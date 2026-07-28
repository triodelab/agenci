"use node";
import { inflateSync } from "zlib";
import { v } from "convex/values";
import { action, internalAction } from "../_generated/server";

const BOT_UA =
  "Mozilla/5.0 (compatible; AgenciBot/1.0; +https://agenci.no/bot)";

const COLOR_VAR_KEYWORDS = [
  "primary", "brand", "accent", "highlight", "main", "key",
  "theme", "cta", "button", "action", "dominant", "corporate",
  "hero", "link", "interactive", "color",
];

const FONT_VAR_KEYWORDS = [
  "font-normal", "font-primary", "font-main", "font-body", "font-base",
  "font-special", "font-family", "heading-font", "body-font", "font",
  "global-font", "typeface",
];

// Matches any CSS color value: hex, rgb(a), hsl(a), oklch, lch
const COLOR_VAL =
  /#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|oklch\([^)]+\)|lch\([^)]+\)/i;
const COLOR_VAL_G =
  /#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|oklch\([^)]+\)|lch\([^)]+\)/gi;

async function fetchPngBuffer(url: string, timeoutMs = 5000): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": BOT_UA }, signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch { return null; }
}

async function runExtractThemeColor(url: string): Promise<{ color: string | null; fontFamily: string | null }> {
  let target: URL;
  try { target = new URL(url.trim()); } catch { return { color: null, fontFamily: null }; }
  if (target.protocol !== "http:" && target.protocol !== "https:") return { color: null, fontFamily: null };

  let vibrantColor: string | null = null;
  let fallbackColor: string | null = null;
  let fontFamily: string | null = null;

  const tryColor = (raw: string | null | undefined): void => {
    if (!raw) return;
    const c = normalizeColor(raw);
    if (!c) return;
    if (!isNearBlack(c) && !isNearWhite(c) && !isNearGray(c)) {
      vibrantColor = vibrantColor ?? c;
    } else {
      fallbackColor = fallbackColor ?? c;
    }
  };

  const domain = target.hostname;

  // ── Phase 1: Google Favicon Service (works for ANY domain, no HTML needed) ──
  // Google caches and serves favicons for all major websites reliably.
  const googleFaviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}`;
  const googlePng = await fetchPngBuffer(googleFaviconUrl, 5000);
  if (googlePng) tryColor(extractDominantColorFromPng(googlePng));

  // ── Phase 2: Fetch HTML for font info + additional color signals ─────────────
  let html = "";
  let base = target;
  try {
    const res = await fetch(target.toString(), {
      headers: { "User-Agent": BOT_UA },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      html = await res.text();
      base = new URL(res.url || target.toString());
    }
  } catch { /* continue with empty html */ }

  const head = html.slice(0, 100000);

  if (!fontFamily) fontFamily = extractGoogleFont(head);

  // ── Phase 3: SVG favicon (text-parsable, very accurate) ──────────────────────
  if (!vibrantColor) {
    const svgMatch = head.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+\.svg[^"']*)["']/i)
      ?? head.match(/<link[^>]+href=["']([^"']+\.svg[^"']*)["'][^>]+rel=["'][^"']*icon[^"']*["']/i);
    const svgUrl = svgMatch?.[1]
      ? new URL(svgMatch[1], base).toString()
      : new URL("/favicon.svg", base).toString();
    try {
      const sr = await fetch(svgUrl, { headers: { "User-Agent": BOT_UA }, signal: AbortSignal.timeout(3000) });
      if (sr.ok) tryColor(extractColorFromSvg(await sr.text()));
    } catch { /* skip */ }
  }

  // ── Phase 4: Apple touch icon PNG (solid brand background, 180×180) ──────────
  if (!vibrantColor) {
    const appleMatch = head.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i)
      ?? head.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon["']/i);
    const appleUrl = appleMatch?.[1]
      ? new URL(appleMatch[1], base).toString()
      : new URL("/apple-touch-icon.png", base).toString();
    const applePng = await fetchPngBuffer(appleUrl, 4000);
    if (applePng) tryColor(extractDominantColorFromPng(applePng));
  }

  // ── Phase 5: Meta theme-color (skip neutrals, try vibrant first) ─────────────
  if (!vibrantColor) {
    const metaA = head.match(/<meta[^>]+name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
    const metaB = head.match(/<meta[^>]+content=["']([^"']+)["'][^>]*name=["']theme-color["']/i);
    tryColor((metaA ?? metaB)?.[1]);
    if (!vibrantColor) {
      const mLink = head.match(/<link[^>]+rel=["']manifest["'][^>]*href=["']([^"']+)["']/i);
      if (mLink?.[1]) {
        try {
          const mr = await fetch(new URL(mLink[1], base).toString(), { headers: { "User-Agent": BOT_UA }, signal: AbortSignal.timeout(3000) });
          if (mr.ok) { const mj = await mr.json() as { theme_color?: string }; tryColor(mj.theme_color); }
        } catch { /* skip */ }
      }
    }
  }

  // ── Phase 6: CSS brand variables (inline + external) ─────────────────────────
  if (!vibrantColor || !fontFamily) {
    const inlineCss = [...head.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1] ?? "").join("\n");
    if (!vibrantColor) tryColor(findBestColorFromCss(inlineCss));
    if (!fontFamily) fontFamily = findFontFromCss(inlineCss);

    if (!vibrantColor || !fontFamily) {
      const sheets = extractStylesheetUrls(head, base);
      for (const sheetUrl of sheets.slice(0, 4)) {
        if (vibrantColor && fontFamily) break;
        try {
          const cr = await fetch(sheetUrl, { headers: { "User-Agent": BOT_UA }, signal: AbortSignal.timeout(5000) });
          if (!cr.ok) continue;
          const css = (await cr.text()).slice(0, 150000);
          if (!vibrantColor) tryColor(findBestColorFromCss(css));
          if (!fontFamily) { fontFamily = findFontFromCss(css) ?? extractGoogleFont(css); }
        } catch { /* skip */ }
      }
    }
  }

  return { color: vibrantColor ?? fallbackColor, fontFamily };
}

// ── PNG dominant color extractor ─────────────────────────────────────────────

function extractDominantColorFromPng(data: ArrayBuffer): string | null {
  try {
    const buf = Buffer.from(data);
    // Verify PNG signature
    if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) return null;

    let pos = 8;
    let width = 0, height = 0, bitDepth = 0, colorType = 0;
    const idatChunks: Buffer[] = [];

    while (pos + 12 <= buf.length) {
      const len = buf.readUInt32BE(pos);
      const type = buf.subarray(pos + 4, pos + 8).toString("ascii");
      const data = buf.subarray(pos + 8, pos + 8 + len);
      if (type === "IHDR") {
        width = data.readUInt32BE(0);
        height = data.readUInt32BE(4);
        bitDepth = data[8] ?? 8;
        colorType = data[9] ?? 2;
      } else if (type === "IDAT") {
        idatChunks.push(Buffer.from(data));
      } else if (type === "IEND") break;
      pos += 12 + len;
    }

    // Only handle 8-bit RGB or RGBA
    if ((colorType !== 2 && colorType !== 6) || bitDepth !== 8) return null;
    const bpp = colorType === 6 ? 4 : 3;
    const rowLen = width * bpp;

    let decompressed: Buffer;
    try { decompressed = inflateSync(Buffer.concat(idatChunks)); } catch { return null; }

    const colorFreq = new Map<string, number>();
    let prevRow = Buffer.alloc(rowLen, 0);

    for (let y = 0; y < height; y++) {
      const rowOff = y * (rowLen + 1);
      if (rowOff + rowLen >= decompressed.length) break;
      const filter = decompressed[rowOff] ?? 0;
      const raw = decompressed.subarray(rowOff + 1, rowOff + 1 + rowLen);
      const row = Buffer.alloc(rowLen);

      for (let i = 0; i < rowLen; i++) {
        const x = raw[i] ?? 0;
        const a = i >= bpp ? row[i - bpp] ?? 0 : 0;
        const b = prevRow[i] ?? 0;
        const c = i >= bpp ? prevRow[i - bpp] ?? 0 : 0;
        switch (filter) {
          case 0: row[i] = x; break;
          case 1: row[i] = (x + a) & 0xff; break;
          case 2: row[i] = (x + b) & 0xff; break;
          case 3: row[i] = (x + Math.floor((a + b) / 2)) & 0xff; break;
          case 4: {
            const p = a + b - c;
            const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
            row[i] = (x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
            break;
          }
          default: row[i] = x;
        }
      }
      prevRow = row;

      for (let x = 0; x < width; x++) {
        const i = x * bpp;
        const r = row[i] ?? 0, g = row[i + 1] ?? 0, b = row[i + 2] ?? 0;
        const alpha = bpp === 4 ? (row[i + 3] ?? 255) : 255;
        if (alpha < 100) continue;
        if (r > 240 && g > 240 && b > 240) continue; // skip white
        if (r < 20 && g < 20 && b < 20) continue;    // skip black
        const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        colorFreq.set(hex, (colorFreq.get(hex) ?? 0) + 1);
      }
    }

    if (colorFreq.size === 0) return null;

    // Score by saturation × frequency
    let best: string | null = null;
    let bestScore = -1;
    for (const [hex, count] of colorFreq) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      if (sat < 0.25) continue;
      const score = sat * 0.6 + Math.min(1, count / Math.max(1, width)) * 0.4;
      if (score > bestScore) { bestScore = score; best = hex; }
    }
    return best;
  } catch { return null; }
}

export const extractThemeColor = action({
  args: { url: v.string() },
  handler: async (_ctx, args): Promise<{ color: string | null; fontFamily: string | null }> => {
    return runExtractThemeColor(args.url);
  },
});

export const extractThemeColorInternal = internalAction({
  args: { url: v.string() },
  handler: async (_ctx, args): Promise<{ color: string | null; fontFamily: string | null }> => {
    return runExtractThemeColor(args.url);
  },
});

// ── SVG color extraction ──────────────────────────────────────────────────────

function extractColorFromSvg(svg: string): string | null {
  const fills: string[] = [];
  // fill="..." attributes
  const fillAttr = /\bfill=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = fillAttr.exec(svg)) !== null) {
    if (m[1] === "none" || m[1] === "currentColor") continue;
    const c = normalizeColor(m[1]!);
    if (c && !isNearWhite(c) && !isNearBlack(c)) fills.push(c);
  }
  // fill: ... in style attributes / <style> blocks
  const fillStyle = /\bfill\s*:\s*([^;}"'\s]+)/gi;
  while ((m = fillStyle.exec(svg)) !== null) {
    if (m[1] === "none" || m[1] === "currentColor") continue;
    const c = normalizeColor(m[1]!);
    if (c && !isNearWhite(c) && !isNearBlack(c)) fills.push(c);
  }
  if (fills.length === 0) return null;
  // Prefer the most vibrant (saturated) fill color, then most frequent
  return pickBestColor(fills);
}

// ── CSS color finding ─────────────────────────────────────────────────────────

function findBestColorFromCss(css: string): string | null {
  if (!css.trim()) return null;

  // Step 1: CSS custom properties with brand-keyword names
  const varPat = new RegExp(`--([\\.\\w-]+)\\s*:\\s*(${COLOR_VAL.source})`, "gi");
  const candidates: Array<{ name: string; color: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = varPat.exec(css)) !== null) {
    const name = (m[1] ?? "").toLowerCase();
    const color = normalizeColor(m[2] ?? "");
    if (color && !isNearWhite(color) && !isNearBlack(color)) {
      candidates.push({ name, color });
    }
  }
  // Match by keyword — prefer vibrant, fallback to any
  for (const kw of COLOR_VAR_KEYWORDS) {
    const hit = candidates.find((c) => c.name.includes(kw) && !isNearGray(c.color) && getSaturation(c.color) > 30);
    if (hit) return hit.color;
  }
  for (const kw of COLOR_VAR_KEYWORDS) {
    const hit = candidates.find((c) => c.name.includes(kw) && !isNearGray(c.color));
    if (hit) return hit.color;
  }
  for (const kw of COLOR_VAR_KEYWORDS) {
    const hit = candidates.find((c) => c.name.includes(kw));
    if (hit) return hit.color;
  }

  // Step 2: background-color on semantic selectors (buttons, headers, navs)
  const semantic = findColorOnSemanticSelectors(css);
  if (semantic) return semantic;

  // Step 3: Saturation-preferred frequency fallback
  return findFrequentVibrantColor(css);
}

function findColorOnSemanticSelectors(css: string): string | null {
  const blockPat = /([a-z0-9\s,._#:[\]"'=*^$~|>+~-]+?)\s*\{([^}]{0,600})\}/gi;
  const bgPat = /background(?:-color)?\s*:\s*([^;!}{]+)/i;
  let m: RegExpExecArray | null;
  while ((m = blockPat.exec(css)) !== null) {
    const sel = (m[1] ?? "").toLowerCase();
    if (!/(\.btn|button|\bcta\b|primary|brand|accent|\.hero|header\b|\.nav\b|navbar|nav\b)/.test(sel)) continue;
    const bg = bgPat.exec(m[2] ?? "");
    if (!bg) continue;
    const color = normalizeColor(bg[1]!.trim());
    if (color && !isNearWhite(color) && !isNearBlack(color) && getSaturation(color) > 30) return color;
  }
  return null;
}

function findColorInInlineStyles(html: string): string | null {
  const pat = /style=["'][^"']*background(?:-color)?\s*:\s*([^;"'}\s]+)/gi;
  const colors: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = pat.exec(html)) !== null) {
    const c = normalizeColor(m[1] ?? "");
    if (c && !isNearWhite(c) && !isNearBlack(c)) colors.push(c);
  }
  return colors.length > 0 ? pickBestColor(colors) : null;
}

/**
 * Frequency fallback — but VIBRANT colors (saturation > 60) win over
 * muted ones regardless of count. This prevents gray text (#333, #555)
 * from beating a blue button (#2563eb) just because it appears more often.
 */
function findFrequentVibrantColor(css: string): string | null {
  const freq = new Map<string, number>();
  let m: RegExpExecArray | null;
  const pat = new RegExp(COLOR_VAL_G.source, "gi");
  while ((m = pat.exec(css)) !== null) {
    const color = normalizeColor(m[0]);
    if (!color || isNearWhite(color) || isNearBlack(color)) continue;
    freq.set(color, (freq.get(color) ?? 0) + 1);
  }
  if (freq.size === 0) return null;

  const entries = [...freq.entries()];

  // Tier 1: vibrant (saturation > 60), sorted by count
  const vibrant = entries.filter(([c]) => getSaturation(c) > 60);
  if (vibrant.length > 0) return vibrant.sort((a, b) => b[1] - a[1])[0]![0];

  // Tier 2: any colored (saturation > 25), sorted by count
  const colored = entries.filter(([c]) => getSaturation(c) > 25);
  if (colored.length > 0) return colored.sort((a, b) => b[1] - a[1])[0]![0];

  return null;
}

// Pick the most vibrant color from a list, then most frequent
function pickBestColor(colors: string[]): string | null {
  if (colors.length === 0) return null;
  const freq = new Map<string, number>();
  for (const c of colors) freq.set(c, (freq.get(c) ?? 0) + 1);
  const entries = [...freq.entries()];
  const vibrant = entries.filter(([c]) => getSaturation(c) > 60);
  if (vibrant.length > 0) return vibrant.sort((a, b) => b[1] - a[1])[0]![0];
  const colored = entries.filter(([c]) => getSaturation(c) > 25);
  if (colored.length > 0) return colored.sort((a, b) => b[1] - a[1])[0]![0];
  return entries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

// ── Color utilities ───────────────────────────────────────────────────────────

function getSaturation(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function isNearWhite(hex: string): boolean {
  return parseInt(hex.slice(1, 3), 16) > 215
    && parseInt(hex.slice(3, 5), 16) > 215
    && parseInt(hex.slice(5, 7), 16) > 215;
}

function isNearBlack(hex: string): boolean {
  return parseInt(hex.slice(1, 3), 16) < 40
    && parseInt(hex.slice(3, 5), 16) < 40
    && parseInt(hex.slice(5, 7), 16) < 40;
}

function isNearGray(hex: string): boolean {
  return getSaturation(hex) < 25;
}

// ── Font helpers ──────────────────────────────────────────────────────────────

function extractGoogleFont(text: string): string | null {
  const m = text.match(/fonts\.googleapis\.com\/css2?\?[^"'\s)]*family=([A-Za-z0-9+]+)/i);
  return m?.[1] ? m[1].replace(/\+/g, " ") : null;
}

function findFontFromCss(css: string): string | null {
  if (!css.trim()) return null;

  // 1. CSS variable with font keyword
  const varPat = /--([\w-]+)\s*:\s*["']?([A-Za-z][^"',;}{]+?)["']?\s*(?:,|;|})/gi;
  let m: RegExpExecArray | null;
  while ((m = varPat.exec(css)) !== null) {
    const name = (m[1] ?? "").toLowerCase();
    const value = (m[2] ?? "").replace(/['"]/g, "").trim();
    if (!value || value.startsWith("var(")) continue;
    if (FONT_VAR_KEYWORDS.some((kw) => name.includes(kw))) {
      const clean = cleanFontName(value);
      if (clean) return clean;
    }
  }

  // 2. @font-face declarations (custom fonts loaded by the site)
  const fontFacePat = /@font-face\s*\{[^}]*font-family\s*:\s*["']?([^"';}{]+?)["']?\s*[;}/]/gi;
  while ((m = fontFacePat.exec(css)) !== null) {
    const clean = cleanFontName(m[1] ?? "");
    if (clean) return clean;
  }

  // 3. font-family on body / html / :root
  const bodyPat = /(?:body|html|:root)\s*\{[^}]*font-family\s*:\s*([^;}{]+)/gi;
  while ((m = bodyPat.exec(css)) !== null) {
    const clean = cleanFontName(m[1] ?? "");
    if (clean) return clean;
  }

  return null;
}

function cleanFontName(raw: string): string | null {
  const first = raw.split(",")[0]?.replace(/['"]/g, "").trim() ?? "";
  if (!first || first.toLowerCase().startsWith("var(")) return null;
  const generics = ["serif", "sans-serif", "monospace", "cursive", "fantasy",
    "system-ui", "inherit", "initial", "unset", "-apple-system"];
  if (generics.some((g) => first.toLowerCase() === g)) return null;
  if (first.length < 2 || first.length > 60) return null;
  return first;
}

// ── Stylesheet URL helpers ────────────────────────────────────────────────────

function extractStylesheetUrls(html: string, base: URL): string[] {
  const urls: string[] = [];
  const re = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try { urls.push(new URL(m[1]!, base).toString()); } catch { /* skip */ }
  }
  const isMain = (u: string) =>
    /\/themes?\//i.test(u) || /style\.css/i.test(u) || /main\.css/i.test(u) ||
    /app\.css/i.test(u) || /global\.css/i.test(u) || /base\.css/i.test(u) ||
    /site\.css/i.test(u) || /index\.css/i.test(u);
  return [...urls.filter(isMain), ...urls.filter((u) => !isMain(u))];
}

// ── Color normalisation ───────────────────────────────────────────────────────

function normalizeColor(raw: string): string | null {
  const v = raw.trim();

  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(v))
    return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`.toLowerCase();
  if (/^#[0-9a-f]{8}$/i.test(v)) return v.slice(0, 7).toLowerCase();

  // rgb / rgba
  const rgb = v.match(/^rgba?\(\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)/i);
  if (rgb) {
    const r = Math.min(255, parseInt(rgb[1]!, 10));
    const g = Math.min(255, parseInt(rgb[2]!, 10));
    const b = Math.min(255, parseInt(rgb[3]!, 10));
    return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("").toLowerCase();
  }

  // hsl / hsla — comma or space separated, optional deg unit
  const hsl = v.match(/^hsla?\(\s*(\d+(?:\.\d+)?)(?:deg)?\s*[,\s]\s*(\d+(?:\.\d+)?)%\s*[,\s]\s*(\d+(?:\.\d+)?)%/i);
  if (hsl) return hslToHex(parseFloat(hsl[1]!), parseFloat(hsl[2]!), parseFloat(hsl[3]!));

  // oklch (Tailwind v4, modern CSS)
  const ok = v.match(/^oklch\(\s*(\d+(?:\.\d+)?)(%?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/i);
  if (ok) {
    const L = ok[2] === "%" ? parseFloat(ok[1]!) / 100 : parseFloat(ok[1]!);
    return oklchToHex(L, parseFloat(ok[3]!), parseFloat(ok[4]!));
  }

  // lch
  const lch = v.match(/^lch\(\s*(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/i);
  if (lch) return lchToHex(parseFloat(lch[1]!), parseFloat(lch[2]!), parseFloat(lch[3]!));

  return null;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const hex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return "#" + hex(f(0)) + hex(f(8)) + hex(f(4));
}

function oklchToHex(L: number, C: number, h: number): string {
  const r = h * (Math.PI / 180);
  const a = C * Math.cos(r), b = C * Math.sin(r);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const ll = l_ ** 3, mm = m_ ** 3, ss = s_ ** 3;
  const rr =  4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss;
  const gg = -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss;
  const bb = -0.0041960863 * ll - 0.7034186147 * mm + 1.7076147010 * ss;
  const toS = (x: number) => { const c = Math.max(0, Math.min(1, x)); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1/2.4) - 0.055; };
  const hex = (x: number) => Math.round(toS(x) * 255).toString(16).padStart(2, "0");
  return "#" + hex(rr) + hex(gg) + hex(bb);
}

function lchToHex(L: number, C: number, h: number): string {
  const r = h * (Math.PI / 180);
  const a = C * Math.cos(r), b = C * Math.sin(r);
  const fy = (L + 16) / 116, fx = a / 500 + fy, fz = fy - b / 200;
  const d = 6/29, xyz = (t: number) => t > d ? t**3 : 3*d*d*(t - 4/29);
  const x = 0.95047 * xyz(fx), y = xyz(fy), z = 1.08883 * xyz(fz);
  const rr =  3.2406*x - 1.5372*y - 0.4986*z;
  const gg = -0.9689*x + 1.8758*y + 0.0415*z;
  const bb =  0.0557*x - 0.2040*y + 1.0570*z;
  const toS = (c: number) => { const cc = Math.max(0, Math.min(1, c)); return cc <= 0.0031308 ? 12.92*cc : 1.055*cc**(1/2.4) - 0.055; };
  const hex = (c: number) => Math.round(toS(c) * 255).toString(16).padStart(2, "0");
  return "#" + hex(rr) + hex(gg) + hex(bb);
}
