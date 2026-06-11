import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
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
    fontFamily: v.optional(v.string()),
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

function getContrastTextColor(bgHex: string): "#ffffff" | "#18181b" {
  const hex = bgHex.replace("#", "");
  if (hex.length !== 6) return "#ffffff";
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const r = toLinear(parseInt(hex.slice(0, 2), 16) / 255);
  const g = toLinear(parseInt(hex.slice(2, 4), 16) / 255);
  const b = toLinear(parseInt(hex.slice(4, 6), 16) / 255);
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.179 ? "#18181b" : "#ffffff";
}

export const applyBrandColor = internalMutation({
  args: {
    agentId: v.id("agents"),
    orgId: v.string(),
    primaryColor: v.union(v.string(), v.null()),
    fontFamily: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    if (!args.primaryColor && !args.fontFamily) return;

    const existing = await ctx.db
      .query("widgetSettings")
      .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId))
      .first();

    const base = existing?.appearance ?? {};
    const appearance: Record<string, unknown> = { ...base };
    if (args.primaryColor) {
      const textColor = getContrastTextColor(args.primaryColor);
      appearance.headerColor = args.primaryColor;
      appearance.headerTextColor = textColor;
      appearance.bubbleUserColor = args.primaryColor;
      appearance.bubbleUserTextColor = textColor;
      appearance.bubbleButtonColor = args.primaryColor;
      appearance.bubbleButtonIconColor = textColor;
    }
    if (args.fontFamily) {
      appearance.fontFamily = args.fontFamily;
    }

    if (existing) {
      await ctx.db.patch(existing._id, { appearance });
    } else {
      await ctx.db.insert("widgetSettings", {
        organizationId: args.orgId,
        agentId: args.agentId,
        greetMessage: "Hei! Hvordan kan jeg hjelpe deg i dag?",
        defaultSuggestions: {},
        vapiSettings: {},
        appearance,
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
