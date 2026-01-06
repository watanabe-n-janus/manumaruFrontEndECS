# AmplifyとReactのインストールおよび使用方法

## Amplifyの説明

AWS Amplifyは、フロントエンドウェブおよびモバイルアプリケーションの開発を簡素化するためのツールチェーンです。Amplifyを使用すると、認証、ストレージ、API、データベースなどのバックエンドサービスを簡単に追加および管理できます。

## Amplifyのインストール方法

### 前提条件

- Node.jsがインストールされていること
- npmまたはyarnがインストールされていること

### インストール手順

以下のコマンドを実行して、Amplify CLIをインストールします。

```bash
npm install -g @aws-amplify/cli


## React アプリケーション開発 & AWS Amplify 導入マニュアル

本マニュアルでは、React アプリケーションの開発から AWS Amplify を用いた認証機能の追加、ホスティングまでの一連の手順を解説します。

### 1. React アプリケーションの作成 (Windows & Mac)

#### 前提条件

* Node.js と npm (または yarn) がインストールされていること

#### 手順

1.  **ターミナル (またはコマンドプロンプト) を開く**

2.  **プロジェクトを作成するディレクトリに移動**

3.  **create-react-app を使用して React アプリケーションを作成**

```bash
npx create-react-app my-amplify-app
# または
yarn create react-app my-amplify-app
```

`my-amplify-app` はプロジェクト名です。任意の名前に変更可能です。

4.  **作成されたプロジェクトディレクトリに移動**

```bash
cd my-amplify-app
```

5.  **開発サーバーを起動**

```bash
npm start
# または
yarn start
```

ブラウザが起動し、React アプリケーションがデフォルトのページが表示されます。

### 2. AWS Amplify の導入

#### 前提条件

* AWS アカウントが作成済みであること
* Amplify CLI がインストール済みであること (未インストールの場合は下記コマンドを実行)

```bash
npm install -g @aws-amplify/cli
# または
yarn global add @aws-amplify/cli
```

# 環境変数の設定

`.env` ファイルに環境変数を追記する方法を説明します。

React アプリケーションで環境変数を扱う場合、`REACT_APP_` というプレフィックスが付いた変数のみが参照可能です。  `.env` ファイルにこれらの変数を定義することで、アプリケーション内で `process.env.REACT_APP_変数名` としてアクセスできるようになります。

**手順:**

1.  **`.env` ファイルの作成:**
    プロジェクトのルートディレクトリに `.env` という名前のファイルを作成します。もし既に存在する場合は、そのファイルに追記します。  このファイルはGitで管理しないように `.gitignore` に追加することを推奨します。

2.  **.env ファイルへの環境変数の記述:**
    作成した `.env` ファイルに、以下の形式で環境変数を記述します。

```
REACT_APP_AWS_REGION=xxxxxx
REACT_APP_AWS_ACCESS_KEY_ID=xxxxxx
REACT_APP_AWS_SECRET_ACCESS_KEY=xxxxxx
REACT_APP_AWS_BUCKET_NAME=xxxxxxxxx
REACT_APP_DYNAMODB_TABLE_NAME=xxxxxxxxx
REACT_APP_AWS_API_BASE_ENDPOINT=xxxxxxxxxxxxx
REACT_APP_AWS_API_KEY=xxxxxx
```

    *   `REACT_APP_` プレフィックスを必ず付けること
    *   `=` の前後にスペースは不要
    *   値にスペースが含まれる場合は、クォーテーションで囲む (`REACT_APP_MY_VAR="this is a value"`)
    *   コメントアウトする場合は `#` を行頭に記述

 * **REACT_APP_AWS_REGION:** AWS サービスがデプロイされているリージョンを指定します。例えば、ap-northeast-1（東京リージョン）

* **REACT_APP_AWS_ACCESS_KEY_ID:** AWS アカウントのアクセスキー ID を指定します。このキーは、AWS サービスへのアクセス権限を持つため、機密情報として厳重に管理する必要があります。今回の場合は、dynamoDBとs3へのアクセス権限を持つIAMのものを設定します

* **REACT_APP_AWS_SECRET_ACCESS_KEY:** AWS アカウントのシークレットアクセスキーを指定します。

* **REACT_APP_AWS_BUCKET_NAME:** AWS S3（Simple Storage Service）のバケット名を指定します。Backend側アプリで作成したバケット名を入力します
   通常は`{BackendStackName}-bucket-manual` で大丈夫です（S3のマネコンまたはbackendアプリのoutputをみれば確認できます）。
  
* **REACT_APP_DYNAMODB_TABLE_NAME:** AWS DynamoDB（NoSQL データベース）のテーブル名を指定します。Backend側アプリで作成したテーブル名を入力します
  通常は`{BackendStackName}-FileInfo` で大丈夫です（DynamoDBのマネコンまたはbackendアプリのoutputをみれば確認できます）。
  
