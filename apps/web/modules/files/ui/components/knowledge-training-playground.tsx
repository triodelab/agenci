"use client";

import { useOrganization } from "@clerk/nextjs";
import {
  useQuery,
  useAction,
  useMutation,
  usePaginatedQuery,
} from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type {
  PublicFile,
  PublicWebsiteSource,
} from "@workspace/backend/private/files";
import { getWidgetPreviewUrl } from "@/lib/widget-preview-url";
import { DashboardAccentButton } from "@/modules/dashboard/ui/components/dashboard-accent";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
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
  FileIcon,
  GlobeIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SaveIcon,
  TrashIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "sonner";
import { UploadDialog } from "./upload-dialog";
import { DeleteFileDialog } from "./delete-file-dialog";
import { DeleteWebsiteSourceDialog } from "./delete-website-source-dialog";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidHttpUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const DEFAULT_INSTRUCTIONS_PLACEHOLDER = `Beskriv bedriften, tjenestene og tonen du ønsker.

Eksempel:
Vi er Agenci, en AI-plattform for norske bedrifter. Svar alltid vennlig og direkte på norsk. Fokuser på å hjelpe kunden raskt — hold svarene korte og presise.`;

const SUPPORT_CHAT_MODEL_LABEL = "GPT-4o mini";

// ─── PlaygroundSection ────────────────────────────────────────────────────────

function PlaygroundSection({
  title,
  headerRight,
  children,
  className,
}: {
  title?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "app-dashboard-panel overflow-hidden rounded-2xl",
        className,
      )}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {title}
          </h3>
          {headerRight}
        </div>
      )}
      <div className="space-y-3 p-4 sm:p-5">{children}</div>
    </section>
  );
}

// ─── Source row ───────────────────────────────────────────────────────────────

