/**
 * Task 1.3 — Session helpers for private HTTP routes.
 *
 * Mirrors Convex `getOrgIdOrNull` / Clerk org JWT scoping using Better Auth:
 * - `getSession` — soft read (null if anonymous)
 * - `requireSession` — 401 if not signed in
 * - `requireOrg` — 401 if not signed in, 403 if no active organization
 */
import { auth } from "@agenci/auth";

/** Shape returned by Better Auth `getSession` (user + session row). */
export type AuthSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

export type OrgContext = {
  userId: string;
  organizationId: string;
  /** Better Auth member role string (e.g. "owner" | "admin" | "member"). */
  role: string | null;
  session: AuthSession["session"];
  user: AuthSession["user"];
};

export class AuthError extends Error {
  constructor(
    message: string,
    readonly statusCode: 401 | 403,
    readonly code: "UNAUTHENTICATED" | "NO_ACTIVE_ORGANIZATION",
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/** Resolve Better Auth session from Fetch `Headers` (oRPC context / Request). */
export async function getSessionFromHeaders(
  headers: Headers,
): Promise<AuthSession | null> {
  return auth.api.getSession({ headers });
}

/** Require a signed-in user from `Headers` (throws AuthError 401). */
export async function requireSessionFromHeaders(
  headers: Headers,
): Promise<AuthSession> {
  const session = await getSessionFromHeaders(headers);
  if (!session) {
    throw new AuthError("Not authenticated", 401, "UNAUTHENTICATED");
  }
  return session;
}

/**
 * Require signed-in user + active organization from `Headers`.
 * Active org is set via Better Auth `organization.setActive`.
 */
export async function requireOrgFromHeaders(
  headers: Headers,
): Promise<OrgContext> {
  const session = await requireSessionFromHeaders(headers);
  const organizationId = session.session.activeOrganizationId;

  if (!organizationId) {
    throw new AuthError(
      "No active organization — call organization.setActive first",
      403,
      "NO_ACTIVE_ORGANIZATION",
    );
  }

  // Role may be attached when organization plugin enriches the session; fall back to null.
  const role =
    ("activeOrganizationRole" in session.session
      ? (session.session as { activeOrganizationRole?: string | null })
          .activeOrganizationRole
      : null) ?? null;

  return {
    userId: session.user.id,
    organizationId,
    role,
    session: session.session,
    user: session.user,
  };
}

export const getSession = getSessionFromHeaders;
export const requireSession = requireSessionFromHeaders;
export const requireOrg = requireOrgFromHeaders;
