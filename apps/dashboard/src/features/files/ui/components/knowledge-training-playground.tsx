import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ExternalLinkIcon,
  FileIcon,
  GlobeIcon,
  PlusIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SaveIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { authClient } from "@/lib/auth-client";
import { getWidgetPreviewUrl } from "@/lib/widget-preview-url";
import {
  useAddWebpageMutation,
  useAgentDocumentsQuery,
  useUploadDocumentMutation,
} from "@/features/agents/queries/agents-queries";

const UPLOAD_ACCEPT =
  ".pdf,.doc,.docx,.txt,.md,.markdown,.rtf,.ppt,.pptx,.xls,.xlsx,.csv,.html,.png,.jpg,.jpeg,.webp";

const DEFAULT_INSTRUCTIONS_PLACEHOLDER = `Beskriv bedriften, tjenestene og tonen du ønsker.

Eksempel:
Vi er Agenci, en AI-plattform for norske bedrifter. Svar alltid vennlig og direkte på norsk. Fokuser på å hjelpe kunden raskt — hold svarene korte og presise.`;

type DocumentRow = {
  id: string;
  type: "DOCUMENT" | "WEBPAGE" | "MEDIA";
  status: "PENDING" | "PROCESSING" | "INDEXING" | "COMPLETED" | "FAILED";
  webpageUrl?: string | null;
  documentName: string | null;
  mediaName?: string | null;
};

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function documentLabel(doc: DocumentRow) {
  return doc.webpageUrl || doc.documentName || doc.mediaName || "Uten navn";
}

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
      className={cn("app-dashboard-panel overflow-hidden rounded-2xl", className)}
    >
      {title ? (
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <h3 className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            {title}
          </h3>
          {headerRight}
        </div>
      ) : null}
      <div className="space-y-3 p-4 sm:p-5">{children}</div>
    </section>
  );
}

