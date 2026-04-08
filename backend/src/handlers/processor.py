import json
import boto3
import os
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME')
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    for record in event['Records']:
        key = record['s3']['object']['key']
        parts = key.split('/')

        if len(parts) >= 2:
            user_id = parts[1]
            image_id = parts[-1].split('.')[0] 
        else:
            user_id = "unknown_user"
            image_id = key.split('.')[0]

        uploaded_at = datetime.utcnow().isoformat()

        table.put_item(Item={
            'userId': user_id,
            'imageId': image_id,
            's3Key': key,
            'Labels': ['Pending Analysis'],
            'uploadedAt': uploaded_at
        })
        
    return {"status": "success"}