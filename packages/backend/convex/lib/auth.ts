import { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";

type AuthCtx = QueryCtx | MutationCtx | ActionCtx;

/**
 * Leser org fra JWT (Convex `UserIdentity` speiler custom claims).
 * Støtter både `orgId` og `org_id` m.m. — se docs/CONVEX_CLERK_JWT.md
 */
export async function getOrgIdOrNull(ctx: AuthCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const record = identity as unknown as Record<string, unknown>;
  const candidates = [
    record.orgId,
    record.org_id,
    record.organizationId,
    record.organization_id,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.length > 0) {
      return c;
    }
  }
  return null;
}

/** E-post fra Clerk JWT (Convex identity), brukes bl.a. til dev team-tilgang for abonnement. */
export async function getUserEmailOrNull(ctx: AuthCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const record = identity as unknown as Record<string, unknown>;
  const email = record.email;
  if (typeof email === "string" && email.includes("@")) {
    return email.trim().toLowerCase();
  }
  return null;
}
