import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getOrgIdOrNull } from "../lib/auth";

const appearanceArgs = v.optional(
  v.object({
    position: v.optional(
      v.union(
        v.literal("center"),
        v.literal("bottom-right"),
        v.literal("bottom-left"),
        v.literal("custom"),
      ),
    ),
    customX: v.optional(v.number()),
    customY: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    borderRadius: v.optional(v.number()),
    headerColor: v.optional(v.string()),
    headerTextColor: v.optional(v.string()),
    bubbleUserColor: v.optional(v.string()),
    bubbleUserTextColor: v.optional(v.string()),
    bubbleAssistantColor: v.optional(v.string()),
    bubbleAssistantTextColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    inputBorderColor: v.optional(v.string()),
    inputBackgroundColor: v.optional(v.string()),
    inputTextColor: v.optional(v.string()),
    inputPlaceholderColor: v.optional(v.string()),
  }),
);

export const upsert = mutation({
  args: {
    agentId: v.optional(v.id("agents")),
    widgetTitle: v.string(),
    greetMessage: v.string(),
    defaultSuggestions: v.object({
      suggestion1: v.optional(v.string()),
      suggestion2: v.optional(v.string()),
      suggestion3: v.optional(v.string()),
    }),
    vapiSettings: v.object({
      assistantId: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
    }),
    appearance: appearanceArgs,
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

    const existingWidgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();

    const patch = {
      agentId: args.agentId,
      widgetTitle: args.widgetTitle,
      greetMessage: args.greetMessage,
      defaultSuggestions: args.defaultSuggestions,
      vapiSettings: args.vapiSettings,
      ...(args.appearance !== undefined ? { appearance: args.appearance } : {}),
    };

    if (existingWidgetSettings) {
      await ctx.db.patch(existingWidgetSettings._id, patch);
    } else {
      await ctx.db.insert("widgetSettings", { organizationId: orgId, ...patch });
    }
  },
});


export const getOne = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgIdOrNull(ctx);

    if (!orgId) {
      return null;
    }

    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();

    return widgetSettings;
  },
});
