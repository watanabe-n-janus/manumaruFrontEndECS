# GitHub Environment Secrets設定手順

## 概要

GitHub Environment 'develop' で AWS認証情報を設定する手順です。

## 手順1: Environmentの作成（まだ作成していない場合）

1. GitHubリポジトリにアクセス
2. 「**Settings**」タブをクリック
3. 左メニューから「**Environments**」を選択
4. 「**New environment**」ボタンをクリック
5. 環境名に `develop` を入力
6. 「**Configure environment**」をクリック

## 手順2: Environment Secretsの設定

### 2.1 develop環境の設定

1. 「**Environments**」ページで `develop` をクリック
2. 「**Environment secrets**」セクションで「**Add secret**」をクリック
3. 以下のシークレットを追加：

#### 必須のAWS認証情報

**AWS_ACCESS_KEY_ID**:
- Name: `AWS_ACCESS_KEY_ID`
- Secret: develop環境のAWSアカウントのアクセスキーID
- 「**Add secret**」をクリック

**AWS_SECRET_ACCESS_KEY**:
- Name: `AWS_SECRET_ACCESS_KEY`
- Secret: develop環境のAWSアカウントのシークレットアクセスキー
- 「**Add secret**」をクリック

**AWS_REGION** (オプション):
- Name: `AWS_REGION`
- Secret: `ap-northeast-1`
- 「**Add secret**」をクリック

#### アプリケーション設定（既に設定済みの場合はスキップ）

以下のシークレットも設定されていることを確認：

- `REACT_APP_USER_POOL_ID`
- `REACT_APP_USER_POOL_CLIENT_ID`
- `REACT_APP_COGNITO_DOMAIN`
- `REACT_APP_CALLBACK_URL`
- `REACT_APP_SIGNOUT_URL`
- `REACT_APP_AWS_API_BASE_ENDPOINT`
- `REACT_APP_AWS_API_KEY`
- `REACT_APP_AWS_BUCKET_NAME`
- `REACT_APP_DYNAMODB_TABLE_NAME`

### 2.2 production環境の設定（必要に応じて）

1. 「**Environments**」ページで「**New environment**」をクリック
2. 環境名に `production` を入力
3. 「**Configure environment**」をクリック
4. 上記と同様に、production環境用のAWS認証情報を設定

## 手順3: AWS認証情報の取得方法

### 3.1 IAMユーザーの作成（推奨）

1. AWSマネジメントコンソールにログイン
2. 「**IAM**」サービスを開く
3. 左メニューから「**Users**」を選択
4. 「**Create user**」をクリック
5. ユーザー名を入力（例: `github-actions-develop`）
6. 「**Next**」をクリック
7. 「**Attach policies directly**」を選択
8. 以下のポリシーをアタッチ：
   - `CloudFormationFullAccess`（または必要な権限のみ）
   - `AmazonS3FullAccess`（または必要な権限のみ）
   - `CloudFrontFullAccess`（または必要な権限のみ）
9. 「**Next**」をクリック
10. 「**Create user**」をクリック

### 3.2 アクセスキーの作成

1. 作成したユーザーをクリック
2. 「**Security credentials**」タブを開く
3. 「**Create access key**」をクリック
4. 「**Command Line Interface (CLI)**」を選択
5. 「**Next**」をクリック
6. 説明を入力（例: `GitHub Actions for develop environment`）
7. 「**Create access key**」をクリック
8. **重要**: アクセスキーIDとシークレットアクセスキーをコピー
   - シークレットアクセスキーは後で表示できません
   - 安全な場所に保存してください

### 3.3 GitHub Environment Secretsに設定

1. コピーしたアクセスキーIDを `AWS_ACCESS_KEY_ID` として設定
2. コピーしたシークレットアクセスキーを `AWS_SECRET_ACCESS_KEY` として設定

## 手順4: 設定の確認

### 4.1 GitHub Environment Secretsの確認

1. 「**Settings** > **Environments** > **develop**」を開く
2. 「**Environment secrets**」セクションで以下が表示されていることを確認：
   - ✅ `AWS_ACCESS_KEY_ID`
   - ✅ `AWS_SECRET_ACCESS_KEY`
   - ✅ `AWS_REGION`（オプション）

### 4.2 ワークフローの再実行

1. GitHub Actionsのページを開く
2. 失敗したワークフローを再実行
3. 「**Check AWS secrets (detailed)**」ステップで以下が表示されることを確認：
   - ✅ `AWS_ACCESS_KEY_ID: SET`
   - ✅ `AWS_SECRET_ACCESS_KEY: SET`

## トラブルシューティング

### エラー: "AWS_ACCESS_KEY_ID: NOT SET"

**原因**: GitHub Environment 'develop' で `AWS_ACCESS_KEY_ID` が設定されていない

**解決方法**:
1. 「**Settings** > **Environments** > **develop**」を開く
2. 「**Environment secrets**」セクションで「**Add secret**」をクリック
3. Name: `AWS_ACCESS_KEY_ID`、Secret: AWSアクセスキーIDを入力
4. 「**Add secret**」をクリック

### エラー: "AWS_SECRET_ACCESS_KEY: NOT SET"

**原因**: GitHub Environment 'develop' で `AWS_SECRET_ACCESS_KEY` が設定されていない

**解決方法**:
1. 「**Settings** > **Environments** > **develop**」を開く
2. 「**Environment secrets**」セクションで「**Add secret**」をクリック
3. Name: `AWS_SECRET_ACCESS_KEY`、Secret: AWSシークレットアクセスキーを入力
4. 「**Add secret**」をクリック

### エラー: "Environment not found"

**原因**: GitHub Environment 'develop' が作成されていない

**解決方法**:
1. 「**Settings** > **Environments**」を開く
2. 「**New environment**」をクリック
3. 環境名に `develop` を入力
4. 「**Configure environment**」をクリック

### Repository SecretsとEnvironment Secretsの違い

- **Repository Secrets**: リポジトリ全体で使用可能（Environment指定なし）
- **Environment Secrets**: 特定のEnvironmentでのみ使用可能（`environment: develop` 指定時）

**現在のワークフローは `environment: develop` を使用しているため、Environment Secretsが必要です。**

Repository Secretsを使用する場合は、ワークフローから `environment: develop` を削除するか、Environment Secretsに移動してください。

---

**作成日**: 2026-01-04
**バージョン**: 1.0

