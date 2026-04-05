import os
import boto3
import json
from typing import List, Optional, Any
from decimal import Decimal

from aws_lambda_powertools.event_handler import APIGatewayRestResolver, CORSConfig
from aws_lambda_powertools.utilities.typing.lambda_context import LambdaContext
from pydantic import BaseModel 
from boto3.dynamodb.conditions import Key

# Importing your custom middleware
from shared.auth import auth_middleware
from shared.exceptions import exception_middleware

cors_config = CORSConfig(
    allow_origin="*", 
    allow_headers=["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token"]
)
app = APIGatewayRestResolver(cors=cors_config)

TABLE_NAME = os.environ["TABLE_NAME"]
BUCKET_NAME = os.environ["BUCKET_NAME"]

# Initialize resources
dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")

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

# --- UPLOAD ROUTE ---
@app.get("/upload")
def get_upload_url():
    # Retrieve user_id from the context (populated by auth_middleware)
    user_id = app.lambda_context.user_id
    
    params = app.current_event.query_string_parameters or {}
    filename = params.get("filename", "image.jpg")
    content_type = params.get("contentType", "image/jpeg") 
    
    # Organize S3 by User ID
    object_key = f"uploads/{user_id}/{filename}"

    try:
        presigned_url = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': object_key,
                'ContentType': content_type
            },
            ExpiresIn=300 
        )
        
        return {
            "uploadUrl": presigned_url,
            "key": object_key
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
            validated_image = ImageModel(
                imageId=str(item.get("imageId", "unknown-id")),
                userId=item.get("userId"),
                Labels=item.get("Labels", []),
                s3Key=item.get("s3Key", "missing-key"),
                LastUpdated=str(item.get("LastUpdated", "Unknown")),
                ContentType=item.get("ContentType", "image/jpeg"),
                size=int(item.get("size", 0)),
                dimension=item.get("dimension", [0, 0]),
                downloadUrl=item.get("downloadUrl")
            )
            checked_items.append(validated_image.model_dump())
        except Exception as ve:
            print(f"DEBUG: Skipping item validation error: {ve}")

    return {"images": checked_items}

@app.get("/health")
def health_check():
    return {"message": "healthy"}

# --- HANDLER WITH MIDDLEWARE ---
@auth_middleware      # 1. Resolves the user identity / Dev Bypass
@exception_middleware # 2. Catches errors and formats JSON responses
def lambda_handler(event: dict, context: LambdaContext) -> dict:
    return app.resolve(event, context)