import os
import boto3
import json
import uuid
from typing import List, Optional, Any
from decimal import Decimal
from datetime import datetime

from aws_lambda_powertools.event_handler import APIGatewayRestResolver, CORSConfig
from aws_lambda_powertools.event_handler.api_gateway import Response
from aws_lambda_powertools.utilities.typing.lambda_context import LambdaContext
from aws_lambda_powertools.utilities.parser import parse

from pydantic import BaseModel 
from boto3.dynamodb.conditions import Key

# Importing your custom middleware
from shared.auth import auth_middleware
from shared.exceptions import BadRequestException, InternalServerErrorException, NotFoundException, exception_middleware

cors_config = CORSConfig(
    allow_origin=os.environ["ALLOW_ORIGIN"], 
    allow_headers=["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token"],
)
app = APIGatewayRestResolver(cors=cors_config)

TABLE_NAME = os.environ["TABLE_NAME"]
BUCKET_NAME = os.environ["BUCKET_NAME"]

# Initialize resources
dynamodb = boto3.resource("dynamodb")
dynamodb_client = boto3.client("dynamodb")
s3 = boto3.client('s3')

table = dynamodb.Table(TABLE_NAME)
PRESIGNED_URL_EXPIRY = 3600


def generate_presigned_url(s3_client, client_method, method_parameters, expires_in):
    return s3_client.generate_presigned_url(
        ClientMethod=client_method,
        Params=method_parameters,
        ExpiresIn=expires_in
    )


def build_download_url(s3_key: str) -> str:
    return generate_presigned_url(
        s3_client=s3,
        client_method="get_object",
        method_parameters={"Bucket": BUCKET_NAME, "Key": s3_key},
        expires_in=PRESIGNED_URL_EXPIRY,
    )


def build_image_response(item: dict) -> dict:
    labels = item.get("Labels") or item.get("tags") or []
    s3_key = item.get("s3Key")
    return {
        "imageId": str(item.get("imageId", "unknown-id")),
        "userId": item.get("userId"),
        "s3Key": s3_key,
        "Labels": labels,
        "status": item.get("status", "COMPLETE"),
        "LastUpdated": str(item.get("LastUpdated", item.get("uploadedAt", "Unknown"))),
        "ContentType": item.get("ContentType", "image/jpeg"),
        "size": int(item.get("size", 0)),
        "dimension": item.get("dimension", [0, 0]),
        "downloadUrl": build_download_url(s3_key) if s3_key else None,
    }


def cors_preflight_response(allowed_methods: str) -> Response:
    return Response(
        status_code=200,
        content_type="application/json",
        body={"ok": True},
        headers={
            "Access-Control-Allow-Origin": os.environ["ALLOW_ORIGIN"],
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": allowed_methods,
        },
    )


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

@app.get("/images/<imageId>")
def get_image_metadata(imageId: str):
    user_id = app.lambda_context.user_id
    response = table.get_item(Key={"userId": user_id, "imageId": imageId})
    item = response.get("Item")

    if not item:
        raise NotFoundException(f"Image '{imageId}' not found for user '{user_id}'")

    if "s3Key" not in item:
        raise InternalServerErrorException("Malformed item in database")
    return build_image_response(item)

class ImageModel(BaseModel):
    imageId: str
    userId: str
    s3Key: str
    Labels: List[Any] = []
    LastUpdated: str
    ContentType: Optional[str] = "image/jpeg"
    size: Optional[int] = 0
    dimension: Optional[List[int]] = [0, 0]
    downloadUrl: Optional[str] = None

@app.post("/upload")
def create_upload():
    user_id = app.lambda_context.user_id
    body = app.current_event.json_body or {}

    filename = body.get("fileName", "image.jpg")
    content_type = body.get("fileType", "image/jpeg")
    _, extension = os.path.splitext(filename)
    extension = extension or ".jpg"

    image_id = str(uuid.uuid4())
    object_key = f"uploads/{user_id}/{image_id}{extension}"
    now = datetime.utcnow().isoformat()

    try:
        presigned_url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": BUCKET_NAME,
                "Key": object_key,
                "ContentType": content_type,
            },
            ExpiresIn=300,
        )

        table.put_item(
            Item={
                "userId": user_id,
                "imageId": image_id,
                "s3Key": object_key,
                "Labels": [],
                "status": "PROCESSING",
                "LastUpdated": now,
                "uploadedAt": now,
                "ContentType": content_type,
                "size": 0,
                "dimension": [0, 0],
            }
        )

        return {
            "uploadUrl": presigned_url,
            "imageId": image_id,
            "s3Key": object_key,
            "downloadUrl": build_download_url(object_key),
        }
    except Exception as e:
        return {"error": str(e)}, 500

