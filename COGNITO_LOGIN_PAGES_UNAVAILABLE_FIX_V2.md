# Cognito "Login pages unavailable" エラーの解決方法（再確認）

## エラー内容

```
Login pages unavailable
Please contact an administrator.
```

## 原因

このエラーは、Cognito の App Client の **Managed Login Page** 設定が正しくない場合に発生します。

## 解決手順

### 1. App Client の Managed Login Page 設定を確認

1. **AWS Cognitoコンソール**にアクセス
2. User Pool `manumaruECSDeveop` を選択
3. 左メニューから「**アプリケーション (Applications)** > **アプリケーションクライアント (Application Clients)**」を選択
4. `manuMaruDevelopPublic` をクリック

### 2. 「ログインページ (Login Page)」タブを確認

1. **「ログインページ (Login Page)」タブ**を開く
2. **「マネージドログインページの設定」セクション**を確認

### 3. 設定を確認・修正

以下の設定が正しく行われていることを確認：

#### ✅ Allowed callback URLs
```
http://localhost:3000
```

#### ✅ Allowed sign-out URLs
```
http://localhost:3000
```

#### ✅ Allowed OAuth flows
- ✅ **Authorization code grant** をチェック
- ❌ **Implicit grant** はチェックを外す（セキュリティのため）

#### ✅ Allowed OAuth scopes
- ✅ **email**
- ✅ **openid**
- ✅ **profile**

### 4. 設定を保存

すべての設定を確認したら、**「保存 (Save)」**または**「Save changes」**をクリックしてください。

### 5. ステータスを確認

**「マネージドログインページの設定」セクション**で、ステータスが**「使用可能」**になっていることを確認してください。

もし**「使用不可」**になっている場合は：
1. **「編集」**ボタンをクリック
2. 上記の設定を確認・修正
3. **「保存」**をクリック
4. 数秒待ってから、再度ステータスを確認

### 6. Domain の確認

1. 左メニューから「**ブランディング (Branding)** > **ドメイン (Domain)**」を選択
2. **「Cognito ドメイン」セクション**で、Domain URLが表示されていることを確認
3. Domain URLが表示されていない場合は、Domain を作成してください

### 7. App Client と Domain の関連付けを確認

1. App Client `manuMaruDevelopPublic` の詳細ページに戻る
2. **「ログインページ (Login Page)」タブ**を開く
3. **「マネージドログインページの設定」セクション**で、Domain URLが表示されていることを確認

---

## 確認チェックリスト

- [ ] App Client `manuMaruDevelopPublic` が存在する
- [ ] 「ログインページ (Login Page)」タブでステータスが「使用可能」
- [ ] Allowed callback URLs に `http://localhost:3000` が登録されている
- [ ] Allowed sign-out URLs に `http://localhost:3000` が登録されている
- [ ] Allowed OAuth flows で「Authorization code grant」がチェックされている
- [ ] Allowed OAuth scopes で「email」「openid」「profile」がすべてチェックされている
- [ ] Cognito Domain が作成されている
- [ ] App Client と Domain が正しく関連付けられている

---

## 追加の確認事項

### App Client のタイプ

App Client `manuMaruDevelopPublic` が**「Single Page Application (SPA)」**タイプであることを確認してください。

1. App Client の詳細ページで、**「アプリケーションクライアントの詳細」セクション**を確認
2. **「アプリケーションタイプ」**が**「Single Page Application (SPA)」**になっていることを確認
3. **「クライアントシークレットを生成」**が**チェックされていない**ことを確認

---

## トラブルシューティング

### ステータスが「使用不可」のままの場合

1. App Client を削除して再作成する
2. 新しい App Client ID を `.env.local` に設定する
3. 上記の設定を再度確認・保存する

### Domain が表示されない場合

1. 「ブランディング > ドメイン」で Domain を作成する
2. App Client の「ログインページ」タブで、Domain が関連付けられていることを確認する

---

**作成日**: 2026-01-04
**バージョン**: 2.0

