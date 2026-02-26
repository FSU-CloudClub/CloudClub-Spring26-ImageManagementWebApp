import json

from aws_lambda_powertools.utilities.parser import event_parser

def lambda_handler(event, context):
    print("This is a sample change")
    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": f"healthy",
        }),
    }