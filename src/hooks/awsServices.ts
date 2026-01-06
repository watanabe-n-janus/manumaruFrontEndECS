import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";

// AWS認証情報の取得と検証
const getAwsCredentials = () => {
  const accessKeyId = process.env.REACT_APP_AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;
  
  // デバッグログ（本番環境では削除推奨）
  if (process.env.NODE_ENV === 'development') {
    console.log('🔑 AWS認証情報の確認:');
    console.log('  - Access Key ID:', accessKeyId ? `${accessKeyId.substring(0, 4)}...` : '未設定');
    console.log('  - Secret Access Key:', secretAccessKey ? '設定済み' : '未設定');
    console.log('  - Region:', process.env.REACT_APP_AWS_REGION || 'ap-northeast-1');
  }
  
  // 認証情報が設定されていない場合のエラーハンドリング
  if (!accessKeyId || !secretAccessKey) {
    const errorMsg = 'AWS認証情報が設定されていません。.env.localファイルにREACT_APP_AWS_ACCESS_KEY_IDとREACT_APP_AWS_SECRET_ACCESS_KEYを設定してください。';
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }
  
  return {
    accessKeyId,
    secretAccessKey,
  };
};

// S3クライアントの設定
const s3Client = new S3Client({
  region: process.env.REACT_APP_AWS_REGION || "ap-northeast-1",
  credentials: getAwsCredentials(),
  // チェックサムを無効化
  requestChecksumCalculation: "WHEN_REQUIRED",
});

// DynamoDBクライアントの設定
const dynamoDbClient = new DynamoDBClient({
  region: "ap-northeast-1",
  credentials: getAwsCredentials(),
});

const dynamoDB = DynamoDBDocumentClient.from(dynamoDbClient);

// S3バケットからプリサインドURLを取得する関数
const getPresignedUrl = async (
  bucketName: string,
  key: string
): Promise<string | null> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error("Error getting presigned URL from S3:", error);
    return null;
  }
};

// フィードバックデータをDynamoDBに保存する関数
interface FeedbackData {
  rating: number;
  timeSaved: string;
  comment: string;
  timestamp: string;
  userId?: string;
}

const saveFeedbackToDynamoDB = async (
  feedbackData: FeedbackData
): Promise<void> => {
  // 専用のFeedbackテーブルを使用
  const feedbackTableName = process.env.REACT_APP_DYNAMODB_FEEDBACK_TABLE_NAME || 'gemini-manual-stage-Feedback';

  const command = new PutCommand({
    TableName: feedbackTableName,
    Item: {
      FeedbackId: `feedback_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      UserId: feedbackData.userId || 'anonymous',
      Timestamp: feedbackData.timestamp,
      rating: feedbackData.rating,
      timeSaved: feedbackData.timeSaved,
      comment: feedbackData.comment,
      createdAt: new Date().toISOString(),
    },
  });

  try {
    await dynamoDB.send(command);
    console.log('Feedback saved successfully to Feedback table');
  } catch (error) {
    console.error('Error saving feedback to DynamoDB:', error);
    throw error;
  }
};

export { 
  s3Client, 
  getPresignedUrl, 
  dynamoDB, 
  saveFeedbackToDynamoDB, 
  Upload, 
  ListObjectsV2Command, 
  PutObjectCommand, 
  DeleteObjectCommand, 
  GetObjectCommand, 
  GetCommand 
};
