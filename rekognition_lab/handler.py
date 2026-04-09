import json
import logging
import os
import time
from typing import Any

import boto3

from parser import parse_detect_labels
from errorHandle_issue12 import (
    call_rekog_with_retries,
    handle_rekog_failure,
    RekogTransientError,
)
from moderation import run_moderation, moderation_results


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


# ── Helpers ──────────────────────────────────────────────────────────────────

def log(request_id: str, message: str, **extra: Any) -> None:
    payload = {"request_id": request_id, "message": message, **extra}
    logger.info(json.dumps(payload))


# Module-level lazy client (Issue 11 — cold start optimization)
_rekognition = None

def get_rekognition_client():
    global _rekognition
    if _rekognition is None:
        _rekognition = boto3.client("rekognition")
    return _rekognition


def extract_s3_location(event: dict) -> tuple[str, str]:
    if "bucket" in event and "key" in event:
        return event["bucket"], event["key"]

    records = event.get("Records", [])
    if not records:
        raise ValueError("Cannot locate S3 bucket/key in event payload.")

    record = records[0]
    if "s3" in record:
        return record["s3"]["bucket"]["name"], record["s3"]["object"]["key"]

    raise ValueError(f"Unrecognised event record shape: {list(record.keys())}")


# ── Main Handler ──────────────────────────────────────────────────────────────

def handler(event: dict, context: Any) -> dict:
    request_id: str = getattr(context, "aws_request_id", "local")
    t_total_start = time.monotonic()
    min_confidence = float(os.environ.get("MIN_CONFIDENCE") or "80.0")
    mod_confidence = float(os.environ.get("MOD_CONFIDENCE", "75.0"))

    # ── Step 1: Parse event ───────────────────────────────────────────────────
    try:
        bucket, key = extract_s3_location(event)
    except (KeyError, ValueError) as exc:
        log(request_id, "event_parse_error", error=str(exc))
        return {
            "statusCode": 400,
            "body": json.dumps({"error": f"Bad event payload: {exc}"}),
        }

    log(request_id, "invocation_start", bucket=bucket, key=key,
        min_confidence=min_confidence, mod_confidence=mod_confidence)

    client = get_rekognition_client()

    # ── Step 2: Moderation check (Issue 9) ────────────────────────────────────
    try:
        mod_result = run_moderation(client, bucket, key, mod_confidence)
    except Exception as exc:
        log(request_id, "moderation_error", bucket=bucket, key=key, error=str(exc))
        return {
            "statusCode": 502,
            "body": json.dumps({"error": f"Moderation check failed: {exc}"}),
        }

    moderation_results(logger, request_id, mod_result["flagged"], mod_result["categories"])

    if mod_result["flagged"]:
        log(request_id, "image_flagged", bucket=bucket, key=key,
            categories=mod_result["categories"])
        return {
            "statusCode": 200,
            "body": json.dumps({
                "bucket": bucket,
                "key": key,
                "status": "flagged",
                "moderation": mod_result,
                "tags": [],
            }),
        }

    # ── Step 3: Detect labels with retries (Issues 4, 5, 12) ─────────────────
    t_rekog_start = time.monotonic()
    try:
        raw_response = call_rekog_with_retries(client, bucket, key, request_id, logger)
    except RekogTransientError as exc:
        # All retries exhausted — return placeholder until Issue 5 contract lands
        return handle_rekog_failure(exc, request_id, key, logger)
    except Exception as exc:
        log(request_id, "rekognition_error", bucket=bucket, key=key, error=str(exc))
        return {
            "statusCode": 502,
            "body": json.dumps({"error": f"Rekognition call failed: {exc}"}),
        }

    rekog_time = round((time.monotonic() - t_rekog_start) * 1000, 2)

    # ── Step 4: Parse + filter tags (Issue 3, 5) ─────────────────────────────
    filtered_tags = parse_detect_labels(raw_response, min_confidence=min_confidence)

    total_time = round((time.monotonic() - t_total_start) * 1000, 2)

    log(
        request_id,
        "invocation_complete",
        bucket=bucket,
        key=key,
        label_count=len(filtered_tags),
        duration_ms={"rekognition": rekog_time, "total": total_time},
    )

    # ── Step 5: Return ────────────────────────────────────────────────────────
    return {
        "statusCode": 200,
        "body": json.dumps({
            "bucket": bucket,
            "key": key,
            "status": "ok",
            "moderation": mod_result,
            "tags": filtered_tags,
            "duration_ms": {
                "rekognition": rekog_time,
                "total": total_time,
            },
        }),
    }
