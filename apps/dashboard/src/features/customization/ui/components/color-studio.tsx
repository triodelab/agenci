/**
 * "Farger" for widget customization: ready-made themes, one main colour and
 * a simple overview of every colour in the widget.
 */
import { cn } from "@workspace/ui/lib/utils";
import type { WidgetAppearance } from "@workspace/ui/lib/widget-appearance";
import {
  CheckIcon,
  GlobeIcon,
  PaletteIcon,
  PipetteIcon,
  RotateCcwIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { dataText, Section } from "./customization-fields";

export type ColorKey =
  | "headerColor"
  | "headerTextColor"
  | "bubbleUserColor"
  | "bubbleUserTextColor"
  | "bubbleAssistantColor"
  | "bubbleAssistantTextColor"
  | "backgroundColor"
  | "inputBackgroundColor"
  | "inputBorderColor"
  | "inputTextColor"
  | "inputPlaceholderColor"
  | "bubbleButtonColor"
  | "bubbleButtonIconColor";

type Colors = Partial<Record<ColorKey, string>>;
/** `undefined` removes the override (back to the website's colour). */
export type ColorPatch = Partial<Record<ColorKey, string | undefined>>;

/** Every colour, grouped by the part of the widget it belongs to. */
const GROUPS: { label: string; colors: { key: ColorKey; label: string }[] }[] =
  [
    {
      label: "Toppfelt",
      colors: [
        { key: "headerColor", label: "Flate" },
        { key: "headerTextColor", label: "Tekst" },
      ],
    },
    {
      label: "Kundens boble",
      colors: [
        { key: "bubbleUserColor", label: "Flate" },
        { key: "bubbleUserTextColor", label: "Tekst" },
      ],
    },
    {
      label: "Agentens boble",
      colors: [
        { key: "bubbleAssistantColor", label: "Flate" },
        { key: "bubbleAssistantTextColor", label: "Tekst" },
      ],
    },
    {
      label: "Bakgrunn",
      colors: [{ key: "backgroundColor", label: "Flate" }],
    },
    {
      label: "Skrivefelt",
      colors: [
        { key: "inputBackgroundColor", label: "Flate" },
        { key: "inputTextColor", label: "Tekst" },
        { key: "inputBorderColor", label: "Kant" },
        { key: "inputPlaceholderColor", label: "Hint" },
      ],
    },
    {
      label: "Startknapp",
      colors: [
        { key: "bubbleButtonColor", label: "Flate" },
        { key: "bubbleButtonIconColor", label: "Ikon" },
      ],
    },
  ];

const ALL_COLORS = GROUPS.flatMap((g) => g.colors);

const THEMES: { name: string; colors: Colors | null }[] = [
  { name: "Fra nettsiden", colors: null },
  {
    name: "Kullgrå",
    colors: {
      headerColor: "#243236",
      headerTextColor: "#ffffff",
      bubbleUserColor: "#243236",
      bubbleUserTextColor: "#ffffff",
      bubbleButtonColor: "#243236",
      bubbleButtonIconColor: "#ffffff",
      backgroundColor: "#ffffff",
      bubbleAssistantColor: "#f1f3f2",
      bubbleAssistantTextColor: "#243236",
    },
  },
  {
    name: "Skog",
    colors: {
      headerColor: "#365c3d",
      headerTextColor: "#ffffff",
      bubbleUserColor: "#365c3d",
      bubbleUserTextColor: "#ffffff",
      bubbleButtonColor: "#365c3d",
      bubbleButtonIconColor: "#ffffff",
      backgroundColor: "#fbfcfb",
      bubbleAssistantColor: "#edf1ee",
      bubbleAssistantTextColor: "#1f2a22",
    },
  },
  {
    name: "Hav",
    colors: {
      headerColor: "#1f4e79",
      headerTextColor: "#ffffff",
      bubbleUserColor: "#1f4e79",
      bubbleUserTextColor: "#ffffff",
      bubbleButtonColor: "#1f4e79",
      bubbleButtonIconColor: "#ffffff",
      backgroundColor: "#ffffff",
      bubbleAssistantColor: "#eef3f8",
      bubbleAssistantTextColor: "#16283a",
    },
  },
  {
    name: "Terrakotta",
    colors: {
      headerColor: "#b5563a",
      headerTextColor: "#ffffff",
      bubbleUserColor: "#b5563a",
      bubbleUserTextColor: "#ffffff",
      bubbleButtonColor: "#b5563a",
      bubbleButtonIconColor: "#ffffff",
      backgroundColor: "#fffaf7",
      bubbleAssistantColor: "#f6ece6",
      bubbleAssistantTextColor: "#3a2219",
    },
  },
  {
    name: "Natt",
    colors: {
      headerColor: "#1b1e22",
      headerTextColor: "#e6eaea",
      bubbleUserColor: "#4f7cff",
      bubbleUserTextColor: "#ffffff",
      bubbleButtonColor: "#1b1e22",
      bubbleButtonIconColor: "#e6eaea",
      backgroundColor: "#111315",
      bubbleAssistantColor: "#1f2328",
      bubbleAssistantTextColor: "#e6eaea",
      inputBackgroundColor: "#16191c",
      inputBorderColor: "#2a2f35",
      inputTextColor: "#e6eaea",
      inputPlaceholderColor: "#6f767e",
    },
  },
];

const SWATCHES = [
  "#243236",
  "#111418",
  "#1f4e79",
  "#2f6fed",
  "#6d4aff",
  "#0f766e",
  "#365c3d",
  "#b5563a",
  "#c2410c",
  "#be185d",
];

const HEX = /^#[0-9a-f]{6}$/i;

function luminance(hex: string) {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** White or near-black, whichever reads best on `hex`. */
function readableOn(hex: string) {
  if (!HEX.test(hex)) return "#ffffff";
  const l = luminance(hex);
  return 1.05 / (l + 0.05) >= (l + 0.05) / (luminance("#111418") + 0.05)
    ? "#ffffff"
    : "#111418";
}

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };

export function ColorStudio({
  base,
  effective,
  overrides,
  brandColors,
  onChange,
}: {
  /** Widget defaults + the website's branding (no overrides). */
  base: WidgetAppearance;
  effective: WidgetAppearance;
  overrides: Colors;
  brandColors: string[];
  onChange: (patch: ColorPatch) => void;
}) {
  const [canPick, setCanPick] = useState(false);
  useEffect(() => setCanPick("EyeDropper" in window), []);

  const hasOverrides = ALL_COLORS.some(({ key }) => overrides[key]);
  const clearAll = Object.fromEntries(
    ALL_COLORS.map(({ key }) => [key, undefined]),
  ) as ColorPatch;
  const activeTheme = THEMES.find((t) =>
    t.colors
      ? ALL_COLORS.every(({ key }) => t.colors?.[key] === overrides[key])
      : !hasOverrides,
  )?.name;

  const hex = (k: ColorKey) => {
    const v = effective[k as keyof WidgetAppearance];
    return typeof v === "string" && HEX.test(v) ? v.toLowerCase() : "#ffffff";
  };
  const primary = hex("headerColor");
  const setPrimary = (c: string) => {
    const ink = readableOn(c);
    onChange({
      headerColor: c,
      bubbleUserColor: c,
      bubbleButtonColor: c,
      headerTextColor: ink,
      bubbleUserTextColor: ink,
      bubbleButtonIconColor: ink,
    });
  };
  const pick = async () => {
    const Ctor = (window as unknown as { EyeDropper?: EyeDropperCtor })
      .EyeDropper;
    if (!Ctor) return;
    try {
      const { sRGBHex } = await new Ctor().open();
      if (HEX.test(sRGBHex)) setPrimary(sRGBHex.toLowerCase());
    } catch {
      // Cancelled.
    }
  };

  const brand = [...new Set(brandColors.map((c) => c.toLowerCase()))].filter(
    (c) => HEX.test(c),
  );

  return (
    <Section
      icon={PaletteIcon}
      title="Farger"
      aside={
        hasOverrides ? (
          <button
            type="button"
            onClick={() => onChange(clearAll)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium text-(--agenci-ink-2) transition-colors hover:bg-[#f3f5f4] hover:text-(--agenci-ink) active:scale-[0.97] dark:hover:bg-white/5"
          >
            <RotateCcwIcon
              className="size-3.5"
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
            Tilbakestill
          </button>
        ) : null
      }
    >
      {/* Themes */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {THEMES.map((t) => {
          const c = { ...base, ...(t.colors ?? {}) };
          const active = activeTheme === t.name;
          return (
            <button
              key={t.name}
              type="button"
              onClick={() => onChange({ ...clearAll, ...(t.colors ?? {}) })}
              aria-pressed={active}
              className="group flex min-w-0 flex-col gap-1.5 text-left active:scale-[0.97] transition-transform duration-150"
            >
              <span
                className={cn(
                  "flex h-10 w-full overflow-hidden rounded-[10px] transition-shadow duration-200",
                  active
                    ? "shadow-[0_0_0_2px_#fff,0_0_0_3.5px_var(--agenci-ink)]"
                    : "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)] group-hover:shadow-[0_0_0_2px_#fff,0_0_0_3px_var(--agenci-line)]",
                )}
              >
                <span
                  className="flex-[2]"
                  style={{ background: c.headerColor }}
                />
                <span
                  className="flex-1"
                  style={{ background: c.bubbleAssistantColor }}
                />
                <span
                  className="flex-1"
                  style={{ background: c.backgroundColor }}
                />
              </span>
              <span
                className={cn(
                  "truncate text-[12px]",
                  active
                    ? "font-medium text-(--agenci-ink)"
                    : "text-(--agenci-ink-2)",
                )}
              >
                {t.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main colour */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[12px] bg-[#f6f7f6] px-3.5 py-3 dark:bg-white/5">
        <label className="flex cursor-pointer items-center gap-2.5">
          <span
            className="relative size-8 shrink-0 overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]"
            style={{ background: primary }}
          >
            <input
              type="color"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
              aria-label="Hovedfarge"
            />
          </span>
          <span>
            <span className="block text-[13px] font-medium text-(--agenci-ink)">
              Hovedfarge
            </span>
            <span
              className={cn(
                dataText,
                "block text-[12px] text-(--agenci-ink-3)",
              )}
            >
              {primary.toUpperCase()}
            </span>
          </span>
        </label>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {brand.map((c) => (
            <Swatch
              key={`b-${c}`}
              color={c}
              active={primary === c}
              onClick={() => setPrimary(c)}
              brand
            />
          ))}
          {brand.length ? (
            <span className="mx-1 h-4 w-px bg-(--agenci-line)" aria-hidden />
          ) : null}
          {SWATCHES.filter((c) => !brand.includes(c)).map((c) => (
            <Swatch
              key={c}
              color={c}
              active={primary === c}
              onClick={() => setPrimary(c)}
            />
          ))}
          {canPick ? (
            <button
              type="button"
              onClick={pick}
              title="Hent farge fra skjermen"
              aria-label="Hent farge fra skjermen"
              className="ml-0.5 flex size-6 items-center justify-center rounded-full text-(--agenci-ink-3) transition-colors hover:text-(--agenci-ink)"
            >
              <PipetteIcon
                className="size-3.5"
                strokeWidth={1.5}
                absoluteStrokeWidth
              />
            </button>
          ) : null}
        </div>
      </div>

      {/* Every colour, one row per part */}
      <div className="-my-1 divide-y divide-(--agenci-line)">
        {GROUPS.map((g) => (
          <div
            key={g.label}
            className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5"
          >
            <span className="min-w-[110px] flex-1 text-[13px] text-(--agenci-ink)">
              {g.label}
            </span>
            <div className="flex flex-wrap justify-end gap-1.5">
              {g.colors.map(({ key, label }) => (
                <ColorChip
                  key={key}
                  label={label}
                  name={`${g.label} – ${label.toLowerCase()}`}
                  value={hex(key)}
                  isCustom={Boolean(overrides[key])}
                  onChange={(v) => onChange({ [key]: v })}
                  onReset={() => onChange({ [key]: undefined })}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/** Small pill: colour dot (opens the picker) + what it colours. */
function ColorChip({
  label,
  name,
  value,
  isCustom,
  onChange,
  onReset,
}: {
  label: string;
  name: string;
  value: string;
  isCustom: boolean;
  onChange: (hex: string) => void;
  onReset: () => void;
}) {
  return (
    <span className="group relative inline-flex h-8 items-center rounded-full bg-[#f3f5f4] pr-3 pl-1 transition-colors hover:bg-[#eceeed] dark:bg-white/5 dark:hover:bg-white/10">
      <label
        className="flex cursor-pointer items-center gap-2"
        title={`${name} · ${value.toUpperCase()}`}
      >
        <span
          className="relative size-6 shrink-0 overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]"
          style={{ background: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
            aria-label={name}
          />
        </span>
        <span className="text-[12px] text-(--agenci-ink-2)">{label}</span>
      </label>
      {isCustom ? (
        <button
          type="button"
          onClick={onReset}
          aria-label={`Tilbakestill ${name.toLowerCase()}`}
          title="Tilbake til nettsidens farge"
          className="-mr-1.5 ml-1 flex size-5 items-center justify-center rounded-full text-(--agenci-ink-3) transition-colors hover:bg-white hover:text-(--agenci-ink) dark:hover:bg-white/10"
        >
          <RotateCcwIcon
            className="size-3"
            strokeWidth={1.5}
            absoluteStrokeWidth
          />
        </button>
      ) : null}
    </span>
  );
}

function Swatch({
  color,
  active,
  brand,
  onClick,
}: {
  color: string;
  active: boolean;
  brand?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${brand ? "Farge fra nettsiden" : "Farge"} ${color.toUpperCase()}`}
      title={
        brand ? `Fra nettsiden · ${color.toUpperCase()}` : color.toUpperCase()
      }
      className={cn(
        "flex size-6 items-center justify-center rounded-full transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] hover:scale-110 active:scale-[0.97]",
        active
          ? "shadow-[0_0_0_2px_#fff,0_0_0_3.5px_var(--agenci-ink)]"
          : "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]",
      )}
      style={{ background: color }}
    >
      {active ? (
        <CheckIcon
          className="size-3"
          style={{ color: readableOn(color) }}
          strokeWidth={2.5}
        />
      ) : brand ? (
        <GlobeIcon
          className="size-3"
          style={{ color: readableOn(color) }}
          strokeWidth={1.5}
          absoluteStrokeWidth
        />
      ) : null}
    </button>
  );
}
