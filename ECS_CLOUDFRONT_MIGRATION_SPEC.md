# Amplify → ECS + CloudFront 移行仕様書

## 1. 概要

### 1.1 目的
AWS AmplifyからAmazon ECS（Fargate）とCloudFrontへの移行を実施し、より柔軟でスケーラブルなインフラストラクチャを構築する。

### 1.2 移行範囲
- **ホスティング**: Amplify Hosting → CloudFront + S3
- **アプリケーション実行環境**: Amplify → ECS Fargate
- **認証**: Amplify経由のCognito → Cognito直接利用
- **デプロイ**: Amplify自動デプロイ → GitHub Actions + CloudFormation
- **React**: 18.3.1 → 19.x（最新版）

### 1.3 非移行項目
- S3バケット（既存のものを継続利用）
- DynamoDBテーブル（既存のものを継続利用）
- API Gateway（既存のものを継続利用）

### 1.4 新規作成項目
- **Cognito User Pool**: Amplifyのものは使用せず、CloudFormationで新規作成
- **CloudFront Distribution**: デフォルトドメインを使用（カスタムドメインなし）

## 2. 現状分析

### 2.1 現在のアーキテクチャ
```
[ユーザー]
    ↓
[CloudFront] (Amplify管理)
    ↓
[Amplify Hosting]
    ↓
[React App] (Amplifyビルド)
    ↓
[Cognito] (Amplify経由)
[S3/DynamoDB/API Gateway] (直接アクセス)
```

### 2.2 使用技術スタック
- **React**: 18.3.1
- **TypeScript**: 5.9.3
- **AWS Amplify**: 6.15.0
- **AWS SDK**: v3
- **認証**: Cognito (OAuth/SAML via Amplify)
- **ビルドツール**: react-scripts 5.0.1

### 2.3 依存関係
- `@aws-amplify/auth`: 6.13.0
- `@aws-amplify/ui-react`: 6.11.2
- `aws-amplify`: 6.15.0
- `@aws-sdk/client-s3`: 3.943.0
- `@aws-sdk/client-dynamodb`: 3.943.0
- `@aws-sdk/lib-dynamodb`: 3.943.0
- `@aws-sdk/lib-storage`: 3.943.0

## 3. 移行後のアーキテクチャ

### 3.1 全体構成
```
[ユーザー]
    ↓
[CloudFront Distribution]
    ↓
[S3 Bucket] (静的ファイル)
    ↓
[React App] (ビルド済み)
    ↓
[ECS Fargate Service] (必要に応じて)
    ↓
[Cognito] (直接接続)
[S3/DynamoDB/API Gateway] (直接アクセス)
```

### 3.2 コンポーネント詳細

#### 3.2.1 CloudFront Distribution
- **目的**: 静的コンテンツの配信とキャッシュ
- **オリジン**: S3バケット
- **ドメイン**: CloudFrontのデフォルトドメインを使用（例: `d1234567890abc.cloudfront.net`）
- **機能**:
  - HTTPS強制（CloudFrontデフォルト証明書）
  - キャッシュポリシー最適化
  - WAF統合（オプション）

#### 3.2.2 S3 Bucket
- **目的**: Reactアプリケーションの静的ファイルホスティング
- **設定**:
  - 静的ウェブサイトホスティング（CloudFront経由のため無効化可能）
  - パブリックアクセスブロック
  - CloudFront OAI/OACによるアクセス制御

#### 3.2.3 ECS Fargate（オプション）
- **目的**: サーバーサイドレンダリングやAPIプロキシが必要な場合
- **現時点**: 静的ホスティングのみのため、初期実装では不要
- **将来拡張**: SSRやBFF（Backend for Frontend）が必要になった場合に追加

#### 3.2.4 Cognito統合
- **方式**: Amplify SDKを削除し、Cognito JavaScript SDKを直接使用
- **新規作成**: CloudFormationでCognito User Poolを新規作成
- **機能**:
  - OAuth/SAML認証（新規設定）
  - Hosted UI対応
  - トークン管理
  - セッション管理
- **ローカル開発**: ローカル環境でもCognito Hosted UIを使用してログインテストが可能（初回デプロイ後）

