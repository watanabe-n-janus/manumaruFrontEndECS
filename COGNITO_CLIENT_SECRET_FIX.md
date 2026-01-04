# Cognitoクライアントシークレットエラーの解決方法

## エラー内容

```
invalid_client - invalid_client_secret
```

## 原因

CognitoのApp Clientにクライアントシークレットが設定されているが、フロントエンドアプリケーションではクライアントシークレットを安全に保存できないため、トークン交換時に送信できていません。

## 解決方法

フロントエンドアプリケーション（SPA）では、**Public Client**（クライアントシークレットなし）を使用する必要があります。

### 手順

1. **AWS CognitoコンソールでApp Clientを開く**
   - User Pool `manumaruECSDeveop` を選択
   - 左メニューから「**アプリケーション (Applications)** > **アプリケーションクライアント (Application Clients)**」を選択
   - `manuMaruDevelop` をクリック

2. **App Clientを削除して再作成（クライアントシークレットなし）**
   
   **方法1: 既存のApp Clientを編集（推奨）**
   - 残念ながら、既存のApp Clientのクライアントシークレットを無効化することはできません
   - 新しいApp Clientを作成する必要があります

   **方法2: 新しいApp Clientを作成**
   1. 「**アプリケーションクライアントを作成**」ボタンをクリック
   2. **アプリケーションクライアント名**: `manuMaruDevelop`（既存の名前を使用する場合は、既存のものを先に削除）
   3. **クライアントシークレットを生成**: **チェックを外す**（重要！）
   4. **認証フロー**: 以下を選択
      - ✅ 選択ベースのサインイン (Selection-based Sign-in)
      - ✅ セキュアリモートパスワード (SRP)
      - ✅ 既存の認証済みセッションからユーザートークンを取得
   5. 「**作成**」をクリック

3. **Hosted UI設定を確認・設定**
   - 作成したApp Clientの詳細画面で、「**Hosted UI**」セクションを開く
   - 「**編集**」をクリック
   - **Allowed callback URLs**: `http://localhost:3000` を追加
   - **Allowed sign-out URLs**: `http://localhost:3000` を追加
   - **Allowed OAuth flows**: `Authorization code grant` をチェック
   - **Allowed OAuth scopes**: 以下をチェック
     - ✅ `email`
     - ✅ `openid`
     - ✅ `profile`
   - 「**保存**」をクリック

4. **環境変数を更新**
   - 新しいClient IDを取得して、`.env.local`ファイルを更新：
     ```
     REACT_APP_USER_POOL_CLIENT_ID=新しいClientID
     ```

5. **既存のApp Clientを削除（オプション）**
   - 古いApp Clientが不要な場合は削除できます

---

**重要**: クライアントシークレットを生成するチェックボックスを**外す**ことが重要です。これにより、Public Clientとして動作し、フロントエンドアプリケーションから安全に使用できます。

