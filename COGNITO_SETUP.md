# Cognito 設定ガイド

## 概要

このアプリケーションは、AWS Cognitoを使用してユーザー認証を行います。Cognitoリソースは手動で作成する必要があります。

## 作成するリソース

1. **Cognito User Pool** - ユーザー認証プール
2. **Cognito User Pool Client** - Webアプリケーション用クライアント（Public Client）
3. **Cognito User Pool Domain** - Hosted UI用ドメイン

---

## 手順1: Cognito User PoolとApp Clientの作成

### 1.1 AWSマネジメントコンソールにアクセス

1. AWSマネジメントコンソールにログイン
2. リージョンを **ap-northeast-1（東京）** に設定
3. 検索バーで「Cognito」を検索し、**Amazon Cognito** を選択

### 1.2 User Poolの作成

1. 左メニューから「**User pools**」を選択
2. 「**Create user pool**」ボタンをクリック
3. **新しいUI**が表示された場合、アプリケーション作成フローを使用します

#### アプリケーションタイプの選択

- ✅ **Single Page Application (SPA)** を選択
  - このタイプを選択すると、クライアントシークレットは自動的に無効になります
- 「**Next**」をクリック

#### アプリケーション名の設定

- アプリケーション名: `manuMaruDevelop`（develop環境の場合）
- 「**Next**」をクリック

#### サインイン識別子の設定

- ✅ **メールアドレス (Email address)** をチェック
- ✅ **ユーザー名 (Username)** もチェック（オプション）
- 「**Next**」をクリック

#### 自己登録の設定

- ✅ **自己登録を有効化 (Enable self-registration)** をチェック
- **必須属性**: **email** を選択
- 「**Next**」をクリック

#### リターンURLの設定（オプション）

- **リターン URL**: `http://localhost:3000`（ローカル開発用）
- 「**Next**」をクリック

#### 確認と作成

1. 設定を確認
2. 「**Create application**」をクリック
3. 作成完了後、**Client ID** をコピー（後で使用します）

### 1.3 App Clientの設定確認

**重要**: フロントエンドアプリケーションでは、**Single Page Application (SPA)** タイプを使用する必要があります。

1. 作成されたApp Clientを開く
2. 「**アプリケーションクライアントの詳細**」セクションで以下を確認：
   - **アプリケーションタイプ**: **Single Page Application (SPA)** になっていること
   - **クライアントシークレットを生成**: **自動的にチェックが外れている**こと（SPAタイプでは自動的に無効）
3. **Client ID**をコピーして保存

---

## 手順2: Hosted UI設定

### 2.1 App ClientのHosted UI設定

1. 作成したApp Clientを開く
2. 「**Hosted UI**」タブを開く

#### Allowed callback URLs

```
http://localhost:3000
https://{CloudFrontDomainName}
```

**注意**: CloudFront URLは、CloudFormationデプロイ後に追加してください。

#### Allowed sign-out URLs

```
http://localhost:3000
https://{CloudFrontDomainName}
```

#### Allowed OAuth flows

- ✅ **Authorization code grant** をチェック
- ❌ **Implicit grant** はチェックを外す（セキュリティのため）

#### Allowed OAuth scopes

- ✅ **email**
- ✅ **openid**
- ✅ **profile**

#### 設定を保存

「**保存 (Save)**」または「**Save changes**」をクリック

### 2.2 Managed Login Page設定

1. 「**ログインページ (Login Page)**」タブを開く
2. 「**マネージドログインページの設定**」セクションを確認
3. ステータスが**「使用可能」**になっていることを確認
4. なっていない場合は、「**編集**」ボタンをクリックして設定を確認・保存

---

## 手順3: Cognito Domainの作成

### 3.1 Domainの作成

1. 左メニューから「**ブランディング (Branding)** > **ドメイン (Domain)**」を選択
2. 「**Cognito ドメイン**」セクションで「**Cognitoドメインを作成**」をクリック
3. Domain prefixを入力（例: `ap-northeast-16vhvyzczy`）
   - または、自動生成を選択
4. 「**Cognitoドメインを作成**」をクリック

### 3.2 Domain URLの確認

作成後、Domain URLが表示されます：
```
https://{domain-prefix}.auth.ap-northeast-1.amazoncognito.com
```

---

## 手順4: 環境変数の設定

### 4.1 ローカル開発環境（`.env.local`）

`.env.local` ファイルを作成または更新：