## 4. Reactアップグレード

### 4.1 アップグレード計画
- **現在**: React 18.3.1
- **目標**: React 19.x（最新安定版）
- **互換性確認**: 全依存パッケージのReact 19対応確認

### 4.2 主な変更点
1. **新機能**:
   - React Compiler（オプション）
   - 改善されたSuspense
   - 新しいフック（useActionState, useFormStatus等）

2. **破壊的変更**:
   - `react-dom/client`のAPI変更（既に対応済み）
   - TypeScript型定義の更新

3. **依存パッケージ更新**:
   - `@types/react`: 19.x対応版
   - `@types/react-dom`: 19.x対応版
   - Material-UI等の互換性確認

### 4.3 移行手順
1. `package.json`の依存関係更新
2. 型定義の更新
3. コンポーネントの動作確認
4. テストの実行と修正

## 5. Amplify依存の削除

### 5.1 削除対象パッケージ
- `aws-amplify`
- `@aws-amplify/auth`
- `@aws-amplify/ui-react`

### 5.2 置き換え実装

#### 5.2.1 Cognito認証
**現在（Amplify使用）**:
```typescript
import { signInWithRedirect, getCurrentUser } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
```

**移行後（Cognito直接）**:
```typescript
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
// または
import { Auth } from '@aws-amplify/auth'; // 軽量版のみ使用
```

#### 5.2.2 認証フロー
1. **OAuth/SAML認証**:
   - Cognito Hosted UIを使用（既存設定を継続）
   - コールバック処理を自前実装

2. **トークン管理**:
   - localStorageでのトークン保存
   - トークンリフレッシュ処理

3. **セッション管理**:
   - カスタムフックでのセッション管理
   - 認証状態の管理

### 5.3 影響範囲
- `src/index.tsx`: Amplify設定の削除
- `src/App.tsx`: Amplify認証APIの置き換え
- `src/hooks/useExternalAuth.ts`: トークン処理の調整
- `src/contexts/UserAttributesContext.tsx`: 認証状態管理の調整

## 6. CloudFormation設計

### 6.1 スタック構成

#### 6.1.1 スタック名規則
- **Develop環境**: `manumaruFrontECS-develop`
- **Production環境**: `manumaruFrontECS-production`

#### 6.1.2 リソース構成
```
manumaruFrontECS-{ENV}
├── S3 Bucket (静的ファイル)
│   ├── BucketName: manumaru-front-{ENV}-{random}
│   └── Versioning: Enabled
├── CloudFront Distribution
│   ├── Origin: S3 Bucket
│   ├── ViewerCertificate: CloudFront Default Certificate
│   ├── DefaultCacheBehavior: Optimized
│   └── DomainName: d{random}.cloudfront.net (デフォルト)
├── CloudFront Origin Access Control (OAC)
├── IAM Role (CloudFront → S3)
├── Cognito User Pool (新規作成)
│   ├── UserPoolName: manumaru-front-{ENV}-userpool
│   ├── UserPoolClient (Web)
│   ├── UserPoolDomain (Hosted UI)
│   └── Identity Pool (オプション)
└── Outputs
    ├── CloudFrontDistributionId
    ├── CloudFrontDomainName
    ├── S3BucketName
    ├── CognitoUserPoolId
    ├── CognitoUserPoolClientId
    ├── CognitoHostedUIDomain
    └── CognitoHostedUIURL
```

### 6.2 パラメータ定義

| パラメータ名 | 型 | 説明 | デフォルト |
|------------|-----|------|-----------|
| Environment | String | 環境名 (develop/production) | - |
| AllowedOrigins | CommaDelimitedList | CORS許可オリジン（CloudFront URL含む） | - |
| CognitoCallbackURL | String | Cognito認証後のリダイレクトURL | - |
| CognitoSignOutURL | String | Cognitoサインアウト後のリダイレクトURL | - |
| CognitoDomainPrefix | String | Cognito Hosted UI ドメイン接頭辞 | manumaru-{ENV} |

