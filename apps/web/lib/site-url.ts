/**
 * Kanonisk base-URL for sitemap, robots og JSON-LD.
 * Sett `NEXT_PUBLIC_APP_URL` i produksjon (f.eks. https://agenci.no).
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  return "https://agenci.no";
}
