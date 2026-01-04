# Cognito 手動作成手順書

## 概要

CloudFormationでのCognito作成が困難な場合、AWSマネジメントコンソールから手動でCognitoリソースを作成する手順です。

## 前提条件

- AWSマネジメントコンソールへのアクセス権限
- 適切なIAM権限（Cognito User Poolの作成・管理権限）
- AWSプロファイル `panaDevTake` が設定済み

## 作成するリソース

1. **Cognito User Pool** - ユーザー認証プール
2. **Cognito User Pool Client** - Webアプリケーション用クライアント
3. **Cognito User Pool Domain** - Hosted UI用ドメイン

---

## 手順1: Cognito User Poolとアプリケーションの作成

### 1.1 AWSマネジメントコンソールにアクセス

1. AWSマネジメントコンソールにログイン
2. リージョンを **ap-northeast-1（東京）** に設定
3. 検索バーで「Cognito」を検索し、**Amazon Cognito** を選択

### 1.2 アプリケーションの作成開始

1. 左メニューから「**User pools**」を選択
2. 「**Create user pool**」ボタンをクリック
3. **新しいUI**が表示された場合、アプリケーション作成フローを使用します

### 1.3 アプリケーションタイプの選択

1. **アプリケーションタイプ (Application Type)** セクション：
   - ✅ **従来のウェブアプリケーション (Traditional Web Application)** を選択
   - 説明: "Webサーバーでホストされるアプリケーション。リダイレクトと個別のページを使用して情報を表示します。Java、Python、NodeJSが例です。"

2. 「**Next**」をクリック

### 1.4 アプリケーション名の設定

1. **アプリケーションに名前を付ける (Name Application)** セクション：
   - アプリケーション名に以下を入力：
     ```
     manuMaruDevelop
     ```
     （production環境の場合は `manuMaruProduction`）
   - 注意: 
     - 名前は128文字以下
     - 英数字、スペース、特殊文字（`+ = , . @ -`）のみ使用可能
     - この名前はApp Client名として使用されます

2. 「**Next**」をクリック

### 1.5 サインイン識別子の設定

1. **サインイン識別子のオプション (Sign-in Identifier Options)** セクション：
   - ⚠️ **重要**: この設定は後で変更できません
   - ✅ **ユーザー名 (Username)** をチェック
   - ⬜ **メールアドレス (Email address)** はチェックを**外す**（または必要に応じてチェック）
   - ⬜ **電話番号 (Phone number)** はチェックを**外す**（または必要に応じてチェック）
   
   **推奨設定**:
   - メールアドレス認証を使用する場合: ✅ **メールアドレス** をチェック、✅ **ユーザー名** もチェック（オプション）
   - ユーザー名のみを使用する場合: ✅ **ユーザー名** のみチェック

2. 「**Next**」をクリック

### 1.6 自己登録の設定

1. **自己登録 (Self-registration)** セクション：
   - 説明を確認: "ユーザープールでユーザー登録が有効になっている場合、インターネット上の任意のユーザーがアカウントに登録してアプリケーションにサインインできます。"
   - ✅ **自己登録を有効化 (Enable self-registration)** をチェック
   - 注意: 有効化すると、Hosted UIのサインインページに「[Sign up]」リンクが表示され、パブリックAPIを使用して新しいユーザーアカウントを作成できます

2. **サインアップのための必須属性 (Required attributes for signup)** セクション：
   - ドロップダウンから必要な属性を選択
   - 推奨: **email** を選択（メールアドレス認証を使用する場合）

3. ⚠️ **警告**: "サインイン識別子のオプションと必須属性は、アプリケーションの作成後に変更することはできません。"


### 1.7 リターンURLの設定（オプション）

1. **リターン URL を追加 - オプション (Add Return URL - Optional)** セクション：
   - 説明: "リターンURLを選択します。Cognitoは、ユーザープールドメインの管理されたログインページへのサインインが成功した後、このURLにリダイレクトします。アプリケーションは、生成されたトークンを処理できます。"
   
