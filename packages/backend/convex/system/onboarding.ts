import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

const brandingArgs = v.object({
  logoUrl: v.union(v.string(), v.null()),
  colorScheme: v.union(v.string(), v.null()),
  primaryColor: v.union(v.string(), v.null()),
  secondaryColor: v.union(v.string(), v.null()),
  backgroundColor: v.union(v.string(), v.null()),
  textPrimaryColor: v.union(v.string(), v.null()),
});

export const saveBrandingMutation = internalMutation({
  args: {
    orgId: v.string(),
    agentId: v.id("agents"),
    url: v.string(),
    branding: brandingArgs,
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { branding, agentId, orgId, url } = args;

    // Upsert agentBranding table
    const existing = await ctx.db
      .query("agentBranding")
      .withIndex("by_agent_id", (q) => q.eq("agentId", agentId))
      .first();

    const brandingDoc = {
      organizationId: orgId,
      agentId,
      sourceUrl: url,
      extractedAt: now,
      ...(branding.logoUrl !== null ? { logoUrl: branding.logoUrl } : {}),
      ...(branding.colorScheme !== null ? { colorScheme: branding.colorScheme } : {}),
      ...(branding.primaryColor !== null ? { primaryColor: branding.primaryColor } : {}),
      ...(branding.secondaryColor !== null ? { secondaryColor: branding.secondaryColor } : {}),
      ...(branding.backgroundColor !== null ? { backgroundColor: branding.backgroundColor } : {}),
      ...(branding.textPrimaryColor !== null ? { textPrimaryColor: branding.textPrimaryColor } : {}),
    };

    if (existing) {
      await ctx.db.patch(existing._id, brandingDoc);
    } else {
      await ctx.db.insert("agentBranding", brandingDoc);
    }

    // Build appearance patch — only include fields where branding has a value
    const appearance: {
      headerColor?: string;
      bubbleUserColor?: string;
      bubbleButtonColor?: string;
      backgroundColor?: string;
      bubbleAssistantColor?: string;
      headerTextColor?: string;
      bubbleUserTextColor?: string;
      inputTextColor?: string;
    } = {};
    if (branding.primaryColor !== null) {
      appearance.headerColor = branding.primaryColor;
      appearance.bubbleUserColor = branding.primaryColor;
      appearance.bubbleButtonColor = branding.primaryColor;
    }
    if (branding.backgroundColor !== null) {
      appearance.backgroundColor = branding.backgroundColor;
      appearance.bubbleAssistantColor = branding.backgroundColor;
    }
    if (branding.textPrimaryColor !== null) {
      appearance.headerTextColor = branding.textPrimaryColor;
      appearance.bubbleUserTextColor = branding.textPrimaryColor;
      appearance.inputTextColor = branding.textPrimaryColor;
    }

    // Only touch widgetSettings if we have at least one color to apply
    const hasColors =
      appearance.headerColor !== undefined ||
      appearance.backgroundColor !== undefined ||
      appearance.headerTextColor !== undefined;

    if (!hasColors) return;

    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_agent_id", (q) => q.eq("agentId", agentId))
      .first();

    if (widgetSettings) {
      await ctx.db.patch(widgetSettings._id, {
        appearance: { ...(widgetSettings.appearance ?? {}), ...appearance },
      });
    } else {
      await ctx.db.insert("widgetSettings", {
        organizationId: orgId,
        agentId,
        greetMessage: "Hei! Hvordan kan jeg hjelpe deg i dag?",
        defaultSuggestions: {},
        vapiSettings: {},
        appearance,
      });
    }
  },
});
