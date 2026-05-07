import { query } from "../_generated/server";
import { getOrgIdOrNull } from "../lib/auth";

export const getOwn = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) return null;

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();

    if (!sub) {
      return {
        status: "free" as const,
        trialEndsAt: null,
        planKey: null,
        stripeCustomerId: null,
      };
    }

    return {
      status: sub.status as "active" | "trialing" | "canceled" | "free",
      trialEndsAt: sub.trialEndsAt ?? null,
      planKey: sub.planKey ?? null,
      stripeCustomerId: sub.stripeCustomerId ?? null,
    };
  },
});
