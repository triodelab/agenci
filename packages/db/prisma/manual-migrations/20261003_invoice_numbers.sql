-- Manual migration: sequential invoice numbers on billing payments.
-- Apply once per environment:
--   psql "$DATABASE_URL" -f packages/db/prisma/manual-migrations/20261003_invoice_numbers.sql
-- Idempotent. Existing rows get numbers in creation order.

BEGIN;

ALTER TABLE "billing_payments" ADD COLUMN IF NOT EXISTS "invoiceNumber" SERIAL;
CREATE UNIQUE INDEX IF NOT EXISTS "billing_payments_invoiceNumber_key" ON "billing_payments"("invoiceNumber");
-- Net amount and VAT as charged (amount stays the gross total).
ALTER TABLE "billing_payments" ADD COLUMN IF NOT EXISTS "netAmount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "billing_payments" ADD COLUMN IF NOT EXISTS "vatAmount" INTEGER NOT NULL DEFAULT 0;

COMMIT;
