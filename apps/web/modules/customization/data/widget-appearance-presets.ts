/**
 * Fargepresetter for widget-tilpasning.
 * Hver preset er et komplett design med alle farger satt for optimal lesbarhet
 * i både lys og mørk kontekst (widgeten har egen bakgrunn).
 */
import type { WidgetAppearance } from "@workspace/ui/lib/widget-appearance";
import {
  DEFAULT_WIDGET_APPEARANCE_DARK,
  DEFAULT_WIDGET_APPEARANCE_LIGHT,
  mergeWidgetAppearance,
} from "@workspace/ui/lib/widget-appearance";

type PresetInput = Omit<
  Partial<WidgetAppearance>,
  "position" | "customX" | "customY" | "width" | "height" | "borderRadius"
>;

function lightPreset(overrides: PresetInput): WidgetAppearance {
  return mergeWidgetAppearance({
    ...DEFAULT_WIDGET_APPEARANCE_LIGHT,
    ...overrides,
  });
}

function darkPreset(overrides: PresetInput): WidgetAppearance {
  return mergeWidgetAppearance({
    ...DEFAULT_WIDGET_APPEARANCE_DARK,
    ...overrides,
  });
}

export interface WidgetColorPreset {
  name: string;
  design: WidgetAppearance;
}

/** Alle fargepresetter – naturlige, abstrakte og andre. Lys- og mørkvarianter der det gir mening. */
export const WIDGET_COLOR_PRESETS: WidgetColorPreset[] = [
  // ——— Klassiske (lys) ———
  {
    name: "Blå",
    design: lightPreset({
      headerColor: "#3b82f6",
      headerTextColor: "#ffffff",
      bubbleUserColor: "#2563eb",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#eff6ff",
      bubbleAssistantTextColor: "#1e3a8a",
      backgroundColor: "#ffffff",
      inputBorderColor: "#bfdbfe",
      inputBackgroundColor: "#ffffff",
      inputTextColor: "#18181b",
      inputPlaceholderColor: "#3b82f6",
    }),
  },
  {
    name: "Grønn",
    design: lightPreset({
      headerColor: "#059669",
      headerTextColor: "#ffffff",
      bubbleUserColor: "#047857",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#ecfdf5",
      bubbleAssistantTextColor: "#064e3b",
      backgroundColor: "#ffffff",
      inputBorderColor: "#a7f3d0",
      inputBackgroundColor: "#ffffff",
      inputTextColor: "#18181b",
      inputPlaceholderColor: "#059669",
    }),
  },
  {
    name: "Rosa",
    design: lightPreset({
      headerColor: "#ec4899",
      headerTextColor: "#ffffff",
      bubbleUserColor: "#db2777",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#fdf2f8",
      bubbleAssistantTextColor: "#831843",
      backgroundColor: "#ffffff",
      inputBorderColor: "#fbcfe8",
      inputBackgroundColor: "#ffffff",
      inputTextColor: "#18181b",
      inputPlaceholderColor: "#be185d",
    }),
  },

  // ——— Naturlige farger (lys) ———
  {
    name: "Skog",
    design: lightPreset({
      headerColor: "#166534",
      headerTextColor: "#fefce8",
      bubbleUserColor: "#15803d",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#f0fdf4",
      bubbleAssistantTextColor: "#14532d",
      backgroundColor: "#fafaf9",
      inputBorderColor: "#bbf7d0",
      inputBackgroundColor: "#ffffff",
      inputTextColor: "#18181b",
      inputPlaceholderColor: "#166534",
    }),
  },
  {
    name: "Hav",
    design: lightPreset({
      headerColor: "#0e7490",
      headerTextColor: "#f0fdfa",
      bubbleUserColor: "#0d9488",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#f0fdfa",
      bubbleAssistantTextColor: "#134e4a",
      backgroundColor: "#f8fafc",
      inputBorderColor: "#99f6e4",
      inputBackgroundColor: "#ffffff",
      inputTextColor: "#18181b",
      inputPlaceholderColor: "#0f766e",
    }),
  },
  {
    name: "Sand",
    design: lightPreset({
      headerColor: "#b45309",
      headerTextColor: "#fffbeb",
      bubbleUserColor: "#c2410c",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#fff7ed",
      bubbleAssistantTextColor: "#7c2d12",
      backgroundColor: "#fefce8",
      inputBorderColor: "#fed7aa",
      inputBackgroundColor: "#ffffff",
      inputTextColor: "#18181b",
      inputPlaceholderColor: "#9a3412",
    }),
  },
  {
    name: "Lavendel",
    design: lightPreset({
      headerColor: "#7c3aed",
      headerTextColor: "#faf5ff",
      bubbleUserColor: "#6d28d9",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#f5f3ff",
      bubbleAssistantTextColor: "#4c1d95",
      backgroundColor: "#fafafa",
      inputBorderColor: "#ddd6fe",
      inputBackgroundColor: "#ffffff",
      inputTextColor: "#18181b",
      inputPlaceholderColor: "#6d28d9",
    }),
  },
  {
    name: "Sol",
    design: lightPreset({
      headerColor: "#ca8a04",
      headerTextColor: "#18181b",
      bubbleUserColor: "#a16207",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#fefce8",
      bubbleAssistantTextColor: "#713f12",
      backgroundColor: "#fefce8",
      inputBorderColor: "#fde047",
      inputBackgroundColor: "#ffffff",
      inputTextColor: "#18181b",
      inputPlaceholderColor: "#854d0e",
    }),
  },
  {
    name: "Mynt",
    design: lightPreset({
      headerColor: "#0d9488",
      headerTextColor: "#f0fdfa",
      bubbleUserColor: "#0f766e",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#ccfbf1",
      bubbleAssistantTextColor: "#134e4a",
      backgroundColor: "#f0fdfa",
      inputBorderColor: "#5eead4",
      inputBackgroundColor: "#ffffff",
      inputTextColor: "#18181b",
      inputPlaceholderColor: "#0d9488",
    }),
  },

  // ——— Naturlige farger (mørk) ———
  {
    name: "Skog (mørk)",
    design: darkPreset({
      headerColor: "#166534",
      headerTextColor: "#fefce8",
      bubbleUserColor: "#22c55e",
      bubbleUserTextColor: "#052e16",
      bubbleAssistantColor: "#14532d",
      bubbleAssistantTextColor: "#dcfce7",
      backgroundColor: "#0c0c0c",
      inputBorderColor: "#166534",
      inputBackgroundColor: "#14532d",
      inputTextColor: "#f0fdf4",
      inputPlaceholderColor: "#86efac",
    }),
  },
  {
    name: "Hav (mørk)",
    design: darkPreset({
      headerColor: "#0e7490",
      headerTextColor: "#f0fdfa",
      bubbleUserColor: "#14b8a6",
      bubbleUserTextColor: "#042f2e",
      bubbleAssistantColor: "#134e4a",
      bubbleAssistantTextColor: "#ccfbf1",
      backgroundColor: "#0c0c0c",
      inputBorderColor: "#0e7490",
      inputBackgroundColor: "#134e4a",
      inputTextColor: "#f0fdfa",
      inputPlaceholderColor: "#5eead4",
    }),
  },
  {
    name: "Lavendel (mørk)",
    design: darkPreset({
      headerColor: "#6d28d9",
      headerTextColor: "#faf5ff",
      bubbleUserColor: "#8b5cf6",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#3b0764",
      bubbleAssistantTextColor: "#ede9fe",
      backgroundColor: "#0c0c0c",
      inputBorderColor: "#5b21b6",
      inputBackgroundColor: "#2e1065",
      inputTextColor: "#f5f3ff",
      inputPlaceholderColor: "#c4b5fd",
    }),
  },

  // ——— Abstrakte / moderne (lys) ———
  {
    name: "Slate",
    design: lightPreset({
      headerColor: "#475569",
      headerTextColor: "#f8fafc",
      bubbleUserColor: "#334155",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#f1f5f9",
      bubbleAssistantTextColor: "#1e293b",
      backgroundColor: "#ffffff",
      inputBorderColor: "#cbd5e1",
      inputBackgroundColor: "#ffffff",
      inputTextColor: "#18181b",
      inputPlaceholderColor: "#64748b",
    }),
  },
  {
    name: "Teal",
    design: lightPreset({
      headerColor: "#0d9488",
      headerTextColor: "#f0fdfa",
      bubbleUserColor: "#0f766e",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#f0fdfa",
      bubbleAssistantTextColor: "#134e4a",
      backgroundColor: "#f8fafc",
      inputBorderColor: "#99f6e4",
      inputBackgroundColor: "#ffffff",
      inputTextColor: "#18181b",
      inputPlaceholderColor: "#0d9488",
    }),
  },
  {
    name: "Indigo",
    design: lightPreset({
      headerColor: "#4f46e5",
      headerTextColor: "#eef2ff",
      bubbleUserColor: "#4338ca",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#eef2ff",
      bubbleAssistantTextColor: "#312e81",
      backgroundColor: "#fafafa",
      inputBorderColor: "#c7d2fe",
      inputBackgroundColor: "#ffffff",
      inputTextColor: "#18181b",
      inputPlaceholderColor: "#4338ca",
    }),
  },
  {
    name: "Fiolett",
    design: lightPreset({
      headerColor: "#7c3aed",
      headerTextColor: "#faf5ff",
      bubbleUserColor: "#6d28d9",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#f5f3ff",
      bubbleAssistantTextColor: "#4c1d95",
      backgroundColor: "#fafafa",
      inputBorderColor: "#ddd6fe",
      inputBackgroundColor: "#ffffff",
      inputTextColor: "#18181b",
      inputPlaceholderColor: "#6d28d9",
    }),
  },

  // ——— Abstrakte (mørk) ———
  {
    name: "Slate (mørk)",
    design: darkPreset({
      headerColor: "#334155",
      headerTextColor: "#f1f5f9",
      bubbleUserColor: "#475569",
      bubbleUserTextColor: "#f8fafc",
      bubbleAssistantColor: "#1e293b",
      bubbleAssistantTextColor: "#e2e8f0",
      backgroundColor: "#0f172a",
      inputBorderColor: "#334155",
      inputBackgroundColor: "#1e293b",
      inputTextColor: "#f8fafc",
      inputPlaceholderColor: "#94a3b8",
    }),
  },
  {
    name: "Indigo (mørk)",
    design: darkPreset({
      headerColor: "#4338ca",
      headerTextColor: "#eef2ff",
      bubbleUserColor: "#6366f1",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#312e81",
      bubbleAssistantTextColor: "#c7d2fe",
      backgroundColor: "#0f0f14",
      inputBorderColor: "#4338ca",
      inputBackgroundColor: "#1e1b4b",
      inputTextColor: "#eef2ff",
      inputPlaceholderColor: "#a5b4fc",
    }),
  },
  {
    name: "Teal (mørk)",
    design: darkPreset({
      headerColor: "#0f766e",
      headerTextColor: "#f0fdfa",
      bubbleUserColor: "#14b8a6",
      bubbleUserTextColor: "#042f2e",
      bubbleAssistantColor: "#134e4a",
      bubbleAssistantTextColor: "#99f6e4",
      backgroundColor: "#0c0c0c",
      inputBorderColor: "#0f766e",
      inputBackgroundColor: "#134e4a",
      inputTextColor: "#f0fdfa",
      inputPlaceholderColor: "#2dd4bf",
    }),
  },

  // ——— Ekstra (lys) ———
  {
    name: "Korall",
    design: lightPreset({
      headerColor: "#ea580c",
      headerTextColor: "#fff7ed",
      bubbleUserColor: "#c2410c",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#fff7ed",
      bubbleAssistantTextColor: "#7c2d12",
      backgroundColor: "#fefce8",
      inputBorderColor: "#fed7aa",
      inputBackgroundColor: "#ffffff",
      inputTextColor: "#18181b",
      inputPlaceholderColor: "#9a3412",
    }),
  },
  {
    name: "Eple",
    design: lightPreset({
      headerColor: "#16a34a",
      headerTextColor: "#f0fdf4",
      bubbleUserColor: "#15803d",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#dcfce7",
      bubbleAssistantTextColor: "#166534",
      backgroundColor: "#f0fdf4",
      inputBorderColor: "#86efac",
      inputBackgroundColor: "#ffffff",
      inputTextColor: "#18181b",
      inputPlaceholderColor: "#15803d",
    }),
  },
  {
    name: "Blå (mørk)",
    design: darkPreset({
      headerColor: "#1d4ed8",
      headerTextColor: "#eff6ff",
      bubbleUserColor: "#3b82f6",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#1e3a8a",
      bubbleAssistantTextColor: "#bfdbfe",
      backgroundColor: "#0c0c0c",
      inputBorderColor: "#1e40af",
      inputBackgroundColor: "#1e3a8a",
      inputTextColor: "#eff6ff",
      inputPlaceholderColor: "#93c5fd",
    }),
  },
  {
    name: "Rosa (mørk)",
    design: darkPreset({
      headerColor: "#be185d",
      headerTextColor: "#fdf2f8",
      bubbleUserColor: "#ec4899",
      bubbleUserTextColor: "#ffffff",
      bubbleAssistantColor: "#831843",
      bubbleAssistantTextColor: "#fbcfe8",
      backgroundColor: "#0c0c0c",
      inputBorderColor: "#9d174d",
      inputBackgroundColor: "#831843",
      inputTextColor: "#fdf2f8",
      inputPlaceholderColor: "#f9a8d4",
    }),
  },
];
