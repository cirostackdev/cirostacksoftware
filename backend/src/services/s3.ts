import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { secrets } from '@/config/secrets.js';

function getClient(): S3Client {
  const { awsAccessKey, awsSecretKey, awsRegion } = secrets();
  return new S3Client({
    region: awsRegion ?? 'us-east-1',
    credentials: { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey },
  });
}

export async function getUploadUrl(key: string, contentType: string): Promise<string> {
  const client = getClient();
  const command = new PutObjectCommand({
    Bucket: secrets().awsS3Bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}

export async function getDownloadUrl(key: string, expiresInSecs = 300): Promise<string> {
  const client = getClient();
  const command = new GetObjectCommand({
    Bucket: secrets().awsS3Bucket,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSecs });
}

export function s3KeyForCertificate(userId: string, courseId: string): string {
  return `certificates/${userId}/${courseId}.pdf`;
}

export function s3KeyForCapstoneScreenshot(userId: string, courseId: string): string {
  return `capstone/${userId}/${courseId}.jpg`;
}
