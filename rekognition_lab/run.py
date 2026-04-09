import argparse
import boto3
import json
import os
import sys
from rekognition_lab.parser import parse_detect_labels, MIN_CONFIDENCE

def main():
    parser = argparse.ArgumentParser(description = "Local Rekognition lab harness")
    parser.add_argument("--bucket", required = True, help="S3 bucket name")
    parser.add_argument("--key", required=True, help="S3 object key (image path)")
    parser.add_argument("--top", type = int, default = 10, help="Number of top labels to display")
    parser.add_argument("--region", default = "us-east-1", help="AWS region")
    parser.add_argument(
        "--min-confidence",
        type=float,
        default=float(os.environ.get("MIN_CONFIDENCE") or MIN_CONFIDENCE),
        help="Minimum confidence threshold (default = 80.0)",
    )
    parser.add_argument("--min-confidence", type=float, default=float(os.environ.get("MIN_CONFIDENCE")), help="Minimum confidence threshold (default = 80.0)")
    args = parser.parse_args()

    rekognition = boto3.client("rekognition", region_name=args.region)
    
    try:
        response = rekognition.detect_labels(
            Image={
                "S3Object":{
                    "Bucket": args.bucket,
                    "Name": args.key
                }
            },
            MaxLabels=50
        )
    except Exception as e:
        print(f"Error calling Rekognition: {e}")
        sys.exit(1)
    
    os.makedirs("out/raw", exist_ok = True)
    safe_key = args.key.replace("/", "_")
    output_path = f"out/raw/{safe_key}.json"

    with open(output_path, "w") as f:
        json.dump(response, f, indent=2)

    tags = parse_detect_labels(response, min_confidence=args.min_confidence)

    print(f"Found {len(tags)} tags.")
    print(f"Top {min(args.top, len(tags))} tags:")

    for tag in tags[:args.top]:
        print(f"- {tag['name']}: {tag['confidence']:.2f}%")

    print(f"Raw JSON saved to {output_path}")
    results = process_image(rekognition, args.bucket, args.key)

    print(json.dumps(results, indent=2))


def process_image(rekog, bucket, key):
    #Task 9
    mod_response = rekog.detect_moderation_labels(
        Image={'S3Object': {'Bucket': bucket, 'Name':key}},
        MinConfidence=70
    )
    is_flagged = len(mod_response.get("ModerationLabels", [])) > 0
    if is_flagged:
        return {
            "status": "flagged",
            "moderation":{
                "flagged": True,
                "labels": [l['Name'] for l in mod_response.get("ModerationLabels", [])]
            },
            "tags": []
        }
    
    #Task 8
    response = rekog.detect_labels(
        Image={'S3Object': {'Bucket': bucket, 'Name':key}},
        MaxLabels=10,
        MinConfidence=80
    )
    tags = [l['Name'] for l in response.get("Labels", [])]
    return {
        "status": "ok",
        "moderation":{
            "flagged": False,
            "labels": []
        },
        "tags": tags
    }

if __name__ == "__main__":
    main()