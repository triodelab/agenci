import { PgVector } from "@mastra/pg";
import { env } from "@agenci/env/server";

/**
 * Knowledge-base vectors (ingested documents + webpages).
 * Shared module so tools can query without importing the Mastra instance.
 */
export const pgVector = new PgVector({
  id: "pg-vector",
  connectionString: env.DATABASE_URL,
});
