import json
import os
import sys

sys.path.append(os.path.abspath("."))

from rekognition_lab.parser import parse_detect_labels


def test_parse_detect_labels():
    with open("tests/fixtures/sample_rekognition.json") as f:
        resp = json.load(f)

    tags = parse_detect_labels(resp)

    assert tags[0]["name"] == "dog"
    assert tags[0]["confidence"] == 98.2

    assert tags[1]["name"] == "pet"
    assert tags[1]["confidence"] == 96.4

    assert tags == sorted(tags, key=lambda x: x["confidence"], reverse=True)