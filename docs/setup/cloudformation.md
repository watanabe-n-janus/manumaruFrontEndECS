# CloudFormation デプロイメントガイド

## 概要

このディレクトリには、ManuMaru Frontend の ECS + CloudFront インフラストラクチャを構築するためのCloudFormationテンプレートが含まれています。

## ディレクトリ構造

```
cloudformation/
├── templates/
│   └── main.yaml          # メインCloudFormationテンプレート
├── parameters/
│   ├── develop.json       # develop環境のパラメータ
│   └── production.json    # production環境のパラメータ
├── scripts/
│   ├── deploy.sh          # デプロイスクリプト
│   ├── get-outputs.sh     # Output取得スクリプト（ローカル開発用）
│   └── validate.sh        # テンプレート検証スクリプト
└── README.md              # このファイル
```

## 前提条件

- AWS CLI がインストールされ、設定されていること
- 適切なIAM権限があること
- jq がインストールされていること（get-outputs.sh使用時）

## デプロイ手順

### 1. 初回デプロイ（develop環境）

```bash
cd cloudformation/scripts
./deploy.sh develop
```

### 2. ローカル開発環境の設定

デプロイ後、CloudFormationのOutputを取得して`.env.local`ファイルを作成：

```bash
cd cloudformation/scripts
./get-outputs.sh develop > ../../.env.local
```

`.env.local`ファイルには以下のような内容が出力されます：

```bash
REACT_APP_USER_POOL_ID=ap-northeast-1_xxxxxxxxx
REACT_APP_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
REACT_APP_COGNITO_DOMAIN=manumaru-dev-develop
REACT_APP_COGNITO_HOSTED_UI_URL=https://manumaru-dev-develop.auth.ap-northeast-1.amazoncognito.com
REACT_APP_AWS_REGION=ap-northeast-1
REACT_APP_CALLBACK_URL=http://localhost:3000
REACT_APP_SIGNOUT_URL=http://localhost:3000
```

### 3. CloudFront URLの更新

初回デプロイ後、CloudFrontのURLが確定します。そのURLをCognitoのコールバックURLに追加する必要があります：

1. CloudFormationのOutputから`CloudFrontURL`を確認
2. AWS CognitoコンソールでUser Pool Clientの設定を開く
3. コールバックURLにCloudFront URLを追加
4. サインアウトURLにもCloudFront URLを追加

または、パラメータファイルを更新してスタックを更新：

```bash
# parameters/develop.json を編集して CognitoCallbackURL に CloudFront URL を追加
./deploy.sh develop
```

### 4. Production環境のデプロイ

```bash
./deploy.sh production
```

## スタックの更新

スタックを更新する場合も同じコマンドを使用：

```bash
./deploy.sh develop
```

## テンプレートの検証

デプロイ前にテンプレートを検証：

```bash
./validate.sh
```

## スタックの削除

```bash
aws cloudformation delete-stack --stack-name manumaruFrontECS-develop
```

## 作成されるリソース

- **S3 Bucket**: 静的ファイル用
- **CloudFront Distribution**: CDN配信
- **Cognito User Pool**: 認証用
- **Cognito User Pool Client**: Webアプリケーション用
- **Cognito User Pool Domain**: Hosted UI用

## 出力値（Outputs）

- `CloudFrontDistributionId`: CloudFront Distribution ID
- `CloudFrontDomainName`: CloudFront ドメイン名
- `CloudFrontURL`: CloudFront URL
- `S3BucketName`: S3バケット名
- `CognitoUserPoolId`: Cognito User Pool ID
- `CognitoUserPoolClientId`: Cognito User Pool Client ID
- `CognitoHostedUIDomain`: Cognito Hosted UI ドメイン
- `CognitoHostedUIURL`: Cognito Hosted UI URL
- `CognitoRegion`: AWSリージョン

## トラブルシューティング

### スタック作成に失敗する場合

1. CloudFormationコンソールでイベントを確認
2. エラーメッセージを確認
3. IAM権限を確認

### Cognitoドメインが既に使用されている場合

`CognitoDomainPrefix`パラメータを変更してください。

### S3バケット名が既に使用されている場合

バケット名は自動的に一意になるように設定されていますが、問題が発生した場合はテンプレートを確認してください。

## 注意事項

- 初回デプロイ後、CloudFront URLをCognitoのコールバックURLに追加する必要があります
- ローカル開発環境では`http://localhost:3000`が既にコールバックURLに含まれています
- Production環境では、デプロイ後にCloudFront URLを手動で追加するか、パラメータファイルを更新してスタックを更新してください


