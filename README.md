# SkyOps Bookstore - A Demo E-commerce WebApp with serverless technologies

This is a demo e-commerce web application built with with Express and React and runs with serverless computing. The application allows users to browse books, add them to a shopping cart, and purchase them.

# Features

1. Fully runs on AWS serverless computing platforms. - lifts worrying of resource management and scaling.
2. Backend utilizes AWS lambda functions to efficiently withstand high traffic while being cost effective.
3. Stateless authentication with JWT (JSON Web Tokens).
4. Frontend is built with React and tailwind for a responsive and modern design and hosted on AWS S3 for fast delivery while being cost-effective.
5. AWS codebuild and codepipeline for faster CI/CD with better integration with AWS
5. Hassle free cloud resource management with Terraform.

# Architecture

# How to self deploy

## Prerequisites

1. AWS account and an IAM user with the necessary permissions as follows,
```
AmazonAPIGatewayAdministrator
AmazonDynamoDBFullAccess
AmazonS3FullAccess
AmazonSSMFullAccess
AWSCodeBuildAdminAccess
AWSCodePipeline_FullAccess
AWSLambda_FullAccess
CloudWatchLogsFullAccess
```

2. AWS CLI configured with that IAM user.
3. Terraform installed on your local machine.
4. Node.js and npm installed on your local machine.

## Steps

1. Clone the repository:
2. Install the dependencies for backend:
3. Zip the backend folder into a zip file:
4. Create the terraform.tfvars file with the following variables:
```
aws_region = "your-aws-region"
github_owner = "your-github-owner"
github_repo = "your-github-repo"
github_branch = "your-preffered-github-branch-for-production-deployment"
github_token = "your-github-token"
s3_bucket_name = "your-s3-bucket-name"
s3_bucket_name_front = "your-s3-bucket-name-for-frontend"
```
5. Run the terraform script to deploy the backend and frontend with codebuilds and codepipelines:

> [!Note]
> To stay within the AWS free tier, we have not utilized any environment variable management services like AWS Secrets Manager or AWS Parameter Store. If you wish to use them, you can modify the backend code to fetch the environment variables from the AWS Secrets Manager or AWS Parameter Store.

# Wanna know in-depth details?

Frontend: [Frontend README](frontend/README.md)
backend: [Backend README](backend/README.md)
Terraform: [Terraform README](terraform/README.md)


# Contributing

This section is for the memebers of the team to contribute to the project.

1. Make sure to follow PR template before openning a PR.
2. If you wish to test this using your own account, you have to change api endpoints and cors access url in the frontend.