function SourceRow({ doc }: { doc: DocumentRow }) {
  const isWeb = doc.type === "WEBPAGE" || Boolean(doc.webpageUrl);
  const label = documentLabel(doc);
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-background text-muted-foreground">
        {isWeb ? (
          <GlobeIcon className="size-3.5" strokeWidth={1.75} />
        ) : (
          <FileIcon className="size-3.5" strokeWidth={1.75} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        {isWeb && doc.webpageUrl ? (
          <a
            href={doc.webpageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-[12px] font-medium text-foreground underline-offset-2 hover:underline"
          >
            {label}
          </a>
        ) : (
          <p className="truncate text-[12px] font-medium text-foreground">
            {label}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground">
          {doc.type}
          {doc.status === "PROCESSING" ||
          doc.status === "PENDING" ||
          doc.status === "INDEXING" ? (
            <span className="ml-1.5 text-amber-500">· Indekserer…</span>
          ) : null}
          {doc.status === "FAILED" ? (
            <span className="ml-1.5 text-red-500">· Feil</span>
          ) : null}
          {doc.status === "COMPLETED" ? (
            <span className="ml-1.5 text-emerald-500">· Klar</span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

export function KnowledgeTrainingPlayground({ agentId }: { agentId: string }) {
  const { data: organization } = authClient.useActiveOrganization();
  const { data, isPending } = useAgentDocumentsQuery(agentId);
  const addWebpage = useAddWebpageMutation(agentId);
  const uploadDocument = useUploadDocumentMutation(agentId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documents = data ?? [];

  const [iframeKey, setIframeKey] = useState(0);
  const [instructions, setInstructions] = useState("");
  const [showCapacityBanner, setShowCapacityBanner] = useState(true);
  const [webUrl, setWebUrl] = useState("");

  const widgetUrl = useMemo(
    () =>
      organization?.id
        ? getWidgetPreviewUrl(organization.id, {
            playground: true,
            agentId,
          })
        : null,
    [organization?.id, agentId],
  );

  const indexed = documents.some((doc) => doc.status === "COMPLETED");
  const canAddWebpage =
    isValidHttpUrl(webUrl) && !addWebpage.isPending;

  const reloadWidget = useCallback(() => setIframeKey((key) => key + 1), []);

  const handleAddWebpage = async () => {
    if (!canAddWebpage) return;
    const trimmedUrl = webUrl.trim();
    try {
      await addWebpage.mutateAsync({ agentId, url: trimmedUrl });
      toast.success(`Nettside lagt til i kunnskapsbasen: ${trimmedUrl}`);
      setWebUrl("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Kunne ikke importere nettside",
      );
    }
  };

  const openFilePicker = () => {
    if (uploadDocument.isPending) return;
    fileInputRef.current?.click();
  };

  const handleUploadFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      await uploadDocument.mutateAsync({ agentId, file });
      toast.success(`Fil lagt til i kunnskapsbasen: ${file.name}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Kunne ikke laste opp fil",
      );
    }
  };

  if (isPending) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 w-full shrink-0 flex-col gap-4 overflow-y-auto border-border/50 bg-background px-5 py-6 lg:w-[min(100%,440px)] lg:min-w-[360px] lg:border-r">
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
      <div className="flex min-h-0 w-full shrink-0 flex-col overflow-y-auto overscroll-y-contain border-border/50 bg-background px-5 py-6 lg:w-[min(100%,440px)] lg:min-w-[360px] lg:border-r xl:w-[460px]">
        <div className="space-y-5">
          <header className="space-y-1.5">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Kunnskapsbase
            </p>
            <h2 className="text-[20px] font-semibold tracking-tight text-foreground">
              Kunnskapstrening
            </h2>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Legg til kilder og test widgeten mot din kunnskap.
            </p>
          </header>

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
                  {indexed
                    ? `${documents.length} kilder i kunnskapsbasen.`
                    : "Legg til kilder nedenfor for å bygge indeksen."}
                </p>
              </div>
            </div>
          </PlaygroundSection>

          <PlaygroundSection
            title={`Kilder ${documents.length > 0 ? `(${documents.length})` : ""}`}
            headerRight={
              <Button
                className="h-7 gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold"
                disabled={uploadDocument.isPending}
                onClick={openFilePicker}
                size="sm"
                type="button"
                variant="default"
              >
                {uploadDocument.isPending ? (
                  <RefreshCwIcon className="size-3 animate-spin" />
                ) : (
                  <UploadIcon className="size-3" strokeWidth={2.5} />
                )}
                {uploadDocument.isPending ? "Laster opp…" : "Last opp fil"}
              </Button>
            }
          >
            <input
              accept={UPLOAD_ACCEPT}
              className="sr-only"
              disabled={uploadDocument.isPending}
              onChange={(event) => void handleUploadFile(event)}
              ref={fileInputRef}
              type="file"
            />
            <div className="flex gap-2">
              <Input
                className="h-9 flex-1 rounded-xl border-border/70 bg-background text-[12px]"
                disabled={addWebpage.isPending}
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
                {addWebpage.isPending ? (
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

            {documents.length === 0 ? (
              <button
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/10 py-7 text-center transition-colors hover:border-border hover:bg-muted/20 disabled:pointer-events-none disabled:opacity-50"
                disabled={uploadDocument.isPending}
                onClick={openFilePicker}
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
                {documents.map((doc) => (
                  <SourceRow key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </PlaygroundSection>

          <PlaygroundSection title="Modell">
            <div className="flex h-10 w-full items-center rounded-xl border border-border/80 bg-background/90 px-3 text-[13px] text-foreground">
              GPT-4o mini
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Samme modell som produksjons-agenten.
            </p>
          </PlaygroundSection>

          {showCapacityBanner ? (
            <div className="relative overflow-hidden rounded-xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/[0.07] via-background to-violet-500/[0.06] px-3 py-3 pr-10">
              <button
                aria-label="Lukk"
                className="absolute top-2 right-2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCapacityBanner(false)}
                type="button"
              >
                <XIcon className="size-4" />
              </button>
              <p className="text-[12px] leading-relaxed">
                <span className="font-medium text-foreground">
                  Mer kontekst snart:
                </span>{" "}
                vedlegg i chat, flere modeller og lengre instruks — på roadmap.
              </p>
            </div>
          ) : null}

          <PlaygroundSection
            title="Instruksjoner (systemprompt)"
            headerRight={
              <div className="flex items-center gap-2">
                <Button
                  className="size-7 shrink-0 rounded-lg"
                  onClick={() => setInstructions("")}
                  size="icon"
                  title="Tilbakestill til standard"
                  type="button"
                  variant="outline"
                >
                  <RotateCcwIcon className="size-3.5" />
                </Button>
                <Button
                  className="h-7 gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold"
                  onClick={() =>
                    toast.info(
                      "Lagring av systemprompt kommer i en senere versjon.",
                    )
                  }
                  size="sm"
                  type="button"
                  variant="default"
                >
                  <SaveIcon className="size-3" strokeWidth={2.5} />
                  Lagre
                </Button>
              </div>
            }
          >
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Overstyrer standardoppførselen til assistenten. Tom = standard.
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

      <div className="dash-knowledge-playground relative flex min-h-0 min-w-0 flex-1 flex-col bg-muted/15">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/50 bg-background/60 px-5 py-3.5 backdrop-blur-sm lg:px-8 dark:bg-background/30">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
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
                Widget krever en aktiv organisasjon.
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "dash-card-surface w-full max-w-[400px] overflow-hidden rounded-2xl",
                "shadow-[0_1px_0_rgba(255,255,255,0.55)_inset,0_12px_40px_-28px_rgba(0,0,0,0.14)]",
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
