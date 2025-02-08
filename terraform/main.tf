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

resource "aws_s3_bucket" "build_badges_bucket" {
  bucket = var.build_badges_bucket_name

  tags = {
    Name        = "build_badges_bucket"
    Environment = "Production"
  }
}

resource "aws_s3_bucket_public_access_block" "build_badges_bucket_access" {
  bucket                  = aws_s3_bucket.build_badges_bucket.id
  block_public_acls       = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "build_badges_bucket_policy" {
  bucket = aws_s3_bucket.build_badges_bucket.id
  policy = data.aws_iam_policy_document.build_badges_bucket_policy.json
}

data "aws_iam_policy_document" "build_badges_bucket_policy" {
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
      aws_s3_bucket.build_badges_bucket.arn,
      "${aws_s3_bucket.build_badges_bucket.arn}/*"
    ]
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
    finally:
      - |
        if [ "$buildExitCode" -ne 0 ]; then
          badge_status=failing
          badge_colour=red
        else
          badge_status=passing
          badge_colour=green
        fi
      - curl -s "https://img.shields.io/badge/Frontend_CodePipeline-$badge_status-$badge_colour.svg" > frontend-build.svg
      - aws s3 cp frontend-build.svg s3://$S3_BUCKET_BUILD_BADGES/badges/frontend-build.svg --cache-control no-cache
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
      - npm install --production
  build:
    commands:
      - echo "Packaging Lambda function code..."
      - zip -r function.zip . -x "*.git*" -x "README.md" -x "mockdata.md"
  post_build:
    commands:
      - echo "Deploying to AWS Lambda..."
      - aws lambda update-function-code --function-name book-store-skyops --zip-file fileb://function.zip
      - sleep 10
      - aws lambda update-function-configuration --function-name book-store-skyops --handler lambda.handler
    finally:
      - |
        if [ "$buildExitCode" -ne 0 ]; then
          badge_status=failing
          badge_colour=red
        else
          badge_status=passing
          badge_colour=green
        fi
      - curl -s "https://img.shields.io/badge/Backend_Codepipeline-$badge_status-$badge_colour.svg" > backend-build.svg
      - aws s3 cp backend-build.svg s3://$S3_BUCKET_BUILD_BADGES/badges/backend-build.svg --cache-control no-cache

artifacts:
  files:
    - backend/function.zip
EOF
}

