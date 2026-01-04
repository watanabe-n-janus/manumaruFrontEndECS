# Cognito "Login pages unavailable" エラーの解決方法

## エラー内容

```
Login pages unavailable
Please contact an administrator.
```

## 原因

新しいApp Client `manuMaruDevelopPublic` がCognito Domainと関連付けられていない可能性があります。

## 解決方法

### 方法1: Domainの確認とApp Clientの関連付け

1. **AWS CognitoコンソールでDomainを確認**
   - User Pool `manumaruECSDeveop` を選択
   - 左メニューから「**ブランディング (Branding)** > **ドメイン (Domain)**」を選択
   - **Cognito ドメイン** セクションにドメインが表示されているか確認
   - 例: `https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com`

2. **Domainが存在しない場合**
   - 「**Cognitoドメインを作成**」ボタンをクリック
   - Domain prefixを入力（既存のものがあればそれを使用）
   - または、自動生成を選択
   - 「**Cognitoドメインを作成**」をクリック

3. **App ClientとDomainの関連付けを確認**
   - 新しいApp Client `manuMaruDevelopPublic` の詳細画面を開く
   - 「**ログインページ (Login Page)**」タブを確認
   - 「**マネージドログインページの設定**」セクションで、ステータスが「**使用可能**」になっているか確認

### 方法2: Managed Login Pageの設定を確認

1. **App Clientの詳細画面を開く**
   - `manuMaruDevelopPublic` を選択
   - 「**ログインページ (Login Page)**」タブを開く

2. **Managed Login Page Settingsを確認**
   - 「**マネージドログインページの設定**」セクションを確認
   - ステータスが「**使用可能**」になっているか確認
   - なっていない場合は、「**編集**」ボタンをクリックして設定を確認

3. **設定を保存**
   - すべての設定を確認したら、「**保存**」をクリック

### 方法3: 既存のDomainを使用する

既存のDomain（`ap-northeast-16vhvyzczy`）が存在する場合：

1. **環境変数を確認**
   - `.env.local` ファイルで `REACT_APP_COGNITO_DOMAIN` が正しく設定されているか確認
   - 例: `REACT_APP_COGNITO_DOMAIN=ap-northeast-16vhvyzczy`

2. **Domainが正しく動作しているか確認**
   - ブラウザで直接アクセス: `https://ap-northeast-16vhvyzczy.auth.ap-northeast-1.amazoncognito.com`
   - ログインページが表示されるか確認

---

## 確認チェックリスト

- [ ] Cognito Domainが作成されている
- [ ] Domain URLが正しく表示されている
- [ ] App Client `manuMaruDevelopPublic` のステータスが「使用可能」
- [ ] 環境変数 `REACT_APP_COGNITO_DOMAIN` が正しく設定されている
- [ ] Domain URLに直接アクセスしてログインページが表示される

---

**重要**: 新しいApp Clientを作成した場合、Domainとの関連付けが自動的に行われるはずですが、場合によっては手動で確認・設定が必要な場合があります。

