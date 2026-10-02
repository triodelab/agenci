-- Manual migration: two-factor login (Better Auth twoFactor plugin) and the
-- admin audit log. Apply once per environment:
--   psql "$DATABASE_URL" -f packages/db/prisma/manual-migrations/20261005_two_factor_audit.sql
-- Idempotent.

BEGIN;

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS "twoFactor" (
  "id" TEXT PRIMARY KEY,
  "secret" TEXT NOT NULL,
  "backupCodes" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "verified" BOOLEAN DEFAULT true,
  "failedVerificationCount" INTEGER DEFAULT 0,
  "lockedUntil" TIMESTAMP(3)
);
ALTER TABLE "twoFactor" DROP CONSTRAINT IF EXISTS "twoFactor_userId_fkey";
ALTER TABLE "twoFactor" ADD CONSTRAINT "twoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "twoFactor_secret_idx" ON "twoFactor"("secret");
CREATE INDEX IF NOT EXISTS "twoFactor_userId_idx" ON "twoFactor"("userId");

-- Everything done in the admin area: who, what, on whom, when.
CREATE TABLE IF NOT EXISTS "admin_audit_log" (
  "id" TEXT PRIMARY KEY,
  "actorUserId" TEXT NOT NULL,
  "actorEmail" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "target" TEXT,
  "details" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "admin_audit_log_createdAt_idx" ON "admin_audit_log"("createdAt");

COMMIT;
