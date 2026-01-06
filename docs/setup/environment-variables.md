# 環境変数の設定とビルド時の反映について

## 概要

GitHub Environment Secretsで設定した値は、ビルド時の環境変数として正しく設定されます。

## 動作の仕組み

### 1. GitHub Environment Secretsの設定

GitHub Environment（`develop`または`production`）でSecretsを設定すると、そのEnvironmentを使用するワークフローで参照可能になります。

### 2. ワークフローでの参照

ワークフローの`env:`セクションで`${{ secrets.REACT_APP_* }}`として参照すると、そのステップの環境変数として設定されます。

```yaml
- name: Build React app
  env:
    REACT_APP_USER_POOL_ID: ${{ secrets.REACT_APP_USER_POOL_ID }}
    REACT_APP_COGNITO_DOMAIN: ${{ secrets.REACT_APP_COGNITO_DOMAIN }}
    # ... 他の環境変数
  run: npm run build
```

### 3. Reactビルドプロセスでの利用

`REACT_APP_`プレフィックスが付いた環境変数は、Reactのビルドプロセス（webpack）で`process.env`として利用可能になります。

**重要**: 
- `REACT_APP_`プレフィックスが必須
- ビルド時に環境変数がコードに埋め込まれる（ランタイムではなくビルド時）
- ビルド後のコードから環境変数の値が確認できる（機密情報は含めないこと）

### 4. アプリケーション内での利用

ビルド後、アプリケーション内で以下のように参照できます：

```typescript
// 正しい例
const userPoolId = process.env.REACT_APP_USER_POOL_ID;
const apiEndpoint = process.env.REACT_APP_AWS_API_BASE_ENDPOINT;

// 間違った例（REACT_APP_プレフィックスがない）
const wrong = process.env.USER_POOL_ID; // undefined
```

## 確認方法

### ビルド時の確認

ワークフローで環境変数が正しく設定されているか確認：

```yaml
- name: Build React app
  env:
    REACT_APP_USER_POOL_ID: ${{ secrets.REACT_APP_USER_POOL_ID }}
  run: |
    echo "REACT_APP_USER_POOL_ID: ${REACT_APP_USER_POOL_ID:0:10}..." # 最初の10文字のみ表示
    npm run build
```

### ビルド後の確認

ビルド後のコードで環境変数が埋め込まれているか確認：

```bash
# ビルド後のファイルを検索
grep -r "REACT_APP_USER_POOL_ID" build/
```

## 注意事項

### 1. 機密情報の取り扱い

**重要**: `REACT_APP_*`環境変数は、ビルド後のJavaScriptコードに埋め込まれます。つまり：

- ✅ **公開しても問題ない情報**: APIエンドポイントURL、リージョン名など
- ❌ **公開してはいけない情報**: APIキー、シークレットキー、パスワードなど

**推奨**:
- APIキーは、可能な限りバックエンドで管理
- フロントエンドで必要な場合は、最小限の権限を持つキーのみ使用
- Cognito認証を使用して、ユーザーごとに適切な権限を付与

### 2. 環境変数の優先順位

Reactアプリケーションでは、以下の優先順位で環境変数が読み込まれます：

1. `.env.production`（本番ビルド時）
2. `.env.local`（ローカル開発時、gitignoreされる）
3. `.env`（共通設定）

GitHub Actionsでは、`.env`ファイルは使用せず、ワークフローの`env:`セクションで直接設定します。

### 3. 環境変数の命名規則

- `REACT_APP_`プレフィックスが必須
- 大文字とアンダースコアのみ使用可能
- 例: `REACT_APP_USER_POOL_ID` ✅
- 例: `REACT_APP-user-pool-id` ❌

## トラブルシューティング

### 環境変数が`undefined`になる

**原因**: 
1. Environment Secretsが設定されていない
2. `REACT_APP_`プレフィックスがない
3. ビルド後に環境変数を変更した（ビルド時に埋め込まれるため、再ビルドが必要）

**解決方法**:
1. GitHub Environment Secretsを確認
2. 環境変数名に`REACT_APP_`プレフィックスがあるか確認
3. 環境変数を変更した場合は、再ビルドが必要

### ビルド時に環境変数が反映されない

**原因**: 
1. `env:`セクションで環境変数が設定されていない
2. Environment Secretsの名前が間違っている

**解決方法**:
1. ワークフローの`env:`セクションを確認
2. Environment Secretsの名前を確認（大文字小文字を区別）

---

**作成日**: 2026-01-04
**バージョン**: 1.0


