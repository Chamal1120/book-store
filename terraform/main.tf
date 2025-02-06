provider "aws" {
  region  = var.aws_region
  profile = "default"
}

###############################
# S3 Buckets
###############################

resource "aws_s3_bucket" "front_end_source_bucket" {
  bucket = "front-end-source"    

  tags = {
    Name        = "front_end_source_bucket"
    Environment = "Production"
  }
}

resource "aws_s3_bucket_versioning" "front_end_source_bucket_versioning" {
  bucket = aws_s3_bucket.front_end_source_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket" "book_store_front_bucket" {
  bucket = var.s3_bucket_name_front
}

resource "aws_s3_bucket_public_access_block" "book_store_front_bucket_access" {
  bucket                  = aws_s3_bucket.book_store_front_bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

data "aws_iam_policy_document" "book_store_front_bucket_policy" {
  statement {
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:ListBucket"
    ]

    resources = [
      aws_s3_bucket.book_store_front_bucket.arn,
      "${aws_s3_bucket.book_store_front_bucket.arn}/*"
    ]
  }
}

resource "aws_s3_bucket_policy" "book_store_front_bucket_policy" {
  bucket = aws_s3_bucket.book_store_front_bucket.id
  policy = data.aws_iam_policy_document.book_store_front_bucket_policy.json
}

resource "aws_s3_bucket_website_configuration" "book_store_front_website" {
  bucket = aws_s3_bucket.book_store_front_bucket.id

  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket" "pipeline_bucket" {
  bucket = var.s3_bucket_name

  tags = {
    Name        = var.s3_bucket_name
    Environment = "Production"
  }
}

