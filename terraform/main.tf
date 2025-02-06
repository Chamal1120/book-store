provider "aws" {
  profile = "default"
  region  = var.aws_region
}

###############################
# IAM Roles and Policies
###############################

# IAM Role for CodeBuild
resource "aws_iam_role" "codebuild_role" {
  name = "CodeBuildExpressAppRole"

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


###############################
# AWS Lambda Function
###############################

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

# Lambda function using the packaged code artifact.
resource "aws_lambda_function" "express_app" {
  function_name = var.lambda_function_name
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "app.handler"
  runtime       = "nodejs20.x"

  filename         = var.lambda_code_path
  source_code_hash = filebase64sha256(var.lambda_code_path)

  timeout = 10
}

###############################
# CodeBuild Project
###############################

locals {
  buildspec = <<EOF
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
      - aws lambda update-function-code --function-name expressApp --zip-file fileb://function.zip
      - sleep 10
      - aws lambda update-function-configuration --function-name expressApp --handler app.handler
artifacts:
  files:
    - backend/function.zip
EOF
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
    buildspec = local.buildspec
  }
}

###############################
# CodePipeline
###############################

resource "aws_codepipeline" "express_pipeline" {
  name     = "ExpressAppPipeline"
  role_arn = aws_iam_role.codepipeline_role.arn

  pipeline_type = "V2"

  artifact_store {
    type     = "S3"
    location = var.s3_bucket_name
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
        OAuthToken = var.github_token
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
# S3 Bucket for CodePipeline Artifacts
###############################

resource "aws_s3_bucket" "pipeline_bucket" {
  bucket = "aws-bookstore-artifact-s3-bucket"

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
  default     = "ap-south-1"
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

variable "s3_bucket_name" {
  description = "S3 bucket for storing pipeline artifacts"
  type        = string
}

variable "lambda_function_name" {
  description = "Lambda function name"
  type        = string
}

variable "lambda_code_path" {
  description = "Path to the Lambda function code zip file"
  type        = string
}