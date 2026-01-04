# react-oidc-context と Cognito Hosted UI の設定

## 問題

`react-oidc-context` が `/login` エンドポイントにリダイレクトしてしまう問題が発生していました。

## 解決方法

`react-oidc-context` の設定で、Cognito Hosted UI の正しいエンドポイント（`/oauth2/authorize`）を明示的に指定しました。

## 設定内容

### `src/index.tsx`

```typescript
const cognitoAuthConfig = {
  // authority: Cognito Hosted UI Domain URLを使用
  authority: cognitoDomain, // https://{domain}.auth.{region}.amazoncognito.com
  // metadataUrl: Cognito User PoolのOIDCエンドポイントを使用
  metadataUrl: metadataUrl, // https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/openid-configuration
  // 認証エンドポイントを明示的に指定（/oauth2/authorize を使用）
  authorization_endpoint: `${cognitoDomain}/oauth2/authorize`,
  // トークンエンドポイントを明示的に指定
  token_endpoint: `${cognitoDomain}/oauth2/token`,
  // ユーザー情報エンドポイントを明示的に指定
  userinfo_endpoint: `${cognitoDomain}/oauth2/userInfo`,
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code' as const,
  scope: 'email openid profile',
  automaticSilentRenew: true,
  loadUserInfo: true,
};
```

## 重要なポイント

1. **authority**: Cognito Hosted UI Domain URL（`https://{domain}.auth.{region}.amazoncognito.com`）を使用
2. **metadataUrl**: Cognito User Pool の OIDC エンドポイント（`.well-known/openid-configuration`）を使用
3. **authorization_endpoint**: `/oauth2/authorize` を明示的に指定（`/login` ではなく）

## 環境変数

以下の環境変数が必要です：

```bash
REACT_APP_USER_POOL_ID=ap-northeast-1_6vhVyzcZy
REACT_APP_USER_POOL_CLIENT_ID=43rjh9se4s70tiurtar83onpsq
REACT_APP_COGNITO_DOMAIN=ap-northeast-16vhvyzczy
REACT_APP_AWS_REGION=ap-northeast-1
REACT_APP_CALLBACK_URL=http://localhost:3000
REACT_APP_SIGNOUT_URL=http://localhost:3000
```

## 動作確認

1. 開発サーバーを再起動：
   ```bash
   npm start
   ```

2. `http://localhost:3000/?login=email` にアクセス

3. ブラウザのコンソールで以下のログを確認：
   - `🔧 Cognito OIDC設定:` が正しく表示される
   - リダイレクトURLが `/oauth2/authorize` を使用している

4. Cognito のログインページが正しく表示されることを確認

---

**作成日**: 2026-01-04
**バージョン**: 1.0

