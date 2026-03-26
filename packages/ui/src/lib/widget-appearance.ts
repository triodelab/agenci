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
}

/** Typisk innebygd chat (bredde × høyde) — nær vanlige widget-rammer. */
export const DEFAULT_WIDGET_APPEARANCE_LIGHT: WidgetAppearance = {
  position: "center",
  customX: 24,
  customY: 24,
  width: 400,
  height: 600,
  borderRadius: 16,
  headerColor: "#18181b",
  headerTextColor: "#fafafa",
  bubbleUserColor: "#18181b",
  bubbleUserTextColor: "#ffffff",
  bubbleAssistantColor: "#f4f4f5",
  bubbleAssistantTextColor: "#18181b",
  backgroundColor: "#ffffff",
  inputBorderColor: "#e4e4e7",
  inputBackgroundColor: "#ffffff",
  inputTextColor: "#18181b",
  inputPlaceholderColor: "#71717a",
};

export const DEFAULT_WIDGET_APPEARANCE_DARK: WidgetAppearance = {
  position: "center",
  customX: 24,
  customY: 24,
  width: 400,
  height: 600,
  borderRadius: 16,
  headerColor: "#27272a",
  headerTextColor: "#fafafa",
  bubbleUserColor: "#fafafa",
  bubbleUserTextColor: "#18181b",
  bubbleAssistantColor: "#27272a",
  bubbleAssistantTextColor: "#e4e4e7",
  backgroundColor: "#0c0c0c",
  inputBorderColor: "#3f3f46",
  inputBackgroundColor: "#18181b",
  inputTextColor: "#fafafa",
  inputPlaceholderColor: "#a1a1aa",
};

export function mergeWidgetAppearance(
  partial?: Partial<WidgetAppearance> | null,
): WidgetAppearance {
  return { ...DEFAULT_WIDGET_APPEARANCE_LIGHT, ...partial };
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
    /** Respekter valgt høyde, men krymp på små skjermer så alt forblir synlig. */
    height: `min(${h}px, calc(100dvh - 1.5rem))`,
    minHeight: `min(${h}px, calc(100dvh - 1.5rem))`,
    maxHeight: `min(${h}px, calc(100dvh - 1.5rem))`,
    borderRadius: `${a.borderRadius}px`,
    backgroundColor: a.backgroundColor,
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
  };
}
