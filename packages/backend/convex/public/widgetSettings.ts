import { v } from "convex/values";
import { query } from "../_generated/server";

export const getByOrganizationId = query({
  args: {
    organizationId: v.string(),
    agentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    if (args.agentId) {
      const agentSettings = await ctx.db
        .query("widgetSettings")
        .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId!))
        .first();
      if (agentSettings) return agentSettings;
    }
    return ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .filter((q) => q.eq(q.field("agentId"), undefined))
      .first();
  },
});
