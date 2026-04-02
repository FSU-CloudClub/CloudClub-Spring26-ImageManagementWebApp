

import os
import boto3
import json

from aws_lambda_powertools.event_handler import APIGatewayRestResolver
from aws_lambda_powertools.utilities.typing.lambda_context import LambdaContext
from aws_lambda_powertools.utilities.parser import parse

from pydantic import BaseModel 

from boto3.dynamodb.conditions import Key
from decimal import Decimal

from shared.auth import auth_middleware
from shared.exceptions import InternalServerErrorException, exception_middleware, BadRequestException


app = APIGatewayRestResolver()

TABLE_NAME = os.environ["TABLE_NAME"]
BUCKET_NAME = os.environ["BUCKET_NAME"]

dynamodb = boto3.resource("dynamodb")
dynamodb_client = boto3.client("dynamodb")
s3 = boto3.client('s3')

table = dynamodb.Table("Images")

class ImageModel(BaseModel):
    imageId: str
    userId: str
    tags: list
    s3Key: str
    uploadedAt: str
    dimension: list
    size: int
    downloadUrl: str

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

@app.get("/images")
def list_images():
    user_id = app.lambda_context.user_id
    table = dynamodb.Table(TABLE_NAME)

    # query DB
    response = table.query(
        KeyConditionExpression = Key("userId").eq(user_id),
        ScanIndexForward = False
    )

    items = response.get("Items", [])

    # generate presigned URLs
    for item in items:
        s3_key = item.get("s3Key")
        if s3_key:
            item["downloadUrl"] = s3.generate_presigned_url(
                ClientMethod = "get_object",
                Params = {"Bucket": BUCKET_NAME, "Key": s3_key}
            )

    # request validation
    checked_items = [
        ImageModel(
            imageId=item.get("imageId"),
            userId=item.get("userId"),
            tags=item.get("tags"),
            s3Key=item.get("s3Key"),
            uploadedAt=item.get("uploadedAt"),
            dimension=item.get("dimension"),
            size=item.get("size"),
            downloadUrl=item.get("downloadUrl")
        ).model_dump()
        for item in items
    ]

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
        ExpressionAttributeNames= {'#t': 'tags'}, 
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

  
@app.delete("/image/<image_id>")
def delete_image(image_id: str):
    user_id = app.context.user_id
        
    s3.delete_object(
        Bucket = BUCKET_NAME,
        Key = f"images/{image_id}"
    )
    
    response = dynamodb.Table(TABLE_NAME).delete_item(
        Key = {
          'userId': user_id,
          'imageId': image_id
        }
    )
        
    return response
  
@app.get("/health")
def health():
    status = {}
    overall_healthy = True

    # S3 Check
    s3.head_bucket(Bucket=BUCKET_NAME)
    status['S3'] = 'Healthy'

    # DynamoDB Check
    res = dynamodb_client.describe_table(TableName=TABLE_NAME)
    state = res['Table']['TableStatus']
    status['DynamoDB'] = 'Healthy' if state == 'ACTIVE' else f'Status: {state}'

    return {
        "status": "OK" if overall_healthy else "DEGRADED",
        "details": status
    }

@exception_middleware
@auth_middleware
def lambda_handler(event: dict, context: LambdaContext) -> dict:
    return app.resolve(event, context)
