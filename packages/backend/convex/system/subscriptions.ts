import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const upsert = internalMutation({
  args: {
    organizationId: v.string(),
    status: v.string(),
    trialEndsAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .unique();

    const fields = {
      status: args.status,
      trialEndsAt: args.trialEndsAt,
    };

    if (existingSubscription) {
      await ctx.db.patch(existingSubscription._id, fields);
    } else {
      await ctx.db.insert("subscriptions", {
        organizationId: args.organizationId,
        ...fields,
      });
    }
  },
});

export const getByOrganizationId = internalQuery({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) => 
        q.eq("organizationId", args.organizationId),
      )
      .unique();
  },
});
