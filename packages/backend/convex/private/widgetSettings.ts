import { ConvexError, v } from "convex/values";
import { internalQuery, mutation, query } from "../_generated/server";
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
    bubbleButtonColor: v.optional(v.string()),
    bubbleButtonIconColor: v.optional(v.string()),
    bubbleButtonSize: v.optional(v.number()),
  }),
);

export const upsert = mutation({
  args: {
    forAgentId: v.optional(v.id("agents")),
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

    const existingWidgetSettings = args.forAgentId
      ? await ctx.db
          .query("widgetSettings")
          .withIndex("by_agent_id", (q) => q.eq("agentId", args.forAgentId!))
          .first()
      : await ctx.db
          .query("widgetSettings")
          .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
          .first();

    const patch = {
      agentId: args.forAgentId ?? args.agentId,
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
  args: { agentId: v.optional(v.id("agents")) },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) return null;

    if (args.agentId) {
      const agentSettings = await ctx.db
        .query("widgetSettings")
        .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId!))
        .first();
      if (agentSettings) return agentSettings;
    }

    return ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .filter((q) => q.eq(q.field("agentId"), undefined))
      .first();
  },
});

export const saveSystemPrompt = mutation({
  args: { systemPrompt: v.string(), agentId: v.optional(v.id("agents")) },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "No organization in session.",
      });
    }

    const existing = args.agentId
      ? await ctx.db
          .query("widgetSettings")
          .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId!))
          .first()
      : await ctx.db
          .query("widgetSettings")
          .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
          .first();

    if (existing) {
      await ctx.db.patch(existing._id, { systemPrompt: args.systemPrompt });
    } else {
      await ctx.db.insert("widgetSettings", {
        organizationId: orgId,
        agentId: args.agentId,
        greetMessage: "Hei! Hvordan kan jeg hjelpe deg i dag?",
        defaultSuggestions: {},
        vapiSettings: {},
        systemPrompt: args.systemPrompt,
      });
    }
  },
});

export const getByOrganizationId = internalQuery({
  args: { organizationId: v.string(), agentId: v.optional(v.id("agents")) },
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
