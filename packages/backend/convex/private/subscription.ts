import { query } from "../_generated/server";
import { getOrgIdOrNull, getUserEmailOrNull } from "../lib/auth";
import { getMaxAgents } from "../lib/subscriptionAccess";

export const getOwn = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) return null;

    const [sub, email] = await Promise.all([
      ctx.db
        .query("subscriptions")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
        .unique(),
      getUserEmailOrNull(ctx),
    ]);

    const maxAgents = getMaxAgents(orgId, sub, { userEmail: email });

    if (!sub) {
      return {
        status: "free" as const,
        trialEndsAt: null,
        planKey: null,
        stripeCustomerId: null,
        maxAgents,
      };
    }

    return {
      status: sub.status as "active" | "trialing" | "canceled" | "free",
      trialEndsAt: sub.trialEndsAt ?? null,
      planKey: sub.planKey ?? null,
      stripeCustomerId: sub.stripeCustomerId ?? null,
      maxAgents,
    };
  },
});
