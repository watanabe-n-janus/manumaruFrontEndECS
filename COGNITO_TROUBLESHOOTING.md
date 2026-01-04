# Cognito認証エラー トラブルシューティングガイド

## invalid_scope エラーの解決方法

### エラーの原因

`invalid_scope`エラーは、CognitoのApp Client設定でOAuthスコープが許可されていない場合に発生します。

### 解決手順

#### 1. AWS CognitoコンソールでApp Clientを開く

1. AWS Cognitoコンソールにアクセス
2. User Pool `manumaruECSDeveop` を選択
3. 左メニューから「**アプリケーション (Applications)** > **アプリケーションクライアント (Application Clients)**」を選択
4. `manuMaruDevelop` をクリック

#### 2. Hosted UI設定を確認

**Allowed OAuth scopes** セクションで、以下がすべてチェックされていることを確認：

- ✅ **email**
- ✅ **openid**
- ✅ **profile**

**重要**: これら3つのスコープがすべて有効になっている必要があります。

#### 3. Allowed callback URLsを確認

**Allowed callback URLs** セクションで、以下が登録されていることを確認：

```
http://localhost:3000
```

**注意**: 
- 末尾スラッシュの有無に注意してください
- 現在のコードは末尾スラッシュなしで設定されています
- Cognitoの設定と一致させる必要があります

#### 4. Allowed OAuth flowsを確認

**Allowed OAuth flows** セクションで、以下がチェックされていることを確認：

- ✅ **Authorization code grant**

**重要**: `Implicit grant` はチェックを外してください（セキュリティのため）。

#### 5. 設定を保存

すべての設定を確認したら、「**保存 (Save)**」または「**Save changes**」をクリックしてください。

### 設定確認チェックリスト

- [ ] `email` スコープが有効
- [ ] `openid` スコープが有効
- [ ] `profile` スコープが有効
- [ ] `http://localhost:3000` がコールバックURLに登録されている
- [ ] `Authorization code grant` が有効
- [ ] `Implicit grant` が無効（チェックが外れている）
- [ ] 設定を保存済み

### 設定後の確認

設定を保存した後、ブラウザで以下を確認してください：

1. ブラウザのキャッシュをクリア（Ctrl+Shift+Delete / Cmd+Shift+Delete）
2. `http://localhost:3000/?login=email` にアクセス
3. CognitoのHosted UIにリダイレクトされることを確認

### それでもエラーが発生する場合

1. **ブラウザのコンソールを確認**
   - `🔧 Amplify設定:` のログで、設定が正しく読み込まれているか確認
   - `🔧 環境変数確認:` のログで、環境変数が正しく設定されているか確認

2. **Cognitoの設定を再確認**
   - App Clientの設定画面で、すべての設定が正しく保存されているか確認
   - ブラウザをリフレッシュして、設定が反映されているか確認

3. **環境変数を確認**
   - `.env.local` ファイルで、以下の環境変数が正しく設定されているか確認：
     ```
     REACT_APP_USER_POOL_ID=ap-northeast-1_6vhVyzcZy
     REACT_APP_USER_POOL_CLIENT_ID=299je5t1fsij0kg5jsgmbiu20
     REACT_APP_COGNITO_DOMAIN=ap-northeast-16vhvyzczy
     REACT_APP_CALLBACK_URL=http://localhost:3000
     REACT_APP_SIGNOUT_URL=http://localhost:3000
     ```

4. **開発サーバーを再起動**
   - 環境変数を変更した場合は、開発サーバーを再起動してください：
     ```bash
     npm start
     ```

---

**作成日**: 2026-01-04
**バージョン**: 1.0

