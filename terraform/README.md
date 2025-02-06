# Terraform AWS Configuration

This project contains a Terraform configuration for deploying an AWS-based Express app with Lambda, CodePipeline, and other resources. To configure the project for your environment, you need to update the following variables as needed:

## Variables to Update

- **`aws_region`**: The AWS region where you want to deploy the resources. Example: 

- **`github_owner`**: Your GitHub username or organization name.

- **`github_repo`**: The name of the GitHub repository you want to use with CodePipeline.

- **`github_branch`**: The GitHub branch you want CodePipeline to use (default is `main`).

- **`github_token`**: Your GitHub OAuth token for CodePipeline. Ensure this token has the necessary permissions for accessing the repository.

- **`s3_bucket_name`**: The name of the S3 bucket where the CodePipeline artifacts will be stored.

- **`lambda_function_name`**: The name of the Lambda function to deploy the code to.

- **`lambda_code_path`**: The local path to the zipped Lambda function code. Update it if the path to your Lambda code changes.

#### Example
```hcl
aws_region           = "ap-south-1"

github_owner         = "your-github-username"
github_repo          = "your-repo-name"
github_branch        = "main"
github_token         = "your-github-token"

s3_bucket_name       = "your-s3-bucket-name"

lambda_function_name = "your-lambda-function-name"
lambda_code_path     = "path/to/your/lambda-code.zip"
```

---

## How to Update

1. Open the `terraform.tfvars` file.
2. Replace the default values with your own values for each variable.
3. Save the file and run `terraform apply` to deploy the updated configuration.

---

**Note:** Be sure to keep your `github_token` private and secure. Consider using environment variables or AWS Secrets Manager for better security practices.
