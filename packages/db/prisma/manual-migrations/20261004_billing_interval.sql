-- Manual migration: monthly or yearly billing per subscription.
-- Apply once per environment:
--   psql "$DATABASE_URL" -f packages/db/prisma/manual-migrations/20261004_billing_interval.sql
-- Idempotent. Existing rows stay monthly.

BEGIN;

ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "interval" TEXT NOT NULL DEFAULT 'month';
ALTER TABLE "billing_payments" ADD COLUMN IF NOT EXISTS "interval" TEXT NOT NULL DEFAULT 'month';

COMMIT;