2. **リターン URL (Return URL)** に以下を入力：
   ```
   http://localhost:3000
   ```
   - 注意: 
     - URLは1〜1,024文字
     - テスト目的の場合のみ `http://localhost` が許可されます
     - 本番環境では `https://` を使用してください
     - CloudFront URLは後で追加します

3. 「**Next**」をクリック

### 1.8 追加設定（セキュリティ、MFA等）

次の画面で以下を設定：

1. **Password policy** セクション：
   - **Minimum length**: `8`
   - その他の要件は必要に応じて設定

2. **Multi-factor authentication (MFA)** セクション：
   - **MFA**: `No MFA` を選択

3. **User account recovery** セクション：
   - ✅ **Email** をチェック

4. 「**Next**」をクリック

### 1.9 確認と作成

1. 設定内容を確認
2. 「**Create**」または「**Create user pool**」をクリック
3. 作成完了まで待機（数秒〜数十秒）

### 1.10 User Pool IDの取得

1. 作成完了後、User Poolの概要ページが表示されます
2. **ユーザープール情報 (User Pool Information)** セクションから以下をコピー：
   - **ユーザープール ID (User Pool ID)**: コピーボタンをクリック
     - 形式: `ap-northeast-1_XXXXXXXXX`
     - 例: `ap-northeast-1_6vhVyzcZy`
3. このIDをメモ帳などに保存

### 1.11 アプリケーションの確認

1. 概要ページの **レコメンデーション (Recommendations)** セクションを確認
2. 「**アプリケーションをセットアップします: manuMaruDevelop**」というカードが表示されていることを確認
   - これでアプリケーション（App Client）が自動的に作成されています
3. 左メニューから「**アプリケーション (Applications)** > **アプリケーションクライアント (Application Clients)**」を選択
4. `manuMaruDevelop` というアプリケーションクライアントが表示されていることを確認

---

## 手順2: App Clientの設定確認と調整

### 2.1 App Clientの確認

新しいUIでアプリケーションを作成した場合、App Clientは自動的に作成されています。

1. User Poolの概要ページで、左メニューから「**アプリケーション (Applications)** > **アプリケーションクライアント (Application Clients)**」を選択
2. `manuMaruDevelop` というアプリケーションクライアントが表示されていることを確認
3. アプリケーションクライアント名をクリックして詳細を表示

### 2.2 Client IDの取得

1. アプリケーションクライアントの詳細ページで、**Client ID** をコピー
   - 形式: 長い文字列（例: `1a2b3c4d5e6f7g8h9i0j1k2l3m`）
2. このIDをメモ帳などに保存

### 2.3 Hosted UI設定の確認と調整

1. アプリケーションクライアントの詳細ページで、**Hosted UI** セクションを確認・編集：

2. **Allowed callback URLs** セクション：
   - 既に `http://localhost:3000` が設定されているか確認
   - 必要に応じて以下を追加（1行に1つ）：
     ```
     http://localhost:3000
     https://d1234567890abc.cloudfront.net
     ```
   - 注意: CloudFront URLは後で取得して追加します（初回は `http://localhost:3000` のみでOK）

3. **Allowed sign-out URLs** セクション：
   - 既に `http://localhost:3000` が設定されているか確認
   - 必要に応じて以下を追加（1行に1つ）：
     ```
     http://localhost:3000
     https://d1234567890abc.cloudfront.net
     ```
   - 注意: CloudFront URLは後で取得して追加します（初回は `http://localhost:3000` のみでOK）

4. **Allowed OAuth flows** セクション：
   - ✅ **Authorization code grant** がチェックされていることを確認
   - ⬜ **Implicit grant** のチェックを**外す**（セキュリティのため）

5. **Allowed OAuth scopes** セクション：
   - ✅ **email** がチェックされていることを確認
   - ✅ **openid** がチェックされていることを確認
   - ✅ **profile** がチェックされていることを確認

6. **変更を保存**:
   - 「**Save changes**」ボタンをクリック

### 2.4 認証フローの確認

