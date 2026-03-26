/**
 * Abonnement: `subscriptions.status === "active"` (Clerk Billing / webhook).
 *
 * Dev (deling med team uten betaling):
 * - `CONVEX_DEV_BYPASS_SUBSCRIPTION=true` → alle org-ID-er behandles som aktive (KUN dev/staging).
 * - `CONVEX_DEV_ORGANIZATION_IDS` → kommaseparerte org-ID-er (finere kontroll).
 */
function isDevSubscriptionBypassEnabled(): boolean {
  const v = process.env.CONVEX_DEV_BYPASS_SUBSCRIPTION?.trim();
  return v === "true" || v === "1";
}

export function isDevOrganizationAllowlisted(organizationId: string): boolean {
  const raw = process.env.CONVEX_DEV_ORGANIZATION_IDS?.trim();
  if (!raw) {
    return false;
  }
  const ids = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return ids.includes(organizationId);
}

export function hasActiveSubscriptionAccess(
  organizationId: string,
  subscription: { status: string } | null | undefined,
): boolean {
  if (subscription?.status === "active") {
    return true;
  }
  if (isDevSubscriptionBypassEnabled()) {
    return true;
  }
  return isDevOrganizationAllowlisted(organizationId);
}
