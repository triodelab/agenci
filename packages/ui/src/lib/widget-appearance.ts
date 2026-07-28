import type { CSSProperties } from "react";

export type WidgetPosition =
  | "center"
  | "bottom-right"
  | "bottom-left"
  | "custom";

/** Full widget chrome + bubble colors (persisted per org). */
export interface WidgetAppearance {
  position: WidgetPosition;
  customX: number;
  customY: number;
  width: number;
  height: number;
  borderRadius: number;
  headerColor: string;
  headerTextColor: string;
  bubbleUserColor: string;
  bubbleUserTextColor: string;
  bubbleAssistantColor: string;
  bubbleAssistantTextColor: string;
  backgroundColor: string;
  inputBorderColor: string;
  inputBackgroundColor: string;
  inputTextColor: string;
  inputPlaceholderColor: string;
  /** Floating trigger button on the host page */
  bubbleButtonColor: string;
  bubbleButtonIconColor: string;
  bubbleButtonSize: number;
  /** Brand font family extracted from the customer's website */
  fontFamily?: string;
}

/** Typisk innebygd chat (bredde × høyde) — nær vanlige widget-rammer. */
export const DEFAULT_WIDGET_APPEARANCE_LIGHT: WidgetAppearance = {
  position: "center",
  customX: 24,
  customY: 24,
  width: 400,
  height: 600,
  borderRadius: 16,
  headerColor: "#5e6ad2",
  headerTextColor: "#ffffff",
  bubbleUserColor: "#5e6ad2",
  bubbleUserTextColor: "#ffffff",
  bubbleAssistantColor: "#f4f4f5",
  bubbleAssistantTextColor: "#18181b",
  backgroundColor: "#ffffff",
  inputBorderColor: "#e4e4e7",
  inputBackgroundColor: "#ffffff",
  inputTextColor: "#18181b",
  inputPlaceholderColor: "#8a8f98",
  bubbleButtonColor: "#5e6ad2",
  bubbleButtonIconColor: "#ffffff",
  bubbleButtonSize: 60,
};

export const DEFAULT_WIDGET_APPEARANCE_DARK: WidgetAppearance = {
  position: "center",
  customX: 24,
  customY: 24,
  width: 400,
  height: 600,
  borderRadius: 16,
  headerColor: "#5e6ad2",
  headerTextColor: "#f7f8f8",
  bubbleUserColor: "#5e6ad2",
  bubbleUserTextColor: "#ffffff",
  bubbleAssistantColor: "#23252a",
  bubbleAssistantTextColor: "#d0d6e0",
  backgroundColor: "#0f1011",
  inputBorderColor: "#23252a",
  inputBackgroundColor: "#0f1011",
  inputTextColor: "#f7f8f8",
  inputPlaceholderColor: "#8a8f98",
  bubbleButtonColor: "#5e6ad2",
  bubbleButtonIconColor: "#ffffff",
  bubbleButtonSize: 60,
};

/**
 * Returns the optimal text color (#ffffff or #18181b) for a background.
 *
 * Uses WCAG luminance as baseline, but overrides for vibrant/saturated brand
 * colors: brands almost always pair vibrant colors with white text, and the
 * pure WCAG formula picks black on mid-luminance vibrant colors (hot pink,
 * orange, etc.) which looks wrong. Yellow hues are the exception.
 */
export function getContrastTextColor(bgHex: string): "#ffffff" | "#18181b" {
  const hex = bgHex.replace("#", "");
  if (hex.length !== 6) return "#ffffff";

  const ri = parseInt(hex.slice(0, 2), 16) / 255;
  const gi = parseInt(hex.slice(2, 4), 16) / 255;
  const bi = parseInt(hex.slice(4, 6), 16) / 255;

  // WCAG relative luminance
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const L = 0.2126 * toLinear(ri) + 0.7152 * toLinear(gi) + 0.0722 * toLinear(bi);

  // Very light → always dark text; very dark → always white text
  if (L > 0.55) return "#18181b";
  if (L < 0.04) return "#ffffff";

  // HSL saturation + lightness
  const max = Math.max(ri, gi, bi);
  const min = Math.min(ri, gi, bi);
  const d = max - min;
  const sat = max === 0 ? 0 : d / max;
  const lightness = (max + min) / 2;

  // Vibrant saturated colors (brand colors) → white text,
  // UNLESS they're in the yellow hue range (50–70°) which is naturally light.
  if (sat > 0.35 && lightness < 0.72) {
    let hue = 0;
    if (d > 0) {
      if (max === ri) hue = ((gi - bi) / d + 6) % 6;
      else if (max === gi) hue = (bi - ri) / d + 2;
      else hue = (ri - gi) / d + 4;
      hue *= 60;
    }
    const isYellow = hue >= 45 && hue <= 75;
    if (!isYellow) return "#ffffff";
  }

  // Fallback: pure WCAG decision
  return L > 0.179 ? "#18181b" : "#ffffff";
}

