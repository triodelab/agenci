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

export async function fetchWebpageHtml(
  url: string,
): Promise<{ normalizedUrl: string; html: string }> {
  const publicUrl = assertPublicHttpUrl(url);
  const requestedUrl = publicUrl.toString();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25_000);

  let response: Response;
  try {
    response = await fetch(requestedUrl, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5",
        "User-Agent": "AgenciKnowledgeBot/1.0",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isRedirectLoop =
      msg.toLowerCase().includes("too many redirects") ||
      msg.toLowerCase().includes("redirect");
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: isRedirectLoop
        ? "Nettsiden har for mange omdirigeringer og kan ikke hentes. Prøv en mer direkte URL (f.eks. uten www, eller bruk https:// direkte), eller last opp innholdet som en fil i stedet."
        : `Kunne ikke hente siden: ${msg}`,
    });
  } finally {
    clearTimeout(timeoutId);
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
