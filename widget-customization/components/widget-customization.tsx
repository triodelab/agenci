"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@echo/backend/convex/_generated/api";
import type { Id } from "@echo/backend/convex/_generated/dataModel";
import { getStoredWidgetDesign, setStoredWidgetDesign } from "@/lib/widget-design-storage";
import { PlaygroundChatCanvas } from "@/modules/playground/components/PlaygroundChatCanvas";
import { PlaygroundChatPreview } from "@/modules/playground/components/PlaygroundChatPreview";
import type {
  PlaygroundWidgetDesign,
  WidgetPosition,
  PlaygroundChatMessage,
} from "@/modules/playground/types";
import { DEFAULT_WIDGET_DESIGN, DEFAULT_DARK_WIDGET_DESIGN } from "@/modules/playground/types";
import { WIDGET_COLOR_PRESETS } from "@/modules/widget-customization/widget-presets";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Slider } from "@workspace/ui/components/slider";
import {
  CornerDownLeft,
  CornerDownRight,
  AlignCenterHorizontal,
  GripHorizontal,
  Palette,
  Copy,
  Check,
  Code2,
  MessageSquare,
  Sun,
  Moon,
  Gamepad2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Standard tema: Lys og Mørk (først), deretter andre presets */
const STANDARD_THEMES = [
  { name: "Lys", design: DEFAULT_WIDGET_DESIGN, icon: Sun },
  { name: "Mørk", design: DEFAULT_DARK_WIDGET_DESIGN, icon: Moon },
];

const PREVIEW_MESSAGES: PlaygroundChatMessage[] = [
  {
    id: "w",
    role: "assistant",
    content: "Hei! Hva kan jeg hjelpe deg med i dag?",
    createdAt: Date.now() - 60000,
    quickReplies: ["Åpningstider", "Bestille", "Kontakt oss"],
  },
  {
    id: "u",
    role: "user",
    content: "Hva er deres åpningstider?",
    createdAt: Date.now() - 30000,
  },
  {
    id: "a",
    role: "assistant",
    content: "Vi har åpent man–fre 09–16. Lørdag 10–14.",
    createdAt: Date.now(),
  },
];

const EMBED_TEMPLATE = (orgId: string) =>
  `<!-- Agenci Chat Widget -->
<script
  src="https://cdn.agenci.no/widget.js"
  data-organization-id="${orgId}"
  defer
></script>`;

export interface WidgetCustomizationProps {
  title?: string;
}

export default function WidgetCustomization({
  title = "Widget Tilpasning",
}: WidgetCustomizationProps) {
  const params = useParams<{ wId: string; agentId?: string }>();
  const router = useRouter();
  const wId = params?.wId as string | undefined;
  const agentId = params?.agentId as string | undefined;

  const [design, setDesign] = useState<PlaygroundWidgetDesign>(() => ({
    ...DEFAULT_WIDGET_DESIGN,
  }));
  const [agentName, setAgentName] = useState("Kundeservice");
  const [inputPlaceholder, setInputPlaceholder] = useState("Skriv melding…");
  const [embedCopied, setEmbedCopied] = useState(false);
  const [designLoadedFromStorage, setDesignLoadedFromStorage] = useState(false);
  const [savingToPlayground, setSavingToPlayground] = useState(false);

  const { data: agent } = useQuery({
    ...convexQuery(api.public.agents.getById, {
      orgId: wId ?? "",
      agentId: (agentId ?? "") as Id<"agents">,
    }),
    enabled: !!wId && !!agentId,
  });

  useEffect(() => {
    if (!wId || !agentId || designLoadedFromStorage) return;
    const stored = getStoredWidgetDesign(wId, agentId);
    if (stored) setDesign((prev) => ({ ...DEFAULT_WIDGET_DESIGN, ...prev, ...stored }));
    setDesignLoadedFromStorage(true);
  }, [wId, agentId, designLoadedFromStorage]);

  useEffect(() => {
    if (agent?.name) setAgentName(agent.name);
  }, [agent?.name]);

  const setDesignPartial = useCallback((partial: Partial<PlaygroundWidgetDesign>) => {
    setDesign((d) => ({ ...d, ...partial }));
  }, []);

  const setPosition = useCallback(
    (position: WidgetPosition) => setDesignPartial({ position }),
    [setDesignPartial]
  );

  const applyStandardTheme = useCallback((theme: (typeof STANDARD_THEMES)[0]) => {
    setDesign({ ...theme.design });
  }, []);

  const applyPreset = useCallback((preset: (typeof WIDGET_COLOR_PRESETS)[0]) => {
    setDesign({ ...preset.design });
  }, []);

  const saveAndOpenPlayground = useCallback(() => {
    if (!wId || !agentId) {
      toast.error("Mangler workspace eller agent");
      return;
    }
    setSavingToPlayground(true);
    setStoredWidgetDesign(wId, agentId, design);
    toast.success("Tilpasning lagret");
    router.push(`/w/${wId}/agents?agentId=${agentId}`);
    setSavingToPlayground(false);
  }, [wId, agentId, design, router]);

  const copyEmbed = useCallback(() => {
    const orgId = wId ?? "YOUR_ORGANIZATION_ID";
    navigator.clipboard.writeText(EMBED_TEMPLATE(orgId));
    setEmbedCopied(true);
    toast.success("Embed-kode kopiert");
    setTimeout(() => setEmbedCopied(false), 2000);
  }, [wId]);

  return (
    <div className="flex h-full min-h-0 w-full">
      {/* Left: controls */}
      <aside className="flex w-[320px] shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-background/50 p-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Tilpass utseende og hent kode for nettsiden.
          </p>
        </div>

        {/* Position */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Posisjon
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["center", AlignCenterHorizontal, "Sentrert"],
                ["bottom-right", CornerDownRight, "Høyre"],
                ["bottom-left", CornerDownLeft, "Venstre"],
                ["custom", GripHorizontal, "Tilpasset"],
              ] as const
            ).map(([pos, Icon, label]) => (
              <button
                key={pos}
                type="button"
                onClick={() => setPosition(pos)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  design.position === pos
                    ? "border-foreground/30 bg-foreground/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-border hover:bg-foreground/10 hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground">
            Størrelse
          </Label>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Bredde</span>
              <span>{design.width} px</span>
            </div>
            <Slider
              value={[design.width]}
              onValueChange={([v]) => setDesignPartial({ width: v })}
              min={320}
              max={520}
              step={20}
              className="mt-1"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Høyde</span>
              <span>{design.height} px</span>
            </div>
            <Slider
              value={[design.height]}
              onValueChange={([v]) => setDesignPartial({ height: v })}
              min={400}
              max={720}
              step={20}
              className="mt-1"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Avrunding</span>
              <span>{design.borderRadius} px</span>
            </div>
            <Slider
              value={[design.borderRadius]}
              onValueChange={([v]) => setDesignPartial({ borderRadius: v })}
              min={0}
              max={28}
              step={2}
              className="mt-1"
            />
          </div>
        </div>

        {/* Standard tema: Lys / Mørk */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Palette className="size-3.5" />
            Standard tema
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {STANDARD_THEMES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => applyStandardTheme(t)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                    design.backgroundColor === t.design.backgroundColor
                      ? "border-foreground/30 bg-foreground/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                  )}
                  title={t.name}
                >
                  <Icon className="size-3.5" />
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fargepresetter – naturlige, abstrakte og andre (lys og mørk) */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Fargepresetter
          </Label>
          <div className="flex max-h-[220px] flex-wrap gap-1.5 overflow-y-auto">
            {WIDGET_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground hover:bg-foreground/10"
                title={preset.name}
              >
                <span
                  className="size-4 shrink-0 rounded-full border border-border/80"
                  style={{ backgroundColor: preset.design.headerColor }}
                />
                <span className="truncate">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Colors fine-tune */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Farger (tilpass enkeltvis)
          </Label>
          <div className="space-y-3">
            {[
              { label: "Header", key: "headerColor" as const, textKey: "headerTextColor" as const, textLabel: "Tekst", fallback: undefined },
              { label: "Bruker-boble", key: "bubbleUserColor" as const, textKey: "bubbleUserTextColor" as const, textLabel: "Tekst", fallback: undefined },
              { label: "Assistent-boble", key: "bubbleAssistantColor" as const, textKey: "bubbleAssistantTextColor" as const, textLabel: "Tekst", fallback: undefined },
              { label: "Bakgrunn", key: "backgroundColor" as const, textKey: null as null, textLabel: null, fallback: undefined },
              { label: "Input ramme", key: "inputBorderColor" as const, textKey: "inputBackgroundColor" as const, textLabel: "Fyll", fallback: undefined },
              { label: "Input tekst", key: "inputTextColor" as const, textKey: null as null, textLabel: null, fallback: "#18181b" as const },
              { label: "Input placeholder", key: "inputPlaceholderColor" as const, textKey: null as null, textLabel: null, fallback: "#71717a" as const },
            ].map(({ label, key, textKey, textLabel, fallback }) => (
              <div key={key} className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground w-24 shrink-0 truncate">
                  {label}
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={(design[key] as string | undefined) ?? fallback ?? ""}
                    onChange={(e) => setDesignPartial({ [key]: e.target.value })}
                    className="size-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
                    aria-label={`${label} hovedfarge`}
                    title={textKey && textLabel ? `Ramme / ${textLabel}` : label}
                  />
                  {textKey && textLabel && (
                    <input
                      type="color"
                      value={design[textKey] ?? design.backgroundColor}
                      onChange={(e) =>
                        setDesignPartial({ [textKey]: e.target.value })
                      }
                      className="size-7 cursor-pointer rounded border border-border bg-transparent p-0.5"
                      aria-label={`${label} ${textLabel.toLowerCase()}`}
                      title={textLabel}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <MessageSquare className="size-3.5" />
            Tekst
          </Label>
          <div>
            <Input
              placeholder="Agent-navn"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div>
            <Input
              placeholder="Input placeholder"
              value={inputPlaceholder}
              onChange={(e) => setInputPlaceholder(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>

        {/* Lagre og åpne Spillområde (kun når vi er på en agent) */}
        {agentId && wId && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Gamepad2 className="size-3.5" />
              Spillområde
            </Label>
            <Button
              variant="default"
              size="sm"
              className="w-full gap-2"
              onClick={saveAndOpenPlayground}
              disabled={savingToPlayground}
            >
              <Gamepad2 className="size-4" />
              {savingToPlayground ? "Lagrer…" : "Lagre og åpne Spillområde"}
            </Button>
          </div>
        )}

        {/* Embed */}
        <div className="space-y-2 border-t border-border pt-4">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Code2 className="size-3.5" />
            Sett inn på nettside
          </Label>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={copyEmbed}
          >
            {embedCopied ? (
              <>
                <Check className="size-4 text-emerald-500" />
                Kopiert
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Kopier embed-kode
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Right: live preview */}
      <div className="min-w-0 flex-1 flex flex-col p-6">
        <p className="mb-3 text-xs text-muted-foreground">
          Forhåndsvisning
        </p>
        <div className="flex min-h-0 flex-1 flex-col">
          <PlaygroundChatCanvas
            design={design}
            onDesignChange={setDesign}
          >
            <PlaygroundChatPreview
              messages={PREVIEW_MESSAGES}
              onSend={() => {}}
              disabled
              agentName={agentName}
              inputPlaceholder={inputPlaceholder}
              design={design}
              className="h-full"
            />
          </PlaygroundChatCanvas>
        </div>
      </div>
    </div>
  );
}
