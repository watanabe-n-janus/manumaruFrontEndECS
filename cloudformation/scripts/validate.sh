#!/bin/bash

# CloudFormation テンプレート検証スクリプト
# Usage: ./validate.sh
# Note: AWS_PROFILE環境変数が設定されている場合、それを使用します

set -e

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

TEMPLATE_FILE="$PROJECT_ROOT/cloudformation/templates/main.yaml"

# AWS_PROFILEの確認
if [ -n "$AWS_PROFILE" ]; then
  echo "✓ Using AWS Profile: $AWS_PROFILE"
  export AWS_PROFILE
fi

if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "Error: Template file not found: $TEMPLATE_FILE"
  exit 1
fi

echo "Validating CloudFormation template: $TEMPLATE_FILE"

aws cloudformation validate-template \
  --template-body file://$TEMPLATE_FILE

if [ $? -eq 0 ]; then
  echo "✓ Template validation successful"
else
  echo "✗ Template validation failed"
  exit 1
fi

