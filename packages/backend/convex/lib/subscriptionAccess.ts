/**
 * Abonnement: `subscriptions.status === "active"` (Stripe webhook).
 *
 * Dev (deling med team uten betaling):
 * - `CONVEX_DEV_BYPASS_SUBSCRIPTION=true` → alle org-ID-er behandles som aktive (KUN dev/staging).
 * - `CONVEX_DEV_ORGANIZATION_IDS` → kommaseparerte org-ID-er (finere kontroll).
 * - `CONVEX_DEV_TEAM_EMAILS` → innloggede brukere med disse e-postene (JWT) får tilgang som aktivt abonnement.
 */

/** Maks agenter per plan. Free og Starter: 1, Pro: 3, Business: 10. */
const PLAN_MAX_AGENTS: Record<string, number> = {
  business: 10,
  pro: 3,
  starter: 1,
  free: 1,
};

/** Maks samtaler per kalendermåned per plan. Matcher priser på landingssiden. */
const PLAN_MAX_CONVERSATIONS_PER_MONTH: Record<string, number> = {
  business: 10000,
  pro: 2000,
  starter: 500,
  free: 50,
};

/**
 * Returnerer maks antall agenter for en org basert på plan og dev-bypass.
 * Dev-team og org-bypass får Business-grense (10).
 */
export function getMaxAgents(
  organizationId: string,
  subscription: { status: string; planKey?: string | null } | null | undefined,
  options?: { userEmail?: string | null },
): number {
  if (isDevSubscriptionBypassEnabled()) return 10;
  if (isDevOrganizationAllowlisted(organizationId)) return 10;
  if (isDevTeamEmailAllowlisted(options?.userEmail)) return 10;

  const isActive = subscription?.status === "active" || subscription?.status === "trialing";
  if (!isActive) return PLAN_MAX_AGENTS.free!;
  return PLAN_MAX_AGENTS[subscription?.planKey ?? "free"] ?? PLAN_MAX_AGENTS.free!;
}

/**
 * Returnerer maks samtaler per kalendermåned for en org. Dev-bypass gir Business-grense.
 */
export function getMaxConversationsPerMonth(
  organizationId: string,
  subscription: { status: string; planKey?: string | null } | null | undefined,
  options?: { userEmail?: string | null },
): number {
  if (isDevSubscriptionBypassEnabled()) return PLAN_MAX_CONVERSATIONS_PER_MONTH.business!;
  if (isDevOrganizationAllowlisted(organizationId)) return PLAN_MAX_CONVERSATIONS_PER_MONTH.business!;
  if (isDevTeamEmailAllowlisted(options?.userEmail)) return PLAN_MAX_CONVERSATIONS_PER_MONTH.business!;

  const isActive = subscription?.status === "active" || subscription?.status === "trialing";
  if (!isActive) return PLAN_MAX_CONVERSATIONS_PER_MONTH.free!;
  return (
    PLAN_MAX_CONVERSATIONS_PER_MONTH[subscription?.planKey ?? "free"] ??
    PLAN_MAX_CONVERSATIONS_PER_MONTH.free!
  );
}

/** Returnerer ms-tidsstempel for første dag i inneværende kalendermåned (UTC). */
export function startOfCurrentMonthUtc(now: number = Date.now()): number {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0);
}

/** Hvilke plan-nøkler som har tilgang til timebestilling i chatten. */
const PLAN_CAN_USE_BOOKINGS: Record<string, boolean> = {
  business: true,
  pro: true,
  starter: true,
  free: false,
};

/** Hvilke plan-nøkler som kan skjule «Powered by Agenci» i widgeten. */
const PLAN_CAN_HIDE_BRANDING: Record<string, boolean> = {
  business: true,
  pro: true,
  starter: false,
  free: false,
};

function resolvePlanKey(
  subscription: { status: string; planKey?: string | null } | null | undefined,
): string {
  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";
  if (!isActive) return "free";
  return subscription?.planKey ?? "free";
}

/** Kan denne organisasjonen bruke timebestilling? Respekterer dev-bypass. */
export function getCanUseBookings(
  organizationId: string,
  subscription: { status: string; planKey?: string | null } | null | undefined,
  options?: { userEmail?: string | null },
): boolean {
  if (isDevSubscriptionBypassEnabled()) return true;
  if (isDevOrganizationAllowlisted(organizationId)) return true;
  if (isDevTeamEmailAllowlisted(options?.userEmail)) return true;
  return PLAN_CAN_USE_BOOKINGS[resolvePlanKey(subscription)] ?? false;
}

/** Kan denne organisasjonen skjule «Powered by Agenci»? Respekterer dev-bypass. */
export function getCanHideBranding(
  organizationId: string,
  subscription: { status: string; planKey?: string | null } | null | undefined,
  options?: { userEmail?: string | null },
): boolean {
  if (isDevSubscriptionBypassEnabled()) return true;
  if (isDevOrganizationAllowlisted(organizationId)) return true;
  if (isDevTeamEmailAllowlisted(options?.userEmail)) return true;
  return PLAN_CAN_HIDE_BRANDING[resolvePlanKey(subscription)] ?? false;
}

function parseEmailList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.includes("@"));
}

function isDevTeamEmailAllowlisted(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  const list = parseEmailList(process.env.CONVEX_DEV_TEAM_EMAILS);
  return list.includes(email.trim().toLowerCase());
}

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
  options?: { userEmail?: string | null },
): boolean {
  if (subscription?.status === "active" || subscription?.status === "trialing") {
    return true;
  }
  if (isDevSubscriptionBypassEnabled()) {
    return true;
  }
  if (isDevOrganizationAllowlisted(organizationId)) {
    return true;
  }
  if (isDevTeamEmailAllowlisted(options?.userEmail)) {
    return true;
  }
  return false;
}
