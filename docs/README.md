# ドキュメント一覧

このディレクトリには、ManuMaru Frontend ECSプロジェクトのドキュメントが整理されています。

## 📚 セットアップガイド

### 認証・セキュリティ
- [Cognito設定ガイド](./setup/cognito-setup.md) - AWS Cognitoの手動セットアップ手順
- [CloudFront URLをCognitoに設定](./setup/cloudfront-cognito-setup.md) - デプロイ後のCognito設定

### デプロイメント
- [デプロイメントガイド](./setup/deployment.md) - GitHub Actionsを使用したデプロイメント手順
- [CloudFormationデプロイメントガイド](./setup/cloudformation.md) - CloudFormationスタックのデプロイ手順

### 環境設定
- [GitHub Environment設定](./setup/github-environment-setup.md) - GitHub Environment Secretsの設定手順
- [GitHub Environments説明](./setup/github-environments.md) - GitHub Environmentsの概念と使い方
- [環境変数の説明](./setup/environment-variables.md) - 環境変数の扱い方とビルド時の埋め込み

## 🔧 トラブルシューティング

- [CloudFormationエラー](./troubleshooting/cloudformation-errors.md) - CloudFormationデプロイ時のエラー対処法
- [リダイレクトURL問題](./troubleshooting/redirect-url-fix.md) - ログイン後のリダイレクト問題の解決方法

## 📋 移行・仕様書

- [ECS/CloudFront移行仕様](./migration/ecs-cloudfront-migration-spec.md) - ECSからCloudFrontへの移行仕様書

---

**更新日**: 2026-01-04

