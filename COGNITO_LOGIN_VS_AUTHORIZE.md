# Cognito `/login` vs `/oauth2/authorize` エンドポイント

## 問題

`react-oidc-context` が `/login` エンドポイントにリダイレクトしているが、これは正しい動作ではありません。

## 正しいエンドポイント

Cognito Hosted UI では、**`/oauth2/authorize`** エンドポイントを使用する必要があります。

## 確認結果

### Cognito User Pool のメタデータ

```bash
curl "https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_6vhVyzcZy/.well-known/openid-configuration"
```

結果：
```json
{
  "authorization_endpoint": "https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com/oauth2/authorize",
  "token_endpoint": "https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com/oauth2/token",
  "userinfo_endpoint": "https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com/oauth2/userInfo"
}
```

**メタデータは正しく `/oauth2/authorize` を返しています。**

### `/login` エンドポイントの動作

```bash
curl -I "https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com/login?..."
```

結果：**404 Not Found**

**`/login` エンドポイントは存在しません。**

## 解決方法

`react-oidc-context` の設定で、`metadata` オプションを明示的に指定して、正しいエンドポイント（`/oauth2/authorize`）を使用するようにしました。

### 設定例

```typescript
const cognitoAuthConfig = {
  authority: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code' as const,
  scope: 'email openid profile',
  // メタデータを明示的に指定
  metadata: {
    authorization_endpoint: `${cognitoDomain}/oauth2/authorize`,
    token_endpoint: `${cognitoDomain}/oauth2/token`,
    userinfo_endpoint: `${cognitoDomain}/oauth2/userInfo`,
    end_session_endpoint: `${cognitoDomain}/logout`,
    jwks_uri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
    issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
  },
};
```

## 動作確認

1. 開発サーバーを再起動
2. `http://localhost:3000/?login=email` にアクセス
3. ブラウザのコンソールで、リダイレクトURLが `/oauth2/authorize` を使用していることを確認
4. Cognito のログインページが正しく表示されることを確認

---

**作成日**: 2026-01-04
**バージョン**: 1.0

