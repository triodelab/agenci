import { ConvexError } from "convex/values";
import { assertPublicHttpUrl } from "./publicHttpUrl";

export type WebsiteMode = "single" | "crawl";

export const DEFAULT_WEBSITE_MAX_PAGES = 25;
export const MAX_WEBSITE_MAX_PAGES = 50;
export const DEFAULT_WEBSITE_SYNC_INTERVAL_MINUTES = 24 * 60;
export const MIN_WEBSITE_SYNC_INTERVAL_MINUTES = 60;
export const WEBSITE_BATCH_SIZE = 3;

const MAX_WEB_HTML_CHARS = 2_000_000;
const NON_HTML_PATH_RE =
  /\.(?:pdf|png|jpe?g|gif|webp|svg|zip|rar|gz|mp[34]|avi|mov|css|js|json|xml|ico|woff2?|ttf|eot)$/i;

export function normalizeWebpageUrl(raw: string): string {
  return assertPublicHttpUrl(raw).toString();
}

export function clampWebsiteMaxPages(
  value: number | undefined,
  mode: WebsiteMode,
): number {
  if (mode === "single") {
    return 1;
  }

  const fallback = DEFAULT_WEBSITE_MAX_PAGES;
  const normalized = Math.floor(value ?? fallback);
  if (!Number.isFinite(normalized) || normalized < 1) {
    return fallback;
  }

  return Math.min(normalized, MAX_WEBSITE_MAX_PAGES);
}

export function clampWebsiteSyncIntervalMinutes(
  value: number | undefined,
): number {
  const fallback = DEFAULT_WEBSITE_SYNC_INTERVAL_MINUTES;
  const normalized = Math.floor(value ?? fallback);
  if (
    !Number.isFinite(normalized) ||
    normalized < MIN_WEBSITE_SYNC_INTERVAL_MINUTES
  ) {
    return fallback;
  }

  return normalized;
}

const BROWSER_HEADERS = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "nb-NO,nb;q=0.9,no;q=0.8,en-US;q=0.7,en;q=0.6",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
};

async function doFetch(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25_000);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: BROWSER_HEADERS,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

// Fallback via Jina Reader — bypasses Cloudflare/bot-protection on most sites.
// Returns plain-text/markdown content wrapped in a fake HTML response shape.
async function fetchViaJina(url: string): Promise<{ normalizedUrl: string; html: string }> {
  const jinaUrl = `https://r.jina.ai/${url}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);
  let response: Response;
  try {
    response = await fetch(jinaUrl, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/plain",
        "X-Return-Format": "text",
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }
  if (!response.ok) {
    throw new Error(`Jina feilet med HTTP ${response.status}`);
  }
  const text = await response.text();
  if (!text || text.trim().length < 20) {
    throw new Error("Jina returnerte tomt innhold");
  }
  // Wrap as minimal HTML so downstream HTML-checks pass
  const html = `<html><body><pre>${text}</pre></body></html>`;
  return { normalizedUrl: url, html };
}

export async function fetchWebpageHtml(
  url: string,
): Promise<{ normalizedUrl: string; html: string }> {
  const publicUrl = assertPublicHttpUrl(url);
  const requestedUrl = publicUrl.toString();
  const withoutWww = requestedUrl.replace(/^(https?:\/\/)www\./i, "$1");
  const hasWww = withoutWww !== requestedUrl;

  let response: Response | null = null;
  let lastError = "";

  // Try original URL first, then non-www fallback if URL has www
  const urlsToTry = hasWww ? [requestedUrl, withoutWww] : [requestedUrl];

  for (const candidate of urlsToTry) {
    try {
      response = await doFetch(candidate);
      break;
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }

  if (!response) {
    // Direct fetch failed for all URL variants — try Jina Reader as proxy fallback.
    try {
      return await fetchViaJina(requestedUrl);
    } catch {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: `Kunne ikke hente siden. Nettsiden kan ha bot-beskyttelse som blokkerer henting. Prøv å laste opp innholdet som PDF i stedet.`,
      });
    }
  }

  if (!response.ok) {
    throw new ConvexError(`HTTP ${response.status} fra serveren`);
  }

  const contentType = (
    response.headers.get("content-type") ?? ""
  ).toLowerCase();
  let html = await response.text();
  const looksHtml =
    contentType.includes("text/html") ||
    contentType.includes("application/xhtml") ||
    contentType.includes("text/plain") ||
    /^\s*</.test(html.slice(0, 800));
  if (!looksHtml) {
    throw new ConvexError(
      "URL-en ser ikke ut som en vanlig nettside (HTML). Prøv en annen adresse eller last opp som fil.",
    );
  }

  if (html.length > MAX_WEB_HTML_CHARS) {
    html = html.slice(0, MAX_WEB_HTML_CHARS);
  }

  const finalUrl = assertPublicHttpUrl(response.url || requestedUrl).toString();
  return { normalizedUrl: finalUrl, html };
}

export function extractSameHostLinks(
  rootUrl: string,
  pageUrl: string,
  html: string,
): string[] {
  const root = new URL(rootUrl);
  const base = new URL(pageUrl);
  const discovered = new Set<string>();

  for (const match of html.matchAll(
    /href\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi,
  )) {
    const href = match[1] ?? match[2] ?? match[3];
    if (!href) {
      continue;
    }

    const trimmed = href.trim();
    if (
      !trimmed ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("mailto:") ||
      trimmed.startsWith("tel:") ||
      trimmed.startsWith("javascript:")
    ) {
      continue;
    }

    let candidate: URL;
    try {
      candidate = new URL(trimmed, base);
    } catch {
      continue;
    }

    if (candidate.protocol !== "http:" && candidate.protocol !== "https:") {
      continue;
    }

    if (candidate.hostname.toLowerCase() !== root.hostname.toLowerCase()) {
      continue;
    }

    if (NON_HTML_PATH_RE.test(candidate.pathname)) {
      continue;
    }

    candidate.hash = "";
    const normalized = assertPublicHttpUrl(candidate.toString()).toString();
    discovered.add(normalized);
  }

  return [...discovered];
}
