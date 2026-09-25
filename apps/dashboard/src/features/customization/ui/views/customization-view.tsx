/**
 * Widget customization: settings on the left, the real widget live on the
 * right. Every change shows instantly in the preview; "Lagre" publishes it to
 * the customer's website.
 */
import { cn } from "@workspace/ui/lib/utils";
import {
  DEFAULT_WIDGET_APPEARANCE_LIGHT,
  type WidgetAppearance,
} from "@workspace/ui/lib/widget-appearance";
import {
  LayoutTemplateIcon,
  MessageSquareTextIcon,
  MousePointerClickIcon,
  RefreshCwIcon,
  SparklesIcon,
  TypeIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AgenciLoader } from "@/components/agenci-loader";
import { Segment } from "@/components/segment";
import { getWidgetPreviewUrl } from "@/lib/widget-preview-url";
import {
  useSaveWidgetCustomizationMutation,
  useWidgetCustomizationQuery,
  useWidgetSiteQuery,
  type WidgetAppearanceDraft,
  type WidgetCustomization,
} from "../../queries/customization-queries";
import { BehaviorSettings } from "../components/behavior-settings";
import { type ColorPatch, ColorStudio } from "../components/color-studio";
import {
  dataText,
  Field,
  RangeField,
  Section,
  Switch,
  TextArea,
  TextInput,
} from "../components/customization-fields";
import {
  type Device,
  WidgetLivePreview,
} from "../components/widget-live-preview";

