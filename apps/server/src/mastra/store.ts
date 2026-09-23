import { PostgresStore } from "@mastra/pg";
import { Memory } from "@mastra/memory";
import { env } from "@agenci/env/server";

/** Model used by the customer agent and by OM's Observer/Reflector. */
export const CUSTOMER_AGENT_MODEL = "openai/gpt-4o-mini";

/**
 * Conversation memory for customer-service agents.
 * Observational Memory only supports pg/libsql/mysql/mongodb/convex/oracledb.
 * @see https://mastra.ai/docs/memory/observational-memory
 */
export const memoryStore = new PostgresStore({
  id: "customer-agent-memory",
  connectionString: env.DATABASE_URL,
});

/**
 * Shared across every tenant agent — threads are isolated by `thread`/`resource`
 * at call time, so one store and one config is enough.
 */
export const customerAgentMemory = new Memory({
  storage: memoryStore,
  options: {
    observationalMemory: {
      model: CUSTOMER_AGENT_MODEL,
      scope: "thread",
    },
  },
});