1. **Authentication flows** セクションを確認：
   - ✅ **ALLOW_USER_SRP_AUTH** が有効になっていることを確認
   - ✅ **ALLOW_REFRESH_TOKEN_AUTH** が有効になっていることを確認
   - ✅ **ALLOW_USER_PASSWORD_AUTH** は必要に応じて有効化

2. 変更がある場合は「**保存 (Save)**」または「**Save changes**」をクリック

---

## 手順3: Cognito User Pool Domainの作成

### 3.1 Domainの作成開始

1. User Poolの概要ページで、左メニューから「**ブランディング (Branding)** > **ドメイン (Domain)**」を選択
2. **Domain** セクションを表示
3. 「**Create Cognito domain**」または「**Cognitoドメインを作成**」ボタンをクリック

### 3.2 Domainの確認

新しいUIでアプリケーションを作成した場合、自動的にCognitoドメインが作成されている場合があります。

1. **Cognito ドメイン** セクションを確認
2. 既にドメインが表示されている場合（例: `https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com`）、そのまま使用できます
3. カスタムprefixを使用したい場合は、「**編集 (Edit)**」ボタンをクリックして変更可能

### 3.3 Domain設定（新規作成する場合）

既にドメインが作成されている場合は、この手順はスキップしてください。

1. **Domain prefix** に以下を入力：
   ```
   manumaru-dev-develop
   ```
   （production環境の場合は `manumaru-prod-production`）
   - 注意: 
     - このドメインは一意である必要があります。既に使用されている場合は別の名前に変更してください
     - ドメイン名は3〜63文字で、英数字とハイフンのみ使用可能

2. **Use your own domain** は選択しない（デフォルトのCognitoドメインを使用）

3. 「**Create Cognito domain**」または「**Cognitoドメインを作成**」をクリック

### 3.4 Domain名の確認と環境変数用の値の取得

1. **Cognito ドメイン** セクションにドメインが表示されていることを確認
2. **ドメイン (Domain)** のURLを確認
   - 自動生成の場合: `https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com`
   - カスタムprefixの場合: `https://manumaru-dev-develop.auth.ap-northeast-1.amazoncognito.com`

3. **環境変数で使用する値**:
   - 自動生成ドメインの場合: Domain URLからprefixを抽出
     - 例: `https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com` → `ap-northeast-16vhvyzczy`
   - カスタムprefixの場合: 設定したprefix（例: `manumaru-dev-develop`）
   
4. この値をメモ帳などに保存（`.env.local` の `REACT_APP_COGNITO_DOMAIN` に使用）

---

## 手順4: 環境変数の設定

### 4.0 取得した情報の整理

以下の情報を取得済みであることを確認してください：

- ✅ **User Pool ID**: 概要ページから取得（例: `ap-northeast-1_6vhVyzcZy`）
- ✅ **Client ID**: アプリケーションクライアント詳細ページから取得
- ✅ **Domain prefix**: ドメイン作成時に設定した値（例: `manumaru-dev-develop`）
- ✅ **Region**: `ap-northeast-1`

### 4.1 .env.localファイルの作成

プロジェクトルートに `.env.local` ファイルを作成（既に存在する場合は上書き）：

```bash
cd /Users/norihisa/Projects/Panasonic/geminiManualFrontendECS
```

`.env.local` ファイルに以下を記述：

```bash
# Cognito設定（手動作成）
# 実際の値に置き換えてください

# User Pool ID（概要ページから取得）
REACT_APP_USER_POOL_ID=ap-northeast-1_6vhVyzcZy

# Client ID（アプリケーションクライアント詳細ページから取得）
REACT_APP_USER_POOL_CLIENT_ID=実際のClientIDをここに記入

# Domain prefix（ドメインURLから抽出、または設定した値）
# 自動生成ドメインの場合: ap-northeast-16vhvyzczy
# カスタムprefixの場合: manumaru-dev-develop
REACT_APP_COGNITO_DOMAIN=ap-northeast-16vhvyzczy

# AWS Region
REACT_APP_AWS_REGION=ap-northeast-1

# Cognito Hosted UI URL（自動計算されるが、明示的に設定することも可能）
# 形式: https://{domain-prefix}.auth.{region}.amazoncognito.com
# 自動生成ドメインの場合: https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com
# カスタムprefixの場合: https://manumaru-dev-develop.auth.ap-northeast-1.amazoncognito.com
REACT_APP_COGNITO_HOSTED_UI_URL=https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com

# コールバックURL（ローカル開発用）
REACT_APP_CALLBACK_URL=http://localhost:3000
REACT_APP_SIGNOUT_URL=http://localhost:3000

# その他の環境変数（既存のものを維持）
# REACT_APP_AWS_BUCKET_NAME=...
# REACT_APP_DYNAMODB_TABLE_NAME=...
# など
```