const FONTS = [
  { label: "Fra nettsiden", value: null },
  { label: "Inter", value: "Inter" },
  { label: "DM Sans", value: "DM Sans" },
  { label: "Manrope", value: "Manrope" },
  { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans" },
  { label: "Nunito", value: "Nunito" },
  { label: "Lora (serif)", value: "Lora" },
] as const;

const DEFAULT_GREETING = "Hei! Hvordan kan jeg hjelpe deg i dag?";

/** Drop empty values so "unchanged" compares equal. */
function normalize(c: WidgetCustomization): WidgetCustomization {
  const appearance = Object.fromEntries(
    Object.entries(c.appearance ?? {}).filter(
      ([, v]) => v !== undefined && v !== "",
    ),
  ) as WidgetAppearanceDraft;
  const suggestions = (c.suggestions ?? []).map((s) => s.trim());
  return {
    title: c.title?.trim() || null,
    greeting: c.greeting?.trim() || null,
    suggestions: suggestions.some(Boolean) ? suggestions : [],
    hideBranding: c.hideBranding ?? false,
    appearance,
    behavior: cleanBehavior(c.behavior),
  };
}

/** Drop blank rules/topics and empty values so "unchanged" compares equal. */
function cleanBehavior(b: WidgetCustomization["behavior"]) {
  if (!b) return {};
  const rules = (b.rules ?? []).filter((r) => r.text.trim());
  const avoidTopics = (b.avoidTopics ?? []).filter((t) => t.trim());
  const escalation = b.escalation
    ? {
        ...b.escalation,
        contact: b.escalation.contact?.trim() || undefined,
      }
    : undefined;
  return Object.fromEntries(
    Object.entries({
      ...b,
      rules: rules.length ? rules : undefined,
      avoidTopics: avoidTopics.length ? avoidTopics : undefined,
      escalation,
    }).filter(([, v]) => v !== undefined),
  ) as NonNullable<WidgetCustomization["behavior"]>;
}

function loadFontPreview(name: string) {
  const id = `font-preview-${name.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@400;600&display=swap`;
  document.head.appendChild(link);
}

export function CustomizationView({ agentId }: { agentId: string }) {
  const { data, isPending, isError } = useWidgetCustomizationQuery(agentId);
  const save = useSaveWidgetCustomizationMutation(agentId);
  const [draft, setDraft] = useState<WidgetCustomization | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  // The real website from onboarding, behind the live widget.
  const { data: site, isPending: siteLoading } = useWidgetSiteQuery(
    agentId,
    device,
  );
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<"look" | "behavior">("look");
  const [previewKey, setPreviewKey] = useState(0);

  // Start from what's saved (and again after every save).
  useEffect(() => {
    if (data) setDraft(normalize(data.saved));
  }, [data]);

  const saved = useMemo(() => (data ? normalize(data.saved) : null), [data]);
  const current = draft ?? saved;
  const dirty =
    !!draft &&
    !!saved &&
    JSON.stringify(normalize(draft)) !== JSON.stringify(saved);

  // Effective look = widget defaults ← website branding ← saved/draft overrides.
  const appearance: WidgetAppearance = useMemo(
    () => ({
      ...DEFAULT_WIDGET_APPEARANCE_LIGHT,
      ...(data?.defaults ?? {}),
      ...(current?.appearance ?? {}),
      position:
        current?.appearance?.position === "bottom-left"
          ? "bottom-left"
          : "bottom-right",
    }),
    [data, current],
  );

  const payload = useMemo(() => {
    const s = current?.suggestions ?? [];
    return {
      widgetTitle: current?.title || null,
      greeting: current?.greeting || null,
      hideBranding: current?.hideBranding ?? false,
      appearance,
      defaultSuggestions: {
        suggestion1: s[0] || null,
        suggestion2: s[1] || null,
        suggestion3: s[2] || null,
      },
    };
  }, [current, appearance]);

  // Warn before leaving with unsaved changes; ⌘/Ctrl+S saves.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty && draft) save.mutate(normalize(draft));
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("keydown", onKey);
    };
  }, [dirty, draft, save]);

  useEffect(() => {
    for (const f of FONTS) if (f.value) loadFontPreview(f.value);
  }, []);

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-[13px] text-(--agenci-ink-2)">
        Kunne ikke laste widget-innstillingene. Prøv å laste siden på nytt.
      </div>
    );
  }
  if (isPending || !data || !current) {
    return (
      <div className="grid flex-1 gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          {[180, 260, 200].map((h) => (
            <div
              key={h}
              className="animate-pulse rounded-[20px] bg-[#f3f5f4]"
              style={{ height: h }}
            />
          ))}
        </div>
        <div className="hidden animate-pulse rounded-[20px] bg-[#f3f5f4] xl:block" />
      </div>
    );
  }

  const update = (patch: Partial<WidgetCustomization>) =>
    setDraft((d) => ({ ...(d ?? {}), ...patch }));
  const setAppearance = (patch: Partial<WidgetAppearanceDraft>) =>
    setDraft((d) => ({
      ...(d ?? {}),
      appearance: { ...(d?.appearance ?? {}), ...patch },
    }));
  const setColors = (patch: ColorPatch) =>
    setDraft((d) => {
      const next = { ...(d?.appearance ?? {}) } as Record<string, unknown>;
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined) delete next[k];
        else next[k] = v;
      }
      return { ...(d ?? {}), appearance: next as WidgetAppearanceDraft };
    });

  const suggestions = [0, 1, 2].map((i) => current.suggestions?.[i] ?? "");
  const activeFont = current.appearance?.fontFamily ?? null;
  const brandFont = data.defaults.fontFamily
    ?.replace(/['"]/g, "")
    .split(",")[0]
    ?.trim();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 md:p-5">
      {/* Header */}
      <header className="flex shrink-0 flex-wrap items-end gap-x-6 gap-y-3 px-1">
        <div className="min-w-0">
          <h1 className="[font-family:var(--font-agenci-title)] text-[24px] leading-[1.15] font-medium tracking-[-0.03em] text-(--agenci-ink)">
            Widget-tilpasning
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={cn(
              "flex items-center gap-1.5 text-[12.5px] transition-opacity duration-200",
              dirty ? "text-[#B06A34] opacity-100" : "text-(--agenci-ink-3)",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                dirty ? "bg-[#E49A62]" : "bg-[#3F7A4A]",
              )}
            />
            {dirty
              ? "Ulagrede endringer"
              : data.updatedAt
                ? "Alt er lagret"
                : "Standardoppsett"}
          </span>
          <button
            type="button"
            disabled={!dirty || save.isPending}
            onClick={() => saved && setDraft(saved)}
            className="h-9 rounded-full border border-(--agenci-line) bg-white px-3.5 text-[13px] font-medium text-(--agenci-ink) transition-[background-color,opacity] hover:bg-[#f6f7f6] disabled:opacity-40 dark:bg-transparent"
          >
            Angre
          </button>
          <button
            type="button"
            disabled={!dirty || save.isPending}
            onClick={() => draft && save.mutate(normalize(draft))}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-(--agenci-ink) px-4 text-[13px] font-medium text-white transition-[background-color,opacity,transform] hover:bg-(--agenci-accent-hover) active:scale-[0.985] disabled:opacity-40 dark:text-[#0b0c0e]"
          >
            {save.isPending ? (
              <>
                <AgenciLoader size={24} decorative />
                Lagrer
              </>
            ) : (
              "Lagre"
            )}
            <kbd
              className={cn(
                dataText,
                "hidden rounded-[6px] bg-white/15 px-1.5 text-[12px] sm:inline",
              )}
            >
              ⌘S
            </kbd>
          </button>
        </div>
      </header>

      <div
        className={cn(
          "mt-5 grid gap-5",
          tab === "look" && "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]",
        )}
      >
        {/* Settings */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 px-1">
            <Segment
              label="Innstillinger"
              options={[
                { value: "look", label: "Utseende" },
                { value: "behavior", label: "Oppførsel" },
              ]}
              value={tab}
              onChange={setTab}
            />
          </div>
          {tab === "behavior" ? (
            <BehaviorSettings
              behavior={current.behavior ?? {}}
              onChange={(next) => update({ behavior: next })}
            />
          ) : (
            <>
              <ColorStudio
                base={{
                  ...DEFAULT_WIDGET_APPEARANCE_LIGHT,
                  ...data.defaults,
                  position: appearance.position,
                }}
                effective={appearance}
                overrides={current.appearance ?? {}}
                brandColors={[
                  data.brand?.primaryColor,
                  data.brand?.accentColor,
                  data.brand?.textPrimaryColor,
                ].filter((c): c is string => Boolean(c))}
                onChange={setColors}
              />

              <Section icon={MessageSquareTextIcon} title="Tekst">
                <Field label="Tittel" htmlFor="wc-title">
                  <TextInput
                    id="wc-title"
                    value={current.title ?? ""}
                    onChange={(v) => update({ title: v })}
                    placeholder={data.agentName}
                    max={60}
                  />
                </Field>
                <Field label="Velkomsthilsen" htmlFor="wc-greeting">
                  <TextArea
                    id="wc-greeting"
                    value={current.greeting ?? ""}
                    onChange={(v) => update({ greeting: v })}
                    placeholder={DEFAULT_GREETING}
                    max={300}
                  />
                </Field>
                <Field label="Forslag til spørsmål">
                  <div className="flex flex-col gap-2">
                    {suggestions.map((s, i) => (
                      <TextInput
                        key={i}
                        value={s}
                        max={90}
                        placeholder={
                          [
                            "Hva er åpningstidene?",
                            "Hvordan returnerer jeg en vare?",
                            "Hvor lang er leveringstiden?",
                          ][i]
                        }
                        onChange={(v) => {
                          const next = [...suggestions];
                          next[i] = v;
                          update({ suggestions: next });
                        }}
                      />
                    ))}
                  </div>
                </Field>
              </Section>

              <Section
                icon={MousePointerClickIcon}
                title="Startknapp og plassering"
              >
                <Field label="Plassering">
                  <Segment
                    label="Plassering"
                    options={[
                      { value: "bottom-left", label: "Nede til venstre" },
                      { value: "bottom-right", label: "Nede til høyre" },
                    ]}
                    value={
                      appearance.position === "bottom-left"
                        ? "bottom-left"
                        : "bottom-right"
                    }
                    onChange={(v) => setAppearance({ position: v })}
                  />
                </Field>
                <RangeField
                  label="Størrelse"
                  value={appearance.bubbleButtonSize}
                  min={44}
                  max={80}
                  onChange={(v) => setAppearance({ bubbleButtonSize: v })}
                />
              </Section>

              <Section icon={LayoutTemplateIcon} title="Form og størrelse">
                <RangeField
                  label="Runde hjørner"
                  value={appearance.borderRadius}
                  min={0}
                  max={32}
                  onChange={(v) => setAppearance({ borderRadius: v })}
                />
                <RangeField
                  label="Bredde"
                  value={appearance.width}
                  min={300}
                  max={560}
                  step={10}
                  onChange={(v) => setAppearance({ width: v })}
                />
                <RangeField
                  label="Høyde"
                  value={appearance.height}
                  min={420}
                  max={820}
                  step={10}
                  onChange={(v) => setAppearance({ height: v })}
                />
              </Section>

              <Section icon={TypeIcon} title="Skrift">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {FONTS.map((f) => {
                    const active =
                      f.value === activeFont || (!f.value && !activeFont);
                    const family = f.value ?? brandFont ?? "Inter";
                    return (
                      <button
                        key={f.label}
                        type="button"
                        onClick={() =>
                          setAppearance({ fontFamily: f.value ?? undefined })
                        }
                        aria-pressed={active}
                        className={cn(
                          "rounded-[12px] border px-3 py-2.5 text-left transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-px",
                          active
                            ? "border-(--agenci-ink) shadow-[0_0_0_1px_var(--agenci-ink)]"
                            : "border-(--agenci-line)",
                        )}
                      >
                        <span
                          className="block text-[20px] leading-none text-(--agenci-ink)"
                          style={{ fontFamily: family }}
                        >
                          Aa
                        </span>
                        <span className="mt-1.5 block truncate text-[12px] text-(--agenci-ink-2)">
                          {f.value
                            ? f.label
                            : `${f.label}${brandFont ? ` (${brandFont})` : ""}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section icon={SparklesIcon} title="Avansert">
                <Switch
                  checked={current.hideBranding ?? false}
                  onChange={(v) => update({ hideBranding: v })}
                  label="Skjul «Drevet av Agenci»"
                />
              </Section>
            </>
          )}
        </div>

        {/* Live preview */}
        {/* Hidden (not unmounted) on the behaviour tab so the widget keeps its state. */}
        <div className={cn("min-w-0", tab === "behavior" && "hidden")}>
          <div className="sticky top-0 flex h-[min(820px,calc(100dvh-180px))] min-h-[560px] flex-col rounded-[24px] border border-(--agenci-line) bg-[linear-gradient(180deg,#f7f8f7,#eef0ef)] p-4 dark:bg-white/[0.03]">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex items-center gap-2 text-[13px] font-medium text-(--agenci-ink)">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3F7A4A] opacity-50" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#3F7A4A]" />
                </span>
                Live forhåndsvisning
              </span>
              <span className="ml-auto flex items-center gap-2">
                <Segment
                  label="Enhet"
                  options={[
                    { value: "desktop", label: "Desktop" },
                    { value: "mobile", label: "Mobil" },
                  ]}
                  value={device}
                  onChange={(v) => {
                    setDevice(v);
                    setOpen(true);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPreviewKey((k) => k + 1)}
                  aria-label="Start forhåndsvisningen på nytt"
                  title="Start samtalen på nytt"
                  className="flex size-8 items-center justify-center rounded-full bg-white text-(--agenci-ink-2) shadow-[0_1px_2px_rgb(5_6_7/0.08)] hover:text-(--agenci-ink) dark:bg-white/10"
                >
                  <RefreshCwIcon
                    className="size-3.5"
                    strokeWidth={1.5}
                    absoluteStrokeWidth
                  />
                </button>
              </span>
            </div>
            <div className="min-h-0 flex-1">
              <WidgetLivePreview
                key={`${previewKey}-${device}`}
                src={`${getWidgetPreviewUrl(data.organizationId, { agentId })}&preview=1`}
                payload={payload}
                appearance={appearance}
                agentName={data.agentName}
                siteUrl={data.brand?.sourceUrl ?? null}
                site={site ?? null}
                siteLoading={siteLoading}
                device={device}
                open={open}
                onToggleOpen={() => setOpen((o) => !o)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
