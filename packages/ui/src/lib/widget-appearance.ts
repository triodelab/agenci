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

export function mergeWidgetAppearance(
  partial?: Partial<WidgetAppearance> | null,
): WidgetAppearance {
  return { ...DEFAULT_WIDGET_APPEARANCE_LIGHT, ...partial };
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
    width: "100%",
    height: "100%",
    backgroundColor: appearance.backgroundColor,
    ...widgetColorVars(appearance),
  };
}
