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

/** Full-page screenshot of a live site (hosted image URL), or null. */
export const screenshotWebsite = async (
  url: string,
  options: { mobile?: boolean } = {},
) => {
  const response = await firecrawlClient.scrape(url, {
    formats: [{ type: "screenshot", fullPage: true }],
    mobile: options.mobile ?? false,
  });
  const shot = (response as { screenshot?: unknown }).screenshot;
  return typeof shot === "string" && shot ? shot : null;
};
