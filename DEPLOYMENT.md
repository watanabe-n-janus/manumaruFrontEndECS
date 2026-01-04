# デプロイメントガイド

## 概要

このプロジェクトは、GitHub Actionsを使用して自動デプロイを行います。

- **testブランチ** → `develop`環境にデプロイ
- **main/master/productionブランチ** → `production`環境にデプロイ

## デプロイフロー

1. **コードをビルド** - Reactアプリケーションをビルド
2. **CloudFormationスタックをデプロイ** - S3バケットとCloudFront Distributionを作成/更新
3. **S3にアップロード** - ビルドしたファイルをS3バケットにアップロード
4. **CloudFrontキャッシュを無効化** - 変更を即座に反映

## 初回セットアップ

### 1. GitHub Secretsの設定

GitHubリポジトリの「**Settings** > **Secrets and variables** > **Actions**」で以下のシークレットを設定：

#### 共通シークレット

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION=ap-northeast-1
```

#### develop環境用シークレット

```
REACT_APP_USER_POOL_ID
REACT_APP_USER_POOL_CLIENT_ID
REACT_APP_COGNITO_DOMAIN
REACT_APP_AWS_REGION=ap-northeast-1
REACT_APP_CALLBACK_URL=https://your-cloudfront-domain.cloudfront.net
REACT_APP_SIGNOUT_URL=https://your-cloudfront-domain.cloudfront.net
REACT_APP_AWS_API_BASE_ENDPOINT
REACT_APP_AWS_API_KEY
REACT_APP_AWS_BUCKET_NAME
REACT_APP_DYNAMODB_TABLE_NAME
```

#### production環境用シークレット（オプション）

production環境が異なる値を使用する場合：

```
REACT_APP_USER_POOL_ID_PROD
REACT_APP_USER_POOL_CLIENT_ID_PROD
REACT_APP_COGNITO_DOMAIN_PROD
REACT_APP_CALLBACK_URL_PROD
REACT_APP_SIGNOUT_URL_PROD
REACT_APP_AWS_API_BASE_ENDPOINT_PROD
REACT_APP_AWS_API_KEY_PROD
REACT_APP_AWS_BUCKET_NAME_PROD
REACT_APP_DYNAMODB_TABLE_NAME_PROD
```

### 2. 初回CloudFormationデプロイ

初回は、GitHub Actionsを実行する前に、手動でCloudFormationスタックを作成することを推奨します：

```bash
cd cloudformation
./scripts/deploy.sh develop
```

### 3. CloudFront URLをCognitoに追加

CloudFormationデプロイ後：

1. CloudFormationのOutputから `CloudFrontDomainName` を取得
2. CognitoのApp Client設定に追加：
   - **Allowed callback URLs**: `https://{CloudFrontDomainName}`
   - **Allowed sign-out URLs**: `https://{CloudFrontDomainName}`
3. GitHub Secretsの `REACT_APP_CALLBACK_URL` と `REACT_APP_SIGNOUT_URL` を更新

## デプロイ方法

### develop/testブランチにデプロイ

```bash
git checkout develop  # または test, test-clean
git add .
git commit -m "Your commit message"
git push origin develop
```

GitHub Actionsが自動的に実行され、`develop`環境にデプロイされます。

**対応ブランチ**:
- `develop`
- `test`
- `test-clean`

### production環境にデプロイ

```bash
git checkout main
git merge test
git push origin main
```

GitHub Actionsが自動的に実行され、`production`環境にデプロイされます。

## デプロイ後の確認

1. GitHub Actionsのワークフロー実行を確認
2. CloudFormationスタックの状態を確認
3. CloudFront URLにアクセスして動作確認
4. Cognito認証が正常に動作することを確認

## トラブルシューティング

### CloudFormationスタックが作成されない

- AWS認証情報が正しく設定されているか確認
- IAM権限が十分か確認（CloudFormation、S3、CloudFrontの権限）

### S3へのアップロードが失敗する

- S3バケットが正しく作成されているか確認
- IAM権限にS3への書き込み権限があるか確認

### CloudFrontキャッシュが無効化されない

- CloudFront Distribution IDが正しく取得できているか確認
- IAM権限にCloudFrontの無効化権限があるか確認

---

**作成日**: 2026-01-04
**バージョン**: 1.0

