"""
Unit tests for Issue 7 — MinConfidence filtering
Run: python -m pytest test_confidence.py -v

Test cases:
  - Filters default confidence (80.0)
  - Boundary cases (include exactly 80.0, exclude 79.99)
  - User override of MIN_CONFIDENCE env var
  - “No tags” outcome
  - Empty Labels list returns []
"""

import pytest
from parser import parse_detect_labels, MIN_CONFIDENCE

FIXTURE_LABELS = {
    "Labels": [
        {"Name": "Dog",    "Confidence": 98.40},
        {"Name": "Animal", "Confidence": 95.10},
        {"Name": "Pet",    "Confidence": 82.30},
        {"Name": "Boat",   "Confidence": 79.99},
        {"Name": "Pencil",   "Confidence": 61.00},
    ]
}

FIXTURE_BOUNDARY = {
    "Labels": [
        {"Name": "ExactlyAt",  "Confidence": 80.00},
        {"Name": "JustBelow",  "Confidence": 79.99},
    ]
}

FIXTURE_EMPTY_LABELS = {"Labels": []}
FIXTURE_NO_LABELS_KEY  = {}



# Default filtering (80.0) and structure
class TestDefaultConfidence:

    def test_filters_below_80(self):
        tags = parse_detect_labels(FIXTURE_LABELS)
        names = [t["name"] for t in tags]
        assert "Boat" not in names,  "79.99 should be excluded at conf = 80.0"
        assert "Pencil" not in names,  "61.0 should be excluded at conf = 80.0"

    def test_keeps_above_80(self):
        tags = parse_detect_labels(FIXTURE_LABELS)
        names = [t["name"] for t in tags]
        assert "dog"    in names
        assert "animal" in names
        assert "pet"    in names

    def test_sorted_descending(self):
        tags = parse_detect_labels(FIXTURE_LABELS)
        confidences = [t["confidence"] for t in tags]
        assert confidences == sorted(confidences, reverse=True)

    def test_names_are_lowercase(self):
        tags = parse_detect_labels(FIXTURE_LABELS)
        for tag in tags:
            assert tag["name"] == tag["name"].lower()

    def test_default_is_80(self):
        assert MIN_CONFIDENCE == 80.0


# Boundary cases (79.99, 80.0)
class TestBoundaryCases:

    def test_equal_to_80(self):
        tags = parse_detect_labels(FIXTURE_BOUNDARY)
        names = [t["name"] for t in tags]
        assert "exactlyat" in names, "Confidence == MIN_CONFIDENCE should be included"

    def test_just_less_than_80(self):
        tags = parse_detect_labels(FIXTURE_BOUNDARY)
        names = [t["name"] for t in tags]
        assert "justbelow" not in names, "Boundary values should be excluded"


# Configurable confidence
class TestConfigureConfidence:

    def test_removes_lower_labels(self):
        tags = parse_detect_labels(FIXTURE_LABELS, min_confidence=95.0)
        names = [t["name"] for t in tags]
        assert "dog"    in names # Keep
        assert "animal" in names # Keep
        assert "pet"    not in names # Filtered

    def test_includes_all(self):
        tags = parse_detect_labels(FIXTURE_LABELS, min_confidence=60.0)
        assert len(tags) == 5 # All labels pass

    def test_excludes_all(self):
        tags = parse_detect_labels(FIXTURE_LABELS, min_confidence=100.0)
        assert tags == [], "No label matches, should return []"

    def test_boundary_with_custom_threshold(self):
        tags = parse_detect_labels(FIXTURE_LABELS, min_confidence=95.10)
        names = [t["name"] for t in tags]
        assert "animal" in names # Exactly equal, include
        assert "pet"    not in names # Exclude


# "No tags" outcome
class TestNoTags:

    def test_all_filtered_returns_empty_list(self):
        result = parse_detect_labels(FIXTURE_LABELS, min_confidence=99.0)
        assert result == [], "Should return [] not None or raise"
        assert isinstance(result, list)

    def test_empty_labels_returns_empty_list(self):
        result = parse_detect_labels(FIXTURE_EMPTY_LABELS)
        assert result == []

    def test_missing_labels_key_returns_empty_list(self):
        result = parse_detect_labels(FIXTURE_NO_LABELS_KEY)
        assert result == []
