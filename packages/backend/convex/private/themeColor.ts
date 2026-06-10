import { v } from "convex/values";
import { action } from "../_generated/server";

/**
 * Henter primærfarge fra en nettside via <meta name="theme-color"> eller
 * fallback til OG-bilde-tag. Returnerer null hvis ingen farge ble funnet.
 */
export const extractThemeColor = action({
  args: { url: v.string() },
  handler: async (_ctx, args): Promise<{ color: string | null }> => {
    let target: URL;
    try {
      target = new URL(args.url.trim());
    } catch {
      return { color: null };
    }
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      return { color: null };
    }

    try {
      const res = await fetch(target.toString(), {
        headers: { "User-Agent": "AgenciBot/1.0 (theme-color-extractor)" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return { color: null };
      const html = await res.text();
      const head = html.slice(0, 60000);

      const metaMatch =
        head.match(
          /<meta[^>]+name=["']theme-color["'][^>]*content=["']([^"']+)["']/i,
        ) ??
        head.match(
          /<meta[^>]+content=["']([^"']+)["'][^>]*name=["']theme-color["']/i,
        );
      if (metaMatch?.[1]) {
        const c = normalizeColor(metaMatch[1]);
        if (c) return { color: c };
      }

      const msMatch = head.match(
        /<meta[^>]+name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i,
      );
      if (msMatch?.[1]) {
        const c = normalizeColor(msMatch[1]);
        if (c) return { color: c };
      }

      return { color: null };
    } catch {
      return { color: null };
    }
  },
});

function normalizeColor(raw: string): string | null {
  const v = raw.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
    return v.length === 4
      ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`.toLowerCase()
      : v.toLowerCase();
  }
  const rgb = v.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (rgb) {
    const r = Math.min(255, parseInt(rgb[1]!, 10));
    const g = Math.min(255, parseInt(rgb[2]!, 10));
    const b = Math.min(255, parseInt(rgb[3]!, 10));
    return (
      "#" +
      [r, g, b]
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("")
        .toLowerCase()
    );
  }
  return null;
}
