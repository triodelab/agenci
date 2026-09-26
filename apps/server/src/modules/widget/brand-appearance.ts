/**
 * Maps the branding extracted from the customer's website during onboarding
 * (`AgentWidgetBrand`, Firecrawl `formats: ["branding"]`) onto the widget's
 * `WidgetAppearance` (packages/ui). Only colors we actually have are sent;
 * the widget fills the rest from its defaults and recomputes text contrast
 * for header / user bubble / launcher in `mergeWidgetAppearance`.
 */

type BrandRow = {
  colorScheme: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  backgroundColor: string | null;
  textPrimaryColor: string | null;
  textSecondaryColor: string | null;
  fontFamilyPrimary: string | null;
};

export type WidgetAppearancePatch = {
  headerColor?: string;
  bubbleUserColor?: string;
  bubbleButtonColor?: string;
  backgroundColor?: string;
  bubbleAssistantColor?: string;
  bubbleAssistantTextColor?: string;
  inputBackgroundColor?: string;
  inputBorderColor?: string;
  inputTextColor?: string;
  inputPlaceholderColor?: string;
  fontFamily?: string;
};

const DARK_FALLBACK_BG = "#0f1011";
const LIGHT_FALLBACK_TEXT = "#18181b";
const DARK_FALLBACK_TEXT = "#f7f8f8";

function hex(value: string | null | undefined): string | null {
  const v = value?.trim();
  return v && /^#[0-9a-f]{6}$/i.test(v) ? v.toUpperCase() : null;
}

/** Linear blend of two #RRGGBB colors — `amount` 0 = a, 1 = b. */
function mix(a: string, b: string, amount: number): string {
  const channel = (c: string, i: number) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
  const out = [0, 1, 2].map((i) =>
    Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * amount)
      .toString(16)
      .padStart(2, "0"),
  );
  return `#${out.join("")}`.toUpperCase();
}

function fontStack(family: string | null | undefined): string | null {
  const name = family?.trim().replace(/['"]/g, "");
  return name ? `"${name}", ui-sans-serif, system-ui, sans-serif` : null;
}

export function brandToWidgetAppearance(
  brand: BrandRow | null | undefined,
): WidgetAppearancePatch | null {
  if (!brand) return null;

  const isDark = brand.colorScheme === "dark";
  const primary = hex(brand.primaryColor) ?? hex(brand.accentColor);
  const background = hex(brand.backgroundColor) ?? (isDark ? DARK_FALLBACK_BG : null);
  const text =
    hex(brand.textPrimaryColor) ?? (background ? (isDark ? DARK_FALLBACK_TEXT : LIGHT_FALLBACK_TEXT) : null);
  const font = fontStack(brand.fontFamilyPrimary);

  const patch: WidgetAppearancePatch = {};

  if (primary) {
    patch.headerColor = primary;
    patch.bubbleUserColor = primary;
    patch.bubbleButtonColor = primary;
  }

  if (background && text) {
    patch.backgroundColor = background;
    patch.inputBackgroundColor = background;
    // Assistant bubble: a quiet tint of the page's own text color so it reads
    // as a surface on the brand background without introducing a new hue.
    patch.bubbleAssistantColor = mix(background, text, isDark ? 0.1 : 0.06);
    patch.bubbleAssistantTextColor = text;
    patch.inputBorderColor = mix(background, text, isDark ? 0.2 : 0.14);
    patch.inputTextColor = text;
    patch.inputPlaceholderColor = hex(brand.textSecondaryColor) ?? mix(background, text, 0.5);
  }

  if (font) {
    patch.fontFamily = font;
  }

  return Object.keys(patch).length > 0 ? patch : null;
}
