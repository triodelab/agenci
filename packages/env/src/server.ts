import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    FIRECRAWL_API_KEY: z.string().min(1),
    /**
     * Redis (docker compose service `redis-worker` on :6379).
     * Example: redis://localhost:6379
     */
    REDIS_URL: z.url().default("redis://localhost:6379"),
    BETTER_AUTH_SECRET: z.string().min(32),
    /** Public base URL of the auth API (e.g. http://localhost:3003). */
    BETTER_AUTH_URL: z.url(),
    /** Primary browser origin (apps/web or apps/dashboard). */
    CORS_ORIGIN: z.url(),
    /**
     * Solid dashboard origin (apps/dashboard) while web still exists.
     * Added to Better Auth trustedOrigins + Hono CORS allow-list.
     */
    DASHBOARD_ORIGIN: z.url().optional(),
    /**
     * Optional widget origin (apps/widget).
     * Added to Better Auth `trustedOrigins` when set.
     */
    WIDGET_ORIGIN: z.url().optional(),
    LLAMA_API_KEY: z.string().min(1),
    /**
     * Llama Cloud API host. Keys are region-specific.
     * EU: https://api.cloud.eu.llamaindex.ai
     * NA: https://api.cloud.llamaindex.ai
     */
    LLAMA_CLOUD_BASE_URL: z.url().optional(),
    INNGEST_DEV: z.enum(["0", "1"]).optional(),
    /**
     * Inngest Dev Server URL when running via docker compose (`inngest` on :8288).
     * Example: http://localhost:8288
     */
    INNGEST_BASE_URL: z.url().optional(),
    PORT: z.string().transform((val) => parseInt(val)).pipe(z.number().min(1).max(65535)),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    /**
     * MinIO (docker compose service `minio` on :9000, console :9001).
     */
    MINIO_ENDPOINT: z.url().default("http://localhost:9000"),
    MINIO_ACCESS_KEY: z.string().min(1).default("agenci"),
    MINIO_SECRET_KEY: z.string().min(1).default("agenci_dev_secret"),
    MINIO_REGION: z.string().min(1).default("us-east-1"),
    MINIO_BUCKET: z.string().min(1).default("agenci-bucket"),
    /**
     * OpenAI API key for Mastra agents (`openai/gpt-4o-mini`).
     * Optional at boot so non-AI routes work; required when generating replies.
     */
    OPENAI_API_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
