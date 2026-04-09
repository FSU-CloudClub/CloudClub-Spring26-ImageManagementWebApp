import json
import logging
import os
import random
import time
from datetime import datetime
from typing import Any

import boto3

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# ── AWS Clients (module-level for cold start optimization) ────────────────────
dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME')
table = dynamodb.Table(TABLE_NAME)

MIN_CONFIDENCE = float(os.environ.get("MIN_CONFIDENCE", "80.0"))
MOD_CONFIDENCE = float(os.environ.get("MOD_CONFIDENCE", "75.0"))

_rekognition = None

def get_rekognition_client():
    global _rekognition
    if _rekognition is None:
        _rekognition = boto3.client("rekognition")
    return _rekognition


# ── Parser (Issue 3) ──────────────────────────────────────────────────────────
def parse_detect_labels(resp: dict) -> list:
    labels = resp.get("Labels", [])
    tags = []
    for label in labels:
        tags.append({
            "name": label.get("Name", "").lower(),
            "confidence": label.get("Confidence", 0.0)
        })
    tags.sort(key=lambda t: t["confidence"], reverse=True)
    return tags


# ── Retry Logic (Issue 12) ────────────────────────────────────────────────────
RETRYABLE_ERRORS = {
    "ProvisionedThroughputExceededException",
    "ThrottlingException",
    "RequestLimitExceeded",
    "ServiceUnavailableException"
}

class RekogTransientError(Exception):
    def __init__(self, message="Rekognition retries exhausted", error_code="OUT_OF_RETRIES"):
        super().__init__(message)
        self.error_code = error_code

def extract_error_details(error):
    error_code = "UNKNOWN_ERROR"
    status_code = None
    message = str(error)
    if hasattr(error, "response"):
        response = error.response
        if "Error" in response:
            error_code = response["Error"].get("Code", error_code)
            message = response["Error"].get("Message", message)
        if "ResponseMetadata" in response:
            status_code = response["ResponseMetadata"].get("HTTPStatusCode")
    return {"error_code": error_code, "status_code": status_code, "message": message}

def is_retryable(error_dets):
    if error_dets["error_code"] in RETRYABLE_ERRORS:
        return True
    if error_dets["status_code"] and 500 <= error_dets["status_code"] <= 599:
        return True
    return False

def compute_retry_delay(attempt: int, base: float = 0.5, cap: float = 5.0) -> float:
    return random.uniform(0, min(cap, base * (2 ** attempt)))

def call_rekog_with_retries(client, bucket: str, key: str, request_id: str) -> dict:
    for attempt in range(1, 4):
        try:
            return client.detect_labels(
                Image={"S3Object": {"Bucket": bucket, "Name": key}},
                MaxLabels=100,
                Features=["GENERAL_LABELS"],
            )
        except Exception as error:
            error_dets = extract_error_details(error)
            retryable = is_retryable(error_dets)
            logger.info(json.dumps({
                "request_id": request_id, "s3_key": key,
                "attempt": attempt, "error_code": error_dets["error_code"],
                "retryable": retryable
            }))
            if not retryable:
                raise
            if attempt == 3:
                raise RekogTransientError() from error
            delay = compute_retry_delay(attempt)
            logger.info(json.dumps({
                "request_id": request_id, "s3_key": key,
                "attempt": attempt, "retrying_in": round(delay, 2)
            }))
            time.sleep(delay)


# ── Moderation (Issue 9) ──────────────────────────────────────────────────────
def run_moderation(client, bucket: str, key: str) -> dict:
    response = client.detect_moderation_labels(
        Image={"S3Object": {"Bucket": bucket, "Name": key}},
        MinConfidence=MOD_CONFIDENCE
    )
    labels = response.get("ModerationLabels", [])
    flagged = len(labels) > 0
    categories = [label["Name"] for label in labels]
    logger.info(json.dumps({
        "message": "moderation_check",
        "flagged": flagged,
        "categories": categories
    }))
    return {"flagged": flagged, "categories": categories}


# ── Main Lambda Handler ───────────────────────────────────────────────────────
def lambda_handler(event, context):
    request_id = getattr(context, "aws_request_id", "local")
    client = get_rekognition_client()

    for record in event['Records']:
        key = record['s3']['object']['key']
        parts = key.split('/')

        if len(parts) >= 2:
            user_id = parts[1]
            image_id = parts[-1].split('.')[0]
        else:
            user_id = "unknown_user"
            image_id = key.split('.')[0]

        bucket = record['s3']['bucket']['name']
        uploaded_at = datetime.utcnow().isoformat()

        # Step 1: Moderation check
        try:
            mod_result = run_moderation(client, bucket, key)
        except Exception as exc:
            logger.error(json.dumps({
                "request_id": request_id, "s3_key": key,
                "message": "moderation_error", "error": str(exc)
            }))
            table.put_item(Item={
                'userId': user_id, 'imageId': image_id,
                's3Key': key, 'Labels': ['Moderation Error'],
                'uploadedAt': uploaded_at
            })
            continue

        if mod_result["flagged"]:
            logger.info(json.dumps({
                "request_id": request_id, "s3_key": key,
                "message": "image_flagged", "categories": mod_result["categories"]
            }))
            table.put_item(Item={
                'userId': user_id, 'imageId': image_id,
                's3Key': key, 'Labels': ['Flagged'],
                'uploadedAt': uploaded_at,
                'moderation': mod_result["categories"]
            })
            continue

        # Step 2: Detect labels with retries
        try:
            raw_response = call_rekog_with_retries(client, bucket, key, request_id)
        except RekogTransientError as exc:
            logger.error(json.dumps({
                "request_id": request_id, "s3_key": key,
                "message": "rekognition_retries_exhausted"
            }))
            table.put_item(Item={
                'userId': user_id, 'imageId': image_id,
                's3Key': key, 'Labels': ['Analysis Failed'],
                'uploadedAt': uploaded_at
            })
            continue
        except Exception as exc:
            logger.error(json.dumps({
                "request_id": request_id, "s3_key": key,
                "message": "rekognition_error", "error": str(exc)
            }))
            table.put_item(Item={
                'userId': user_id, 'imageId': image_id,
                's3Key': key, 'Labels': ['Analysis Failed'],
                'uploadedAt': uploaded_at
            })
            continue

        # Step 3: Parse and filter tags
        all_tags = parse_detect_labels(raw_response)
        filtered_tags = [t for t in all_tags if t["confidence"] >= MIN_CONFIDENCE]
        label_names = [t["name"] for t in filtered_tags]

        # Step 4: Save to DynamoDB
        table.put_item(Item={
            'userId': user_id,
            'imageId': image_id,
            's3Key': key,
            'Labels': label_names,
            'uploadedAt': uploaded_at,
            'moderation': {"flagged": False}
        })

        logger.info(json.dumps({
            "request_id": request_id, "s3_key": key,
            "message": "processing_complete", "label_count": len(filtered_tags)
        }))

    return {"status": "success"}
