from aws_lambda_powertools.event_handler import APIGatewayRestResolver
from aws_lambda_powertools.utilities.typing.lambda_context import LambdaContext

from src.shared.auth import auth_middleware
from src.shared.exceptions import exception_middleware

app = APIGatewayRestResolver()

@app.get("/health")
def health_check():
    return {"message": "healthy"}

@exception_middleware
@auth_middleware
def lambda_handler(event: dict, context: LambdaContext) -> dict:
    return app.resolve(event, context)
