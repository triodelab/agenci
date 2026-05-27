import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";
import { firecrawlClient } from "@/lib/firecrawl";
import { api } from "@workspace/backend/_generated/api";

const MIN_MARKDOWN_CHARS = 40;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const processWebsiteOnboarding: any = inngest.createFunction(
  {
    id: "process-website-onboarding",
    triggers: { event: "app/website-onboarding.created" },
  },
  async ({ event, step }) => {
    const { url, agentId } = event.data;

    const scrapeResult = await step.run("scrape-website", async () => {
      const result = (await firecrawlClient.scrape(url, {
        formats: ["branding", "markdown"],
      })) as any;

      const b = result.branding;
      const branding = {
        logoUrl: typeof b?.logo === "string" ? b.logo : null,
        colorScheme: b?.colorScheme ?? null,
        primaryColor: b?.colors?.primary ?? null,
        secondaryColor: b?.colors?.secondary ?? null,
        backgroundColor: b?.colors?.background ?? null,
        textPrimaryColor: b?.colors?.textPrimary ?? null,
      };

      return { markdown: (result.markdown as string | null) ?? null, branding };
    });

    const { markdown, branding } = scrapeResult;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyApi = api as any;

    if (markdown && markdown.length >= MIN_MARKDOWN_CHARS) {
      await step.run("insert-website-markdown", async () => {
        await convex.action(anyApi.private.onboarding.insertWebsiteMarkdown, {
          markdown,
          websiteUrl: url,
          agentId,
        });
      });
    }

    await step.run("insert-website-branding", async () => {
      await convex.mutation(anyApi.private.onboarding.insertWebsiteBranding, {
        agentId,
        websiteUrl: url,
        ...branding,
      });
    });
  },
);
