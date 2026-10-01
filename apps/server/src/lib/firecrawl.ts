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

/** Most pages read per website (Firecrawl credits scale with this). */
export const MAX_SITE_PAGES = 100;

// Pages that never hold useful knowledge for customers.
const SKIP_PATH =
  /\/(cart|handlekurv|checkout|kasse|account|konto|login|logg-inn|register|wishlist|onskeliste|search|sok)(\/|$)|\.(jpe?g|png|gif|webp|svg|zip|xml|json)$/i;

/**
 * Pages of the same site as `url` (root first), found via sitemap + links.
 * Falls back to just the root when mapping fails.
 */
export async function mapWebsite(url: string, limit = MAX_SITE_PAGES): Promise<string[]> {
  const root = new URL(url);
  const host = root.hostname.replace(/^www\./, "");
  try {
    const { links } = await firecrawlClient.map(url, {
      limit: 500,
      sitemap: "include",
      ignoreQueryParameters: true,
    });
    const seen = new Set<string>([root.href.replace(/\/$/, "")]);
    const pages: string[] = [];
    for (const link of links) {
      const raw = (link as { url?: string }).url;
      if (!raw) continue;
      let u: URL;
      try {
        u = new URL(raw);
      } catch {
        continue;
      }
      if (u.hostname.replace(/^www\./, "") !== host || SKIP_PATH.test(u.pathname)) continue;
      u.hash = "";
      const key = u.href.replace(/\/$/, "");
      if (seen.has(key)) continue;
      seen.add(key);
      pages.push(u.href);
    }
    return [url, ...pages].slice(0, limit);
  } catch {
    return [url];
  }
}

export type ScrapedProduct = {
  title: string;
  url: string;
  price: string | null;
  image: string | null;
  inStock: boolean | null;
  category: string | null;
  description: string | null;
};

export type ScrapedPage = {
  url: string;
  markdown: string;
  product: ScrapedProduct | null;
};

/** First price in the page text, e.g. "fra 3 490 kr" → "3 490 kr". */
function priceFromMarkdown(markdown: string): string | null {
  const m =
    markdown.match(/(\d{1,3}(?:[ . ]\d{3})*(?:,\d{2})?)\s?(?:kr|NOK)\b/i) ??
    markdown.match(/(?:kr|NOK)\s?(\d{1,3}(?:[ . ]\d{3})*(?:,\d{2})?)/i);
  return m?.[1] ? `${m[1].replace(/ /g, " ")} kr` : null;
}

function toProduct(raw: unknown, pageUrl: string, markdown: string): ScrapedProduct | null {
  const p = raw as {
    title?: string;
    url?: string;
    category?: string;
    description?: string;
    variants?: {
      price?: { formatted?: string; amount?: number; currency?: string };
      availability?: { inStock?: boolean };
      images?: { url?: string }[];
    }[];
  } | null;
  if (!p?.title) return null;
  const v = p.variants?.[0];
  const price =
    v?.price?.formatted ??
    (typeof v?.price?.amount === "number"
      ? `${v.price.amount.toLocaleString("nb-NO")} ${v.price.currency ?? "kr"}`
      : priceFromMarkdown(markdown));
  return {
    title: p.title,
    url: p.url || pageUrl,
    price,
    image: p.variants?.flatMap((x) => x.images ?? []).find((i) => i.url)?.url ?? null,
    inStock: typeof v?.availability?.inStock === "boolean" ? v.availability.inStock : null,
    category: p.category ?? null,
    description: p.description ?? null,
  };
}

/** Main content (markdown) + product data for many pages in one batch. */
export async function scrapePages(urls: string[]): Promise<ScrapedPage[]> {
  if (urls.length === 0) return [];
  const job = await firecrawlClient.batchScrape(urls, {
    options: { formats: ["markdown", "product"], onlyMainContent: true },
    ignoreInvalidURLs: true,
  });
  const pages: ScrapedPage[] = [];
  for (const doc of job.data ?? []) {
    const d = doc as {
      markdown?: string;
      product?: unknown;
      metadata?: { sourceURL?: string; url?: string; statusCode?: number };
    };
    const url = d.metadata?.url ?? d.metadata?.sourceURL;
    if (!url || !d.markdown?.trim() || (d.metadata?.statusCode ?? 200) >= 400) continue;
    pages.push({ url, markdown: d.markdown, product: toProduct(d.product, url, d.markdown) });
  }
  return pages;
}

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
