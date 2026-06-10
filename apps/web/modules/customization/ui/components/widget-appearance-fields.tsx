"use client";

import type { WidgetAppearance } from "@workspace/ui/lib/widget-appearance";
import {
  DEFAULT_WIDGET_APPEARANCE_DARK,
  DEFAULT_WIDGET_APPEARANCE_LIGHT,
} from "@workspace/ui/lib/widget-appearance";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Slider } from "@workspace/ui/components/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";
import {
  AlignCenterHorizontal,
  CornerDownLeft,
  CornerDownRight,
  GripHorizontal,
  MessageCircle,
  Moon,
  Palette,
  Sun,
  XIcon,
} from "lucide-react";
import type { UseFormSetValue } from "react-hook-form";
import type { CSSProperties } from "react";
import { useCallback, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { WIDGET_COLOR_PRESETS } from "../../data/widget-appearance-presets";
import type { FormSchema } from "../../types";

const labelUi =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";

const POSITIONS = [
  ["center", AlignCenterHorizontal, "Sentrert"],
  ["bottom-right", CornerDownRight, "Høyre"],
  ["bottom-left", CornerDownLeft, "Venstre"],
  ["custom", GripHorizontal, "Tilpasset"],
] as const;

const STANDARD_THEMES = [
  { name: "Lys", design: DEFAULT_WIDGET_APPEARANCE_LIGHT, icon: Sun },
  { name: "Mørk", design: DEFAULT_WIDGET_APPEARANCE_DARK, icon: Moon },
];

const COLOR_ROWS: {
  label: string;
  key: keyof WidgetAppearance;
  textKey: keyof WidgetAppearance | null;
  textLabel: string | null;
  fallback?: string;
}[] = [
  {
    label: "Header",
    key: "headerColor",
    textKey: "headerTextColor",
    textLabel: "Tekst",
  },
  {
    label: "Bruker-boble",
    key: "bubbleUserColor",
    textKey: "bubbleUserTextColor",
    textLabel: "Tekst",
  },
  {
    label: "Assistent-boble",
    key: "bubbleAssistantColor",
    textKey: "bubbleAssistantTextColor",
    textLabel: "Tekst",
  },
  { label: "Bakgrunn", key: "backgroundColor", textKey: null, textLabel: null },
  {
    label: "Input ramme",
    key: "inputBorderColor",
    textKey: "inputBackgroundColor",
    textLabel: "Fyll",
  },
  {
    label: "Input tekst",
    key: "inputTextColor",
    textKey: null,
    textLabel: null,
    fallback: "#18181b",
  },
  {
    label: "Input placeholder",
    key: "inputPlaceholderColor",
    textKey: null,
    textLabel: null,
    fallback: "#71717a",
  },
];

function applyFullDesign(
  setValue: UseFormSetValue<FormSchema>,
  design: WidgetAppearance,
) {
  setValue("appearance", design, { shouldDirty: true });
}

const pillActive =
  "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 [&_svg]:text-primary-foreground";
const pillIdle =
  "border-border/80 bg-background text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:border-border/60 dark:bg-card/60";

/** Justering i forhåndsvisnings-canvas (ikke «tilpasset» — den har egen sandkasse). */
const PREVIEW_CANVAS_BY_POSITION: Record<
  Exclude<WidgetAppearance["position"], "custom">,
  string
> = {
  "bottom-right":
    "items-end justify-end pb-5 pr-4 pt-12 pl-5 sm:pb-8 sm:pr-8 sm:pt-16",
  "bottom-left":
    "items-end justify-start pb-5 pl-4 pt-12 pr-5 sm:pb-8 sm:pl-8 sm:pt-16",
  center: "items-center justify-center p-6 sm:p-10",
};

function previewDimensions(appearance: WidgetAppearance) {
  const w = Math.min(Math.max(appearance.width, 280), 560);
  const r = Math.min(appearance.borderRadius, 28);
  const boxH = Math.min(appearance.height, 720);
  const h = `min(78vh, ${boxH}px)` as const;
  return { w, r, boxH, h };
}

/** Selve chat-kortet (meldinger som ser ekte ut). */
export function WidgetChatPreviewCard({
  appearance,
  title,
  className,
  style,
}: {
  appearance: WidgetAppearance;
  title: string;
  className?: string;
  style?: CSSProperties;
}) {
  const { w, r, h } = previewDimensions(appearance);
  const headerFg = appearance.headerTextColor;

  return (
    <div
      className={cn(
        "flex w-full max-w-[min(100%,560px)] flex-col overflow-hidden border border-black/[0.07] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05] dark:border-white/[0.1] dark:ring-white/[0.06]",
        className,
      )}
      style={{
        width: w,
        height: h,
        maxHeight: "78vh",
        borderRadius: r,
        backgroundColor: appearance.backgroundColor,
        ...style,
      }}
    >
      <div
        className="flex min-h-0 shrink-0 items-center gap-2 px-3 py-3 sm:px-4 sm:py-3.5"
        style={{
          backgroundColor: appearance.headerColor,
          color: headerFg,
        }}
      >
        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-tight">
          {title.trim() || "Agenci"}
        </span>
        <span
          aria-hidden
          className="grid size-8 shrink-0 place-items-center rounded-full bg-black/5"
          style={{
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: `${headerFg}40`,
            color: headerFg,
          }}
        >
          <XIcon className="size-4 opacity-90" strokeWidth={2} />
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        <p className="text-center text-[10px] text-muted-foreground/90 tabular-nums">
          I dag · 14:32
        </p>
        <div
          className="ml-auto max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug shadow-sm"
          style={{
            backgroundColor: appearance.bubbleUserColor,
            color: appearance.bubbleUserTextColor,
          }}
        >
          Hei! Hva er åpningstidene deres?
        </div>
        <div
          className="max-w-[92%] rounded-2xl border px-3.5 py-2.5 text-[13px] leading-snug shadow-sm"
          style={{
            borderColor: `${appearance.inputBorderColor}80`,
            backgroundColor: appearance.bubbleAssistantColor,
            color: appearance.bubbleAssistantTextColor,
          }}
        >
          Hei 👋 Vi har åpent man–fre 09–16, lørdag 10–14. Trenger du noe mer?
        </div>
      </div>
      <div
        className="shrink-0 border-t px-3 py-3"
        style={{
          borderColor: `${appearance.inputBorderColor}66`,
          backgroundColor: appearance.inputBackgroundColor,
        }}
      >
        <div
          className="rounded-xl border px-3 py-2.5 text-[13px]"
          style={{
            borderColor: appearance.inputBorderColor,
            backgroundColor: appearance.inputBackgroundColor,
            color: appearance.inputTextColor,
          }}
        >
          <span style={{ color: appearance.inputPlaceholderColor }}>
            Skriv melding…
          </span>
        </div>
      </div>
    </div>
  );
}

/** Vanlig forhåndsvisning (sentrert / hjørne). */
function WidgetChatPreview({
  appearance,
  title,
}: {
  appearance: WidgetAppearance;
  title: string;
}) {
  return <WidgetChatPreviewCard appearance={appearance} title={title} />;
}

/** «Nettside»-ramme: dra widgeten for å sette customX / customY (avstand fra høyre og nederst). */
function CustomPlacementSandbox({
  appearance,
  title,
  setValue,
}: {
  appearance: WidgetAppearance;
  title: string;
  setValue: UseFormSetValue<FormSchema>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetWrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    startX: number;
    startY: number;
    startCx: number;
    startCy: number;
  } | null>(null);

  const { w } = previewDimensions(appearance);

  const clampAndSave = useCallback(
    (cx: number, cy: number) => {
      const cont = containerRef.current;
      const widget = widgetWrapRef.current;
      if (!cont || !widget) {
        return;
      }
      const cr = cont.getBoundingClientRect();
      const wr = widget.getBoundingClientRect();
      const maxCx = Math.max(8, cr.width - wr.width - 8);
      const maxCy = Math.max(8, cr.height - wr.height - 8);
      setValue(
        "appearance.customX",
        Math.round(Math.max(8, Math.min(cx, maxCx))),
        { shouldDirty: true },
      );
      setValue(
        "appearance.customY",
        Math.round(Math.max(8, Math.min(cy, maxCy))),
        { shouldDirty: true },
      );
    },
    [setValue],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      startCx: appearance.customX,
      startCy: appearance.customY,
    };

    const onMove = (ev: PointerEvent) => {
      if (!drag.current) {
        return;
      }
      const d = drag.current;
      const newCx = d.startCx - (ev.clientX - d.startX);
      const newCy = d.startCy - (ev.clientY - d.startY);
      clampAndSave(newCx, newCy);
    };

    const onUp = (ev: PointerEvent) => {
      drag.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      try {
        target.releasePointerCapture(ev.pointerId);
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  return (
    <div className="flex min-h-[min(420px,55vh)] w-full flex-1 flex-col gap-2 lg:min-h-0">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.14em]">
        Nettside (forhåndsvisning)
      </p>
      <div
        className="relative min-h-[min(380px,50vh)] flex-1 overflow-hidden rounded-xl border border-dashed border-border/70 bg-muted/25 sm:min-h-[420px]"
        ref={containerRef}
      >
        <p className="pointer-events-none absolute top-2 right-3 z-[1] max-w-[12rem] text-right text-[10px] leading-snug text-muted-foreground">
          Dra chat-vinduet dit du vil. Lagres som px fra høyre og nederst.
        </p>
        <div
          className="touch-none select-none"
          onPointerDown={onPointerDown}
          ref={widgetWrapRef}
          role="presentation"
          style={{
            position: "absolute",
            right: appearance.customX,
            bottom: appearance.customY,
            width: w,
            cursor: "grab",
          }}
        >
          <WidgetChatPreviewCard
            appearance={appearance}
            className="active:cursor-grabbing"
            title={title}
          />
        </div>
      </div>
    </div>
  );
}

export const WidgetAppearanceFields = () => {
  const { control, setValue } = useFormContext<FormSchema>();
  const appearance = useWatch({ control, name: "appearance" }) as
    | WidgetAppearance
    | undefined;
  const widgetTitle =
    (useWatch({ control, name: "widgetTitle" }) as string | undefined) ??
    "Agenci";

  if (!appearance) {
    return null;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:min-h-[min(calc(100vh-10.5rem),920px)] lg:flex-row">
      {/* Smalt panel: alle kontroller, faner for å pakke innhold */}
      <div className="flex max-h-none min-h-0 w-full shrink-0 flex-col border-border/50 bg-card/35 backdrop-blur-sm lg:w-[300px] lg:max-w-[300px] lg:border-border/60 lg:border-r xl:w-[320px] xl:max-w-[320px]">
        <div className="border-border/50 border-b px-4 py-3 lg:px-5">
          <p className="text-[11px] leading-snug text-muted-foreground">
            Posisjon og størrelse for embed. Farger gjelder chat-vinduet.
          </p>
        </div>

        <Tabs className="flex min-h-0 flex-1 flex-col gap-0" defaultValue="layout">
          <div className="shrink-0 px-3 pt-3 lg:px-4">
            <TabsList className="grid h-10 w-full grid-cols-3 gap-1 rounded-xl border border-border/50 bg-muted/45 p-1">
              <TabsTrigger
                className="rounded-lg text-[12px] font-medium text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:hover:bg-primary/90"
                value="layout"
              >
                Oppsett
              </TabsTrigger>
              <TabsTrigger
                className="rounded-lg text-[12px] font-medium text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:hover:bg-primary/90"
                value="colors"
              >
                Farger
              </TabsTrigger>
              <TabsTrigger
                className="rounded-lg text-[12px] font-medium text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:hover:bg-primary/90"
                value="bubble"
              >
                Boble
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            className="mt-0 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4 lg:px-5"
            value="layout"
          >
            <div className="space-y-5">
              <FormField
                control={control}
                name="widgetTitle"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className={labelUi}>Tittel i widget</FormLabel>
                    <FormControl>
                      <Input
                        className="h-9 rounded-lg border-border/70 bg-background text-[13px] shadow-sm"
                        placeholder="Agenci"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label className={labelUi}>Posisjon</Label>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-2">
                  {POSITIONS.map(([pos, Icon, label]) => (
                    <button
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11px] font-medium transition-colors",
                        appearance.position === pos ? pillActive : pillIdle,
                      )}
                      key={pos}
                      onClick={() =>
                        setValue("appearance.position", pos, {
                          shouldDirty: true,
                        })
                      }
                      type="button"
                    >
                      <Icon className="size-3 shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
              ))}
            </div>
            {appearance.position === "custom" ? (
              <p className="text-[10px] leading-snug text-muted-foreground">
                I forhåndsvisningen til høyre: dra chat-vinduet dit du vil på
                «nettsiden». Posisjon lagres som avstand fra høyre og nederst.
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <Label className={labelUi}>Størrelse</Label>
                <div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Bredde</span>
                    <span className="tabular-nums">{appearance.width}px</span>
                  </div>
                  <Slider
                    className="mt-1.5"
                    max={560}
                    min={280}
                    onValueChange={([v]) => {
                      if (v !== undefined) {
                        setValue("appearance.width", v, { shouldDirty: true });
                      }
                    }}
                    step={10}
                    value={[appearance.width ?? 400]}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Høyde</span>
                    <span className="tabular-nums">{appearance.height}px</span>
                  </div>
                  <Slider
                    className="mt-1.5"
                    max={800}
                    min={360}
                    onValueChange={([v]) => {
                      if (v !== undefined) {
                        setValue("appearance.height", v, { shouldDirty: true });
                      }
                    }}
                    step={20}
                    value={[appearance.height ?? 600]}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Avrunding</span>
                    <span className="tabular-nums">
                      {appearance.borderRadius}px
                    </span>
                  </div>
                  <Slider
                    className="mt-1.5"
                    max={32}
                    min={0}
                    onValueChange={([v]) => {
                      if (v !== undefined) {
                        setValue("appearance.borderRadius", v, {
                          shouldDirty: true,
                        });
                      }
                    }}
                    step={2}
                    value={[appearance.borderRadius ?? 16]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className={cn(labelUi, "flex items-center gap-1.5")}>
                  <Palette className="size-3" />
                  Standard tema
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {STANDARD_THEMES.map((t) => {
                    const Icon = t.icon;
                    const active =
                      appearance.headerColor === t.design.headerColor &&
                      appearance.backgroundColor === t.design.backgroundColor;
                    return (
                      <button
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-lg border px-2 py-2.5 text-[12px] font-medium transition-colors",
                          active ? pillActive : pillIdle,
                        )}
                        key={t.name}
                        onClick={() => applyFullDesign(setValue, t.design)}
                        type="button"
                      >
                        <Icon className="size-3.5 shrink-0" />
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            className="mt-0 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4 lg:px-5"
            value="colors"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className={labelUi}>Fargepresetter</Label>
                <div className="grid max-h-[240px] grid-cols-2 gap-1.5 overflow-y-auto pr-0.5 sm:grid-cols-2">
                  {WIDGET_COLOR_PRESETS.map((preset) => (
                    <button
                      className="flex min-w-0 items-center gap-1.5 rounded-lg border border-border/80 bg-background px-2 py-1.5 text-left text-[11px] font-medium text-foreground hover:bg-muted/60"
                      key={preset.name}
                      onClick={() => applyFullDesign(setValue, preset.design)}
                      title={preset.name}
                      type="button"
                    >
                      <span
                        className="size-3.5 shrink-0 rounded-full border border-border/80"
                        style={{ backgroundColor: preset.design.headerColor }}
                      />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className={labelUi}>Tilpass enkeltvis</Label>
                <div className="space-y-2.5">
                  {COLOR_ROWS.map(
                    ({ label, key, textKey, textLabel, fallback }) => (
                      <div
                        className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-background/50 px-2 py-1.5"
                        key={String(key)}
                      >
                        <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
                          {label}
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          <input
                            aria-label={`${label} hovedfarge`}
                            className="size-7 cursor-pointer rounded border border-border bg-transparent p-0.5"
                            onChange={(e) =>
                              setValue(`appearance.${key}`, e.target.value, {
                                shouldDirty: true,
                              })
                            }
                            title={
                              textKey && textLabel
                                ? `Ramme / ${textLabel}`
                                : label
                            }
                            type="color"
                            value={
                              (appearance[key] as string) ??
                              fallback ??
                              "#000000"
                            }
                          />
                          {textKey && textLabel ? (
                            <input
                              aria-label={`${label} ${textLabel.toLowerCase()}`}
                              className="size-6 cursor-pointer rounded border border-border bg-transparent p-0.5"
                              onChange={(e) =>
                                setValue(
                                  `appearance.${textKey}`,
                                  e.target.value,
                                  { shouldDirty: true },
                                )
                              }
                              title={textLabel}
                              type="color"
                              value={appearance[textKey] as string}
                            />
                          ) : null}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            className="mt-0 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4 lg:px-5"
            value="bubble"
          >
            <div className="space-y-5">
              <p className="text-[11px] leading-snug text-muted-foreground">
                Tilpass den flytende chat-knappen som vises på nettsiden din.
              </p>

              <div className="space-y-2">
                <Label className={labelUi}>Farger</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-background/50 px-2 py-1.5">
                    <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
                      Bakgrunnsfarge
                    </span>
                    <input
                      aria-label="Boble bakgrunnsfarge"
                      className="size-7 cursor-pointer rounded border border-border bg-transparent p-0.5"
                      onChange={(e) =>
                        setValue("appearance.bubbleButtonColor", e.target.value, {
                          shouldDirty: true,
                        })
                      }
                      type="color"
                      value={appearance.bubbleButtonColor ?? "#0f172a"}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-background/50 px-2 py-1.5">
                    <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
                      Ikonfarge
                    </span>
                    <input
                      aria-label="Boble ikonfarge"
                      className="size-7 cursor-pointer rounded border border-border bg-transparent p-0.5"
                      onChange={(e) =>
                        setValue("appearance.bubbleButtonIconColor", e.target.value, {
                          shouldDirty: true,
                        })
                      }
                      type="color"
                      value={appearance.bubbleButtonIconColor ?? "#ffffff"}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className={labelUi}>Størrelse</Label>
                <div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Diameter</span>
                    <span className="tabular-nums">{appearance.bubbleButtonSize ?? 60}px</span>
                  </div>
                  <Slider
                    className="mt-1.5"
                    max={80}
                    min={40}
                    onValueChange={([v]) => {
                      if (v !== undefined) {
                        setValue("appearance.bubbleButtonSize", v, { shouldDirty: true });
                      }
                    }}
                    step={4}
                    value={[appearance.bubbleButtonSize ?? 60]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className={labelUi}>Forhåndsvisning</Label>
                <div className="flex items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/25 py-8">
                  <div
                    className="flex items-center justify-center rounded-full shadow-lg"
                    style={{
                      width: appearance.bubbleButtonSize ?? 60,
                      height: appearance.bubbleButtonSize ?? 60,
                      backgroundColor: appearance.bubbleButtonColor ?? "#0f172a",
                      color: appearance.bubbleButtonIconColor ?? "#ffffff",
                    }}
                  >
                    <MessageCircle
                      style={{
                        width: Math.round((appearance.bubbleButtonSize ?? 60) * 0.4),
                        height: Math.round((appearance.bubbleButtonSize ?? 60) * 0.4),
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Hovedflate: sentrert / hjørne, eller sandkasse når «tilpasset» */}
      <div
        aria-label="Forhåndsvisning av chat-widget"
        className={cn(
          "dash-modal-dot-bg relative flex min-h-[min(420px,55vh)] flex-1 flex-col lg:min-h-0",
          appearance.position === "custom"
            ? "min-h-0 flex-1 p-3 sm:p-4"
            : cn(
                "px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10",
                PREVIEW_CANVAS_BY_POSITION[appearance.position],
              ),
        )}
      >
        {appearance.position === "custom" ? (
          <CustomPlacementSandbox
            appearance={appearance}
            setValue={setValue}
            title={widgetTitle}
          />
        ) : (
          <>
            <WidgetChatPreview appearance={appearance} title={widgetTitle} />
            {/* Floating bubble button indicator */}
            <div
              aria-hidden
              className="absolute bottom-5 flex items-center justify-center rounded-full shadow-lg"
              style={{
                [appearance.position === "bottom-left" ? "left" : "right"]: "20px",
                width: appearance.bubbleButtonSize ?? 60,
                height: appearance.bubbleButtonSize ?? 60,
                backgroundColor: appearance.bubbleButtonColor ?? "#0f172a",
                color: appearance.bubbleButtonIconColor ?? "#ffffff",
              }}
            >
              <MessageCircle
                style={{
                  width: Math.round((appearance.bubbleButtonSize ?? 60) * 0.4),
                  height: Math.round((appearance.bubbleButtonSize ?? 60) * 0.4),
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
