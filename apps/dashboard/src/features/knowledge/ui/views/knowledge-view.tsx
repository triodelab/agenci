import { cn } from "@workspace/ui/lib/utils";
import {
  GlobeIcon,
  SearchIcon,
  SparklesIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import {
  type DragEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { DemoSwitch } from "@/components/demo-switch";
import { Segment } from "@/components/segment";
import {
  cardClass,
  dataTextClass,
} from "@/features/conversations/ui/components/conversation-ui";
import { setDemoMode, useDemoMode } from "@/lib/demo-mode";
import {
  type KnowledgeSource,
  useAddWebpageSourceMutation,
  useDeleteSourceMutation,
  useKnowledgeOverviewQuery,
  useUploadSourceMutation,
} from "../../queries/knowledge-queries";
import { KnowledgeAssistant } from "../components/knowledge-assistant";
import {
  chunkMatches,
  type GraphSelection,
  KnowledgeGraph,
  KnowledgeGraph3D,
  TYPE_META,
} from "../components/knowledge-graph";
import {
  KnowledgeLibrary,
  type PendingUpload,
} from "../components/knowledge-library";
import { KnowledgePanel, TypeDot } from "../components/knowledge-panel";

/** Formats LlamaParse can read (documents, sheets, slides, web, images). */
const UPLOAD_ACCEPT =
  ".pdf,.doc,.docx,.txt,.md,.markdown,.rtf,.odt,.ppt,.pptx,.xls,.xlsx,.csv,.html,.htm,.epub,.png,.jpg,.jpeg,.webp";
const MAX_FILE_MB = 50;

type TypeFilter = "all" | KnowledgeSource["type"];

const fmt = (n: number) => n.toLocaleString("nb-NO");

function isValidHttpUrl(url: string) {
  try {
    const u = new URL(url.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function guessType(file: File): KnowledgeSource["type"] {
  return /^(image|video|audio)\//.test(file.type) ? "MEDIA" : "DOCUMENT";
}

const pillButton =
  "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-[background-color,color,transform] duration-150 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40";

export function KnowledgeView({ agentId }: { agentId: string }) {
  const { on: demo } = useDemoMode();
  const { data, isPending, isError } = useKnowledgeOverviewQuery(agentId);
  const addWebpage = useAddWebpageSourceMutation(agentId);
  const upload = useUploadSourceMutation(agentId);
  const remove = useDeleteSourceMutation(agentId);

  const [selection, setSelection] = useState<GraphSelection>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [dragDepth, setDragDepth] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const graphRef = useRef<HTMLElement>(null);
  /** Failed document being replaced by the next picked file. */
  const replacing = useRef<string | null>(null);

  useEffect(() => {
    if (adding) urlRef.current?.focus();
  }, [adding]);

  // The knowledge assistant is a slide-over panel; ⌘/Ctrl+J toggles it.
  const [askOpen, setAskOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setAskOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sources = data?.sources ?? [];
  const visibleSources = useMemo(
    () =>
      typeFilter === "all"
        ? sources
        : sources.filter((s) => s.type === typeFilter),
    [sources, typeFilter],
  );
  const typeOptions = [
    { value: "all" as const, label: "Alle", count: sources.length },
    ...(["WEBPAGE", "DOCUMENT", "MEDIA"] as const)
      .filter((t) => t !== "MEDIA" || sources.some((s) => s.type === "MEDIA"))
      .map((t) => ({
        value: t,
        label: TYPE_META[t].plural,
        count: sources.filter((s) => s.type === t).length,
      })),
  ];
  const q = query.trim();
  const hits = q
    ? sources.reduce(
        (n, s) => n + s.chunks.filter((c) => chunkMatches(c, q)).length,
        0,
      )
    : 0;

  /** Real actions always hit the real knowledge base — leave demo mode. */
  const ensureLive = () => {
    if (!demo) return;
    setDemoMode(false);
    setSelection(null);
    toast.info("Demodata er slått av — du ser nå den ekte kunnskapsbasen.");
  };

  const uploadFiles = async (files: File[]) => {
    const valid = files.filter((f) => {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${f.name} er større enn ${MAX_FILE_MB} MB`);
        return false;
      }
      return true;
    });
    if (!valid.length) return;
    ensureLive();
    const items = valid.map((f) => ({
      file: f,
      pending: {
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
        name: f.name,
        type: guessType(f),
      },
    }));
    setPending((p) => [...items.map((i) => i.pending), ...p]);
    const replaceId = replacing.current;
    replacing.current = null;
    await Promise.allSettled(
      items.map(async ({ file, pending: p }) => {
        try {
          await upload.mutateAsync(file);
        } finally {
          setPending((cur) => cur.filter((x) => x.id !== p.id));
        }
      }),
    );
    if (replaceId) remove.mutate(replaceId);
  };

  const pickFiles = () => fileRef.current?.click();

  const submitUrl = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!isValidHttpUrl(trimmed)) return;
    ensureLive();
    await addWebpage.mutateAsync(trimmed);
    setUrl("");
    setAdding(false);
  };

  const removeSource = (id: string) => {
    if (demo) {
      toast.info(
        "Demokilder kan ikke fjernes. Slå av demodata for å endre kunnskapsbasen.",
      );
      return;
    }
    remove.mutate(id, {
      onSuccess: () => setSelection((s) => (s?.sourceId === id ? null : s)),
    });
  };

  const retrySource = async (s: KnowledgeSource) => {
    if (demo) {
      toast.info("Slå av demodata for å prøve på nytt.");
      return;
    }
    if (s.type === "WEBPAGE" && s.url) {
      await remove.mutateAsync(s.id);
      await addWebpage.mutateAsync(s.url);
    } else {
      replacing.current = s.id;
      pickFiles();
    }
  };

  /** Citation click: open that exact chunk in the graph + panel. */
  const showChunk = (documentId: string, index: number) => {
    if (demo) {
      // Citations always point at real sources.
      setDemoMode(false);
      toast.info(
        "Demodata er slått av — viser kilden fra den ekte kunnskapsbasen.",
      );
    }
    setTypeFilter("all");
    setQuery("");
    setSelection({ kind: "chunk", sourceId: documentId, index });
    graphRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectFromLibrary = (id: string) => {
    setSelection({ kind: "source", sourceId: id });
    graphRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Drag & drop anywhere on the page.
  const hasFiles = (e: DragEvent) => e.dataTransfer?.types?.includes("Files");
  const onDragEnter = (e: DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    setDragDepth((d) => d + 1);
  };
  const onDragLeave = (e: DragEvent) => {
    if (!hasFiles(e)) return;
    setDragDepth((d) => Math.max(0, d - 1));
  };
  const onDrop = (e: DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    setDragDepth(0);
    void uploadFiles(Array.from(e.dataTransfer.files));
  };

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-[13px] text-(--agenci-ink-2)">
        Kunne ikke laste kunnskapsbasen. Prøv å laste siden på nytt.
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: file drop target; the "Last opp filer" button offers the same by keyboard */}
      <div
        className="relative flex min-h-0 flex-1 flex-col overflow-y-auto p-4 md:p-5 [&>*]:shrink-0"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={(e) => hasFiles(e) && e.preventDefault()}
        onDrop={onDrop}
      >
        {/* Drop overlay */}
        {dragDepth > 0 ? (
          <div className="kb-card-in pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-white/55 backdrop-blur-sm dark:bg-black/40">
            <div className="flex flex-col items-center gap-3 rounded-[24px] border-2 border-dashed border-(--agenci-ink)/40 bg-white/90 px-12 py-10 text-center shadow-[0_24px_60px_-24px_rgb(5_6_7/0.35)] dark:bg-(--card)">
              <span className="kb-breathe flex size-14 items-center justify-center rounded-full bg-(--agenci-ink) text-white dark:text-[#0b0c0e]">
                <UploadIcon
                  className="size-6"
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                />
              </span>
              <p className="[font-family:var(--font-agenci-title)] text-[22px] font-medium tracking-[-0.03em] text-(--agenci-ink)">
                Slipp for å lære agenten
              </p>
              <p className="text-[13px] text-(--agenci-ink-2)">
                PDF, Word, Excel, PowerPoint, tekst og bilder · maks{" "}
                {MAX_FILE_MB} MB per fil
              </p>
            </div>
          </div>
        ) : null}

        {/* Header */}
        <header className="flex shrink-0 flex-wrap items-end gap-x-6 gap-y-3 px-1">
          <div className="min-w-0">
            <h1 className="[font-family:var(--font-agenci-title)] text-[24px] leading-[1.15] font-medium tracking-[-0.03em] text-(--agenci-ink)">
              Kunnskapsbase
            </h1>
            <p className="mt-1.5 text-[13.5px] text-(--agenci-ink-2)">
              {data ? (
                <>
                  <span className="text-(--agenci-ink)">{data.agent.name}</span>{" "}
                  svarer ut fra{" "}
                  <span className="text-(--agenci-ink)">
                    {fmt(data.totals.chunks)}
                  </span>{" "}
                  kunnskapsbiter i{" "}
                  <span className="text-(--agenci-ink)">
                    {fmt(data.totals.sources)}
                  </span>{" "}
                  {data.totals.sources === 1 ? "kilde" : "kilder"}
                  <span
                    className={cn(dataTextClass, "ml-2 text-(--agenci-ink-3)")}
                  >
                    {fmt(data.totals.words)} ord
                  </span>
                </>
              ) : (
                "Laster kunnskap…"
              )}
            </p>
          </div>
          <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
            <DemoSwitch />
            <button
              type="button"
              onClick={() => setAskOpen(true)}
              className={cn(
                pillButton,
                "border border-(--agenci-line) bg-white text-(--agenci-ink) hover:bg-[#f6f7f6] dark:bg-transparent",
              )}
            >
              <SparklesIcon
                className="size-4"
                strokeWidth={1.5}
                absoluteStrokeWidth
              />
              Spør kunnskapsbasen
            </button>
            <button
              type="button"
              onClick={() => setAdding((a) => !a)}
              className={cn(
                pillButton,
                "border border-(--agenci-line) bg-white text-(--agenci-ink) hover:bg-[#f6f7f6] dark:bg-transparent",
              )}
            >
              <GlobeIcon
                className="size-4"
                strokeWidth={1.5}
                absoluteStrokeWidth
              />
              Legg til nettside
            </button>
            <button
              type="button"
              disabled={upload.isPending && pending.length > 4}
              onClick={pickFiles}
              className={cn(
                pillButton,
                "bg-(--agenci-ink) text-white hover:bg-(--agenci-accent-hover) dark:text-[#0b0c0e]",
              )}
            >
              <UploadIcon
                className="size-4"
                strokeWidth={1.5}
                absoluteStrokeWidth
              />
              Last opp filer
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept={UPLOAD_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                void uploadFiles(files);
              }}
            />
          </div>
        </header>

        {adding ? (
          <form
            onSubmit={(e) => void submitUrl(e)}
            className={cn(
              cardClass,
              "kb-card-in mt-4 flex flex-wrap items-center gap-2 p-2 pl-4",
            )}
          >
            <GlobeIcon
              className="size-4 text-(--agenci-ink-3)"
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
            <input
              ref={urlRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.dinbedrift.no/side"
              aria-label="Nettadresse"
              className="h-9 min-w-[220px] flex-1 bg-transparent text-[14px] text-(--agenci-ink) outline-none placeholder:text-(--agenci-ink-3)"
            />
            <span className="text-[12px] text-(--agenci-ink-3)">
              Agenten leser siden og lærer innholdet.
            </span>
            <button
              type="submit"
              disabled={!isValidHttpUrl(url) || addWebpage.isPending}
              className={cn(
                pillButton,
                "bg-(--agenci-ink) text-white hover:bg-(--agenci-accent-hover) dark:text-[#0b0c0e]",
              )}
            >
              {addWebpage.isPending ? "Legger til…" : "Legg til"}
            </button>
            <button
              type="button"
              aria-label="Avbryt"
              onClick={() => setAdding(false)}
              className="flex size-9 items-center justify-center rounded-full text-(--agenci-ink-3) hover:text-(--agenci-ink)"
            >
              <XIcon className="size-4" strokeWidth={1.5} absoluteStrokeWidth />
            </button>
          </form>
        ) : null}

        {/* Graph + panel */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section
            ref={graphRef}
            className={cn(
              cardClass,
              "flex min-h-[560px] scroll-mt-4 flex-col p-4",
            )}
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex h-9 w-full items-center sm:w-[300px]">
                <SearchIcon
                  aria-hidden
                  className="pointer-events-none absolute left-3 size-4 text-(--agenci-ink-3)"
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelection(null);
                  }}
                  placeholder="Hva vet agenten om… (f.eks. retur)"
                  aria-label="Søk i kunnskapen"
                  className="h-9 w-full rounded-full border border-(--agenci-line) bg-white pr-9 pl-9 text-[13.5px] text-(--agenci-ink) outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-(--agenci-ink-3) focus:border-(--agenci-ink-3) focus:shadow-[0_0_0_3px_rgb(36_50_54/0.08)] dark:border-white/10 dark:bg-white/5"
                />
                {query ? (
                  <button
                    type="button"
                    aria-label="Tøm søk"
                    onClick={() => setQuery("")}
                    className="absolute right-2 flex size-5 items-center justify-center rounded-full text-(--agenci-ink-3) hover:text-(--agenci-ink)"
                  >
                    <XIcon
                      className="size-3.5"
                      strokeWidth={1.5}
                      absoluteStrokeWidth
                    />
                  </button>
                ) : null}
              </div>
              {q ? (
                <span
                  className={cn(
                    dataTextClass,
                    "text-[12px] text-(--agenci-ink-2)",
                  )}
                >
                  {hits} treff
                </span>
              ) : null}
              <Segment
                label="Type kilde"
                options={typeOptions}
                value={typeFilter}
                onChange={(t) => {
                  setTypeFilter(t);
                  setSelection(null);
                }}
                className="ml-auto"
              />
            </div>

            {/* Clicking the empty area around the graph also puts the pieces back. */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: background click is a convenience; Esc does the same by keyboard */}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: Esc is handled globally by the graph */}
            <div
              className="relative flex flex-1 items-center justify-center py-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setSelection(null);
              }}
            >
              {isPending ? (
                <div className="aspect-square w-full max-w-[520px] animate-pulse rounded-full bg-[#f3f5f4]" />
              ) : data && sources.length === 0 ? (
                <button
                  type="button"
                  onClick={pickFiles}
                  className="group flex max-w-md flex-col items-center rounded-[24px] border-2 border-dashed border-(--agenci-line) px-10 py-12 text-center transition-colors hover:border-(--agenci-ink-3)"
                >
                  <span className="kb-breathe mx-auto size-16 rounded-full bg-(--agenci-ink)" />
                  <span className="mt-5 text-[15px] font-semibold text-(--agenci-ink)">
                    Kunnskapsbasen er tom
                  </span>
                  <span className="mt-1 text-[13px] text-(--agenci-ink-2)">
                    Slipp filer her, last opp dokumenter eller legg til
                    nettsiden deres, så lærer agenten innholdet og kan svare
                    kundene.
                  </span>
                </button>
              ) : data ? (
                // Keyed so switching view replays the enter animation.
                <div key={typeFilter} className="kb-enter w-full">
                  {typeFilter === "all" ? (
                    <KnowledgeGraph
                      agentName={data.agent.name}
                      sources={visibleSources}
                      query={query}
                      selection={selection}
                      onSelect={setSelection}
                      highlight={highlight}
                    />
                  ) : (
                    <KnowledgeGraph3D
                      agentName={data.agent.name}
                      type={typeFilter}
                      sources={visibleSources}
                      query={query}
                      selection={selection}
                      onSelect={setSelection}
                      highlight={highlight}
                    />
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-(--agenci-ink-3)">
              {(["WEBPAGE", "DOCUMENT", "MEDIA"] as const).map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <TypeDot type={t} />
                  {TYPE_META[t].plural}
                </span>
              ))}
              <span className="ml-auto">
                Stor prikk = kilde · små prikker = kunnskapsbiter
              </span>
            </div>
          </section>

          <aside
            className={cn(
              cardClass,
              "min-h-0 p-5 xl:max-h-[calc(560px)] xl:overflow-y-auto",
            )}
          >
            {data ? (
              <KnowledgePanel
                agentId={agentId}
                data={data}
                query={query}
                selection={selection}
                onSelect={setSelection}
                onDelete={removeSource}
                deleting={remove.isPending}
                readOnly={demo}
              />
            ) : (
              <div className="space-y-3">
                {[60, 90, 75, 85].map((w) => (
                  <div
                    key={w}
                    className="h-3.5 animate-pulse rounded bg-[#f1f3f2]"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            )}
          </aside>
        </div>

        {data ? (
          <KnowledgeLibrary
            sources={visibleSources}
            pending={pending}
            typeFilter={typeFilter}
            selectedId={selection?.sourceId ?? null}
            busyAction={remove.isPending || addWebpage.isPending}
            onHover={setHighlight}
            onSelect={selectFromLibrary}
            onRetry={(s) => void retrySource(s)}
            onRemove={removeSource}
          />
        ) : null}
      </div>

      {/* Fixed strip under the scroll area for the chat button. */}
      <div aria-hidden className="h-14 shrink-0" />

      {/* Outside the scroll area, so it stays in the box's bottom corner. */}
      {data ? (
        <KnowledgeAssistant
          agentId={agentId}
          agentName={data.agent.name}
          sources={sources}
          // Demo sources aren't real, so only focus on a real selected source.
          focusSource={
            !demo && selection
              ? (sources.find((s) => s.id === selection.sourceId) ?? null)
              : null
          }
          demo={demo}
          onClearFocus={() => setSelection(null)}
          onShowChunk={showChunk}
          open={askOpen}
          onOpenChange={setAskOpen}
        />
      ) : null}
    </div>
  );
}
