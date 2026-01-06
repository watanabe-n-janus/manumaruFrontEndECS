# S3認証エラーのトラブルシューティング

## エラー内容

```
AuthorizationHeaderMalformed: The authorization header is malformed; a non-empty Access Key (AKID) must be provided in the credential.
```

## 原因

このエラーは、AWS認証情報（Access Key IDとSecret Access Key）が正しく設定されていない、または読み込まれていない場合に発生します。

## 解決方法

### 1. ローカル開発環境（`.env.local`）

プロジェクトルートに`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
REACT_APP_AWS_ACCESS_KEY_ID=your-access-key-id
REACT_APP_AWS_SECRET_ACCESS_KEY=your-secret-access-key
REACT_APP_AWS_REGION=ap-northeast-1
REACT_APP_AWS_BUCKET_NAME=your-bucket-name
```

**重要**: 
- `REACT_APP_`プレフィックスを必ず付けること
- `.env.local`ファイルは`.gitignore`に含まれているため、Gitにはコミットされません
- 値にスペースや特殊文字が含まれる場合は、クォーテーションで囲む必要はありません

### 2. デプロイ環境（GitHub Actions）

GitHub Environment Secretsに以下を設定してください：

1. GitHubリポジトリの「**Settings** > **Environments** > **develop**（または**production**）」を開く
2. 「**Environment secrets**」セクションで以下を設定：

```
REACT_APP_AWS_ACCESS_KEY_ID=your-access-key-id
REACT_APP_AWS_SECRET_ACCESS_KEY=your-secret-access-key
REACT_APP_AWS_REGION=ap-northeast-1
REACT_APP_AWS_BUCKET_NAME=your-bucket-name
```

### 3. 認証情報の確認

ブラウザの開発者ツールのコンソールで、以下のログが表示されることを確認してください：

```
🔑 AWS認証情報の確認:
  - Access Key ID: AKIA...
  - Secret Access Key: 設定済み
  - Region: ap-northeast-1
```

「未設定」と表示される場合は、環境変数が正しく読み込まれていません。

### 4. 環境変数の確認方法

#### ローカル環境

1. `.env.local`ファイルがプロジェクトルートに存在することを確認
2. ファイルの内容が正しい形式か確認
3. 開発サーバーを再起動（`npm start`）

**注意**: `.env.local`ファイルを変更した後は、必ず開発サーバーを再起動してください。

#### デプロイ環境

GitHub Actionsのログで、環境変数が正しく設定されているか確認：

```bash
# ワークフローのログで以下を確認
REACT_APP_AWS_ACCESS_KEY_ID: AKIA...
REACT_APP_AWS_SECRET_ACCESS_KEY: 設定済み
```

### 5. よくある間違い

#### ❌ 間違い1: 環境変数名が間違っている

```bash
# ❌ 間違い
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# ✅ 正しい
REACT_APP_AWS_ACCESS_KEY_ID=...
REACT_APP_AWS_SECRET_ACCESS_KEY=...
```

#### ❌ 間違い2: `.env`ファイルを使用している

Reactアプリケーションでは、`.env.local`ファイルを使用してください。`.env`ファイルは通常、Gitにコミットされるため、機密情報を含めるべきではありません。

#### ❌ 間違い3: 開発サーバーを再起動していない

`.env.local`ファイルを変更した後は、必ず開発サーバーを再起動してください。

## デバッグ方法

### 1. コンソールログの確認

ブラウザの開発者ツールのコンソールで、以下のログを確認：

```
🔑 AWS認証情報の確認:
  - Access Key ID: AKIA...
  - Secret Access Key: 設定済み
  - Region: ap-northeast-1
```

### 2. 環境変数の直接確認

開発者ツールのコンソールで以下を実行：

```javascript
console.log('Access Key ID:', process.env.REACT_APP_AWS_ACCESS_KEY_ID);
console.log('Secret Access Key:', process.env.REACT_APP_AWS_SECRET_ACCESS_KEY ? '設定済み' : '未設定');
```

### 3. ネットワークタブの確認

ブラウザの開発者ツールの「Network」タブで、S3へのリクエストを確認：
- リクエストヘッダーに`Authorization`ヘッダーが含まれているか
- ステータスコードが400（Bad Request）になっていないか

## 関連ドキュメント

- [環境変数の説明](../setup/environment-variables.md)
- [GitHub Environment設定](../setup/github-environment-setup.md)

---

**作成日**: 2026-01-04
**バージョン**: 1.0