**重要**: 
- `REACT_APP_USER_POOL_ID` を実際のUser Pool IDに置き換えてください
- `REACT_APP_USER_POOL_CLIENT_ID` を実際のClient IDに置き換えてください
- `REACT_APP_COGNITO_DOMAIN` を実際のDomain prefixに置き換えてください

### 4.2 CloudFront URLの追加（デプロイ後）

CloudFormationでCloudFront Distributionを作成した後：

1. CloudFormationのOutputから `CloudFrontDomainName` を取得
   - 例: `d1234567890abc.cloudfront.net`

2. AWS Cognitoコンソールで、作成したApp Clientを開く

3. **Hosted UI** セクションの **Allowed callback URLs** に以下を追加：
   ```
   https://d1234567890abc.cloudfront.net
   ```

4. **Allowed sign-out URLs** に以下を追加：
   ```
   https://d1234567890abc.cloudfront.net
   ```

5. 「**保存 (Save)**」または「**Save changes**」をクリック

---

## 手順5: 次のステップ（クイックガイド）

### 5.1 現在の状態

✅ User Pool作成完了
✅ App Client作成完了（`manuMaruDevelop`）
⏭️ Domain作成が必要
⏭️ 環境変数設定が必要
⏭️ CloudFront URL追加が必要（CloudFrontデプロイ後）

### 5.2 今すぐやること

1. **Domain作成**（手順3を参照）
   - 左メニュー: **ブランディング > ドメイン**
   - Domain prefix: `manumaru-dev-develop` を入力

2. **環境変数設定**（手順4を参照）
   - `.env.local` ファイルを作成
   - User Pool ID、Client ID、Domain prefixを設定

3. **ローカル環境での動作確認**
   - `npm start` でアプリケーションを起動
   - `http://localhost:3000` にアクセス
   - 認証フローが動作することを確認

### 5.3 CloudFrontデプロイ後

1. CloudFormationでCloudFront Distributionをデプロイ
2. CloudFront URLを取得
3. CognitoのApp Client設定にCloudFront URLを追加（手順4.2参照）

---

## 手順5: CloudFormationテンプレートからのCognito削除

Cognitoを手動作成したため、CloudFormationテンプレートからCognito関連のリソースを削除します。

### 5.1 テンプレートの編集

`cloudformation/templates/main.yaml` を開き、以下を削除またはコメントアウト：

1. **CognitoUserPool** リソース（130行目あたり）
2. **CognitoUserPoolClient** リソース（161行目あたり）
3. **CognitoUserPoolDomain** リソース（196行目あたり）
4. **Outputs** セクションのCognito関連の出力（220行目あたり）

### 5.2 修正後のテンプレート構造

```yaml
Resources:
  # S3 Bucket
  FrontendBucket:
    # ...
  
  # CloudFront OAC
  CloudFrontOAC:
    # ...
  
  # CloudFront Distribution
  CloudFrontDistribution:
    # ...
  
  # S3 Bucket Policy
  FrontendBucketPolicy:
    # ...

Outputs:
  CloudFrontDistributionId:
    # ...
  CloudFrontDomainName:
    # ...
  CloudFrontURL:
    # ...
  S3BucketName:
    # ...
```

### 5.3 パラメータの整理

`cloudformation/parameters/develop.json` から、Cognito関連のパラメータを削除（または残しておいても問題ありません）：

