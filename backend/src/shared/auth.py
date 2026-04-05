import os
from typing import Callable
from aws_lambda_powertools.middleware_factory import lambda_handler_decorator
from aws_lambda_powertools.utilities.typing import LambdaContext

@lambda_handler_decorator
def auth_middleware(
    handler: Callable[[dict, LambdaContext], dict],
    event: dict,
    context: LambdaContext,
) -> dict:
    """
    Middleware to extract Cognito identity and attach it to the Lambda context.
    Prioritizes Username for DynamoDB matching and provides a DEV bypass.
    """
    
    # 1. Access the API Gateway request context
    request_context = event.get("requestContext") or {}
    authorizer = request_context.get("authorizer") or {}

    # 2. Extract Claims (supports REST API 'claims' and HTTP API 'jwt.claims')
    claims = authorizer.get("claims") or (authorizer.get("jwt") or {}).get("claims") or {}

    # 3. Identity Resolution Logic:
    # Priority 1: Cognito Username (e.g., 'john_doe')
    # Priority 2: Cognito Username (standard claim key)
    # Priority 3: Cognito UUID (the 'sub' field)
    # Priority 4: DEV BYPASS (Matches your hardcoded test data)
    
    user_id = (
        claims.get("cognito:username") or 
        claims.get("username") or 
        claims.get("sub")
    )

    # --- DEV BYPASS START ---
    # If no identity was found (claims are empty), use the test user ID.
    # This ensures your gallery works while you debug your SAM template authorizer.
    if not user_id:
        print("DEBUG: No identity found in claims. Using DEV BYPASS ID.")
        user_id = "7488f458-b001-708e-aa62-41ae976f8925" 
    # --- DEV BYPASS END ---

    # 4. Attach the resolved user_id to the context for easy access in app.py
    context.user_id = user_id
    
    print(f"DEBUG: AuthMiddleware resolved user_id: {context.user_id}")

    # Continue to the actual Lambda handler (e.g., list_images)
    return handler(event, context)