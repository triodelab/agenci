import { ConvexError, v } from "convex/values";
import Firecrawl from "@mendable/firecrawl-js";
import { internalAction } from "../_generated/server";

export const firecrawlClient = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

export type ScrapedBranding = {
  logoUrl: string | null;
  colorScheme: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  backgroundColor: string | null;
  textPrimaryColor: string | null;
};

export const scrapeWebsiteUrlFn = internalAction({
  args: {
    url: v.string(),
  },
  handler: async (_ctx, args) => {
    const doc = await firecrawlClient.scrape(args.url, {
      formats: ["markdown", "branding"],
    });

    const b = doc.branding;
    const branding: ScrapedBranding = b
      ? {
          logoUrl: typeof b.logo === "string" ? b.logo : null,
          colorScheme: b.colorScheme ?? null,
          primaryColor: b.colors?.primary ?? null,
          secondaryColor: b.colors?.secondary ?? null,
          backgroundColor: b.colors?.background ?? null,
          textPrimaryColor: b.colors?.textPrimary ?? null,
        }
      : {
          logoUrl: null,
          colorScheme: null,
          primaryColor: null,
          secondaryColor: null,
          backgroundColor: null,
          textPrimaryColor: null,
        };

    return {
      markdown: doc.markdown ?? null,
      branding,
    };
  },
});
