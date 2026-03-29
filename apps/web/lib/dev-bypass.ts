/**
 * Premium / Pro-tilgang utenom ekte Clerk-abonnement:
 *
 * 1) `NEXT_PUBLIC_DEV_BYPASS_PREMIUM=true` — åpner ProPlanGate for alle (dashboard). Påvirker
 *    **ikke** /billing: der vises alltid Clerk Billing-komponenter med mindre du eksplisitt setter
 *    `NEXT_PUBLIC_HIDE_CLERK_BILLING_UI=true`.
 * 2) `NEXT_PUBLIC_TEAM_DEVELOPER_EMAILS` — Pro i UI uten global bypass; Convex via
 *    `CONVEX_DEV_TEAM_EMAILS` eller org-/subscription-bypass.
 * 3) `NEXT_PUBLIC_HIDE_CLERK_BILLING_UI=true` — valgfri: skjul ekte Clerk på /billing med
 *    dev-plassholder for brukere som ikke står i team-listen (f.eks. delt miljø uten Clerk Billing).
 */

export const isDevBypassPremium =
  process.env.NEXT_PUBLIC_DEV_BYPASS_PREMIUM === "true";

/** Når satt: vis plassholder på /billing for ikke-team (unntatt team-e-post). Standard er av. */
export function isHideClerkBillingUi(): boolean {
  return process.env.NEXT_PUBLIC_HIDE_CLERK_BILLING_UI === "true";
}

function parseEmailList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.includes("@"));
}

/** E-poster som skal ha Pro-funksjoner i appen uten å stole på global env-bypass. */
export function getTeamDeveloperEmails(): string[] {
  return parseEmailList(process.env.NEXT_PUBLIC_TEAM_DEVELOPER_EMAILS);
}

export function isTeamDeveloperEmail(
  email: string | null | undefined,
): boolean {
  if (!email?.trim()) return false;
  const normalized = email.trim().toLowerCase();
  return getTeamDeveloperEmails().includes(normalized);
}

/** Sant når brukeren skal behandles som Pro i UI (Protect / ProPlanGate). */
export function hasUiPremiumBypass(email: string | null | undefined): boolean {
  return isDevBypassPremium || isTeamDeveloperEmail(email);
}

export type BillingUiMode = "clerk" | "placeholder" | "loading";

/**
 * /billing: som standard alltid ekte Clerk (OrganizationProfile, PricingTable).
 * Med `NEXT_PUBLIC_HIDE_CLERK_BILLING_UI=true`: plassholder for ikke-team; team-e-post ser Clerk.
 */
export function getBillingUiMode(
  isLoaded: boolean,
  email: string | null | undefined,
): BillingUiMode {
  if (!isHideClerkBillingUi()) return "clerk";
  if (!isLoaded) return "loading";
  if (isTeamDeveloperEmail(email)) return "clerk";
  return "placeholder";
}