```bash
# Cognito設定
REACT_APP_USER_POOL_ID=ap-northeast-1_6vhVyzcZy
REACT_APP_USER_POOL_CLIENT_ID=43rjh9se4s70tiurtar83onpsq
REACT_APP_COGNITO_DOMAIN=ap-northeast-16vhvyzczy
REACT_APP_AWS_REGION=ap-northeast-1
REACT_APP_CALLBACK_URL=http://localhost:3000
REACT_APP_SIGNOUT_URL=http://localhost:3000

# AWS API設定
REACT_APP_AWS_API_BASE_ENDPOINT=https://pq1c6g2zzi.execute-api.ap-northeast-1.amazonaws.com/Prod/
REACT_APP_AWS_API_KEY=your-api-key-here

# その他のAWS設定
REACT_APP_AWS_REGION=ap-northeast-1
REACT_APP_AWS_BUCKET_NAME=your-bucket-name
REACT_APP_DYNAMODB_TABLE_NAME=your-table-name
```

### 4.2 本番環境（GitHub Secrets）

GitHub Actionsで使用するシークレットを設定：

1. GitHubリポジトリの「**Settings** > **Secrets and variables** > **Actions**」を開く
2. 以下のシークレットを追加：

```
REACT_APP_USER_POOL_ID
REACT_APP_USER_POOL_CLIENT_ID
REACT_APP_COGNITO_DOMAIN
REACT_APP_AWS_REGION
REACT_APP_CALLBACK_URL
REACT_APP_SIGNOUT_URL
REACT_APP_AWS_API_BASE_ENDPOINT
REACT_APP_AWS_API_KEY
REACT_APP_AWS_BUCKET_NAME
REACT_APP_DYNAMODB_TABLE_NAME
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
```

---

## 手順5: CloudFrontデプロイ後の設定

CloudFormationでCloudFront Distributionをデプロイ後：

1. CloudFormationのOutputから `CloudFrontDomainName` を取得
2. CognitoのApp Client設定にCloudFront URLを追加：
   - **Allowed callback URLs** に追加: `https://{CloudFrontDomainName}`
   - **Allowed sign-out URLs** に追加: `https://{CloudFrontDomainName}`
   - 「**保存**」をクリック

---

## トラブルシューティング

### エラー: "Login pages unavailable"

**原因**: Managed Login Page設定が正しく行われていない

**解決方法**:
1. App Clientの「ログインページ」タブを開く
2. 「マネージドログインページの設定」でステータスが「使用可能」になっているか確認
3. なっていない場合は、「編集」ボタンをクリックして設定を確認・保存

### エラー: "invalid_scope"

**原因**: Allowed OAuth scopesが正しく設定されていない

**解決方法**:
1. App Clientの「Hosted UI」タブを開く
2. 「Allowed OAuth scopes」で以下がすべてチェックされているか確認：
   - ✅ email
   - ✅ openid
   - ✅ profile

### エラー: "invalid_client_secret"

**原因**: App Clientが「従来のウェブアプリケーション」タイプで作成されている

**解決方法**:
1. 新しいApp Clientを「Single Page Application (SPA)」タイプで作成
2. SPAタイプでは、クライアントシークレットは自動的に無効になります
3. 新しいClient IDを環境変数に設定

### エラー: "/login" にリダイレクトされる

**原因**: `/oauth2/authorize` エンドポイントを使用していない

**解決方法**:
- コードは既に `/oauth2/authorize` を使用するように修正されています
- 開発サーバーを再起動してください

---

## 確認チェックリスト

- [ ] User Poolが作成されている
- [ ] App Clientが「Single Page Application (SPA)」タイプで作成されている
- [ ] SPAタイプでは、クライアントシークレットは自動的に無効になっている
- [ ] Allowed callback URLsに `http://localhost:3000` が登録されている
- [ ] Allowed sign-out URLsに `http://localhost:3000` が登録されている
- [ ] Allowed OAuth flowsで「Authorization code grant」がチェックされている
- [ ] Allowed OAuth scopesで「email」「openid」「profile」がすべてチェックされている
- [ ] Cognito Domainが作成されている
- [ ] Managed Login Page設定のステータスが「使用可能」
- [ ] `.env.local` に正しい値が設定されている
- [ ] ローカル環境でログインが動作することを確認

---

**作成日**: 2026-01-04
**バージョン**: 2.0

