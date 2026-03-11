import argparse
import boto3
import json
import os
import sys

def main():
    parser = argparse.ArgumentParser(description = "Local Rekognition lab harness")
    parser.add_argument("--bucket", required = True, help="S3 bucket name")
    parser.add_argument("--key", required=True, help="S3 object key (image path)")
    parser.add_argument("--top", type = int, default = 10, help="Number of top labels to display")
    parser.add_argument("--region", default = "us-east-1", help="AWS region")
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

    labels = response.get("Labels", [])

    print(f"Found {len(labels)} labels.")
    print(f"Top {min(args.top, len(labels))} labels:")

    for label in labels[:args.top]:
        name = label.get("Name", "UNKNOWN")
        conf = label.get("Confidence", 0.0)
        print(f"- {name}: {conf:.2f}%")

    print(f"Raw JSON saved to {output_path}")

if __name__ == "__main__":
    main()