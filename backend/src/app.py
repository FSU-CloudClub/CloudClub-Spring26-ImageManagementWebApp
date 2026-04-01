import os
import boto3
from aws_lambda_powertools.event_handler import APIGatewayRestResolver
from aws_lambda_powertools.utilities.typing.lambda_context import LambdaContext

from boto3.dynamodb.conditions import Key

from shared.auth import auth_middleware
from shared.exceptions import exception_middleware

app = APIGatewayRestResolver()

TABLE_NAME = os.environ.get("TABLE_NAME")
BUCKET_NAME = os.environ.get("BUCKET_NAME")

dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")

@app.get("/health")
def health_check():
    return {"message": "healthy"}

@exception_middleware
@auth_middleware
def lambda_handler(event: dict, context: LambdaContext) -> dict:
    return app.resolve(event, context)
