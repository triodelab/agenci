import { v } from "convex/values";
import { action } from "../_generated/server";

const CSS_COLOR_VARS = [
  "--primary",
  "--accent",
  "--brand",
  "--brand-color",
  "--color-primary",
  "--color-accent",
  "--color-brand",
  "--highlight",
];

const CSS_FONT_VARS = [
  "--font-normal",
  "--font-primary",
  "--font-main",
  "--font-body",
  "--font-base",
  "--font-special",
  "--font",
  "--heading-font",
  "--body-font",
  "--font-family",
  "--global-font-family",
];

const BOT_UA = "AgenciBot/1.0 (theme-color-extractor)";

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
      const head = html.slice(0, 60000);

      let color: string | null = null;
      let fontFamily: string | null = null;

      // 1. <meta name="theme-color">
      const metaMatch =
        head.match(/<meta[^>]+name=["']theme-color["'][^>]*content=["']([^"']+)["']/i) ??
        head.match(/<meta[^>]+content=["']([^"']+)["'][^>]*name=["']theme-color["']/i);
      if (metaMatch?.[1]) color = normalizeColor(metaMatch[1]);

      // 2. <meta name="msapplication-TileColor">
      if (!color) {
        const msMatch = head.match(
          /<meta[^>]+name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i,
        );
        if (msMatch?.[1]) color = normalizeColor(msMatch[1]);
      }

      // 3. CSS custom properties in inline <style> tags
      const inlineCss = [...head.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
        .map((m) => m[1] ?? "")
        .join("\n");
      if (!color) color = findCssVarColor(inlineCss);
      if (!fontFamily) fontFamily = findCssFontFamily(inlineCss);

      // 4. CSS custom properties in external stylesheets (theme sheets first, up to 5)
      const sheetUrls = extractStylesheetUrls(head, target);
      for (const sheetUrl of sheetUrls.slice(0, 5)) {
        if (color && fontFamily) break;
        try {
          const cssRes = await fetch(sheetUrl, {
            headers: { "User-Agent": BOT_UA },
            signal: AbortSignal.timeout(5000),
          });
          if (!cssRes.ok) continue;
          const css = cssRes.ok ? await cssRes.text() : "";
          const chunk = css.slice(0, 80000);
          if (!color) color = findCssVarColor(chunk);
          if (!fontFamily) fontFamily = findCssFontFamily(chunk);
        } catch {
          // try next sheet
        }
      }

      return { color, fontFamily };
    } catch {
      return { color: null, fontFamily: null };
    }
  },
});

function findCssVarColor(css: string): string | null {
  for (const varName of CSS_COLOR_VARS) {
    const pattern = new RegExp(
      `${varName}\\s*:\\s*(#[0-9a-f]{3,8}|rgb\\([^)]+\\))`,
      "i",
    );
    const match = css.match(pattern);
    if (match?.[1]) {
      const c = normalizeColor(match[1]);
      if (c) return c;
    }
  }
  return null;
}

function findCssFontFamily(css: string): string | null {
  // Check known CSS variable names first
  for (const varName of CSS_FONT_VARS) {
    const pattern = new RegExp(`${varName}\\s*:\\s*["']?([A-Za-z][^"',;}{]+?)["']?\\s*(?:,|;|})`, "i");
    const match = css.match(pattern);
    if (match?.[1]) {
      const name = match[1].replace(/['"]/g, "").trim();
      if (name && name.length > 1 && !name.startsWith("var(")) return name;
    }
  }
  return null;
}

function extractStylesheetUrls(html: string, base: URL): string[] {
  const urls: string[] = [];
  const re = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      urls.push(new URL(m[1]!, base).toString());
    } catch {
      // skip malformed URLs
    }
  }
  // Theme stylesheets are most likely to have brand CSS vars — check them first
  const isTheme = (u: string) => /\/themes?\//i.test(u);
  return [...urls.filter(isTheme), ...urls.filter((u) => !isTheme(u))];
}

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
      [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("").toLowerCase()
    );
  }
  return null;
}
