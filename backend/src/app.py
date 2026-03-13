from aws_lambda_powertools.event_handler import APIGatewayRestResolver
from aws_lambda_powertools.utilities.typing.lambda_context import LambdaContext

from shared.exceptions import exception_middleware

app = APIGatewayRestResolver()

@exception_middleware
def lambda_handler(event: dict, context: LambdaContext) -> dict:
    return app.resolve(event, context)