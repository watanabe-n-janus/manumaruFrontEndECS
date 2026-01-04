# CloudFront URLをCognitoに設定する手順

## 概要

CloudFormationでCloudFront Distributionをデプロイ後、取得したCloudFront URLをCognitoのApp Client設定に追加する必要があります。

## デプロイ後のCloudFront URL

今回のデプロイで取得されたCloudFront URL:
```
https://d1j5u26nd0gpbk.cloudfront.net
```

## 設定手順

### 1. Cognito User Poolにアクセス

1. AWSマネジメントコンソールにログイン
2. リージョンを **ap-northeast-1（東京）** に設定
3. 検索バーで「Cognito」を検索し、**Amazon Cognito** を選択

### 2. App Clientを開く

1. 左メニューから「**User pools**」を選択
2. 使用しているUser Poolを選択（例: `manumaruECSDeveop`）
3. 左メニューから「**アプリケーション (Applications)** > **アプリケーションクライアント (Application Clients)**」を選択
4. 使用しているApp Clientを選択（例: `manuMaruDevelopPublic`）

### 3. Hosted UI設定を更新

1. 「**Hosted UI**」タブを開く

#### Allowed callback URLs

現在の設定に以下を追加：
```
https://d1j5u26nd0gpbk.cloudfront.net
```

**設定例**:
```
http://localhost:3000
https://d1j5u26nd0gpbk.cloudfront.net
```

#### Allowed sign-out URLs

現在の設定に以下を追加：
```
https://d1j5u26nd0gpbk.cloudfront.net
```

**設定例**:
```
http://localhost:3000
https://d1j5u26nd0gpbk.cloudfront.net
```

### 4. 設定を保存

1. 「**保存 (Save)**」または「**Save changes**」をクリック
2. 設定が保存されたことを確認

## GitHub Secretsの更新（オプション）

CloudFront URLが確定したら、GitHub Environment Secretsも更新できます：

1. GitHubリポジトリの「**Settings** > **Environments** > **develop**」を開く
2. 「**Environment secrets**」セクションで以下を更新：
   - `REACT_APP_CALLBACK_URL`: `https://d1j5u26nd0gpbk.cloudfront.net`
   - `REACT_APP_SIGNOUT_URL`: `https://d1j5u26nd0gpbk.cloudfront.net`

**注意**: 既に設定されている場合は、次回のデプロイ時に自動的に反映されます。

## 動作確認

設定後、以下を確認してください：

1. CloudFront URLにアクセス: `https://d1j5u26nd0gpbk.cloudfront.net`
2. ログインボタンをクリック
3. Cognito Hosted UIにリダイレクトされることを確認
4. ログイン後、CloudFront URLに戻ることを確認

## トラブルシューティング

### エラー: "redirect_uri_mismatch"

**原因**: Allowed callback URLsにCloudFront URLが登録されていない

**解決方法**:
1. Cognito App Clientの「Hosted UI」タブを開く
2. 「Allowed callback URLs」に `https://d1j5u26nd0gpbk.cloudfront.net` を追加
3. 「保存」をクリック

### エラー: ログイン後にリダイレクトされない

**原因**: Allowed sign-out URLsにCloudFront URLが登録されていない

**解決方法**:
1. Cognito App Clientの「Hosted UI」タブを開く
2. 「Allowed sign-out URLs」に `https://d1j5u26nd0gpbk.cloudfront.net` を追加
3. 「保存」をクリック

---

**作成日**: 2026-01-04
**バージョン**: 1.0