export function mergeWidgetAppearance(
  partial?: Partial<WidgetAppearance> | null,
): WidgetAppearance {
  const merged = { ...DEFAULT_WIDGET_APPEARANCE_LIGHT, ...partial };
  // If user/button bubble colors weren't explicitly saved, inherit the header color
  if (partial?.headerColor) {
    if (!partial.bubbleUserColor) merged.bubbleUserColor = partial.headerColor;
    if (!partial.bubbleButtonColor) merged.bubbleButtonColor = partial.headerColor;
  }
  // Auto-compute text colors — also corrects legacy stored "#ffffff" on light backgrounds
  if (merged.headerColor) {
    const ideal = getContrastTextColor(merged.headerColor);
    if (!partial?.headerTextColor || (partial.headerTextColor === "#ffffff" && ideal === "#18181b")) {
      merged.headerTextColor = ideal;
    }
  }
  if (merged.bubbleUserColor) {
    const ideal = getContrastTextColor(merged.bubbleUserColor);
    if (!partial?.bubbleUserTextColor || (partial.bubbleUserTextColor === "#ffffff" && ideal === "#18181b")) {
      merged.bubbleUserTextColor = ideal;
    }
  }
  if (merged.bubbleButtonColor) {
    const ideal = getContrastTextColor(merged.bubbleButtonColor);
    if (!partial?.bubbleButtonIconColor || (partial.bubbleButtonIconColor === "#ffffff" && ideal === "#18181b")) {
      merged.bubbleButtonIconColor = ideal;
    }
  }
  return merged;
}

function widgetColorVars(a: WidgetAppearance): CSSProperties {
  return {
    ["--widget-bg" as string]: a.backgroundColor,
    ["--widget-header-bg" as string]: a.headerColor,
    ["--widget-header-text" as string]: a.headerTextColor,
    ["--widget-bubble-user-bg" as string]: a.bubbleUserColor,
    ["--widget-bubble-user-text" as string]: a.bubbleUserTextColor,
    ["--widget-bubble-assistant-bg" as string]: a.bubbleAssistantColor,
    ["--widget-bubble-assistant-text" as string]: a.bubbleAssistantTextColor,
    ["--widget-input-border" as string]: a.inputBorderColor,
    ["--widget-input-bg" as string]: a.inputBackgroundColor,
    ["--widget-input-text" as string]: a.inputTextColor,
    ["--widget-input-placeholder" as string]: a.inputPlaceholderColor,
    ...(a.fontFamily ? { ["--widget-font-family" as string]: a.fontFamily } : {}),
  };
}

/** Inline styles + CSS variables for the widget root (`<main>`). */
export function widgetAppearanceToRootStyle(
  appearance: WidgetAppearance,
): CSSProperties {
  const a = appearance;
  const h = a.height;
  return {
    width: `${a.width}px`,
    maxWidth: "100%",
    boxSizing: "border-box",
    height: `min(${h}px, calc(100dvh - 1.5rem))`,
    minHeight: `min(${h}px, calc(100dvh - 1.5rem))`,
    maxHeight: `min(${h}px, calc(100dvh - 1.5rem))`,
    borderRadius: `${a.borderRadius}px`,
    backgroundColor: a.backgroundColor,
    ...widgetColorVars(a),
  };
}

/** Full-viewport style for standalone / new-tab mode — no size constraints. */
export function widgetAppearanceToStandaloneStyle(
  appearance: WidgetAppearance,
): CSSProperties {
  return {
    width: "100dvw",
    height: "100dvh",
    maxWidth: "100%",
    maxHeight: "100%",
    backgroundColor: appearance.backgroundColor,
    borderRadius: 0,
    ...widgetColorVars(appearance),
  };
}
