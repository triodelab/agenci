/**
 * Set `NEXT_PUBLIC_DEV_BYPASS_PREMIUM=true` in `apps/web/.env.local` (or `.env`)
 * to skip Pro plan gating and avoid Clerk `<PricingTable />` when billing is disabled.
 */
export const isDevBypassPremium =
  process.env.NEXT_PUBLIC_DEV_BYPASS_PREMIUM === "true";
