#!/bin/bash

# CloudFormation デプロイスクリプト
# Usage: ./deploy.sh [develop|production]
# Note: AWS_PROFILE環境変数が設定されている場合、それを使用します
# Example: export AWS_PROFILE=panaDevTake && ./deploy.sh develop

set -e

# スクリプトのディレクトリを取得（どこから実行しても動作するように）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

ENVIRONMENT=${1:-develop}
STACK_NAME="manumaruFrontECS-${ENVIRONMENT}"
PARAMETER_FILE="$PROJECT_ROOT/cloudformation/parameters/${ENVIRONMENT}.json"
TEMPLATE_FILE="$PROJECT_ROOT/cloudformation/templates/main.yaml"

# AWS_PROFILEの確認
if [ -z "$AWS_PROFILE" ]; then
  echo "⚠️  Warning: AWS_PROFILE is not set. Using default AWS credentials."
  echo "   To use a specific profile, run: export AWS_PROFILE=your-profile-name"
else
  echo "✓ Using AWS Profile: $AWS_PROFILE"
  export AWS_PROFILE
fi

# AWS認証情報の確認
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
  echo "❌ Error: Failed to authenticate with AWS"
  echo "   Please check your AWS credentials or AWS_PROFILE setting"
  exit 1
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_USER=$(aws sts get-caller-identity --query Arn --output text)
echo "✓ Authenticated as: $AWS_USER (Account: $AWS_ACCOUNT)"

if [ ! -f "$PARAMETER_FILE" ]; then
  echo "Error: Parameter file not found: $PARAMETER_FILE"
  exit 1
fi

if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "Error: Template file not found: $TEMPLATE_FILE"
  exit 1
fi

echo ""
echo "=========================================="
echo "Deploying CloudFormation Stack"
echo "=========================================="
echo "Stack Name: $STACK_NAME"
echo "Environment: $ENVIRONMENT"
echo "Template: $TEMPLATE_FILE"
echo "Parameters: $PARAMETER_FILE"
echo "AWS Account: $AWS_ACCOUNT"
echo "=========================================="
echo ""

# テンプレートの検証
echo "Validating CloudFormation template..."
aws cloudformation validate-template \
  --template-body file://$TEMPLATE_FILE \
  > /dev/null

if [ $? -eq 0 ]; then
  echo "✓ Template validation successful"
else
  echo "✗ Template validation failed"
  exit 1
fi

# スタックの存在確認
if aws cloudformation describe-stacks --stack-name "$STACK_NAME" > /dev/null 2>&1; then
  echo "Stack exists, updating..."
  aws cloudformation update-stack \
    --stack-name "$STACK_NAME" \
    --template-body file://$TEMPLATE_FILE \
    --parameters file://$PARAMETER_FILE \
    --capabilities CAPABILITY_NAMED_IAM
  
  echo "Waiting for stack update to complete..."
  aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME"
else
  echo "Stack does not exist, creating..."
  aws cloudformation create-stack \
    --stack-name "$STACK_NAME" \
    --template-body file://$TEMPLATE_FILE \
    --parameters file://$PARAMETER_FILE \
    --capabilities CAPABILITY_NAMED_IAM
  
  echo "Waiting for stack creation to complete..."
  aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME"
fi

echo "✓ Stack deployment completed successfully"
echo ""
echo "Stack Outputs:"
aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query 'Stacks[0].Outputs' \
  --output table

