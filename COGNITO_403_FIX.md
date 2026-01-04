# Cognito 403 Forbidden エラーの解決方法

## エラー内容

```
GET https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com/login... 403 (Forbidden)
```

## 原因

403 Forbiddenエラーは、新しいApp Client `manuMaruDevelopPublic` がCognito Domainと正しく関連付けられていない可能性があります。

## 解決方法

### 手順1: 開発サーバーを再起動

コードを変更したので、開発サーバーを再起動してください：

```bash
# 現在のサーバーを停止（Ctrl+C）
# その後、再起動
npm start
```

### 手順2: App ClientのManaged Login Page設定を確認

1. **AWS CognitoコンソールでApp Clientを開く**
   - User Pool `manumaruECSDeveop` を選択
   - 左メニューから「**アプリケーション (Applications)** > **アプリケーションクライアント (Application Clients)**」を選択
   - `manuMaruDevelopPublic` をクリック

2. **「ログインページ (Login Page)」タブを開く**

3. **「マネージドログインページの設定」セクションを確認**
   - ステータスが「**使用可能**」になっているか確認
   - なっていない場合は、「**編集**」ボタンをクリック

4. **設定を確認・保存**
   - **Allowed callback URLs**: `http://localhost:3000`
   - **Allowed sign-out URLs**: `http://localhost:3000`
   - **Allowed OAuth flows**: `Authorization code grant` をチェック
   - **Allowed OAuth scopes**: `email`、`openid`、`profile` をチェック
   - 「**保存**」をクリック

### 手順3: Domainの確認

1. **左メニューから「ブランディング (Branding)** > **ドメイン (Domain)**」を選択**

2. **「Cognito ドメイン」セクションを確認**
   - Domain URLが表示されているか確認
   - 例: `https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com`

3. **Domainが存在しない場合**
   - 「**Cognitoドメインを作成**」ボタンをクリック
   - Domain prefixを入力（既存のものがあればそれを使用: `ap-northeast-16vhvyzczy`）
   - または、自動生成を選択
   - 「**Cognitoドメインを作成**」をクリック

### 手順4: ブラウザのキャッシュをクリア

1. ブラウザの開発者ツールを開く（F12）
2. ネットワークタブで「Disable cache」をチェック
3. または、ブラウザのキャッシュをクリア（Ctrl+Shift+Delete / Cmd+Shift+Delete）

### 手順5: 動作確認

1. 開発サーバーを再起動
2. `http://localhost:3000/?login=email` にアクセス
3. ブラウザのコンソールで以下のログを確認：
   - `🔧 生成されたリダイレクトURL: https://.../oauth2/authorize?...`
   - エンドポイントが `/oauth2/authorize` になっているか確認
4. Cognitoのログインページが表示されることを確認

---

## 確認チェックリスト

- [ ] 開発サーバーを再起動した
- [ ] App Client `manuMaruDevelopPublic` の「ログインページ」タブでステータスが「使用可能」
- [ ] Managed Login Page設定を確認・保存した
- [ ] Cognito Domainが存在し、正しく表示されている
- [ ] ブラウザのキャッシュをクリアした
- [ ] コンソールで `/oauth2/authorize` エンドポイントが使用されていることを確認

---

**重要**: コードは既に `/oauth2/authorize` エンドポイントを使用するように修正されています。開発サーバーを再起動して、変更を反映してください。

