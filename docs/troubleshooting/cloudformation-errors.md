# CloudFormation エラーコード254のトラブルシューティング

## エラー概要

エラーコード254は、CloudFormationスタックの更新が失敗した場合に発生します。

```
Error: Process completed with exit code 254.
```

これは通常、`aws cloudformation wait stack-update-complete`コマンドが失敗したことを示します。

## 原因の特定方法

### 1. GitHub Actionsのログを確認

GitHub Actionsのログで以下を確認してください：

1. **スタックの状態**: `Current stack status: UPDATE_ROLLBACK_COMPLETE` など
2. **失敗したリソース**: `Failed resources:` セクション
3. **エラーイベント**: `Recent error events:` セクション

### 2. AWSコンソールで確認

1. AWSマネジメントコンソールにログイン
2. **CloudFormation**サービスを開く
3. スタック `manumaruFrontECS-develop` を選択
4. **イベント**タブを開く
5. ステータスが `UPDATE_FAILED` または `UPDATE_ROLLBACK_COMPLETE` のリソースを確認
6. エラーメッセージを確認

### 3. AWS CLIで確認

ローカルで以下のコマンドを実行：

```bash
# スタックの状態を確認
aws cloudformation describe-stacks \
  --stack-name manumaruFrontECS-develop \
  --query 'Stacks[0].StackStatus' \
  --output text

# 失敗したリソースを確認
aws cloudformation describe-stack-events \
  --stack-name manumaruFrontECS-develop \
  --max-items 20 \
  --query 'StackEvents[?ResourceStatus==`UPDATE_FAILED`].[LogicalResourceId,ResourceStatusReason]' \
  --output table

# 最新のエラーイベントを表示
aws cloudformation describe-stack-events \
  --stack-name manumaruFrontECS-develop \
  --max-items 10 \
  --query 'StackEvents[?contains(ResourceStatus, `FAILED`) || contains(ResourceStatus, `ROLLBACK`)].{Time:Timestamp,Resource:LogicalResourceId,Status:ResourceStatus,Reason:ResourceStatusReason}' \
  --output table
```

## よくある原因と解決方法

### 1. リソースの変更が許可されていない

**エラーメッセージ例**:
```
Resource handler returned message: "Resource cannot be updated"
```

**原因**: 一部のリソース（例: CloudFront Distributionの一部のプロパティ）は更新できない

**解決方法**:
- 該当リソースを削除して再作成する必要がある場合がある
- または、変更を別の方法で実装する

### 2. パラメータの値が無効

**エラーメッセージ例**:
```
Parameter validation failed: parameter value is invalid
```

**原因**: `parameters/develop.json`の値が無効

**解決方法**:
- `cloudformation/parameters/develop.json`を確認
- パラメータの値が正しい形式か確認

### 3. IAM権限不足

**エラーメッセージ例**:
```
Access Denied
```

**原因**: IAMユーザー/ロールに必要な権限がない

**解決方法**:
- IAMポリシーに必要な権限を追加
- GitHub SecretsのAWS認証情報を確認

### 4. リソースの依存関係エラー

**エラーメッセージ例**:
```
Resource dependency failed
```

**原因**: リソース間の依存関係が正しくない

**解決方法**:
- CloudFormationテンプレートの`DependsOn`を確認
- リソースの作成順序を確認

### 5. リソースの制限に達している

**エラーメッセージ例**:
```
Limit exceeded
```

**原因**: AWSアカウントのリソース制限に達している

**解決方法**:
- AWSサポートに連絡して制限を増やす
- 不要なリソースを削除

## スタックの状態と対処方法

### UPDATE_ROLLBACK_COMPLETE

スタックの更新が失敗し、ロールバックが完了した状態。

**対処方法**:
1. エラーメッセージを確認
2. 問題を修正
3. 再度デプロイを実行

### UPDATE_ROLLBACK_FAILED

スタックの更新が失敗し、ロールバックも失敗した状態。

**対処方法**:
1. スタックを手動で削除する必要がある場合がある
2. AWSサポートに連絡する必要がある場合がある

### UPDATE_IN_PROGRESS

スタックの更新が進行中。

**対処方法**:
- 更新が完了するまで待つ
- タイムアウトした場合は、手動で状態を確認

## 修正後の動作

修正後のワークフローでは、以下の情報が自動的に表示されます：

1. **スタックの状態**: 現在のスタックの状態
2. **失敗したリソース**: 更新に失敗したリソースの一覧
3. **エラーイベント**: 最新のエラーイベントの詳細

これにより、エラーの原因を迅速に特定できます。

## 次のステップ

1. GitHub Actionsのログを確認して、エラーの詳細を取得
2. エラーメッセージに基づいて問題を修正
3. 再度デプロイを実行

---

**作成日**: 2026-01-04
**バージョン**: 1.0

