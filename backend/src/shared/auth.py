import json
from typing import Callable

from aws_lambda_powertools.middleware_factory import lambda_handler_decorator
from aws_lambda_powertools.utilities.typing import LambdaContext

from .exceptions import UnauthorizedException

#check if requesct context 
@lambda_handler_decorator
def auth_middleware(
    handler: Callable[[dict, LambdaContext], dict],
    event: dict,
    context: LambdaContext,
) -> dict:
    
    # Get the API Gateway request context from the event
    request_context = event.get("requestContext") or {}

    # Get the authorizer data attached by API Gateway
    authorizer = request_context.get("authorizer")
    if not authorizer:
        raise UnauthorizedException("No authorizer context")

    # Support both possible API Gateway claim formats:
    # authorizer["jwt"]["claims"] or authorizer["claims"]
    claims = (authorizer.get("jwt") or {}).get("claims") or authorizer.get("claims")
    if not claims:
        raise UnauthorizedException("No JWT claims found")

    # Get the user id from the JWT "sub" claim
    user_id = claims.get("sub")
    if not user_id:
        raise UnauthorizedException("Token missing user id")
    
    # Save the authenticated user id onto the Lambda context
    context.user_id = user_id

    # Continue to the actual Lambda handler
    return handler(event, context)

