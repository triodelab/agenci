"use client";

import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { getWidgetPreviewUrl } from "@/lib/widget-preview-url";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  ExternalLinkIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "sonner";

type KnowledgeTrainingPlaygroundProps = {
  onManageSources: () => void;
};

const INSTRUCTIONS_STORAGE_PREFIX = "agenci-playground-instructions-draft";

const DEFAULT_INSTRUCTIONS = `### Bedriftskontekst
Beskriv kort selskapet, målgruppe og tone (du/De).

### Prioriteringer
Hva skal assistenten alltid sjekke i kunnskapsbasen før den svarer?

---
Merk: Produksjonsinstruks for assistenten er konfigurert i backend. Dette feltet er et **utkast** som lagres lokalt i nettleseren din (for planlegging og notater).`;

const SUPPORT_CHAT_MODEL_LABEL = "GPT-4o mini";

function PlaygroundSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "app-dashboard-panel space-y-3 overflow-hidden rounded-2xl p-4 sm:p-5",
        className,
      )}
    >
      {title ? (
        <h3 className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          {title}
        </h3>
      ) : null}
      {children}
    </section>
  );
}

export function KnowledgeTrainingPlayground({
  onManageSources,
}: KnowledgeTrainingPlaygroundProps) {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const overview = useQuery(api.private.dashboard.getOverview, {});
  const [iframeKey, setIframeKey] = useState(0);
  const [instructionPreset, setInstructionPreset] = useState("base");
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
  const [showCapacityBanner, setShowCapacityBanner] = useState(true);

  const widgetUrl = useMemo(
    () =>
      organization?.id
        ? getWidgetPreviewUrl(organization.id, { playground: true })
        : null,
    [organization?.id],
  );

  useEffect(() => {
    if (!organization?.id) {
      return;
    }
    const key = `${INSTRUCTIONS_STORAGE_PREFIX}:${organization.id}`;
    const saved = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (saved) {
      setInstructions(saved);
    } else {
      setInstructions(DEFAULT_INSTRUCTIONS);
    }
  }, [organization?.id]);

  const persistInstructions = useCallback(
    (value: string) => {
      if (!organization?.id) {
        return;
      }
      const key = `${INSTRUCTIONS_STORAGE_PREFIX}:${organization.id}`;
      localStorage.setItem(key, value);
    },
    [organization?.id],
  );

  const reloadWidget = useCallback(() => {
    setIframeKey((k) => k + 1);
  }, []);

  const resetInstructions = useCallback(() => {
    setInstructions(DEFAULT_INSTRUCTIONS);
    setInstructionPreset("base");
    if (organization?.id) {
      localStorage.removeItem(
        `${INSTRUCTIONS_STORAGE_PREFIX}:${organization.id}`,
      );
    }
  }, [organization?.id]);

  const sourceCount = overview?.knowledge.count ?? 0;
  const hasMore = overview?.knowledge.hasMore ?? false;
  const indexed = sourceCount > 0;
  const lastIndexedAt = overview?.knowledge.lastIndexedAt ?? null;
  const approxKb = overview?.knowledge.approxIndexedKb ?? 0;

  const trainedSubtitle = useMemo(() => {
    if (!indexed) {
      return "Legg til kilder under General for å bygge indeksen.";
    }
    const parts: string[] = [];
    if (lastIndexedAt) {
      parts.push(
        `Sist oppdatert ${formatDistanceToNow(lastIndexedAt, { addSuffix: true })}`,
      );
    }
    if (approxKb > 0) {
      parts.push(`~${approxKb} KB indeksert tekst`);
    }
    if (hasMore) {
      parts.push("minst én side til i indeksen");
    }
    return parts.join(" · ");
  }, [indexed, lastIndexedAt, approxKb, hasMore]);

  if (overview === undefined || !orgLoaded) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 w-full shrink-0 flex-col gap-4 overflow-y-auto border-border/50 bg-background px-5 py-6 lg:w-[min(100%,420px)] lg:min-w-[340px] lg:border-r xl:w-[440px]">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <div className="dash-knowledge-playground flex min-h-[40vh] min-w-0 flex-1 items-center justify-center px-5 py-10 lg:min-h-0 lg:px-8 lg:py-12">
          <Skeleton className="h-[min(640px,75vh)] w-full max-w-[400px] rounded-2xl shadow-md" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-0 flex-1 flex-col lg:flex-row"
      data-agenci-knowledge-training="playground"
    >
      {/* Venstre: playground-kolonne */}
      <div className="flex min-h-0 w-full shrink-0 flex-col overflow-y-auto overscroll-y-contain border-border/50 bg-background px-5 py-6 lg:w-[min(100%,420px)] lg:min-w-[340px] lg:border-r xl:w-[440px]">
        <div className="space-y-5">
        <header className="space-y-1.5">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Playground
          </p>
          <h2
            className="text-[19px] font-semibold tracking-tight text-foreground"
            id="knowledge-training-heading"
          >
            Kunnskapstrening
          </h2>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="text-muted-foreground max-w-md text-[12px] leading-relaxed">
              Konfigurer kontekst og test widgeten.
            </p>
            <button
              className="text-[12px] font-medium text-primary underline-offset-4 hover:underline"
              onClick={onManageSources}
              type="button"
            >
              Administrer kilder
            </button>
          </div>
        </header>

        {/* Trained / status */}
        <PlaygroundSection>
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className={cn(
                "mt-1.5 size-2 shrink-0 rounded-full",
                indexed ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[15px] font-semibold text-foreground">
                {indexed ? "Indeks klar" : "Ikke indeksert ennå"}
              </p>
              <p className="text-muted-foreground text-[12px] leading-relaxed">
                {trainedSubtitle}
              </p>
            </div>
          </div>
        </PlaygroundSection>

        {/* Sammenlign modeller */}
        <PlaygroundSection>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-medium text-foreground">
              Sammenlign AI-modeller
            </span>
            <Button
              className="h-8 shrink-0 rounded-lg px-3 text-[12px] font-medium"
              onClick={() =>
                toast.info("Modellsammenligning kommer i en senere versjon.")
              }
              type="button"
              variant="outline"
            >
              Sammenlign
            </Button>
          </div>
        </PlaygroundSection>

        {/* Modell */}
        <PlaygroundSection title="Modell">
          <Select disabled value="gpt-4o-mini">
            <SelectTrigger className="h-10 w-full rounded-xl border-border/80 bg-background/90 text-left text-[13px]">
              <SelectValue placeholder={SUPPORT_CHAT_MODEL_LABEL} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o-mini">{SUPPORT_CHAT_MODEL_LABEL}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Samme modell som i produksjons-agenten (
            <code className="rounded bg-muted px-1 font-mono text-[10px]">supportAgent</code>
            ). Valg av modell i UI er planlagt.
          </p>
        </PlaygroundSection>

        {/* Kapasitet / tips — ikke «fake upgrade», tydelig Agenci */}
        {showCapacityBanner ? (
          <div className="relative overflow-hidden rounded-xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/[0.07] via-background to-violet-500/[0.06] px-3 py-3 pr-10">
            <button
              aria-label="Lukk"
              className="text-muted-foreground hover:text-foreground absolute top-2 right-2 rounded-md p-1"
              onClick={() => setShowCapacityBanner(false)}
              type="button"
            >
              <XIcon className="size-4" />
            </button>
            <p className="text-[12px] leading-relaxed">
              <span className="font-medium text-foreground">Mer kontekst senere:</span>{" "}
              vedlegg i chat, flere modeller og lengre instruks — på roadmap.
            </p>
          </div>
        ) : null}

        {/* AI Actions */}
        <PlaygroundSection title="AI-handlinger">
          <button
            className="flex w-full items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 py-8 text-[13px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted/35 hover:text-foreground"
            onClick={() =>
              toast.info(
                "Egendefinerte handlinger kobles til integrasjoner — kommer.",
              )
            }
            type="button"
          >
            Legg til din første handling
          </button>
        </PlaygroundSection>

        {/* Instruksjoner */}
        <PlaygroundSection>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Instruksjoner (systemprompt)
            </h3>
            <div className="flex items-center gap-2">
              <Select
                onValueChange={(v) => {
                  setInstructionPreset(v);
                  if (v === "base") {
                    resetInstructions();
                  }
                }}
                value={instructionPreset}
              >
                <SelectTrigger className="h-8 w-[10.5rem] rounded-lg text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">Basisinstruks</SelectItem>
                  <SelectItem value="custom" disabled>
                    Egendefinert (snart)
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="size-8 shrink-0 rounded-lg"
                onClick={resetInstructions}
                size="icon"
                type="button"
                variant="outline"
              >
                <RotateCcwIcon className="size-4" />
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Utkast lagres i denne nettleseren. Produksjonsoppførsel styres av backend-agenten.
          </p>
          <Textarea
            className="min-h-[180px] resize-y rounded-xl border-border/80 bg-background/90 text-[13px] leading-relaxed"
            onBlur={() => persistInstructions(instructions)}
            onChange={(e) => setInstructions(e.target.value)}
            spellCheck
            value={instructions}
          />
        </PlaygroundSection>
        </div>
      </div>

      {/* Høyre: canvas */}
      <div className="dash-knowledge-playground relative flex min-h-0 min-w-0 flex-1 flex-col bg-muted/15">
        <div className="flex shrink-0 items-center justify-between gap-3 border-border/50 border-b bg-background/60 px-5 py-3.5 backdrop-blur-sm dark:bg-background/30 lg:px-8">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Forhåndsvisning
            </p>
            <p className="text-[13px] font-medium text-foreground">Live widget</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              className="h-9 gap-1.5 rounded-lg px-3 text-[13px]"
              disabled={!widgetUrl}
              onClick={reloadWidget}
              type="button"
              variant="outline"
            >
              <RefreshCwIcon className="size-4" />
              Oppdater
            </Button>
            <Button
              className="h-9 gap-1.5 rounded-lg px-3 text-[13px]"
              disabled={!widgetUrl}
              onClick={() => {
                if (widgetUrl) {
                  window.open(widgetUrl, "_blank", "noopener,noreferrer");
                }
              }}
              type="button"
              variant="outline"
            >
              <ExternalLinkIcon className="size-4" />
              Egen fane
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center px-5 py-10 lg:px-8 lg:py-12">
          {!organization ? (
            <div className="app-dashboard-panel max-w-md rounded-2xl px-6 py-8 text-center">
              <p className="text-[14px] font-medium text-foreground">
                Velg en organisasjon
              </p>
              <p className="text-muted-foreground mt-2 text-[13px] leading-relaxed">
                Widget krever aktiv organisasjon i Clerk.
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "dash-card-surface w-full max-w-[400px] overflow-hidden rounded-2xl",
                "shadow-[0_1px_0_rgba(255,255,255,0.55)_inset,0_12px_40px_-28px_rgba(0,0,0,0.14)]",
                "dark:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_16px_48px_-24px_rgba(0,0,0,0.45)]",
              )}
            >
              <iframe
                allow="clipboard-read; clipboard-write; microphone"
                className="block h-[min(640px,calc(100dvh-12rem))] w-full border-0 bg-background"
                key={iframeKey}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={widgetUrl ?? undefined}
                title="Agenci chatwidget — forhåndsvisning"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