resource "aws_codebuild_project" "book_store_front_build" {
  name          = "BookStoreFrontBuild"
  service_role  = aws_iam_role.codebuild_role.arn
  build_timeout = 15
  
  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type = "BUILD_LAMBDA_1GB"
    image        = "aws/codebuild/amazonlinux-x86_64-lambda-standard:nodejs20"
    type         = "LINUX_LAMBDA_CONTAINER"

    environment_variable {
      name  = "AWS_DEFAULT_REGION"
      value = var.aws_region
    }

    environment_variable {
      name  = "S3_BUCKET"
      value = aws_s3_bucket.book_store_front_bucket.bucket
    }

    environment_variable {
      name  = "S3_BUCKET_BUILD_BADGES"
      value = aws_s3_bucket.build_badges_bucket.bucket
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
  build_timeout = 15

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type = "BUILD_LAMBDA_1GB"
    image        = "aws/codebuild/amazonlinux-x86_64-lambda-standard:nodejs20"
    type            = "LINUX_LAMBDA_CONTAINER"
    privileged_mode = false

    environment_variable {
      name  = "S3_BUCKET_BUILD_BADGES"
      value = aws_s3_bucket.build_badges_bucket.bucket
    }
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
  handler       = "lambda.handler"
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
  hash_key     = "username"

  attribute {
    name = "username"
    type = "S"
  }

  attribute {
    name = "password"
    type = "S"
  }

  attribute {
    name = "id"
    type = "S"  # This is used for the GSI
  }

  global_secondary_index {
    name            = "id-index"
    hash_key        = "id"
    projection_type = "ALL"
  }

  # Dummy GSI for password to satisfy the requirement
  global_secondary_index {
    name            = "password-index"
    hash_key        = "password"
    projection_type = "ALL"
  }

  tags = {
    Environment = "production"
  }
}

resource "aws_dynamodb_table" "books" {
  name         = "books"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "isbn"

  attribute {
    name = "isbn"
    type = "S"
  }

  attribute {
    name = "book_id"
    type = "S"
  }

  attribute {
    name = "title"
    type = "S"
  }

  attribute {
    name = "description"
    type = "S"
  }

  attribute {
    name = "author"
    type = "S"
  }

  attribute {
    name = "price"
    type = "N"
  }

  attribute {
    name = "cover_url"
    type = "S"
  }

  # Adding GSIs for attributes that are not primary keys
  global_secondary_index {
    name            = "author-index"
    hash_key        = "author"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "title-index"
    hash_key        = "title"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "price-index"
    hash_key        = "price"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "book_id-index"
    hash_key        = "book_id"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "description-index"
    hash_key        = "description"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "cover_url-index"
    hash_key        = "cover_url"
    projection_type = "ALL"
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

  attribute {
    name = "purchased_user"
    type = "S"
  }

  attribute {
    name = "purchased_book_title"
    type = "S"
  }

  attribute {
    name = "purchased_book_author"
    type = "S"
  }

  attribute {
    name = "purchased_book_isbn"
    type = "S"
  }

  attribute {
    name = "purchased_book_price"
    type = "N"
  }

  # GSI to query purchases by username
  global_secondary_index {
    name            = "purchased_user-index"
    hash_key        = "purchased_user"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "purchased_book_title-index"
    hash_key        = "purchased_book_title"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "purchased_book_author-index"
    hash_key        = "purchased_book_author"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "purchased_book_isbn-index"
    hash_key        = "purchased_book_isbn"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "purchased_book_price-index"
    hash_key        = "purchased_book_price"
    projection_type = "ALL"
  }

  tags = {
    Environment = "production"
  }
}


###############################
# API Gateway for Express Lambda Function
###############################

# Create the API Gateway REST API
resource "aws_api_gateway_rest_api" "express_api" {
  name        = "express_api"
  description = "API Gateway for Express Lambda function using Lambda proxy integration"
}

# Create a proxy resource to capture all paths
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.express_api.id
  parent_id   = aws_api_gateway_rest_api.express_api.root_resource_id
  path_part   = "{proxy+}"
}

# Create an ANY method on the proxy resource
resource "aws_api_gateway_method" "any_method" {
  rest_api_id   = aws_api_gateway_rest_api.express_api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

# Integrate the ANY method with your Lambda function using AWS_PROXY integration
resource "aws_api_gateway_integration" "lambda_proxy" {
  rest_api_id             = aws_api_gateway_rest_api.express_api.id
  resource_id             = aws_api_gateway_resource.proxy.id
  http_method             = aws_api_gateway_method.any_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.express_app.invoke_arn
}

resource "aws_api_gateway_deployment" "express_api_deployment" {
  depends_on  = [aws_api_gateway_integration.lambda_proxy]
  rest_api_id = aws_api_gateway_rest_api.express_api.id

  triggers = {
    redeployment = sha1(jsonencode({
      lambda_integration_uri = aws_api_gateway_integration.lambda_proxy.uri
    }))
  }
}

# Explicitly create a stage for the deployment
resource "aws_api_gateway_stage" "express_api_stage" {
  stage_name    = "prod"
  rest_api_id   = aws_api_gateway_rest_api.express_api.id
  deployment_id = aws_api_gateway_deployment.express_api_deployment.id
}

# Allow API Gateway to invoke your Lambda function
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.express_app.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.express_api.execution_arn}/*/*"
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

variable "build_badges_bucket_name" {
  description = "S3 bucket for storing build badges"
  type        = string
}
