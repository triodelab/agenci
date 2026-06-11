import { v } from "convex/values";
import { action } from "../_generated/server";

const BOT_UA = "AgenciBot/1.0 (theme-color-extractor)";

// CSS custom property keywords that suggest a primary/brand color (ordered by priority)
const COLOR_VAR_KEYWORDS = [
  "primary", "brand", "accent", "highlight", "main", "key",
  "theme", "cta", "button", "action",
];

// CSS custom property keywords for font family
const FONT_VAR_KEYWORDS = [
  "font-normal", "font-primary", "font-main", "font-body", "font-base",
  "font-special", "font-family", "heading-font", "body-font", "font",
  "global-font", "typeface",
];

export const extractThemeColor = action({
  args: { url: v.string() },
  handler: async (_ctx, args): Promise<{ color: string | null; fontFamily: string | null }> => {
    let target: URL;
    try {
      target = new URL(args.url.trim());
    } catch {
      return { color: null, fontFamily: null };
    }
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      return { color: null, fontFamily: null };
    }

    try {
      const res = await fetch(target.toString(), {
        headers: { "User-Agent": BOT_UA },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return { color: null, fontFamily: null };
      const html = await res.text();
      const head = html.slice(0, 80000);

      let color: string | null = null;
      let fontFamily: string | null = null;

      // ── 1. <meta name="theme-color"> ──────────────────────────────────────
      const metaMatch =
        head.match(/<meta[^>]+name=["']theme-color["'][^>]*content=["']([^"']+)["']/i) ??
        head.match(/<meta[^>]+content=["']([^"']+)["'][^>]*name=["']theme-color["']/i);
      if (metaMatch?.[1]) color = normalizeColor(metaMatch[1]);

      // ── 2. <meta name="msapplication-TileColor"> ──────────────────────────
      if (!color) {
        const msMatch = head.match(
          /<meta[^>]+name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i,
        );
        if (msMatch?.[1]) color = normalizeColor(msMatch[1]);
      }

      // ── 3. Web App Manifest theme_color ───────────────────────────────────
      if (!color) {
        const manifestMatch = head.match(
          /<link[^>]+rel=["']manifest["'][^>]*href=["']([^"']+)["']/i,
        );
        if (manifestMatch?.[1]) {
          try {
            const mUrl = new URL(manifestMatch[1], target);
            const mRes = await fetch(mUrl.toString(), {
              headers: { "User-Agent": BOT_UA },
              signal: AbortSignal.timeout(4000),
            });
            if (mRes.ok) {
              const mJson = await mRes.json() as { theme_color?: string };
              if (mJson.theme_color) color = normalizeColor(mJson.theme_color);
            }
          } catch { /* skip */ }
        }
      }

      // ── 4. Google Fonts from <link> tags (most reliable font source) ───────
      if (!fontFamily) {
        fontFamily = extractGoogleFont(head);
      }

      // ── 5. Inline <style> CSS ──────────────────────────────────────────────
      const inlineCss = [...head.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
        .map((m) => m[1] ?? "")
        .join("\n");
      if (!color) color = findBestColorFromCss(inlineCss);
      if (!fontFamily) fontFamily = findFontFamilyFromCss(inlineCss);

      // ── 6. External stylesheets (theme/main sheets first) ─────────────────
      const sheetUrls = extractStylesheetUrls(head, target);
      for (const sheetUrl of sheetUrls.slice(0, 6)) {
        if (color && fontFamily) break;
        try {
          const cssRes = await fetch(sheetUrl, {
            headers: { "User-Agent": BOT_UA },
            signal: AbortSignal.timeout(5000),
          });
          if (!cssRes.ok) continue;
          const css = (await cssRes.text()).slice(0, 100000);
          if (!color) color = findBestColorFromCss(css);
          if (!fontFamily) fontFamily = findFontFamilyFromCss(css);
          if (!fontFamily) fontFamily = extractGoogleFontFromCss(css);
        } catch { /* try next */ }
      }

      return { color, fontFamily };
    } catch {
      return { color: null, fontFamily: null };
    }
  },
});

// ── Color helpers ─────────────────────────────────────────────────────────────

function findBestColorFromCss(css: string): string | null {
  // Step 1: CSS custom properties with keyword names
  const varPattern = /--([\w-]+)\s*:\s*(#[0-9a-f]{3,8}|rgb\([^)]+\))/gi;
  const candidates: Array<{ name: string; color: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = varPattern.exec(css)) !== null) {
    const name = (m[1] ?? "").toLowerCase();
    const raw = m[2] ?? "";
    const color = normalizeColor(raw);
    if (color && !isNearWhite(color) && !isNearBlack(color)) {
      candidates.push({ name, color });
    }
  }
  // Prioritise by keyword relevance
  for (const kw of COLOR_VAR_KEYWORDS) {
    const hit = candidates.find((c) => c.name.includes(kw) && !isNearGray(c.color));
    if (hit) return hit.color;
  }
  // Try without the gray filter (some brands intentionally use dark grays)
  for (const kw of COLOR_VAR_KEYWORDS) {
    const hit = candidates.find((c) => c.name.includes(kw));
    if (hit) return hit.color;
  }

  // Step 2: Frequency-based fallback — most used non-white/non-black colored hex
  return findFrequentInterestingColor(css);
}

function findFrequentInterestingColor(css: string): string | null {
  const freq = new Map<string, number>();
  const pattern = /#([0-9a-f]{6}|[0-9a-f]{3})\b/gi;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(css)) !== null) {
    const color = normalizeColor(m[0]);
    if (color && !isNearWhite(color) && !isNearBlack(color) && !isNearGray(color)) {
      freq.set(color, (freq.get(color) ?? 0) + 1);
    }
  }
  if (freq.size === 0) return null;
  return [...freq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function isNearWhite(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r > 215 && g > 215 && b > 215;
}

function isNearBlack(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r < 40 && g < 40 && b < 40;
}

function isNearGray(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return Math.max(r, g, b) - Math.min(r, g, b) < 25;
}

// ── Font helpers ──────────────────────────────────────────────────────────────

function extractGoogleFont(html: string): string | null {
  // <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap">
  const pattern = /fonts\.googleapis\.com\/css2?\?[^"']*family=([A-Za-z0-9+]+)/i;
  const match = html.match(pattern);
  if (match?.[1]) return match[1].replace(/\+/g, " ");
  return null;
}

function extractGoogleFontFromCss(css: string): string | null {
  // @import url('https://fonts.googleapis.com/css2?family=Montserrat...')
  const pattern = /@import[^;]*fonts\.googleapis\.com\/css2?\?[^"')]*family=([A-Za-z0-9+]+)/i;
  const match = css.match(pattern);
  if (match?.[1]) return match[1].replace(/\+/g, " ");
  return null;
}

function findFontFamilyFromCss(css: string): string | null {
  // Step 1: CSS custom property variables with known font keywords
  const varPattern = /--([\w-]+)\s*:\s*["']?([A-Za-z][^"',;}{]+?)["']?\s*(?:,|;|})/gi;
  let m: RegExpExecArray | null;
  while ((m = varPattern.exec(css)) !== null) {
    const name = (m[1] ?? "").toLowerCase();
    const value = (m[2] ?? "").replace(/['"]/g, "").trim();
    if (!value || value.startsWith("var(")) continue;
    if (FONT_VAR_KEYWORDS.some((kw) => name.includes(kw))) {
      const clean = cleanFontName(value);
      if (clean) return clean;
    }
  }
  return null;
}

function cleanFontName(raw: string): string | null {
  // Extract first font name from a font stack like "Montserrat, sans-serif"
  const first = raw.split(",")[0]?.replace(/['"]/g, "").trim();
  if (!first || first.toLowerCase().startsWith("var(")) return null;
  // Skip generic font families
  const generics = ["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "inherit", "initial", "unset"];
  if (generics.includes(first.toLowerCase())) return null;
  return first;
}

// ── Stylesheet helpers ────────────────────────────────────────────────────────

function extractStylesheetUrls(html: string, base: URL): string[] {
  const urls: string[] = [];
  const re = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      urls.push(new URL(m[1]!, base).toString());
    } catch { /* skip malformed */ }
  }
  // Prioritise theme/main stylesheets — most likely to have brand variables
  const isMainSheet = (u: string) =>
    /\/themes?\//i.test(u) ||
    /\/theme\//i.test(u) ||
    /style\.css/i.test(u) ||
    /main\.css/i.test(u) ||
    /app\.css/i.test(u) ||
    /global\.css/i.test(u);
  return [...urls.filter(isMainSheet), ...urls.filter((u) => !isMainSheet(u))];
}

// ── Color normalisation ───────────────────────────────────────────────────────

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
    return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("").toLowerCase();
  }
  return null;
}
