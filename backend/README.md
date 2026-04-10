# Backend

This project contains the source code and supporting files for the Cloud Club image tagging application. It is built using AWS SAM and follows a serverless architecture.

Users authenticate via Cognito, upload images through a pre-signed S3 URL, and a dedicated Lambda function processes each upload — passing it through Amazon Rekognition and storing the resulting metadata in DynamoDB. A separate monolithic Lambda handles all REST API endpoints for the frontend.

## Architecture

**Upload Flow**
`React App → Cognito Auth → Pre-signed S3 URL → S3 → Upload Lambda → Rekognition → DynamoDB`

**API Flow**
`React App → API Gateway → Main Lambda → DynamoDB`

## AWS Services
- **Cognito** — user authentication
- **S3** — image storage and pre-signed URL generation
- **Rekognition** — automatic image tagging
- **DynamoDB** — stores image metadata and Rekognition tags per user
- **Lambda** — two functions: upload processor and API handler
- **API Gateway** — routes frontend requests to the main Lambda

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/images` | Get all images for the authenticated user |
| GET | `/images/{id}` | Get a single image by ID |
| PUT | `/images/{id}/tags` | Replace tags on an image with user input |
| DELETE | `/images/{id}` | Delete an image |

## Prerequisites
- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- Python 3
- Docker
- AWS account with appropriate permissions

## Deploy

```bash
sam build --use-container
sam deploy --guided
```

## Local Development

```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements-dev.txt
```

## Tests

```bash
# Unit tests
python -m pytest tests/unit -v

# Integration tests (requires deployed stack)
AWS_SAM_STACK_NAME="backend" python -m pytest tests/integration -v
```

## Cleanup

```bash
sam delete --stack-name "backend"
```