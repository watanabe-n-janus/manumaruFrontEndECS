#!/bin/bash

# CloudFormation Output取得スクリプト（ローカル開発用）
# Usage: ./get-outputs.sh [develop|production] > .env.local
# Note: AWS_PROFILE環境変数が設定されている場合、それを使用します

set -e

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

ENVIRONMENT=${1:-develop}
STACK_NAME="manumaruFrontECS-${ENVIRONMENT}"

# AWS_PROFILEの確認
if [ -n "$AWS_PROFILE" ]; then
  echo "# Using AWS Profile: $AWS_PROFILE" >&2
  export AWS_PROFILE
fi

if ! aws cloudformation describe-stacks --stack-name "$STACK_NAME" > /dev/null 2>&1; then
  echo "Error: Stack not found: $STACK_NAME"
  echo "Please deploy the stack first using: ./deploy.sh $ENVIRONMENT"
  exit 1
fi

echo "# CloudFormation Outputs for $ENVIRONMENT environment"
echo "# Generated on $(date)"
echo ""

# Outputsを取得して環境変数形式で出力
# jqが利用可能な場合
if command -v jq &> /dev/null; then
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs' \
    --output json | \
    jq -r '.[] | "REACT_APP_\(.OutputKey | ascii_upcase)=\(.OutputValue)"' | \
    sed 's/REACT_APP_CLOUDFRONTDISTRIBUTIONID/REACT_APP_CLOUDFRONT_DISTRIBUTION_ID/' | \
    sed 's/REACT_APP_CLOUDFRONTDOMAINNAME/REACT_APP_CLOUDFRONT_DOMAIN_NAME/' | \
    sed 's/REACT_APP_CLOUDFRONTURL/REACT_APP_CLOUDFRONT_URL/' | \
    sed 's/REACT_APP_S3BUCKETNAME/REACT_APP_S3_BUCKET_NAME/' | \
    sed 's/REACT_APP_COGNITOUSERPOOLID/REACT_APP_USER_POOL_ID/' | \
    sed 's/REACT_APP_COGNITOUSERPOOLCLIENTID/REACT_APP_USER_POOL_CLIENT_ID/' | \
    sed 's/REACT_APP_COGNITOHOSTEDUIDOMAIN/REACT_APP_COGNITO_DOMAIN/' | \
    sed 's/REACT_APP_COGNITOHOSTEDUIURL/REACT_APP_COGNITO_HOSTED_UI_URL/' | \
    sed 's/REACT_APP_COGNITOREGION/REACT_APP_AWS_REGION/'
else
  # jqが利用できない場合、Pythonを使用
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs' \
    --output json | \
    python3 << 'PYEOF'
import json
import sys

outputs = json.load(sys.stdin)
mapping = {
    'CloudFrontDistributionId': 'REACT_APP_CLOUDFRONT_DISTRIBUTION_ID',
    'CloudFrontDomainName': 'REACT_APP_CLOUDFRONT_DOMAIN_NAME',
    'CloudFrontURL': 'REACT_APP_CLOUDFRONT_URL',
    'S3BucketName': 'REACT_APP_S3_BUCKET_NAME',
    'CognitoUserPoolId': 'REACT_APP_USER_POOL_ID',
    'CognitoUserPoolClientId': 'REACT_APP_USER_POOL_CLIENT_ID',
    'CognitoHostedUIDomain': 'REACT_APP_COGNITO_DOMAIN',
    'CognitoHostedUIURL': 'REACT_APP_COGNITO_HOSTED_UI_URL',
    'CognitoRegion': 'REACT_APP_AWS_REGION'
}

for output in outputs:
    key = output['OutputKey']
    value = output['OutputValue']
    env_key = mapping.get(key, f"REACT_APP_{key.upper()}")
    print(f"{env_key}={value}")
PYEOF
fi

# 追加の環境変数
# 注意: これらはAmplify使用時のみ必要です
# Amplify削除後、Cognito直接実装に移行する際は削除可能です
# （リダイレクトURLはCognito User Pool Client側で管理）
echo ""
echo "# Additional configuration (Amplify用 - 移行後は削除可能)"
echo "REACT_APP_CALLBACK_URL=http://localhost:3000"
echo "REACT_APP_SIGNOUT_URL=http://localhost:3000"
