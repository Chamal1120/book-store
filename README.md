# SkyOps Bookstore - A Serverless E-commerce Web Application


![frontend-codepipeline-status](https://book-store-skyops-build-badges.s3.us-east-1.amazonaws.com/badges/frontend-build.svg)
![backend-codepipeline-status](https://book-store-skyops-build-badges.s3.us-east-1.amazonaws.com/badges/backend-build.svg)

![preview](./github-assets/preview.webp)

This is a demo e-commerce web application built with with Express and React and runs on top of serverless technologies. The application allows users to browse books, add them to a shopping cart, and purchase them.

This is done as a part of the SkyOps team project for the CCS3316 - Cloud Application Development Module of University to demonstrate the use of serverless technologies in building a modern web application to withstand unpredictable high traffic and be cost-effective.

# Features

1. Fully runs on AWS serverless computing platforms. - lifts worrying of resource management and scaling.
2. Backend utilizes AWS lambda functions to efficiently withstand high traffic while being cost effective.
3. Stateless authentication with JWT (JSON Web Tokens).
4. Frontend is built with React and tailwind for a responsive and modern design and hosted on AWS S3 for fast delivery while being cost-effective.
5. AWS codebuild and codepipeline for faster CI/CD with better integration with AWS
5. Hassle free cloud resource management with Terraform.

# Architecture
![](./github-assets/architecture.svg)

# Deployment Instructions

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

1. Fork, Clone and cd into the repository:
```bash
git clone <your-fork-repo-git-url> && cd skyops-bookstore
```

2. Make a dummy zip file in the backend folder:
```bash
cd backend
echo "Hello, World!" > dummy.txt && zip function.zip dummy.txt && rm dummy.txt
```

3. Create the terraform.tfvars file inside terraform folder with the following variables:

```bash
cd terraform
touch terraform.tfvars
```

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

```bash
terraform init # Initialize the terraform
terraform validate # Validate the terraform file
terraform plan -out=plan.out # Plan the terraform deployment
terraform apply plan.out # Apply the terraform deployment
```

> [!Note]
> To maintain simplicity, we have not utilized any environment variable management service like AWS Secrets Manager which requires additional setting up of resources. If you wish to use them, you can modify the backend code to fetch the environment variables from the AWS Secrets Manager or AWS Parameter Store.

# Read more about the individual components

[Frontend README](frontend/README.md)<br>
[Backend README](backend/README.md)<br>
[Terraform README](terraform/README.md)<br>

# Contributing

This section is for the members of the team who contributes to the project.

1. Make sure to follow PR template before openning a PR.
2. If you wish to test the backend using your own account, you have to change api endpoints and cors access urls in the frontend.
3. You could also combine serverless-offline and dynamoDB docker image to test the backend locally.
