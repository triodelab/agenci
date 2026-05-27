"use node";
import Firecrawl from "@mendable/firecrawl-js";
import { internalAction } from "../_generated/server";
import { v } from "convex/values";

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
    const doc = (await firecrawlClient.scrape(args.url, {
      formats: ["markdown", "branding", "changeTracking"],
    })) as any;

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

// export const MIN_MARKDOWN_CHARS = 40;

// export const ingestMarkdownFn = internalAction({
//   args: {
//     orgId: v.string(),
//     agentId: v.id("agents"),
//     url: v.string(),
//     markdown: v.string(),
//   },
//   handler: async (ctx, args) => {
//     if (args.markdown.length < MIN_MARKDOWN_CHARS) {
//       throw new ConvexError(
//         "For lite tekst hentet fra siden. Prøv en annen URL eller last opp innholdet som fil.",
//       );
//     }

//     let publicUrl: URL;
//     try {
//       publicUrl = new URL(args.url);
//     } catch {
//       throw new ConvexError(`Ugyldig URL: "${args.url}"`);
//     }
//     const title = `${publicUrl.hostname}${publicUrl.pathname}`;
//     const textBytes = new TextEncoder().encode(args.markdown);

//     let entryId: string;
//     let created: boolean;
//     try {
//       ({ entryId, created } = await rag.add(ctx, {
//         namespace: agentNamespace(args.orgId, args.agentId),
//         text: args.markdown,
//         key: args.url,
//         title,
//         metadata: {
//           uploadedBy: args.orgId,
//           filename: title,
//           category: null,
//           sourceType: "webpage",
//           sourceUrl: args.url,
//           agentId: args.agentId,
//         },
//         contentHash: await contentHashFromArrayBuffer(textBytes.buffer),
//       }));
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : String(e);
//       const isKeyMissing =
//         msg.toLowerCase().includes("api key") ||
//         msg.toLowerCase().includes("openai");
//       throw new ConvexError(
//         isKeyMissing
//           ? "Mangler OpenAI API-nøkkel på Convex-deploymenten. Sett OPENAI_API_KEY i Convex-dashboardet."
//           : `Kunne ikke indeksere siden (embedding feilet): ${msg}`,
//       );
//     }

//     if (!created) {
//       console.debug("Markdown entry uendret, hopper over duplikat");
//     }

//     return { entryId, created, url: args.url, title };
//   },
// });
