import { S3Client } from "bun";
import { env } from "@agenci/env/server";

/** Uploaded source files (PDF, Office, media) in MinIO. */
export const s3Client = new S3Client({
  accessKeyId: env.MINIO_ACCESS_KEY,
  secretAccessKey: env.MINIO_SECRET_KEY,
  region: env.MINIO_REGION,
  endpoint: env.MINIO_ENDPOINT,
  bucket: env.MINIO_BUCKET,
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
