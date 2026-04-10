import os
import json
from typing import Callable
from aws_lambda_powertools.middleware_factory import lambda_handler_decorator
from aws_lambda_powertools.utilities.typing import LambdaContext

# Print statements were used to debug with Cloudwatch logs

@lambda_handler_decorator
def auth_middleware(handler, event, context):
    print(f"TRACE 1: Full RequestContext keys: {list(event.get('requestContext', {}).keys())}")
    
    authorizer = event.get("requestContext", {}).get("authorizer", {})
    
    print(f"TRACE 2: Raw Authorizer content: {json.dumps(authorizer)}")

    claims = authorizer.get("claims") or (authorizer.get("jwt", {}).get("claims"))
    
    print(f"TRACE 3: Extracted Claims: {json.dumps(claims) if claims else 'EMPTY'}")

    user_id = (claims or {}).get("cognito:username") or (claims or {}).get("sub")
    
    # TRACE 4: Final resolved ID
    if not user_id:
        print("TRACE 4: NO ID FOUND")
    else:
        print(f"TRACE 4: SUCCESS - Identity found: {user_id}")

    context.user_id = user_id
    return handler(event, context)


