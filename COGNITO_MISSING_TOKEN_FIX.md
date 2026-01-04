# Cognito "Missing Authentication Token" エラーの解決方法

## エラー内容

```json
{"message":"Missing Authentication Token"}
```

## 原因

このエラーは、Cognito DomainのURLに直接アクセスした際に、適切なパラメータ（`client_id`など）が含まれていない場合に発生します。

## 解決方法

### 1. Domain URLに直接アクセスしない

Cognito DomainのURL（例: `https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com`）に直接アクセスすると、このエラーが発生します。

**正しいアクセス方法**:
- アプリケーションから `signInWithRedirect()` 関数を使用してリダイレクトする
- リダイレクトURLには、`client_id`、`response_type`、`scope`、`redirect_uri`などのパラメータが自動的に含まれます

### 2. 生成されたリダイレクトURLを確認

ブラウザのコンソールで、以下のログを確認してください：

```
🔧 生成されたリダイレクトURL: https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com/login?client_id=...&response_type=code&scope=...
```

このURLには、以下のパラメータが含まれている必要があります：
- `client_id`: App ClientのID
- `response_type=code`
- `scope=email%20openid%20profile`
- `redirect_uri=http://localhost:3000`

### 3. Domainが正しく設定されているか確認

1. **AWS CognitoコンソールでDomainを確認**
   - User Pool `manumaruECSDeveop` を選択
   - 左メニューから「**ブランディング (Branding)** > **ドメイン (Domain)**」を選択
   - **Cognito ドメイン** セクションにドメインが表示されているか確認

2. **Domain URLの形式を確認**
   - 正しい形式: `https://{domain-prefix}.auth.{region}.amazoncognito.com`
   - 例: `https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com`

### 4. App Clientの設定を確認

1. **App Client `manuMaruDevelopPublic` の詳細画面を開く**
2. 「**ログインページ (Login Page)**」タブを確認
3. 「**マネージドログインページの設定**」セクションで：
   - ステータスが「**使用可能**」になっているか確認
   - **Allowed callback URLs** に `http://localhost:3000` が登録されているか確認
   - **Allowed OAuth scopes** に `email`、`openid`、`profile` がチェックされているか確認

### 5. 環境変数の確認

`.env.local` ファイルで以下が正しく設定されているか確認：

```bash
REACT_APP_USER_POOL_ID=ap-northeast-1_6vhVyzcZy
REACT_APP_USER_POOL_CLIENT_ID=43rjh9se4s70tiurtar83onpsq
REACT_APP_COGNITO_DOMAIN=ap-northeast-16vhvyzczy
REACT_APP_CALLBACK_URL=http://localhost:3000
REACT_APP_SIGNOUT_URL=http://localhost:3000
```

### 6. 開発サーバーの再起動

環境変数を変更した場合は、開発サーバーを再起動してください：

```bash
npm start
```

---

## 確認方法

1. ブラウザのコンソールを開く（F12）
2. `http://localhost:3000/?login=email` にアクセス
3. コンソールで以下のログを確認：
   - `🔧 生成されたリダイレクトURL: ...`
   - `🔧 設定確認: ...`
   - `🔍 Domain URL確認: ...`
4. 生成されたURLが正しい形式か確認
5. そのURLにリダイレクトされることを確認

---

**重要**: Domain URLに直接アクセスするのではなく、アプリケーションから `signInWithRedirect()` 関数を使用してリダイレクトしてください。これにより、必要なパラメータが自動的に含まれます。

