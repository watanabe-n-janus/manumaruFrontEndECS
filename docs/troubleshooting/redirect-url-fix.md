# リダイレクトURL問題の修正

## 問題

デプロイしたアプリケーション（CloudFront URL）でログイン後、`localhost:3000`にリダイレクトされてしまう。

## 原因

1. **ビルド時の環境変数**: `REACT_APP_CALLBACK_URL`と`REACT_APP_SIGNOUT_URL`がGitHub Secretsに設定されていない、または`localhost:3000`が設定されている
2. **実行時のフォールバック**: 環境変数が未設定の場合、デフォルトで`localhost:3000`が使用されていた

## 修正内容

### 1. コード修正 (`src/utils/cognitoAuth.ts`)

実行時に`window.location.origin`を使用して現在のURLを動的に取得するように変更しました。

```typescript
// 実行時に現在のURLを取得（デプロイ環境に対応）
const getCurrentOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

const callbackUrl = process.env.REACT_APP_CALLBACK_URL || getCurrentOrigin();
const signOutUrl = process.env.REACT_APP_SIGNOUT_URL || getCurrentOrigin();
```

これにより：
- 環境変数が設定されている場合は、その値を使用
- 環境変数が未設定の場合は、実行時の現在のURL（`window.location.origin`）を使用
- これにより、CloudFront URLで実行されている場合は自動的にCloudFront URLが使用される

### 2. GitHub Secretsの設定

GitHub Environment Secretsに以下を設定してください：

#### `develop`環境

1. GitHubリポジトリの「**Settings** > **Environments** > **develop**」を開く
2. 「**Environment secrets**」セクションで以下を設定：

```
REACT_APP_CALLBACK_URL: https://d1j5u26nd0gpbk.cloudfront.net
REACT_APP_SIGNOUT_URL: https://d1j5u26nd0gpbk.cloudfront.net
```

**注意**: CloudFront URLは実際のデプロイ後に取得したURLに置き換えてください。

### 3. Cognito設定の確認

Cognito App Clientの「Hosted UI」設定で、以下が設定されていることを確認：

- **Allowed callback URLs**: `https://d1j5u26nd0gpbk.cloudfront.net`
- **Allowed sign-out URLs**: `https://d1j5u26nd0gpbk.cloudfront.net`

詳細は `CLOUDFRONT_COGNITO_SETUP.md` を参照してください。

## 動作確認

### ローカル環境

1. `npm start`でアプリケーションを起動
2. ログインを試行
3. リダイレクト先が`http://localhost:3000`であることを確認

### デプロイ環境

1. CloudFront URLにアクセス: `https://d1j5u26nd0gpbk.cloudfront.net`
2. ログインを試行
3. リダイレクト先がCloudFront URLであることを確認（`localhost:3000`ではない）

## トラブルシューティング

### まだ`localhost:3000`にリダイレクトされる

**原因1**: ブラウザキャッシュ
- **解決方法**: ブラウザのキャッシュをクリア、またはシークレットモードで試す

**原因2**: ビルド時に古い環境変数が使用された
- **解決方法**: 新しいコードで再デプロイ

**原因3**: Cognitoの設定が正しくない
- **解決方法**: Cognito App Clientの「Hosted UI」設定を確認

### 環境変数が正しく設定されているか確認

GitHub Actionsのログで以下を確認：

```
REACT_APP_CALLBACK_URL: https://d1j5u26nd0gpbk.cloudfront.net
REACT_APP_SIGNOUT_URL: https://d1j5u26nd0gpbk.cloudfront.net
```

これらが表示されていない、または`localhost:3000`になっている場合は、GitHub Secretsを再設定してください。

---

**作成日**: 2026-01-04
**バージョン**: 1.0

