# serverless-chat-app

### 概要

API GatewayのWebSocket APIを用いたチャットアプリケーションです。

複数のブラウザで同じURLにアクセスすることで、アクセスした人同士でチャットを送り合うことができます。

また、パスパラメータがチャットルームを識別するIDとなっており、 `https://sample.cloudfront.net/{room_id}` の`{room_id}`部分を変えることで、異なる部屋を作成することができます。


### 技術スタック

#### インフラ
- AWS CDK 
- AWS Cloudfront
- AWS S3
- AWS Lambda
- AWS API Gateway
- AWS DynamoDB

#### アプリケーション(バックエンド)

- Node.js
- TypeScript

#### アプリケーション(フロントエンド)

- React