import { v } from "convex/values";
import { query } from "../_generated/server";
import {
  getCanHideBranding,
  getCanUseBookings,
} from "../lib/subscriptionAccess";

export const getByOrganizationId = query({
  args: {
    organizationId: v.string(),
    agentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    let settings = null;
    if (args.agentId) {
      settings = await ctx.db
        .query("widgetSettings")
        .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId!))
        .first();
    }
    if (!settings) {
      settings = await ctx.db
        .query("widgetSettings")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId),
        )
        .first();
    }
    if (!settings) return null;

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .unique();
    const canUseBookings = getCanUseBookings(args.organizationId, subscription);
    const canHideBranding = getCanHideBranding(args.organizationId, subscription);

    // Get favicon URL — use stored logoUrl or derive from sourceUrl domain
    let faviconUrl: string | null = null;
    if (settings.agentId) {
      const branding = await ctx.db
        .query("agentBranding")
        .withIndex("by_agent_id", (q) => q.eq("agentId", settings.agentId!))
        .first();
      if (branding?.logoUrl) {
        faviconUrl = branding.logoUrl;
      } else if (branding?.sourceUrl) {
        try {
          const domain = new URL(branding.sourceUrl).hostname;
          faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}`;
        } catch { /* skip */ }
      }
    }

    return {
      ...settings,
      bookingEnabled: settings.bookingEnabled && canUseBookings,
      hideBranding: canHideBranding,
      faviconUrl,
    };
  },
});
