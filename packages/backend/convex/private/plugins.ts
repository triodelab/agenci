import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getOrgIdOrNull } from "../lib/auth";

export const remove = mutation({
  args: {
    service: v.union(v.literal("vapi"))
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);

    if (!orgId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message:
          "No organization in session. Select an organization in Clerk (JWT template must include orgId).",
      });
    }

    const existingPlugin = await ctx.db
      .query("plugins")
      .withIndex("by_organization_id_and_service", (q) =>
        q.eq("organizationId", orgId).eq("service", args.service)
      )
      .unique();

    if (!existingPlugin) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Plugin not found"
      });
    }

    await ctx.db.delete(existingPlugin._id);
  },
});

export const getOne = query({
  args: {
    service: v.union(v.literal("vapi"))
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);

    if (!orgId) {
      return null;
    }

    return await ctx.db
      .query("plugins")
      .withIndex("by_organization_id_and_service", (q) =>
        q.eq("organizationId", orgId).eq("service", args.service)
      )
      .unique();
  },
});
