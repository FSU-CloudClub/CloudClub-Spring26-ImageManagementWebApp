# ☁️ SmartGallery — AWS Cloud Club @ FSU

Founded in Fall 2024, the AWS Cloud Club at Florida State University bridges computer science fundamentals and real-world cloud applications for a growing community of 50 members. This semester, 40 developers across 5 teams — orchestrated by 7 Project Managers — built **SmartGallery**: a serverless image recognition and management web application. The project mirrored a professional production environment, giving students hands-on experience with AWS services, version control, and scalable architecture.

SmartGallery lets users upload images that are automatically tagged using Amazon Rekognition. Tags are stored in DynamoDB and users can browse, filter, search, and manage their personal gallery. All infrastructure follows the Principle of Least Privilege using IAM roles, with images stored in private S3 buckets and accessed only through authenticated application logic.

---

## Repository Structure

- 📁 **`/frontend`** — React web application where users authenticate, upload images, and browse their tagged gallery
- 📁 **`/backend`** — SAM-based serverless API with a monolithic Lambda handling all image CRUD endpoints and a separate upload Lambda that processes images through Rekognition
- 📁 **`/rekognition_lab`** — Standalone lab module for exploring and testing Amazon Rekognition, including sample outputs, a confidence tester, a response parser, and moderation utilities

---

## 🔗 Links

- **[Live Demo](https://s26-aws-cloud-club-smartgallery.netlify.app/)**
- **[Project Wiki](https://github.com/FSU-CloudClub/CloudClub-Spring26-ImageManagementWebApp/wiki#project-introduction)**

---

## A Note from the Project Lead

In today's world of technology, attempting to learn new concepts and build projects can feel overwhelming. The idea behind SmartGallery is not to build an overly complex application, rather it is to provide a fun interactive introduction into frameworks, version control, system design, collaboration, and, of course, AWS. Leading 30+ students broken up into 5 teams to create a production-grade serverless application in ten weeks with many of them building on AWS and using GitHub for the first time, is something I'm genuinely proud of. This project is a reflection of what this club strives for in preparing students with real, industry-ready skills and making that level of cloud education accessible at FSU.

— **Carter Rudolph**, Project Lead · [@CarterRudolph2005](https://github.com/CarterRudolph2005)

---

## AWS Services

- **Cognito** — user authentication
- **S3** — private image storage with pre-signed URL uploads
- **Rekognition** — automatic AI-generated image tagging
- **DynamoDB** — stores image metadata and tags per user
- **Lambda** — serverless compute for upload processing and API logic
- **API Gateway** — routes frontend requests to backend Lambda
