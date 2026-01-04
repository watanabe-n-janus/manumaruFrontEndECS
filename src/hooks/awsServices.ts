import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";

// S3クライアントの設定
const s3Client = new S3Client({
  region: process.env.REACT_APP_AWS_REGION || "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "",
  },
  // チェックサムを無効化
  requestChecksumCalculation: "WHEN_REQUIRED",
});

// DynamoDBクライアントの設定
const dynamoDbClient = new DynamoDBClient({
  region: "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "",
  },
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