```json
[
  {
    "ParameterKey": "Environment",
    "ParameterValue": "develop"
  },
  {
    "ParameterKey": "AllowedOrigins",
    "ParameterValue": "http://localhost:3000,http://localhost:5173"
  }
]
```

---

## 手順6: 動作確認

### 6.1 ローカル環境での確認

1. `.env.local` ファイルが正しく設定されていることを確認

2. アプリケーションを起動：
   ```bash
   npm start
   ```

3. ブラウザで `http://localhost:3000` にアクセス

4. 認証フローが正常に動作することを確認：
   - 未認証の場合は自動的にCognito Hosted UIにリダイレクト
   - ログイン後、コールバックURLに戻る
   - ユーザー情報が表示される

### 6.2 CloudFrontデプロイ後の確認

1. CloudFormationでCloudFront Distributionを作成

2. CloudFront URLをCognitoのコールバックURLに追加（手順4.3参照）

3. CloudFront URLにアクセスして認証フローを確認

---

## トラブルシューティング

### 問題1: ドメイン名が既に使用されている

**エラー**: "Domain prefix is already in use"

**解決策**:
- 別のドメイン名を使用（例: `manumaru-dev-develop-2`）
- または、既存のドメインを削除してから再作成

### 問題2: コールバックURLエラー

**エラー**: "redirect_uri_mismatch"

**解決策**:
1. Cognito App Clientの設定を確認
2. **Allowed callback URLs** に正確なURLが登録されているか確認
3. URLの末尾のスラッシュ（`/`）の有無を確認

### 問題3: 環境変数が読み込まれない

**解決策**:
1. `.env.local` ファイルがプロジェクトルートにあることを確認
2. ファイル名が `.env.local` であることを確認（`.env.local.txt` などではない）
3. アプリケーションを再起動
4. `process.env.REACT_APP_*` の値をコンソールで確認

### 問題4: Hosted UIにアクセスできない

**解決策**:
1. Domainが正しく作成されているか確認
2. Domain名が正しいか確認（`https://manumaru-dev-develop.auth.ap-northeast-1.amazoncognito.com`）
3. リージョンが正しいか確認（`ap-northeast-1`）

---

## 参考情報

### Cognito Hosted UI URLの形式

```
https://{domain-prefix}.auth.{region}.amazoncognito.com
```

例:
```
https://manumaru-dev-develop.auth.ap-northeast-1.amazoncognito.com
```

### 認証フローのURL

**ログイン**:
```
https://{domain-prefix}.auth.{region}.amazoncognito.com/login?client_id={client-id}&response_type=code&redirect_uri={callback-url}&scope=email+openid+profile
```

**ログアウト**:
```
https://{domain-prefix}.auth.{region}.amazoncognito.com/logout?client_id={client-id}&logout_uri={signout-url}
```

### 環境変数のマッピング

| Cognito設定項目 | 環境変数名 | 説明 |
|----------------|-----------|------|
| User Pool ID | `REACT_APP_USER_POOL_ID` | User Poolの一意識別子 |
| Client ID | `REACT_APP_USER_POOL_CLIENT_ID` | App Clientの一意識別子 |
| Domain Prefix | `REACT_APP_COGNITO_DOMAIN` | Hosted UIドメインの接頭辞 |
| Region | `REACT_APP_AWS_REGION` | AWSリージョン |
| Hosted UI URL | `REACT_APP_COGNITO_HOSTED_UI_URL` | 完全なHosted UI URL（オプション） |
| Callback URL | `REACT_APP_CALLBACK_URL` | 認証後のリダイレクト先 |
| Sign Out URL | `REACT_APP_SIGNOUT_URL` | ログアウト後のリダイレクト先 |

---

## 次のステップ

1. ✅ Cognitoリソースの手動作成完了
2. ✅ 環境変数の設定完了
3. ⏭️ CloudFormationテンプレートからCognito部分を削除
4. ⏭️ CloudFront Distributionのデプロイ
5. ⏭️ CloudFront URLをCognitoのコールバックURLに追加
6. ⏭️ 動作確認

---

**作成日**: 2026-01-04
**バージョン**: 1.0