# --- IMAGES ROUTE ---
@app.get("/images")
def list_images():
    # Retrieve user_id from the context (populated by auth_middleware)
    user_id = app.lambda_context.user_id
    print(f"TRACE 5: Querying DynamoDB Table '{TABLE_NAME}' for userId: '{user_id}'")

    table = dynamodb.Table(TABLE_NAME)
    
    # Query DynamoDB using the identity resolved by middleware
    response = table.query(
        KeyConditionExpression=Key("userId").eq(user_id),
        ScanIndexForward=False
    )

    items = response.get("Items", [])
    print(f"TRACE 6: DynamoDB returned {len(items)} items for this user.")

    # Process items and generate download URLs
    for item in items:
        raw_labels = item.get("Labels", [])
        if isinstance(raw_labels, (set, list)):
            item["Labels"] = [list(l) if isinstance(l, set) else l for l in raw_labels]
        
        s_three_key = item.get("s3Key")
        if s_three_key:
            item["downloadUrl"] = s3.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": BUCKET_NAME, "Key": s_three_key},
                ExpiresIn=3600
            )

    checked_items = []
    for item in items:
        try:
            checked_items.append(build_image_response(item))
        except Exception as ve:
            print(f"DEBUG: Skipping item validation error: {ve}")

    return json.loads(json.dumps(checked_items, cls = DecimalEncoder))
  
class UpdateImageRequest(BaseModel):
    userId: str
    imageId: str
    tags: list

@app.patch("/update-metadata")
def update_image_metadata():
    data = parse(model=UpdateImageRequest,event=app.current_event.json_body)

    if data is None:
        raise BadRequestException("Invalid request body")

    response = table.update_item(
        Key = {"userId" : data.userId,
                "imageId": data.imageId},
        UpdateExpression= 'SET #t = :newTag',  
        ExpressionAttributeNames= {'#t': 'Labels'}, 
        ExpressionAttributeValues={
            ':newTag': data.tags
        } 
    )
    
    if not response:
        raise InternalServerErrorException("Failed to update image metadata")


    return {
        "message": "Image updated",
        "data": response
    }


@app.route("/images", method=["OPTIONS"])
def options_images():
    return cors_preflight_response("GET,OPTIONS")


@app.route("/images/<imageId>", method=["OPTIONS"])
def options_image_item(imageId: str):
    return cors_preflight_response("GET,DELETE,OPTIONS")


@app.route("/upload", method=["OPTIONS"])
def options_upload():
    return cors_preflight_response("POST,OPTIONS")

@app.route("/update-metadata", method=["OPTIONS"])
def options_update_metadata():
    return cors_preflight_response("PATCH,OPTIONS")

@app.delete("/images/<imageId>")
def delete_image(imageId: str):
    user_id = app.lambda_context.user_id

    existing = table.get_item(Key={"userId": user_id, "imageId": imageId}).get("Item")
    if existing and existing.get("s3Key"):
        s3.delete_object(Bucket=BUCKET_NAME, Key=existing["s3Key"])

    dynamodb.Table(TABLE_NAME).delete_item(
        Key={"userId": user_id, "imageId": imageId}
    )

    return {"success": True, "imageId": imageId}

@app.get("/health")
def health_check():
    return {"message": "healthy"}

# --- HANDLER WITH MIDDLEWARE ---
@auth_middleware      # 1. Resolves the user identity / Dev Bypass
@exception_middleware # 2. Catches errors and formats JSON responses
def lambda_handler(event: dict, context: LambdaContext) -> dict:
    return app.resolve(event, context)