resource "aws_s3_bucket_versioning" "pipeline_bucket_versioning" {
  bucket = aws_s3_bucket.pipeline_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

###############################
# IAM Roles and Policies
###############################

# IAM Role for CodeBuild
resource "aws_iam_role" "codebuild_role" {
  name = "codebuild_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = { Service = "codebuild.amazonaws.com" },
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "codebuild_role_policy" {
  role       = aws_iam_role.codebuild_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSCodeBuildDeveloperAccess"
}

resource "aws_iam_role_policy_attachment" "codebuild_logs_attachment" {
  role       = aws_iam_role.codebuild_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

resource "aws_iam_role_policy_attachment" "codebuild_s3_readonly_attachment" {
  role       = aws_iam_role.codebuild_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy_attachment" "codebuild_lambda_full_access" {
  role       = aws_iam_role.codebuild_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSLambda_FullAccess"
}

# IAM Role for CodePipeline
resource "aws_iam_role" "codepipeline_role" {
  name = "CodePipelineExpressAppRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = { Service = "codepipeline.amazonaws.com" },
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "codepipeline_role_policy" {
  role       = aws_iam_role.codepipeline_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSCodePipeline_FullAccess"
}

resource "aws_iam_role_policy_attachment" "codepipeline_s3_attachment" {
  role       = aws_iam_role.codepipeline_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy_attachment" "codepipeline_codebuild_attachment" {
  role       = aws_iam_role.codepipeline_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSCodeBuildDeveloperAccess"
}

resource "aws_iam_role_policy_attachment" "codepipeline_lambda_full_access" {
  role       = aws_iam_role.codepipeline_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSLambda_FullAccess"
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_exec_role" {
  name = "express_lambda_exec_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = { Service = "lambda.amazonaws.com" },
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb_full_access" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

###############################
# CodeBuild Projects
###############################

locals {
  buildspec_front = <<EOF
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 20
    commands:
      - echo "changing into frontend folder"
      - cd frontend
      - npm install
  build:
    commands:
      - npm run build
  post_build:
    commands:
      - aws s3 sync dist/ s3://$S3_BUCKET/ --delete
EOF

  buildspec_back = <<EOF
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 20
    commands:
      - echo "Changing into backend folder"
      - cd backend
      - echo "Installing dependencies..."
      - npm install
  build:
    commands:
      - echo "Packaging Lambda function code..."
      - zip -r function.zip .
  post_build:
    commands:
      - echo "Deploying to AWS Lambda..."
      - aws lambda update-function-code --function-name book-store-skyops --zip-file fileb://function.zip
      - sleep 10
      - aws lambda update-function-configuration --function-name book-store-skyops --handler app.handler

artifacts:
  files:
    - backend/function.zip
EOF
}

resource "aws_codebuild_project" "book_store_front_build" {
  name          = "BookStoreFrontBuild"
  service_role  = aws_iam_role.codebuild_role.arn
  build_timeout = 20
  
  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type = "BUILD_GENERAL1_SMALL"
    image        = "aws/codebuild/standard:5.0"
    type         = "LINUX_CONTAINER"

    environment_variable {
      name  = "AWS_DEFAULT_REGION"
      value = var.aws_region
    }

    environment_variable {
      name  = "S3_BUCKET"
      value = aws_s3_bucket.book_store_front_bucket.bucket
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = local.buildspec_front
  }

}

resource "aws_codebuild_project" "express_app_build" {
  name          = "ExpressAppBuild"
  description   = "Build project for Express app on AWS Lambda"
  service_role  = aws_iam_role.codebuild_role.arn
  build_timeout = 10

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type    = "BUILD_GENERAL1_SMALL"
    image           = "aws/codebuild/standard:6.0"
    type            = "LINUX_CONTAINER"
    privileged_mode = false
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = local.buildspec_back
  }
}

###############################
# CodePipeline
###############################

resource "aws_codepipeline" "book_store_front_pipeline" {
  name     = "BookStoreFrontPipeline"
  role_arn = aws_iam_role.codepipeline_role.arn

  pipeline_type = "V2"

  artifact_store {
    type     = "S3"
    location = aws_s3_bucket.front_end_source_bucket.bucket
  }

  stage {
    name = "Source"
    action {
      name            = "Source"
      category        = "Source"
      owner           = "ThirdParty"
      provider        = "GitHub"
      version         = "1"
      output_artifacts = ["SourceOutput"]

      configuration = {
        Owner      = var.github_owner
        Repo       = var.github_repo
        Branch     = var.github_branch
        OAuthToken  = var.github_token
      }
    }
  }

  stage {
    name = "Build"
    action {
      name            = "Build"
      category        = "Build"
      owner           = "AWS"
      provider        = "CodeBuild"
      version         = "1"
      input_artifacts = ["SourceOutput"]
      output_artifacts = ["BuildOutput"]

      configuration = {
        ProjectName = aws_codebuild_project.book_store_front_build.name
      }
    }
  }
}

resource "aws_codepipeline" "express_pipeline" {
  name     = "ExpressAppPipeline"
  role_arn = aws_iam_role.codepipeline_role.arn

  pipeline_type = "V2"

  artifact_store {
    type     = "S3"
    location = aws_s3_bucket.pipeline_bucket.bucket
  }

  stage {
    name = "Source"
    action {
      name             = "Source"
      category         = "Source"
      owner            = "ThirdParty"
      provider         = "GitHub"
      version          = "1"
      output_artifacts = ["source_output"]
      configuration = {
        Owner      = var.github_owner
        Repo       = var.github_repo
        Branch     = var.github_branch
        OAuthToken  = var.github_token
      }
    }
  }

  stage {
    name = "Build"
    action {
      name             = "Build"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      input_artifacts  = ["source_output"]
      output_artifacts = ["build_output"]
      version          = "1"
      configuration = {
        ProjectName = aws_codebuild_project.express_app_build.name
      }
    }
  }
}

###############################
# AWS Lambda Function
###############################

resource "aws_lambda_function" "express_app" {
  function_name = "book-store-skyops"
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "app.handler"
  runtime       = "nodejs20.x"

  filename         = "../backend/function.zip"
  source_code_hash = filebase64sha256("../backend/function.zip")

  timeout = 10
}

###############################
# DynamoDB Tables
###############################

resource "aws_dynamodb_table" "users" {
  name         = "users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "username"
    type = "S"
  }

  global_secondary_index {
    name            = "username-index"
    hash_key        = "username"
    projection_type = "ALL"
  }

  tags = {
    Environment = "production"
  }
}

resource "aws_dynamodb_table" "books" {
  name         = "books"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Environment = "production"
  }
}

resource "aws_dynamodb_table" "purchased_books" {
  name         = "purchased_books"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "purchase_id"

  attribute {
    name = "purchase_id"
    type = "S"
  }

  tags = {
    Environment = "production"
  }
}

###############################
# Terraform Variables
###############################

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "github_owner" {
  description = "GitHub repository owner"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}

variable "github_branch" {
  description = "GitHub branch name"
  type        = string
  default     = "main"
}

variable "github_token" {
  description = "GitHub OAuth token for CodePipeline"
  type        = string
  sensitive   = true
}

variable "s3_bucket_name_front" {
  description = "S3 bucket for storing frontend artifacts"
  type        = string
}

variable "s3_bucket_name" {
  description = "S3 bucket for storing pipeline artifacts"
  type        = string
}
