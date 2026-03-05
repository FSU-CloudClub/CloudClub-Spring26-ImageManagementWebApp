from __future__ import annotations
import json
import logging
import os
import time
from typing import Any
import boto3
from parser import parse_detect_labels  # Issue 3 dependency

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def log(request_id: str, message: str, **extra: Any) -> None:
    payload = {"request_id": request_id, "message": message, **extra}
    logger.info(json.dumps(payload))

rekognition = None
def get_rekognition_client():
    global rekognition
    if rekognition is None:
        rekognition = boto3.client("rekognition")
    return rekognition

def extract_s3_location(event: dict) -> tuple[str, str]:
    if "bucket" in event and "key" in event:
        return event["bucket"], event["key"]

    records = event.get("Records", [])
    if not records:
        raise ValueError("Cannot locate S3 bucket/key in event payload.")

    record = records[0]

    raise ValueError(f"Unrecognised event record shape: {list(record.keys())}")

def detect_labels(bucket: str, key: str, min_confidence: float) -> dict:
    return rekognition.detect_labels(
        Image={"S3Object": {"Bucket": bucket, "Name": key}},
        MaxLabels=100,
        MinConfidence=min_confidence,
        Features=["GENERAL_LABELS"],
    )

def handler(event: dict, context: Any) -> dict:
    request_id: str = getattr(context, "aws_request_id", "local")
    t_total_start = time.monotonic()
    min_confidence = float(os.environ.get("MIN_CONFIDENCE", "80.0"))

    try:
        bucket, key = extract_s3_location(event)
    except (KeyError, ValueError, json.JSONDecodeError) as exc:
        log(request_id, "event_parse_error", error=str(exc))
        return {"statusCode": 400, "body": {"error": f"Bad event payload: {exc}"}}

    log(request_id, "invocation_start", bucket=bucket, key=key, min_confidence=min_confidence)
    t_rekog_start = time.monotonic()
    try:
        raw_response = detect_labels(bucket, key, min_confidence)
    except Exception as exc:
        log(request_id, "rekognition_error", bucket=bucket, key=key, error=str(exc))
        return {"statusCode": 502, "body": {"error": f"Rekognition call failed: {exc}"}}

    rekog_time = round((time.monotonic() - t_rekog_start) * 1000, 2)
    parsed = parse_detect_labels(raw_response, min_confidence=min_confidence)
    total_time = round((time.monotonic() - t_total_start) * 1000, 2)

    log(
        request_id,
        "invocation_complete",
        bucket=bucket,
        key=key,
        label_count=parsed["label_count"],
        model_version=parsed["model_version"],
        duration_ms={"rekognition": rekog_time, "total": total_time},
    )
    return {
        "statusCode": 200,
        "body": {
            "bucket": bucket,
            "key": key,
            **parsed,
            "duration_ms": {
                "rekognition": rekog_ms,
                "total": total_ms,
            },
        },
    }