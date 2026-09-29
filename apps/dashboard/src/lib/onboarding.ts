/**
 * First-time onboarding: an org without agents is sent to create its first
 * one. "Hopp over" remembers the choice per org in this browser, so the user
 * isn't pushed back into the flow every time they open the agent list.
 */

const key = (orgSlug: string) => `agenci:onboarding-skipped:${orgSlug}`;

export function skipOnboarding(orgSlug: string) {
  try {
    localStorage.setItem(key(orgSlug), "1");
  } catch {
    // Storage blocked: they'll just see the flow again next time.
  }
}

export function hasSkippedOnboarding(orgSlug: string) {
  try {
    return localStorage.getItem(key(orgSlug)) === "1";
  } catch {
    return false;
  }
}
