-- Manual migration: billing (Nexi Checkout subscriptions) and AI usage.
-- `prisma db push` must NOT be used (see 20260926_conversations_and_agent_names.sql).
--
-- Apply once per environment:
--   psql "$DATABASE_URL" -f packages/db/prisma/manual-migrations/20261002_billing.sql
--
-- Idempotent: safe to run again. Adds tables only; nothing existing changes.

BEGIN;

CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "nexiSubscriptionId" TEXT,
    "nexiPaymentId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "pastDueSince" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId")
        REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_organizationId_key" ON "subscriptions"("organizationId");
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_nexiSubscriptionId_key" ON "subscriptions"("nexiSubscriptionId");

CREATE TABLE IF NOT EXISTS "billing_payments" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "nexiPaymentId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NOK',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "billing_payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "billing_payments_organizationId_fkey" FOREIGN KEY ("organizationId")
        REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "billing_payments_nexiPaymentId_key" ON "billing_payments"("nexiPaymentId");
CREATE INDEX IF NOT EXISTS "billing_payments_organizationId_createdAt_idx" ON "billing_payments"("organizationId", "createdAt");

CREATE TABLE IF NOT EXISTS "usage_monthly" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "byModel" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "usage_monthly_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "usage_monthly_organizationId_fkey" FOREIGN KEY ("organizationId")
        REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "usage_monthly_organizationId_period_key" ON "usage_monthly"("organizationId", "period");

CREATE TABLE IF NOT EXISTS "billing_accounts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "orgNumber" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "trialStartedAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "billing_accounts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "billing_accounts_organizationId_fkey" FOREIGN KEY ("organizationId")
        REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "billing_accounts_organizationId_key" ON "billing_accounts"("organizationId");
CREATE UNIQUE INDEX IF NOT EXISTS "billing_accounts_orgNumber_key" ON "billing_accounts"("orgNumber");

-- Not linked to "organization" on purpose: survives a deleted organization,
-- so each org number gets the trial once.
CREATE TABLE IF NOT EXISTS "trial_claims" (
    "orgNumber" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "trial_claims_pkey" PRIMARY KEY ("orgNumber")
);

COMMIT;
