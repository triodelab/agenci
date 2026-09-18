import { S3Client } from "bun";
import { env } from "@agenci/env/server";

const credentials = {
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_REGION,
  endpoint: env.AWS_ENDPOINT_URL_S3,
};

export const s3Client = new S3Client({
  ...credentials,
  bucket: env.AWS_BUCKET_NAME,
});

export const markdownS3Client = new S3Client({
  ...credentials,
  bucket: env.AWS_MARKDOWN_BUCKET,
});

export async function writeFile(
  key: string,
  body: string | ArrayBuffer | Uint8Array | Blob | File | Response,
  type?: string,
) {
  await s3Client.write(key, body, type ? { type } : undefined);
  return key;
}

export async function readFileBytes(key: string) {
  return s3Client.file(key).bytes();
}

export async function fileExists(key: string) {
  return s3Client.file(key).exists();
}

export async function deleteFile(key: string) {
  await s3Client.delete(key);
}

export function presignFile(key: string, expiresIn = 3600) {
  return s3Client.presign(key, { expiresIn });
}

export async function uploadMarkdown(key: string, markdown: string) {
  await markdownS3Client.write(key, markdown, {
    type: "text/markdown; charset=utf-8",
  });
  return key;
}

export async function readMarkdown(key: string) {
  return markdownS3Client.file(key).text();
}