* **REACT_APP_AWS_API_BASE_ENDPOINT:** AWS API Gateway のエンドポイントを指定します。このエンドポイントは、アプリケーションがバックエンドの API と通信するために使用されます。Backend側アプリで作成したAPI ENDPOINTを入力します。（API Gatewayのマネコンまたはbackendアプリのoutputをみれば確認できます）。

* **REACT_APP_AWS_API_KEY:** AWS API Gateway の API キーを指定します。このキーは、API へのアクセスを認証するために使用されます。Backend側アプリで作成したAPI KEYを入力します.
   （API Gatewayのマネコンで確認できます。秘密情報なので、backendアプリのoutputには出力されません）。

# Amplifyデプロイ手順

0. **amplifyを完全初期化して始めたい場合（別環境を立ち上げたい場合）**

```bash
rm -rf amplify
```
amplifyの設定を消去

1.  **Amplify プロジェクトの初期化**

```bash
amplify init
```
色々聞かれるけどデフォルト設定で大丈夫

*   プロジェクト名、環境名、エディタ、フレームワーク、言語などを選択 (デフォルト設定で問題ありません)

2.  **認証機能の追加**

```bash
amplify add auth
```

*   サインイン方法 (Username or Email)、サインアップ方法 (Email)、その他設定を選択 (デフォルト設定で問題ありません)

3.  **ホスティング環境の追加**

```bash
amplify add hosting
```

*   cloudFront + S3を選択

4.  **Amplify プロジェクトのデプロイ**

```bash
amplify push
```

*   AWS リソースが作成・設定されます。この処理には時間がかかる場合があります。

### 3. React アプリケーションと Amplify の連携


1.  **必要な ライブラリのインストール**

```bash
npm install 
# または
yarn install
```

2.  **ローカルでの動作テスト**

```bash
npm start 
# または
yarn start
```

ローカルホスト:3000 にアクセスして動作検証
問題がなければ 

```bash
yarn build #デプロイ用のbuild
amplify publish
```

で公開。



`amplify publish` でホスティングされた **Amplify アプリに WAF をつけて IP 制限**したい場合、基本的には Amplify が自動で作成する **CloudFront + S3** 構成に **AWS WAF（Web Application Firewall）をアタッチ**する必要があります。

---

## ✅ 全体構成のイメージ

Amplify のホスティング構成（S3 + CloudFront）
↓
**CloudFront ディストリビューションに WAF をアタッチ**
↓
**IP 制限ルールを作成（allow/deny）**

---

## ✅ 手順（CloudFront + WAF + IP制限）

### ① Amplify を `amplify add hosting` → `amplify publish` で一度公開

この操作で CloudFront と S3 が自動作成されます。
公開後に AWS マネジメントコンソール上で CloudFront のディストリビューションIDを確認します。

---

### ② AWS WAF を作成し、IP 制限ルールを追加

#### 1. WAF の作成（Web ACL）

AWS マネジメントコンソール → WAF → 「Web ACL の作成」

* 名前例: `amplify-ip-whitelist`
* リージョン: `Global (CloudFront用)`
* リソースタイプ: CloudFront distributions
* IPSet を使って許可する IP を設定

#### 2. ルール例（許可する IP アドレス範囲）

* IPSet 作成 → 例: `AllowOfficeIP`

  * 形式: IPv4
  * IP アドレス: `203.0.113.0/24` など
* ルール作成 → 名前: `AllowOnlySpecificIPs`

  * 条件: `IF NOT IP is in AllowOfficeIP`
  * アクション: Block

---

### ③ WAF を CloudFront ディストリビューションにアタッチ

1. CloudFront コンソールに移動
2. 対象ディストリビューションを選択
3. `Web ACL (WAF)` の項目で「既存の ACL をアタッチ」
4. 作成した `amplify-ip-whitelist` を選択して保存


# Cognitoユーザープールのパスワードポリシー強化手順

Amplify CLIとAWSマネジメントコンソールを併用して、Cognitoユーザープールのパスワードポリシーを以下のように強化できます。

