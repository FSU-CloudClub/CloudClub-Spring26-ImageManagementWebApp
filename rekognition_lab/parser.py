from typing import List, Dict

MIN_CONFIDENCE = 80.0

def parse_detect_labels(resp: dict, min_confidence: float = MIN_CONFIDENCE) -> List[Dict]:
    """
    Convert AWS Rekognition detect_labels response into normalized tag format.

    Input (Rekognition):
        {
            "Labels": [
                {"Name": "Dog", "Confidence": 98.4},
                {"Name": "Pet", "Confidence": 96.1}
            ]
        }

    Output:
        [
            {"name": "dog", "confidence": 98.4},
            {"name": "pet", "confidence": 96.1}
        ]
    """

    labels = resp.get("Labels", [])

    tags = []

    for label in labels:
        confidence = label.get("Confidence", 0.0)
        if confidence >= min_confidence:  
            tags.append({
                "name": label.get("Name", "").lower(),
                "confidence": label.get("Confidence", 0.0)
            })

    tags.sort(key=lambda t: t["confidence"], reverse=True)

    return tags