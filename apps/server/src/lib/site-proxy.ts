/**
 * Live-site preview proxy (for sites that refuse to be framed).
 *
 * Each preview gets its own throw-away origin — `http://<id>.localhost:<port>`
 * — that mirrors the customer's site path-for-path (`/` → `/`, `/_next/…` →
 * `/_next/…`). The page therefore runs its JavaScript normally (routers,
 * lazy media, data fetches all hit the proxy), which a single-page HTML
 * rewrite can't do.
 *
 * Safety:
 * - The origin is separate from the dashboard, so the page never sees the
 *   dashboard's cookies/storage (cookies for `localhost` aren't sent to
 *   `*.localhost`), and our incoming cookies are never forwarded upstream.
 * - Sessions are only created by `widgetCustomization.site` for the agent's
 *   own onboarding URL, expire after 30 minutes, and are locked to that one
 *   upstream origin. Private/internal hosts are refused (no SSRF).
 *
 * Production needs a wildcard preview domain (e.g. `*.preview.agenci.no`)
 * pointed at this listener; set SITE_PREVIEW_ORIGIN accordingly.
 */
import { randomBytes } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { Hono } from "hono";

const SESSION_TTL_MS = 30 * 60 * 1000;
export const SITE_PREVIEW_PORT = Number(process.env.SITE_PREVIEW_PORT ?? 3005);
/** `{id}` is replaced with the session id. */
const ORIGIN_TEMPLATE =
  process.env.SITE_PREVIEW_ORIGIN ?? `http://{id}.localhost:${SITE_PREVIEW_PORT}`;

type Session = { upstream: string; exp: number };
// On globalThis so sessions survive `bun --hot` reloads (the listener does too).
const g = globalThis as { __sitePreviewSessions?: Map<string, Session> };
g.__sitePreviewSessions ??= new Map();
const sessions = g.__sitePreviewSessions;

function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    return (
      v === "::1" ||
      v === "::" ||
      v.startsWith("fc") ||
      v.startsWith("fd") ||
      v.startsWith("fe80") ||
      (v.startsWith("::ffff:") && isPrivateAddress(v.slice(7)))
    );
  }
  const [a = 0, b = 0] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

export async function assertPublicUrl(raw: string) {
  const u = new URL(raw);
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error("protocol");
  if (u.hostname === "localhost" || u.hostname.endsWith(".localhost") || u.hostname.endsWith(".local")) {
    throw new Error("host");
  }
  const addresses = isIP(u.hostname)
    ? [{ address: u.hostname }]
    : await lookup(u.hostname, { all: true });
  if (!addresses.length || addresses.some((a) => isPrivateAddress(a.address))) {
    throw new Error("private host");
  }
}

/**
 * Start (or reuse) a preview of `url`; returns the URL to frame (same path,
 * preview origin). Pass `resolved` when `url` already followed redirects.
 */
export async function createPreviewSession(
  url: string,
  opts: { resolved?: boolean } = {},
) {
  await assertPublicUrl(url);
  // Lock the session to where the site actually lives (e.g. apex → www).
  const final = opts.resolved
    ? url
    : await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(8000) })
        .then(async (r) => {
          await r.body?.cancel();
          return r.url || url;
        })
        .catch(() => url);
  if (final !== url) await assertPublicUrl(final);
  const target = new URL(final);
  const now = Date.now();
  for (const [k, s] of sessions) if (s.exp < now) sessions.delete(k);
  // Reuse the live session for this site so the browser cache keeps working.
  let id = [...sessions].find(([, s]) => s.upstream === target.origin)?.[0];
  id ??= randomBytes(8).toString("hex");
  sessions.set(id, { upstream: target.origin, exp: now + SESSION_TTL_MS });
  const origin = ORIGIN_TEMPLATE.replace("{id}", id);
  return `${origin}${target.pathname}${target.search}`;
}

const DROP_RESPONSE_HEADERS = [
  "x-frame-options",
  "content-security-policy",
  "content-security-policy-report-only",
  "strict-transport-security",
  "set-cookie",
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
];

const FORWARD_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "content-type",
  "range",
  "if-none-match",
  "if-modified-since",
  // Next.js App Router data requests
  "rsc",
  "next-router-state-tree",
  "next-router-prefetch",
  "next-url",
];

export const sitePreviewApp = new Hono();

sitePreviewApp.all("*", async (c) => {
  const host = c.req.header("host") ?? "";
  const id = host.split(".")[0] ?? "";
  const session = sessions.get(id);
  if (!session || session.exp < Date.now()) {
    return c.text("Forhåndsvisningen har utløpt. Last inn siden på nytt.", 410);
  }

  const incoming = new URL(c.req.url);
  const upstreamUrl = `${session.upstream}${incoming.pathname}${incoming.search}`;

  const headers = new Headers({
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
  });
  for (const name of FORWARD_REQUEST_HEADERS) {
    const v = c.req.header(name);
    if (v) headers.set(name, v);
  }

  let res: Response;
  try {
    const method = c.req.method;
    res = await fetch(upstreamUrl, {
      method,
      headers,
      body: method === "GET" || method === "HEAD" ? undefined : await c.req.arrayBuffer(),
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    return c.text("Kunne ikke hente nettsiden", 502);
  }

  const out = new Headers(res.headers);
  for (const h of DROP_RESPONSE_HEADERS) out.delete(h);
  out.set("referrer-policy", "no-referrer");
  out.set("x-robots-tag", "noindex, nofollow");

  // Keep redirects inside the preview origin when they point at the site.
  const location = res.headers.get("location");
  if (location) {
    const loc = new URL(location, session.upstream);
    if (loc.origin === session.upstream) {
      out.set("location", `${loc.pathname}${loc.search}${loc.hash}`);
    }
  }

  return new Response(res.body, { status: res.status, headers: out });
});