- パスワードの最小文字数：10文字
- 1文字以上のアルファベット大文字(A-Z)を必要とする：有効
- 1文字以上のアルファベット小文字(a-z)を必要とする：有効
- 少なくとも1つの数字を必要とする：有効
- 少なくとも1つの英数字以外の文字(! @ # $ % ^ & * ( ) _ + - = [ ] { } | '))を必要とする：有効
- パスワードの有効期限を有効にする：90日
- ユーザーにパスワードの変更を許可する：有効
- パスワードの再利用を禁止する：有効
- 記憶するパスワードの数：3
- パスワードの有効期限には管理者のリセットが必要：有効

## 1. Amplify CLIでの設定

```bash
amplify auth update
```

- 「Apply default configuration with Social Provider (Federation)」を選択
- 「Do you want to configure advanced settings?」で「Yes」を選択
- 「Password protection settings」で以下のように設定
    - パスワードの最小文字数：10
    - 大文字必須：Yes
    - 小文字必須：Yes
    - 数字必須：Yes
    - 記号必須：Yes

その後、
```bash
amplify push
```
で反映します。

## 2. AWSマネジメントコンソールでの追加設定

Amplify CLIで設定できない以下の項目は、AWSコンソールでCognito User Poolを開き、手動で設定してください。

- パスワードの有効期限（例：90日）
- パスワードの再利用禁止（記憶するパスワード数：3）
- パスワードの有効期限切れ時の管理者リセット
- パスワード変更の許可

### 設定手順
1. AWSマネジメントコンソールでCognitoサービスを開く
2. 対象のUser Poolを選択
3. 「ポリシー」や「詳細設定」タブで上記項目を設定
=======
# Amplify環境の取得（amplify pull）

既存のAmplify環境をローカルに取得したい場合は、以下の手順で `amplify pull` を実行してください。

例えば、環境名が `d3931ec1agymob` の場合、以下のコマンドを実行します。

```bash
amplify pull --appId d3931ec1agymob 
```

---

# Amplifyでdev環境にデプロイする手順

以下の手順で、Amplifyのdev環境にデプロイできます。

1. **dev環境の設定をローカルに反映（pull）**

   ```bash
   amplify pull --appId d3931ec1agymob --envName dev
   ```

2. **依存パッケージのインストール**

   ```bash
   npm install
   # または
   yarn install
   ```

3. **dev環境にデプロイ（push）**

   ```bash
   amplify push --envName dev
   ```

   ※ 途中で質問が出た場合は、基本的にデフォルトで問題ありません。

4. **（ホスティングしている場合）公開（publish）**

   ```bash
   amplify publish --envName dev
   ```

## 📚 ドキュメント

プロジェクトのドキュメントは [`docs/`](./docs/) フォルダに整理されています。

### セットアップガイド
- [Cognito設定](./docs/setup/cognito-setup.md) - AWS Cognitoの手動セットアップ
- [CloudFront URLをCognitoに設定](./docs/setup/cloudfront-cognito-setup.md) - デプロイ後のCognito設定
- [デプロイメントガイド](./docs/setup/deployment.md) - GitHub Actionsを使用したデプロイ
- [CloudFormationデプロイメント](./docs/setup/cloudformation.md) - CloudFormationスタックのデプロイ
- [GitHub Environment設定](./docs/setup/github-environment-setup.md) - GitHub Environment Secretsの設定
- [環境変数の説明](./docs/setup/environment-variables.md) - 環境変数の扱い方

### トラブルシューティング
- [CloudFormationエラー](./docs/troubleshooting/cloudformation-errors.md) - CloudFormationデプロイ時のエラー対処
- [リダイレクトURL問題](./docs/troubleshooting/redirect-url-fix.md) - ログイン後のリダイレクト問題

詳細は [docs/README.md](./docs/README.md) を参照してください。

## 🎯 iframe埋め込み対応（EW-AI連携）

マニュまるはEW-AI内のiframeで動作します。SSO認証とセキュリティ設定については以下を参照：

### � EW-AI開発者向けクイックスタート

**[⭐ QUICK_START_EW-AI.md](./QUICK_START_EW-AI.md) ← まずはここ！（5分で完了）**

コピペだけで実装できます。GitHub Copilotがあればさらに簡単！

### 📖 詳細ドキュメント

| ドキュメント | 対象 | 内容 |
|---|---|---|
| **[QUICK_START_EW-AI.md](./QUICK_START_EW-AI.md)** | **EW-AI開発者** | **5分で実装！コピペでOK** |
| [EW-AI側実装ガイド.md](./EW-AI側実装ガイド.md) | EW-AI開発者 | 詳細な実装ガイド＆トラブルシューティング |
| [SSO_IFRAME_IMPLEMENTATION.md](./SSO_IFRAME_IMPLEMENTATION.md) | マニュまる開発者 | マニュまる側のSSO認証実装（実装済み） |
| [CLOUDFRONT_IFRAME_SETUP.md](./CLOUDFRONT_IFRAME_SETUP.md) | インフラ担当 | CloudFrontのCSPヘッダー設定 |
| [iframe-message-specification.md](./iframe-message-specification.md) | 両方 | postMessage仕様書 |

### 🔧 実装必要箇所

| 側 | 実装内容 | ステータス | ドキュメント |
|---|---|---|---|
| **マニュまる** | トークン受信・保存 | ✅ 完了 | - |
| **EW-AI** | トークン送信 | ⚠️ 要実装 | [クイックスタート](./QUICK_START_EW-AI.md) |
| **CloudFront** | CSPヘッダー設定 | ⚠️ 要デプロイ | [手順](./CLOUDFRONT_IFRAME_SETUP.md) |

### 📦 マニュまる側のデプロイ

CloudFrontの設定変更を反映するには：
```bash
amplify push  # 設定を反映
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"  # キャッシュクリア
```


