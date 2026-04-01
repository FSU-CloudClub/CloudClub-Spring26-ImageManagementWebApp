import json
from types import SimpleNamespace
import pytest
from src import app

def _build_event(authorizer=None):
    request_context = {
        "resourceId": "123456",
        "apiId": "1234567890",
        "resourcePath": "/health",
        "httpMethod": "GET",
        "requestId": "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
        "accountId": "123456789012",
        "identity": {
            "apiKey": "",
            "userArn": "",
            "cognitoAuthenticationType": "",
            "caller": "",
            "userAgent": "Custom User Agent String",
            "user": "",
            "cognitoIdentityPoolId": "",
            "cognitoIdentityId": "",
            "cognitoAuthenticationProvider": "",
            "sourceIp": "127.0.0.1",
            "accountId": "",
        },
        "stage": "prod",
    }

    if authorizer is not None:
        request_context["authorizer"] = authorizer

    return {
        "body": '{ "test": "body"}',
        "resource": "/health",
        "requestContext": request_context,
        "queryStringParameters": {"foo": "bar"},
        "headers": {
            "Accept": "application/json",
            "Host": "1234567890.execute-api.us-east-1.amazonaws.com",
            "X-Forwarded-Proto": "https",
            "User-Agent": "Custom User Agent String",
        },
        "pathParameters": None,
        "httpMethod": "GET",
        "stageVariables": {"baz": "qux"},
        "path": "/health",
    }


@pytest.fixture()
def apigw_event():
    return _build_event(authorizer={"claims": {"sub": "unit-user-1"}})


def test_lambda_handler_with_valid_authorizer(apigw_event):
    """Returns 200 when authorizer includes a valid sub claim."""
    ret = app.lambda_handler(apigw_event, SimpleNamespace())
    data = json.loads(ret["body"])

    assert ret["statusCode"] == 200
    assert "message" in ret["body"]
    assert data["message"] == "healthy"


def test_auth_happy_path_sets_context_user_id():
    """Sets context.user_id from JWT claims on successful auth."""
    context = SimpleNamespace()
    event = _build_event(authorizer={"jwt": {"claims": {"sub": "jwt-user-123"}}})

    ret = app.lambda_handler(event, context)
    data = json.loads(ret["body"])

    assert ret["statusCode"] == 200
    assert data["message"] == "healthy"
    assert context.user_id == "jwt-user-123"


def test_auth_fails_without_authorizer_context():
    """Returns 401 when requestContext.authorizer is missing."""
    ret = app.lambda_handler(_build_event(authorizer=None), SimpleNamespace())
    data = json.loads(ret["body"])

    assert ret["statusCode"] == 401
    assert data["error"] == "UnauthorizedException"
    assert data["message"] == "No authorizer context"


def test_auth_fails_without_claims():
    """Returns 401 when authorizer exists but has no claims."""
    ret = app.lambda_handler(_build_event(authorizer={"jwt": {}}), SimpleNamespace())
    data = json.loads(ret["body"])

    assert ret["statusCode"] == 401
    assert data["error"] == "UnauthorizedException"
    assert data["message"] == "No JWT claims found"


def test_auth_fails_without_sub_claim():
    """Returns 401 when claims do not include a sub user id."""
    ret = app.lambda_handler(
        _build_event(authorizer={"claims": {"email": "u@example.com"}}),
        SimpleNamespace(),
    )
    data = json.loads(ret["body"])

    assert ret["statusCode"] == 401
    assert data["error"] == "UnauthorizedException"
    assert data["message"] == "Token missing user id"
