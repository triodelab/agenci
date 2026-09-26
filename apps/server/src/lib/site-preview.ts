/**
 * The customer's real website behind the widget preview.
 *
 * If the site allows being framed we return it for a live iframe. Sites that
 * block framing are shown live through lib/site-proxy; a Firecrawl
 * screenshot (slow) is only taken when asked for, as the last fallback. Results are cached briefly so
 * opening the page repeatedly doesn't re-capture.
 */
import { screenshotWebsite } from "@/lib/firecrawl";

const TTL_MS = 30 * 60 * 1000;

type SitePreview = {
  url: string;
  frameable: boolean;
  screenshotUrl: string | null;
  capturedAt: string;
};

const cache = new Map<string, { at: number; value: SitePreview }>();

/** Does the site let other origins show it in an iframe? */
async function isFrameable(url: string): Promise<{ ok: boolean; finalUrl: string }> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
      headers: { "user-agent": "Mozilla/5.0 (AgenciPreview)" },
    });
    const xfo = res.headers.get("x-frame-options")?.toLowerCase() ?? "";
    const csp = res.headers.get("content-security-policy")?.toLowerCase() ?? "";
    const ancestors = csp
      .split(";")
      .map((d) => d.trim())
      .find((d) => d.startsWith("frame-ancestors"));
    const blockedByXfo = xfo.includes("deny") || xfo.includes("sameorigin");
    const blockedByCsp =
      ancestors !== undefined && !/\s\*(\s|$)/.test(`${ancestors} `);
    return { ok: res.ok && !blockedByXfo && !blockedByCsp, finalUrl: res.url || url };
  } catch {
    return { ok: false, finalUrl: url };
  }
}

export async function getSitePreview(
  url: string,
  device: "desktop" | "mobile",
  opts: { screenshot?: boolean } = {},
): Promise<SitePreview> {
  const key = `${device}:${opts.screenshot ? "shot" : "live"}:${url}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  const { ok, finalUrl } = await isFrameable(url);
  let screenshotUrl: string | null = null;
  if (!ok && opts.screenshot) {
    try {
      screenshotUrl = await screenshotWebsite(finalUrl, { mobile: device === "mobile" });
    } catch {
      screenshotUrl = null;
    }
  }
  const value: SitePreview = {
    url: finalUrl,
    frameable: ok,
    screenshotUrl,
    capturedAt: new Date().toISOString(),
  };
  // Don't cache failures, so a retry can succeed.
  if (ok || screenshotUrl || !opts.screenshot) cache.set(key, { at: Date.now(), value });
  return value;
}

export function clearSitePreview(url: string) {
  for (const k of cache.keys()) if (k.endsWith(`:${url}`)) cache.delete(k);
}

