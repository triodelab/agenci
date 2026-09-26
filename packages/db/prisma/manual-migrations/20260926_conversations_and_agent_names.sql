-- Manual migration (this repo has no Prisma migrations folder, and
-- `prisma db push` must NOT be used: it would drop Mastra's own tables
-- (mastra_*) and the embeddings vector index).
--
-- Apply once per environment:
--   psql "$DATABASE_URL" -f packages/db/prisma/manual-migrations/20260926_conversations_and_agent_names.sql
-- then run the backfill:
--   bun apps/server/scripts/backfill-conversations.ts
--
-- Idempotent: safe to run again.

BEGIN;

-- Widget customization (added 2026-09-24).
ALTER TABLE "agent_widget_brands" ADD COLUMN IF NOT EXISTS "settings" JSONB;

-- Agent names are unique per organization, not across all customers.
DROP INDEX IF EXISTS "agents_name_key";
CREATE UNIQUE INDEX IF NOT EXISTS "agents_organizationId_name_key" ON "agents"("organizationId", "name");

-- Conversation index (messages stay in the Mastra thread with the same id).
DO $$ BEGIN
  CREATE TYPE "ConversationStatus" AS ENUM ('unresolved', 'escalated', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "conversations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "contactSessionId" TEXT NOT NULL,
    "status" "ConversationStatus" NOT NULL DEFAULT 'unresolved',
    "firstMessage" TEXT,
    "lastMessage" TEXT,
    "lastMessageRole" TEXT,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "conversations_organizationId_agentId_lastMessageAt_idx" ON "conversations"("organizationId", "agentId", "lastMessageAt");
CREATE INDEX IF NOT EXISTS "conversations_contactSessionId_idx" ON "conversations"("contactSessionId");

DO $$ BEGIN
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_contactSessionId_fkey" FOREIGN KEY ("contactSessionId") REFERENCES "contact_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
