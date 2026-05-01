import { query } from "../_generated/server";
import { getOrgIdOrNull } from "../lib/auth";

/**
 * Returns runtime config values that the web app needs but can't bake in at
 * build time. Values come from Convex env vars — set them once in the Convex
 * dashboard, no web redeploy required.
 *
 * WIDGET_PREVIEW_URL — base URL for the widget iframe in the knowledge-base
 *   playground. Example: https://agenci-widget-vol22.vercel.app
 */
export const getPublicConfig = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) return null;

    return {
      widgetPreviewUrl:
        process.env.WIDGET_PREVIEW_URL?.replace(/\/$/, "") ??
        "https://agenci-widget-vol22.vercel.app",
    };
  },
});