### 6.3 テンプレート構造
```
cloudformation/
├── templates/
│   ├── main.yaml (メインテンプレート)
│   ├── s3-bucket.yaml (S3バケット)
│   ├── cloudfront.yaml (CloudFront)
│   ├── cognito.yaml (Cognito User Pool)
│   └── iam.yaml (IAMロール)
├── parameters/
│   ├── develop.json
│   └── production.json
└── scripts/
    ├── deploy.sh
    ├── validate.sh
    └── get-outputs.sh (ローカル開発用)
```

## 7. CI/CDパイプライン

### 7.1 GitHub Actionsワークフロー

#### 7.1.1 トリガー
- **developブランチ**: develop環境に自動デプロイ
- **main/productionブランチ**: production環境に自動デプロイ
- **手動実行**: 任意のブランチから任意の環境へデプロイ可能

#### 7.1.2 パイプラインステップ
1. **Checkout**: コード取得
2. **Setup Node.js**: Node.js環境構築
3. **Install Dependencies**: `npm ci`
4. **Lint**: ESLint実行
5. **Test**: ユニットテスト実行
6. **Build**: `npm run build`
7. **Deploy to S3**: ビルド成果物をS3にアップロード
8. **Invalidate CloudFront**: キャッシュ無効化
9. **Update CloudFormation**: スタック更新（必要に応じて）

### 7.2 シークレット管理
- **GitHub Secrets**:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
  - 注意: Cognito情報はCloudFormationのOutputから自動取得

### 7.3 デプロイスクリプト
```yaml
# .github/workflows/deploy.yml
name: Deploy to ECS + CloudFront

on:
  push:
    branches: [develop, main]
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [develop, production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: aws-actions/configure-aws-credentials@v4
      - run: aws s3 sync build/ s3://${{ env.S3_BUCKET }}/
      - run: aws cloudfront create-invalidation --distribution-id ${{ env.CF_DIST_ID }} --paths "/*"
```

## 8. Dockerfile（将来拡張用）

### 8.1 静的ホスティング用（Nginx）
```dockerfile
FROM nginx:alpine
COPY build/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 8.2 環境変数注入
- ビルド時に環境変数を注入
- またはランタイム時に環境変数を読み込み

## 9. 環境変数管理

### 9.1 ビルド時環境変数
```bash
REACT_APP_AWS_REGION
REACT_APP_USER_POOL_ID
REACT_APP_USER_POOL_CLIENT_ID
REACT_APP_COGNITO_DOMAIN
REACT_APP_CALLBACK_URL
REACT_APP_SIGNOUT_URL
REACT_APP_DYNAMODB_TABLE_NAME
REACT_APP_AWS_BUCKET_NAME
REACT_APP_AWS_API_BASE_ENDPOINT
REACT_APP_AWS_API_KEY
```

### 9.2 シークレット管理
- **開発環境**: `.env.local`（gitignore）
- **CI/CD**: GitHub Secrets
- **本番環境**: CloudFormation Parameters → Systems Manager Parameter Store

### 9.3 ローカル開発環境設定
- **初回デプロイ**: CloudFormationスタックを一度デプロイしてCognitoリソースを作成
- **環境変数**: `.env.local`にCloudFormationのOutput値を設定
  ```bash
  REACT_APP_USER_POOL_ID=<CloudFormation Output>
  REACT_APP_USER_POOL_CLIENT_ID=<CloudFormation Output>
  REACT_APP_COGNITO_DOMAIN=<CloudFormation Output>
  REACT_APP_CALLBACK_URL=http://localhost:3000
  REACT_APP_SIGNOUT_URL=http://localhost:3000
  ```
- **Cognito Hosted UI**: ローカル環境（localhost:3000）でもCognito Hosted UIを使用可能
- **リダイレクトURL**: Cognito User Poolの設定で`http://localhost:3000`を許可

## 10. セキュリティ考慮事項

### 10.1 IAMポリシー
- **最小権限の原則**: 必要最小限の権限のみ付与
- **CloudFront OAC**: S3への直接アクセスをブロック
- **Cognito認証**: 適切なスコープとリダイレクトURL設定

### 10.2 ネットワークセキュリティ
- **HTTPS強制**: CloudFrontでHTTPS強制
- **CORS設定**: 適切なオリジン制限
- **WAF**: DDoS対策とボット対策（オプション）

