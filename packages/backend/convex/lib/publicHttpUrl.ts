import { ConvexError } from "convex/values";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
]);

/**
 * Begrenser URL til offentlig http(s) for å redusere SSRF-risiko i fetch fra Convex.
 */
export function assertPublicHttpUrl(raw: string): URL {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "Ugyldig URL",
    });
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "Bare http- og https-adresser er tillatt",
    });
  }

  const host = u.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host)) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "Lokale og interne adresser er ikke tillatt",
    });
  }

  if (
    /^192\.168\./.test(host) ||
    /^10\./.test(host) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
    /^169\.254\./.test(host)
  ) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "Private nettverksadresser er ikke tillatt",
    });
  }

  u.hash = "";
  return u;
}