function SourceRow({
  file,
  onDelete,
}: {
  file: PublicFile;
  onDelete: () => void;
}) {
  const isWeb = !!file.sourceUrl;
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5 transition-colors hover:bg-muted/30">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-background text-muted-foreground">
        {isWeb ? (
          <GlobeIcon className="size-3.5" strokeWidth={1.75} />
        ) : (
          <FileIcon className="size-3.5" strokeWidth={1.75} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        {isWeb && file.sourceUrl ? (
          <a
            href={file.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-[12px] font-medium text-foreground hover:underline underline-offset-2"
          >
            {file.name}
          </a>
        ) : (
          <p className="truncate text-[12px] font-medium text-foreground">
            {file.name}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground">
          {file.type.toUpperCase()} · {file.size}
          {file.status === "processing" && (
            <span className="ml-1.5 text-amber-500">· Indekserer…</span>
          )}
          {file.status === "error" && (
            <span className="ml-1.5 text-red-500">· Feil</span>
          )}
        </p>
      </div>
      <button
        onClick={onDelete}
        className="flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
        aria-label="Slett kilde"
        type="button"
      >
        <TrashIcon className="size-3.5" />
      </button>
    </div>
  );
}

function WebsiteSourceRow({
  source,
  isUpdating,
  onTogglePaused,
  onDelete,
}: {
  source: PublicWebsiteSource;
  isUpdating: boolean;
  onTogglePaused: () => void;
  onDelete: () => void;
}) {
  const statusLabel =
    source.status === "queued"
      ? "I kø"
      : source.status === "running"
        ? "Henter"
        : source.status === "paused"
          ? "Pauset"
          : source.status === "ready"
            ? "Synkronisert"
            : "Feil";
  const statusTone =
    source.status === "queued"
      ? "text-amber-500"
      : source.status === "running"
        ? "text-sky-500"
        : source.status === "paused"
          ? "text-slate-500"
          : source.status === "ready"
            ? "text-emerald-500"
            : "text-red-500";

  const details: string[] = [];
  details.push(
    source.mode === "crawl" ? `Inntil ${source.maxPages} sider` : "Enkeltside",
  );
  if (source.lastIndexedCount && source.lastIndexedCount > 0) {
    details.push(`${source.lastIndexedCount} sider indeksert`);
  }
  if (source.lastCompletedAt) {
    details.push(
      `Sist ferdig ${formatDistanceToNow(source.lastCompletedAt, { addSuffix: true })}`,
    );
  } else if (source.lastRunAt) {
    details.push(
      `Startet ${formatDistanceToNow(source.lastRunAt, { addSuffix: true })}`,
    );
  }

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-background text-muted-foreground">
        <GlobeIcon className="size-3.5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <a
          href={source.rootUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-[12px] font-medium text-foreground hover:underline underline-offset-2"
        >
          {source.rootUrl}
        </a>
        <p className="text-[10px] text-muted-foreground">
          <span className={statusTone}>{statusLabel}</span>
          {details.length > 0 ? ` · ${details.join(" · ")}` : ""}
        </p>
        {source.lastError ? (
          <p
            className="mt-1 truncate text-[10px] text-red-500"
            title={source.lastError}
          >
            {source.lastError}
          </p>
        ) : null}
      </div>
      <div className="mt-0.5 flex shrink-0 items-center gap-1">
        <button
          onClick={onTogglePaused}
          disabled={isUpdating}
          className="flex size-6 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={
            source.status === "paused"
              ? "Gjenoppta nettsidekilde"
              : "Paus nettsidekilde"
          }
          title={source.status === "paused" ? "Gjenoppta" : "Paus"}
          type="button"
        >
          {source.status === "paused" ? (
            <PlayIcon className="size-3.5" />
          ) : (
            <PauseIcon className="size-3.5" />
          )}
        </button>
        <button
          onClick={onDelete}
          disabled={isUpdating}
          className="flex size-6 items-center justify-center rounded-lg text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Slett nettsidekilde"
          type="button"
        >
          <TrashIcon className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function KnowledgeTrainingPlayground({
  agentId,
}: {
  agentId?: import("@workspace/backend/_generated/dataModel").Id<"agents">;
}) {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const overview = useQuery(api.private.dashboard.getOverview, {});
  const agentOverview = useQuery(
    api.private.dashboard.getAgentOverview,
    agentId ? { agentId } : "skip",
  );
  const widgetSettings = useQuery(api.private.widgetSettings.getOne, {});
  const saveSystemPromptMutation = useMutation(
    api.private.widgetSettings.saveSystemPrompt,
  );

  // File management
  const files = usePaginatedQuery(
    api.private.files.list,
    agentId !== undefined ? { agentId } : {},
    { initialNumItems: 20 },
  );
  const websiteSources = useQuery(
    api.private.files.listWebsiteSources,
    agentId !== undefined ? { agentId } : {},
  );
  const kickoffWebsiteOnboarding = useMutation(
    api.lib.workflow.kickoffAgentOnboarding,
  );
  const pauseWebsiteSource = useAction(api.private.files.pauseWebsiteSource);
  const resumeWebsiteSource = useAction(api.private.files.resumeWebsiteSource);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [presetFile, setPresetFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PublicFile | null>(null);
  const [deleteWebsiteSourceDialogOpen, setDeleteWebsiteSourceDialogOpen] =
    useState(false);
  const [selectedWebsiteSource, setSelectedWebsiteSource] =
    useState<PublicWebsiteSource | null>(null);
  const [websiteSourceActionId, setWebsiteSourceActionId] = useState<
    PublicWebsiteSource["id"] | null
  >(null);
  const [webUrl, setWebUrl] = useState("");
  const [isImportingWebpage, setIsImportingWebpage] = useState(false);

  // Playground
  const [iframeKey, setIframeKey] = useState(0);
  const [instructions, setInstructions] = useState("");
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [showCapacityBanner, setShowCapacityBanner] = useState(true);

  const widgetUrl = useMemo(
    () =>
      organization?.id
        ? getWidgetPreviewUrl(organization.id, {
            playground: true,
            agentId: agentId ?? undefined,
          })
        : null,
    [organization?.id, agentId],
  );

  // Load system prompt from Convex when settings arrive
  useEffect(() => {
    if (widgetSettings === undefined) return;
    setInstructions(widgetSettings?.systemPrompt ?? "");
  }, [widgetSettings]);

  const reloadWidget = useCallback(() => setIframeKey((k) => k + 1), []);

  const handleSavePrompt = useCallback(async () => {
    setIsSavingPrompt(true);
    try {
      await saveSystemPromptMutation({ systemPrompt: instructions });
      toast.success("Instruksjoner lagret — gjelder for nye samtaler.");
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e && "message" in e
            ? String((e as { message: unknown }).message)
            : "Ukjent feil";
      toast.error(`Kunne ikke lagre instruksjoner: ${msg}`);
    } finally {
      setIsSavingPrompt(false);
    }
  }, [instructions, saveSystemPromptMutation]);

  const resetInstructions = useCallback(async () => {
    setInstructions("");
    setIsSavingPrompt(true);
    try {
      await saveSystemPromptMutation({ systemPrompt: "" });
      toast.success("Instruksjoner tilbakestilt til standard.");
    } catch {
      toast.error("Kunne ikke tilbakestille.");
    } finally {
      setIsSavingPrompt(false);
    }
  }, [saveSystemPromptMutation]);

  const canAddWebpage = isValidHttpUrl(webUrl) && !isImportingWebpage;

  const handleAddWebpage = async () => {
    if (!canAddWebpage || !agentId) return;
    setIsImportingWebpage(true);
    try {
      const trimmedUrl = webUrl.trim();
      await kickoffWebsiteOnboarding({ agentId, url: trimmedUrl });
      toast.success(`Nettside sendt til behandling: ${trimmedUrl}`);
      setWebUrl("");
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e && "message" in e
            ? String((e as { message: unknown }).message)
            : "Kunne ikke importere nettside";
      toast.error(msg);
    } finally {
      setIsImportingWebpage(false);
    }
  };

  const handleToggleWebsiteSourcePaused = async (
    source: PublicWebsiteSource,
  ) => {
    setWebsiteSourceActionId(source.id);
    try {
      if (source.status === "paused") {
        await resumeWebsiteSource({ sourceId: source.id });
        toast.success(`Nettsidekilden ble gjenopptatt: ${source.rootUrl}`);
      } else {
        await pauseWebsiteSource({ sourceId: source.id });
        toast.success(`Nettsidekilden ble pauset: ${source.rootUrl}`);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kunne ikke oppdatere nettsidekilden";
      toast.error(message);
    } finally {
      setWebsiteSourceActionId(null);
    }
  };

  // Use per-agent stats when inside agent context
  const sourceCount = agentId
    ? (agentOverview?.fileCount ?? 0)
    : (overview?.knowledge.count ?? 0);
  const hasMore = agentId ? false : (overview?.knowledge.hasMore ?? false);
  const indexed = sourceCount > 0;
  const lastIndexedAt = agentId
    ? (agentOverview?.lastIndexedAt ?? null)
    : (overview?.knowledge.lastIndexedAt ?? null);
  const approxKb = agentId ? 0 : (overview?.knowledge.approxIndexedKb ?? 0);

  const trainedSubtitle = useMemo(() => {
    if (!indexed) return "Legg til kilder nedenfor for å bygge indeksen.";
    const parts: string[] = [];
    if (lastIndexedAt)
      parts.push(
        `Sist oppdatert ${formatDistanceToNow(lastIndexedAt, { addSuffix: true })}`,
      );
    if (approxKb > 0) parts.push(`~${approxKb} KB indeksert tekst`);
    if (hasMore) parts.push("minst én side til i indeksen");
    return parts.join(" · ");
  }, [indexed, lastIndexedAt, approxKb, hasMore]);

  const statsLoading = agentId
    ? agentOverview === undefined
    : overview === undefined ||
      widgetSettings === undefined ||
      websiteSources === undefined;
  if (statsLoading || !orgLoaded) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 w-full shrink-0 flex-col gap-4 overflow-y-auto border-border/50 bg-background px-5 py-6 lg:w-[min(100%,440px)] lg:min-w-[360px] lg:border-r">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
        <div className="dash-knowledge-playground flex min-h-[40vh] min-w-0 flex-1 items-center justify-center px-5 py-10 lg:min-h-0 lg:px-8 lg:py-12">
          <Skeleton className="h-[min(640px,75vh)] w-full max-w-[400px] rounded-2xl shadow-md" />
        </div>
      </div>
    );
  }

  return (
    <>
      <DeleteFileDialog
        file={selectedFile}
        onDeleted={() => setSelectedFile(null)}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
      />
      <DeleteWebsiteSourceDialog
        source={selectedWebsiteSource}
        onDeleted={() => setSelectedWebsiteSource(null)}
        onOpenChange={setDeleteWebsiteSourceDialogOpen}
        open={deleteWebsiteSourceDialogOpen}
      />
      <UploadDialog
        agentId={agentId}
        onOpenChange={(open) => {
          setUploadDialogOpen(open);
          if (!open) setPresetFile(null);
        }}
        open={uploadDialogOpen}
        presetFile={presetFile}
      />

      <div
        className="flex h-full min-h-0 flex-1 flex-col lg:flex-row"
        data-agenci-knowledge-training="playground"
      >
        {/* ── Venstre: konfig + kilder ── */}
        <div className="flex min-h-0 w-full shrink-0 flex-col overflow-y-auto overscroll-y-contain border-border/50 bg-background px-5 py-6 lg:w-[min(100%,440px)] lg:min-w-[360px] lg:border-r xl:w-[460px]">
          <div className="space-y-5">
            {/* Header */}
            <header className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Kunnskapsbase
              </p>
              <h2 className="text-[20px] font-semibold tracking-tight text-foreground">
                Kunnskapstrening
              </h2>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                Legg til kilder og test widgeten mot din kunnskap.
              </p>
            </header>

            {/* Indeks-status */}
            <PlaygroundSection>
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    indexed ? "bg-emerald-500" : "bg-amber-500",
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[15px] font-semibold text-foreground">
                    {indexed ? "Indeks klar" : "Ikke indeksert ennå"}
                  </p>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    {trainedSubtitle}
                  </p>
                </div>
              </div>
            </PlaygroundSection>

            {/* ── KILDER (integrert General) ── */}
            <PlaygroundSection
              title={`Kilder ${sourceCount > 0 ? `(${sourceCount}${hasMore ? "+" : ""})` : ""}`}
              headerRight={
                <Button
                  className="h-7 gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold"
                  onClick={() => {
                    setPresetFile(null);
                    setUploadDialogOpen(true);
                  }}
                  size="sm"
                  type="button"
                  variant="default"
                >
                  <UploadIcon className="size-3" strokeWidth={2.5} />
                  Last opp fil
                </Button>
              }
            >
              {/* URL-import */}
              <div className="flex gap-2">
                <Input
                  className="h-9 flex-1 rounded-xl border-border/70 bg-background text-[12px]"
                  disabled={isImportingWebpage}
                  onChange={(e) => setWebUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canAddWebpage) {
                      e.preventDefault();
                      void handleAddWebpage();
                    }
                  }}
                  placeholder="https://dinnettside.no/hjelp"
                  type="url"
                  value={webUrl}
                />
                <Button
                  className="h-9 shrink-0 rounded-xl px-3 text-[12px] font-semibold"
                  disabled={!canAddWebpage}
                  onClick={() => void handleAddWebpage()}
                  type="button"
                  variant="secondary"
                >
                  {isImportingWebpage ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCwIcon className="size-3 animate-spin" />
                      Køer…
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <PlusIcon className="size-3.5" strokeWidth={2.5} />
                      Legg til
                    </span>
                  )}
                </Button>
              </div>

              {websiteSources && websiteSources.length > 0 ? (
                <div className="space-y-1.5">
                  {websiteSources.map((source) => (
                    <WebsiteSourceRow
                      key={source.id}
                      source={source}
                      isUpdating={websiteSourceActionId === source.id}
                      onTogglePaused={() =>
                        void handleToggleWebsiteSourcePaused(source)
                      }
                      onDelete={() => {
                        setSelectedWebsiteSource(source);
                        setDeleteWebsiteSourceDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              ) : null}

              {/* Filliste */}
              {files.status === "LoadingFirstPage" ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : files.results.length === 0 &&
                (!websiteSources || websiteSources.length === 0) ? (
                <button
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/10 py-7 text-center transition-colors hover:border-border hover:bg-muted/20"
                  onClick={() => {
                    setPresetFile(null);
                    setUploadDialogOpen(true);
                  }}
                  type="button"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border/50 bg-background">
                    <UploadIcon
                      className="size-5 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">
                      Ingen kilder ennå
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Last opp fil eller legg inn en nettside-URL
                    </p>
                  </div>
                </button>
              ) : (
                <div className="space-y-1.5">
                  {files.results.map((file) => (
                    <SourceRow
                      key={file.id}
                      file={file}
                      onDelete={() => {
                        setSelectedFile(file);
                        setDeleteDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </PlaygroundSection>

            {/* Sammenlign modeller */}
            <PlaygroundSection>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium text-foreground">
                  Sammenlign AI-modeller
                </span>
                <DashboardAccentButton
                  className="h-8 shrink-0 px-3 text-[12px] font-medium"
                  onClick={() =>
                    toast.info(
                      "Modellsammenligning kommer i en senere versjon.",
                    )
                  }
                  type="button"
                >
                  Sammenlign
                </DashboardAccentButton>
              </div>
            </PlaygroundSection>

            {/* Modell */}
            <PlaygroundSection title="Modell">
              <Select disabled value="gpt-4o-mini">
                <SelectTrigger className="h-10 w-full rounded-xl border-border/80 bg-background/90 text-left text-[13px]">
                  <SelectValue placeholder={SUPPORT_CHAT_MODEL_LABEL} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">
                    {SUPPORT_CHAT_MODEL_LABEL}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Samme modell som produksjons-agenten (
                <code className="rounded bg-muted px-1 font-mono text-[10px]">
                  supportAgent
                </code>
                ). Valg av modell i UI er planlagt.
              </p>
            </PlaygroundSection>

            {/* Kapasitet-banner */}
            {showCapacityBanner && (
              <div className="relative overflow-hidden rounded-xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/[0.07] via-background to-violet-500/[0.06] px-3 py-3 pr-10">
                <button
                  aria-label="Lukk"
                  className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCapacityBanner(false)}
                  type="button"
                >
                  <XIcon className="size-4" />
                </button>
                <p className="text-[12px] leading-relaxed">
                  <span className="font-medium text-foreground">
                    Mer kontekst snart:
                  </span>{" "}
                  vedlegg i chat, flere modeller og lengre instruks — på
                  roadmap.
                </p>
              </div>
            )}

            {/* AI-handlinger */}
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
            <PlaygroundSection
              title="Instruksjoner (systemprompt)"
              headerRight={
                <div className="flex items-center gap-2">
                  <Button
                    className="size-7 shrink-0 rounded-lg"
                    onClick={() => void resetInstructions()}
                    size="icon"
                    title="Tilbakestill til standard"
                    type="button"
                    variant="outline"
                    disabled={isSavingPrompt}
                  >
                    <RotateCcwIcon className="size-3.5" />
                  </Button>
                  <Button
                    className="h-7 gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold"
                    onClick={() => void handleSavePrompt()}
                    size="sm"
                    type="button"
                    variant="default"
                    disabled={isSavingPrompt}
                  >
                    {isSavingPrompt ? (
                      <RefreshCwIcon className="size-3 animate-spin" />
                    ) : (
                      <SaveIcon className="size-3" strokeWidth={2.5} />
                    )}
                    Lagre
                  </Button>
                </div>
              }
            >
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Overstyrer standardoppførselen til assistenten. Tom = standard.
                Gjelder for nye samtaler etter lagring.
              </p>
              <Textarea
                className="min-h-[180px] resize-y rounded-xl border-border/80 bg-background/90 text-[13px] leading-relaxed"
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={DEFAULT_INSTRUCTIONS_PLACEHOLDER}
                spellCheck
                value={instructions}
              />
            </PlaygroundSection>
          </div>
        </div>

        {/* ── Høyre: live widget ── */}
        <div className="dash-knowledge-playground relative flex min-h-0 min-w-0 flex-1 flex-col bg-muted/15">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/50 bg-background/60 px-5 py-3.5 backdrop-blur-sm dark:bg-background/30 lg:px-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Forhåndsvisning
              </p>
              <p className="text-[13px] font-medium text-foreground">
                Live widget
              </p>
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
                  if (widgetUrl)
                    window.open(widgetUrl, "_blank", "noopener,noreferrer");
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
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
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
    </>
  );
}
