"""
Custom exception hierarchy for AWS Lambda.
Exceptions map 1-to-1 to HTTP status codes.
"""

from aws_lambda_powertools.middleware_factory import lambda_handler_decorator
import json

class AppException(Exception):
    """Base exception for all application exceptions."""
    status_code: int = 500
    message: str = "An unexpected error occurred"

    def __init__(self, message: str = None):
        self.message = message or self.__class__.message
        super().__init__(self.message)

    def to_response(self) -> dict:
        """Convert exception to a Lambda HTTP response dict."""
        return {
            "statusCode": self.status_code,
            "body": json.dumps({
                "error": self.__class__.__name__,
                "message": self.message,
            }),
        }

# --- 4XX Client Errors ---

class BadRequestException(AppException):
    """400 - The request was malformed or missing required fields."""
    status_code = 400
    message = "Bad request"

class UnauthorizedException(AppException):
    """401 - Authentication is required or has failed."""
    status_code = 401
    message = "Unauthorized"

class ForbiddenException(AppException):
    """403 - The caller does not have permission to perform this action."""
    status_code = 403
    message = "Forbidden"

class NotFoundException(AppException):
    """404 - The requested resource could not be found."""
    status_code = 404
    message = "Resource not found"

class MethodNotAllowedException(AppException):
    """405 - The HTTP method is not allowed for this endpoint."""
    status_code = 405
    message = "Method not allowed"

class ConflictException(AppException):
    """409 - The request conflicts with the current state of the resource."""
    status_code = 409
    message = "Conflict"

class UnprocessableEntityException(AppException):
    """422 - The request was well-formed but contained semantic errors."""
    status_code = 422
    message = "Unprocessable entity"

class TooManyRequestsException(AppException):
    """429 - The caller has sent too many requests in a given time."""
    status_code = 429
    message = "Too many requests"

# --- 5XX Server Errors ---

class InternalServerErrorException(AppException):
    """500 - An unexpected server-side error occurred."""
    status_code = 500
    message = "Internal server error"

class NotImplementedException(AppException):
    """501 - The requested functionality is not implemented."""
    status_code = 501
    message = "Not implemented"

class ServiceUnavailableException(AppException):
    """503 - The service is temporarily unavailable."""
    status_code = 503
    message = "Service unavailable"

# --- Middleware ---

@lambda_handler_decorator
def exception_middleware(handler, event, context):
    try:
        return handler(event, context)
    except AppException as e:
        return e.to_response()
    except Exception as e: # handle unexpected crashes as 500
        return InternalServerErrorException(str(e)).to_response()