### 10.3 シークレット管理
- **環境変数**: ビルド時に注入（クライアント側に露出）
- **APIキー**: 環境変数で管理（クライアント側に露出するため注意）
- **Cognito認証**: トークンベースの認証を使用

## 11. モニタリングとログ

### 11.1 CloudWatch
- **CloudFront**: アクセスログとメトリクス
- **S3**: アクセスログ
- **カスタムメトリクス**: アプリケーションエラー追跡

### 11.2 アラート
- CloudFrontエラー率
- S3アクセスエラー
- デプロイ失敗通知

## 12. 移行手順

### 12.1 フェーズ1: 準備
1. 仕様書レビュー
2. 開発環境構築
3. 依存関係の確認と更新計画

### 12.2 フェーズ2: コード修正
1. React 19へのアップグレード
2. Amplify依存の削除
3. Cognito直接実装
4. テストとデバッグ

### 12.3 フェーズ3: インフラ構築
1. CloudFormationテンプレート作成
2. develop環境のデプロイ
3. 動作確認

### 12.4 フェーズ4: CI/CD構築
1. GitHub Actionsワークフロー作成
2. 自動デプロイテスト
3. ドキュメント更新

### 12.5 フェーズ5: 本番移行
1. production環境のデプロイ
2. 切り替えテスト
3. 旧Amplify環境の削除

## 13. ロールバック計画

### 13.1 デプロイ失敗時
- CloudFormationロールバック（自動）
- S3バケットのバージョニングを活用
- 前バージョンへの手動切り替え

### 13.2 アプリケーション問題時
- CloudFrontキャッシュクリア
- 前バージョンのビルド成果物をS3に再アップロード

## 14. コスト最適化

### 14.1 見積もり
- **CloudFront**: データ転送量ベース
- **S3**: ストレージとリクエスト数
- **ECS**: 使用時のみ（現時点では不要）

### 14.2 最適化施策
- CloudFrontキャッシュ最適化
- S3 Intelligent-Tiering
- 不要なリソースの削除

## 15. 品質保証

### 15.1 テスト戦略
- **ユニットテスト**: コンポーネントテスト
- **統合テスト**: 認証フローテスト
- **E2Eテスト**: 主要機能の動作確認

### 15.2 コード品質
- ESLint/Prettier設定
- TypeScript strict mode
- コードレビュープロセス

## 16. ドキュメント

### 16.1 作成ドキュメント
- 本仕様書
- デプロイ手順書
- トラブルシューティングガイド
- アーキテクチャ図

### 16.2 更新ドキュメント
- README.md
- 環境構築手順
- 開発ガイドライン

## 17. タイムライン

### 17.1 見積もり
- **仕様書作成**: 1日
- **コード修正**: 3-5日
- **インフラ構築**: 2-3日
- **CI/CD構築**: 1-2日
- **テストと調整**: 2-3日
- **合計**: 9-14日

### 17.2 マイルストーン
1. ✅ 仕様書完成
2. ⏳ React 19アップグレード完了
3. ⏳ Amplify依存削除完了
4. ⏳ CloudFormationテンプレート完成
5. ⏳ develop環境デプロイ成功
6. ⏳ CI/CDパイプライン動作確認
7. ⏳ production環境移行完了

## 18. リスクと対策

### 18.1 技術的リスク
| リスク | 影響度 | 対策 |
|--------|--------|------|
| React 19互換性問題 | 中 | 段階的アップグレード、テスト強化 |
| Cognito直接実装の複雑さ | 中 | 既存実装を参考、段階的移行 |
| CloudFormationテンプレートエラー | 低 | テンプレート検証、段階的デプロイ |

### 18.2 運用リスク
| リスク | 影響度 | 対策 |
|--------|--------|------|
| デプロイ失敗 | 中 | ロールバック手順の整備 |
| パフォーマンス低下 | 低 | パフォーマンステスト実施 |
| コスト増加 | 低 | コストモニタリング設定 |

---

**作成日**: 2025-01-XX
**バージョン**: 1.0
**承認者**: [承認者名]

