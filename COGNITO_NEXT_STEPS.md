# Cognito作成後の次のステップ

## 現在の状態

✅ **User Pool作成完了**: `manumaruECSDeveop`
- User Pool ID: `ap-northeast-1_6vhVyzcZy`

✅ **App Client作成完了**: `manuMaruDevelop`
- アプリケーションクライアントが自動的に作成されています

✅ **Domain作成完了**: 自動生成されたドメインが使用可能
- Domain URL: `https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com`
- Domain prefix: `ap-northeast-16vhvyzczy`

⏭️ **環境変数設定が必要**
⏭️ **CloudFront URL追加が必要**（CloudFrontデプロイ後）

---

## 今すぐやること

### 1. Client IDを取得する

1. 左メニューから「**アプリケーション (Applications)** > **アプリケーションクライアント (Application Clients)**」を選択
2. `manuMaruDevelop` をクリック
3. **Client ID** をコピーしてメモ帳に保存

### 2. Domainの確認

✅ **Domainは既に作成済みです**

1. 左メニューから「**ブランディング (Branding)** > **ドメイン (Domain)**」を選択
2. **Cognito ドメイン** セクションにドメインが表示されていることを確認
   - 例: `https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com`
3. Domain URLからprefixを抽出してメモ帳に保存
   - 例: `ap-northeast-16vhvyzczy`
   
**注意**: カスタムprefixを使用したい場合は、「**編集 (Edit)**」ボタンから変更可能です

### 3. 環境変数を設定する

プロジェクトルートに `.env.local` ファイルを作成：

```bash
# Cognito設定（手動作成）
# 実際の値に置き換えてください

# User Pool ID（概要ページから取得）
REACT_APP_USER_POOL_ID=ap-northeast-1_6vhVyzcZy

# Client ID（アプリケーションクライアント詳細ページから取得）
REACT_APP_USER_POOL_CLIENT_ID=ここにClientIDを記入

# Domain prefix（ドメインURLから抽出した値）
# 例: ap-northeast-16vhvyzczy
REACT_APP_COGNITO_DOMAIN=ap-northeast-16vhvyzczy

# AWS Region
REACT_APP_AWS_REGION=ap-northeast-1

# Cognito Hosted UI URL（ドメインURLと同じ値）
# 例: https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com
REACT_APP_COGNITO_HOSTED_UI_URL=https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com

# コールバックURL（ローカル開発用）
REACT_APP_CALLBACK_URL=http://localhost:3000
REACT_APP_SIGNOUT_URL=http://localhost:3000
```

**重要**: `REACT_APP_USER_POOL_CLIENT_ID` を実際のClient IDに置き換えてください。

### 4. ローカル環境で動作確認

```bash
npm start
```

ブラウザで `http://localhost:3000` にアクセスして、認証フローが動作することを確認してください。

---

## CloudFrontデプロイ後

1. CloudFormationでCloudFront Distributionをデプロイ
2. CloudFormationのOutputから `CloudFrontDomainName` を取得
3. CognitoのApp Client設定にCloudFront URLを追加：
   - 左メニュー: **アプリケーション > アプリケーションクライアント**
   - `manuMaruDevelop` をクリック
   - **Hosted UI** セクションの **Allowed callback URLs** に追加
   - **Allowed sign-out URLs** に追加
   - 「**保存**」をクリック

---

詳細な手順は `COGNITO_MANUAL_SETUP_GUIDE.md` を参照してください。

