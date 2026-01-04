# Cognito "Login pages unavailable" エラーの解決方法

## エラー内容

```
Login pages unavailable
Please contact an administrator.
```

URL: `https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com/login?client_id=43rjh9se4s70tiurtar83onpsq&response_type=code&scope=email%20openid%20profile&redirect_uri=http://localhost:3000`

## 原因

新しいApp Client `manuMaruDevelopPublic` がCognito Domainと正しく関連付けられていない可能性があります。

## 解決方法

### 手順1: App ClientのManaged Login Page設定を確認

1. **AWS CognitoコンソールでApp Clientを開く**
   - User Pool `manumaruECSDeveop` を選択
   - 左メニューから「**アプリケーション (Applications)** > **アプリケーションクライアント (Application Clients)**」を選択
   - `manuMaruDevelopPublic` をクリック

2. **「ログインページ (Login Page)」タブを開く**
   - タブバーから「**ログインページ (Login Page)**」を選択

3. **「マネージドログインページの設定」セクションを確認**
   - ステータスが「**使用可能**」になっているか確認
   - なっていない場合は、以下の設定を確認：

### 手順2: Managed Login Page設定を編集

1. **「編集 (Edit)」ボタンをクリック**

2. **以下の設定を確認・設定**：
   - **Allowed callback URLs**: 
     ```
     http://localhost:3000
     ```
   - **Allowed sign-out URLs**: 
     ```
     http://localhost:3000
     ```
   - **Allowed OAuth flows**: 
     - ✅ **Authorization code grant** をチェック
   - **Allowed OAuth scopes**: 
     - ✅ **email** をチェック
     - ✅ **openid** をチェック
     - ✅ **profile** をチェック
     - ⬜ **phone** は必要に応じて（現在はチェックされているが、必須ではない）

3. **「保存 (Save)」または「Save changes」をクリック**

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

### 手順4: 設定の反映を待つ

設定を保存した後、数秒待ってから再度アクセスしてください。設定の反映に時間がかかる場合があります。

### 手順5: 動作確認

1. ブラウザのキャッシュをクリア（Ctrl+Shift+Delete / Cmd+Shift+Delete）
2. `http://localhost:3000/?login=email` にアクセス
3. Cognitoのログインページが表示されることを確認

---

## 確認チェックリスト

- [ ] App Client `manuMaruDevelopPublic` の「ログインページ」タブを開いた
- [ ] 「マネージドログインページの設定」のステータスが「使用可能」
- [ ] 「編集」ボタンで設定を確認・保存した
- [ ] Allowed callback URLs に `http://localhost:3000` が登録されている
- [ ] Allowed OAuth scopes に `email`、`openid`、`profile` がチェックされている
- [ ] Allowed OAuth flows に `Authorization code grant` がチェックされている
- [ ] Cognito Domainが存在し、正しく表示されている
- [ ] 設定を保存した

---

## それでも解決しない場合

1. **App Clientを削除して再作成**
   - 既存の `manuMaruDevelopPublic` を削除
   - 新しいApp Clientを作成（「シングルページアプリケーション (SPA)」を選択）
   - 同じ設定でHosted UIを設定

2. **既存のApp Client `manuMaruDevelop` を使用**
   - 古いApp Clientがまだ存在する場合、そちらを使用することも可能
   - ただし、クライアントシークレットの問題があるため、新しいPublic Clientの方が推奨

---

**重要**: 新しいApp Clientを作成した場合、Managed Login Pageの設定を明示的に行う必要があります。「ログインページ」タブで「編集」ボタンをクリックして、設定を確認・保存してください。

