/**
 * Premium / Pro-tilgang utenom ekte abonnement:
 *
 * 1) `NEXT_PUBLIC_DEV_BYPASS_PREMIUM=true` — åpner ProPlanGate for alle (dashboard).
 * 2) `NEXT_PUBLIC_TEAM_DEVELOPER_EMAILS` — Pro i UI for disse e-postene uten global bypass.
 */

export const isDevBypassPremium =
  process.env.NEXT_PUBLIC_DEV_BYPASS_PREMIUM === "true";

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

/** Sant når brukeren skal behandles som Pro i UI (ProPlanGate). */
export function hasUiPremiumBypass(email: string | null | undefined): boolean {
  return isDevBypassPremium || isTeamDeveloperEmail(email);
}
