# Rekognition Showcase Image Set (Proposed)

This document proposes a canonical set of images used to test and demonstrate AWS Rekognition label detection for the project.

These images are intended for:
- development sanity checks
- demonstrations of the Rekognition pipeline
- validating the output format of the local Rekognition lab harness

The expected labels listed below are **not strict assertions**. They are meant as high-level sanity expectations to confirm Rekognition is behaving reasonably.

---

## Proposed S3 Location Convention

All showcase images follow this structure:

Bucket: `<rekognition-demo-bucket>`  
Key: `showcase/<image_name>.jpg`

Example:

`s3://<rekognition-demo-bucket>/showcase/dog.jpg`

---

## Proposed Canonical Showcase Images

### 1. Dog

Key  
`showcase/dog.jpg`

Expected High-Level Labels
- Dog
- Pet
- Animal
- Mammal

---

### 2. Car

Key  
`showcase/car.jpg`

Expected High-Level Labels
- Car
- Vehicle
- Transportation
- Automobile

---

### 3. Laptop

Key  
`showcase/laptop.jpg`

Expected High-Level Labels
- Laptop
- Computer
- Electronics
- Technology

---

### 4. City Skyline

Key  
`showcase/city.jpg`

Expected High-Level Labels
- Building
- City
- Urban
- Architecture

---

### 5. Food / Meal

Key  
`showcase/food.jpg`

Expected High-Level Labels
- Food
- Meal
- Dish
- Cuisine

---

## Notes

- These images represent a **proposed canonical demo set** for Rekognition testing.
- The final images and bucket location may be adjusted based on team discussion.
- Expected labels are meant for **sanity checks only**, not strict validation tests.