import { Firecrawl } from "firecrawl";
import { env } from "@agenci/env/server";
import {
  mapFirecrawlBrandingToWidgetBrand,
  type FirecrawlBranding,
} from "@/modules/agents/branding";

export const firecrawlClient = new Firecrawl({
  apiKey: env.FIRECRAWL_API_KEY,
});

export const scrapeWebsiteForAgentOnboarding = async (url: string) => {
  const response = await firecrawlClient.scrape(url, {
    formats: ["branding", "markdown"],
  });

  const branding = mapFirecrawlBrandingToWidgetBrand(
    (response as { branding?: FirecrawlBranding }).branding,
  );

  return {
    markdown:
      typeof (response as { markdown?: unknown }).markdown === "string"
        ? (response as { markdown: string }).markdown
        : null,
    branding,
  };
};
