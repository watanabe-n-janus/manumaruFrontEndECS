# GitHub Environments設定ガイド

## 概要

GitHub Environmentsを使用すると、developとproductionで異なるAWSアカウントや設定を使用できます。

## SecretsとVariablesの違い

### Secrets（シークレット）
- **用途**: 機密情報（パスワード、APIキー、アクセスキーなど）
- **暗号化**: 保存時に暗号化される
- **表示**: 値は表示されない（マスクされる）
- **例**: 
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `REACT_APP_AWS_API_KEY`

### Variables（変数）
- **用途**: 非機密情報（設定値、URLなど）
- **暗号化**: 暗号化されない（平文で保存）
- **表示**: 値が表示される
- **例**:
  - `AWS_REGION`
  - `REACT_APP_AWS_REGION`
  - `REACT_APP_CALLBACK_URL`

**推奨**: 機密情報は必ずSecretsを使用してください。

---

## Environmentの設定方法

### 1. Environmentの作成

1. GitHubリポジトリの「**Settings** > **Environments**」を開く
2. 「**New environment**」をクリック
3. 環境名を入力（例: `develop`, `production`）
4. 「**Configure environment**」をクリック

### 2. Environment Secretsの設定

各Environmentで、以下のシークレットを設定：

#### develop環境

**AWS認証情報（develop環境用）**:
```
AWS_ACCESS_KEY_ID          # develop環境のAWSアカウントのアクセスキー
AWS_SECRET_ACCESS_KEY      # develop環境のAWSアカウントのシークレットキー
AWS_REGION                 # ap-northeast-1（オプション）
```

**アプリケーション設定**:
```
REACT_APP_USER_POOL_ID
REACT_APP_USER_POOL_CLIENT_ID
REACT_APP_COGNITO_DOMAIN
REACT_APP_CALLBACK_URL
REACT_APP_SIGNOUT_URL
REACT_APP_AWS_API_BASE_ENDPOINT
REACT_APP_AWS_API_KEY
REACT_APP_AWS_BUCKET_NAME
REACT_APP_DYNAMODB_TABLE_NAME
```

#### production環境

**AWS認証情報（production環境用）**:
```
AWS_ACCESS_KEY_ID          # production環境のAWSアカウントのアクセスキー（developとは異なる）
AWS_SECRET_ACCESS_KEY      # production環境のAWSアカウントのシークレットキー（developとは異なる）
AWS_REGION                 # ap-northeast-1（オプション）
```

**アプリケーション設定**:
```
REACT_APP_USER_POOL_ID
REACT_APP_USER_POOL_CLIENT_ID
REACT_APP_COGNITO_DOMAIN
REACT_APP_CALLBACK_URL
REACT_APP_SIGNOUT_URL
REACT_APP_AWS_API_BASE_ENDPOINT
REACT_APP_AWS_API_KEY
REACT_APP_AWS_BUCKET_NAME
REACT_APP_DYNAMODB_TABLE_NAME
```

### 3. Environment Variablesの設定（オプション）

非機密情報はVariablesとして設定できます：

```
AWS_REGION=ap-northeast-1
REACT_APP_AWS_REGION=ap-northeast-1
```

---

## 異なるAWSアカウントを使用する場合

### 設定手順

1. **develop環境の設定**:
   - Environment: `develop`
   - `AWS_ACCESS_KEY_ID`: develop環境のAWSアカウントのアクセスキー
   - `AWS_SECRET_ACCESS_KEY`: develop環境のAWSアカウントのシークレットキー

2. **production環境の設定**:
   - Environment: `production`
   - `AWS_ACCESS_KEY_ID`: production環境のAWSアカウントのアクセスキー（developとは異なる）
   - `AWS_SECRET_ACCESS_KEY`: production環境のAWSアカウントのシークレットキー（developとは異なる）

### 動作確認

各環境で異なるAWSアカウントが使用されていることを確認：

```bash
# develop環境のワークフロー実行時
aws sts get-caller-identity
# → develop環境のAWSアカウントIDが表示される

# production環境のワークフロー実行時
aws sts get-caller-identity
# → production環境のAWSアカウントIDが表示される
```

---

## Environment保護ルール（オプション）

production環境に保護ルールを設定できます：

1. Environment設定画面で「**Required reviewers**」を有効化
2. 承認が必要なユーザーまたはチームを指定
3. production環境へのデプロイには承認が必要になる

---

## 現在の設定確認

現在のワークフローは以下のように設定されています：

- **develop環境**: `.github/workflows/deploy-test.yml`
  - `environment: develop`
  - develop環境のSecrets/Variablesを使用

- **production環境**: `.github/workflows/deploy-production.yml`
  - `environment: production`
  - production環境のSecrets/Variablesを使用

---

## トラブルシューティング

### エラー: "Credentials could not be loaded"

**原因**: Environment Secretsが設定されていない

**解決方法**:
1. GitHubリポジトリの「**Settings** > **Environments**」を開く
2. 該当のEnvironment（`develop`または`production`）を選択
3. 「**Add secret**」をクリック
4. `AWS_ACCESS_KEY_ID`と`AWS_SECRET_ACCESS_KEY`を設定

### エラー: "Environment not found"

**原因**: Environmentが作成されていない

**解決方法**:
1. GitHubリポジトリの「**Settings** > **Environments**」を開く
2. 「**New environment**」をクリック
3. 環境名を入力（`develop`または`production`）
4. 「**Configure environment**」をクリック

---

**作成日**: 2026-01-04
**バージョン**: 1.0

