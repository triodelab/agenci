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
