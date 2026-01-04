# Cognitoスコープ設定の修正手順

## 問題

コードで`email openid profile`スコープを送信していますが、Cognitoの設定には`phone`スコープしかありません。

## 解決方法

### 方法1: `profile`スコープを追加（推奨）

1. AWS Cognitoコンソールで、`manuMaruDevelop` App Clientを開く
2. **Hosted UI** セクションの **Managed Login Page Settings** を開く
3. **編集 (Edit)** ボタンをクリック
4. **OpenID Connect Scopes** セクションで、以下を確認：
   - ✅ `email` がチェックされている
   - ✅ `openid` がチェックされている
   - ✅ `phone` がチェックされている
   - ⬜ `profile` を**追加でチェック**
5. **保存 (Save)** をクリック

これで、`email openid phone profile`の4つのスコープが有効になります。

### 方法2: コードを修正して`phone`スコープを使用

もし`profile`スコープが不要な場合は、コードを修正して`phone`スコープを使用することもできます。

---

**推奨**: 方法1で`profile`スコープを追加することをお勧めします。`profile`スコープは、ユーザーの名前などのプロフィール情報を取得するために一般的に使用されます。

