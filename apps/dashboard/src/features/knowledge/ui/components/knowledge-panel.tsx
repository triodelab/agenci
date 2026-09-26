import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { TonePill } from "@/features/agents/ui/components/overview-cards";
import {
  dataTextClass,
  formatLongDate,
} from "@/features/conversations/ui/components/conversation-ui";
import {
  isSourceBusy,
  type KnowledgeOverview,
  type KnowledgeSource,
  useKnowledgeSourceQuery,
} from "../../queries/knowledge-queries";
import {
  chunkMatches,
  type GraphSelection,
  TYPE_META,
} from "./knowledge-graph";

export const captionClass = cn(
  dataTextClass,
  "text-[12px] font-medium tracking-[0.06em] uppercase text-(--agenci-ink-3)",
);

export function SourceStatus({ source }: { source: KnowledgeSource }) {
  if (source.status === "FAILED") return <TonePill tone="bad">Feilet</TonePill>;
  if (isSourceBusy(source)) return <TonePill tone="warn">Indekseres</TonePill>;
  return <TonePill tone="ok">Klar</TonePill>;
}

export function TypeDot({ type }: { type: KnowledgeSource["type"] }) {
  return (
    <span
      aria-hidden
      className="size-2 shrink-0 rounded-full"
      style={{ background: TYPE_META[type].color }}
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-[#f6f7f6] px-3 py-2.5 dark:bg-white/[0.04]">
      <p className={captionClass}>{label}</p>
      <p className="mt-1 [font-family:var(--font-agenci-title)] text-[20px] leading-none font-medium tracking-[-0.03em] tabular-nums text-(--agenci-ink)">
        {value}
      </p>
    </div>
  );
}

const fmt = (n: number) => n.toLocaleString("nb-NO");

// ─── Default: agent + brand ──────────────────────────────────────────────────

const AGENT_STATUS: Record<
  string,
  { label: string; tone: "ok" | "warn" | "bad" }
> = {
  COMPLETED: { label: "Aktiv", tone: "ok" },
  PENDING: { label: "Venter", tone: "warn" },
  PROCESSING: { label: "Indekserer", tone: "warn" },
  FAILED: { label: "Feilet", tone: "bad" },
};

function AgentPanel({ data }: { data: KnowledgeOverview }) {
  const [more, setMore] = useState(false);
  const status = AGENT_STATUS[data.agent.status] ?? AGENT_STATUS.COMPLETED;
  const b = data.brand;
  const colors = b
    ? [
        { label: "Primær", value: b.primaryColor },
        { label: "Aksent", value: b.accentColor },
        { label: "Bakgrunn", value: b.backgroundColor },
        { label: "Tekst", value: b.textPrimaryColor },
      ].filter((c): c is { label: string; value: string } => Boolean(c.value))
    : [];

  return (
    <div className="flex flex-col gap-5">
      <section>
        <div className="flex items-center gap-2">
          <p className={captionClass}>Agenten</p>
          {status ? (
            <span className="ml-auto">
              <TonePill tone={status.tone}>{status.label}</TonePill>
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 [font-family:var(--font-agenci-title)] text-[22px] leading-tight font-medium tracking-[-0.03em] text-(--agenci-ink)">
          {data.agent.name}
        </h3>
        {data.agent.description ? (
          <>
            <p
              className={cn(
                "mt-2 text-[13px] leading-relaxed whitespace-pre-line text-(--agenci-ink-2)",
                !more && "line-clamp-5",
              )}
            >
              {data.agent.description}
            </p>
            {data.agent.description.length > 260 ? (
              <button
                type="button"
                onClick={() => setMore((m) => !m)}
                className="mt-1 text-[12.5px] text-(--agenci-ink) underline-offset-2 hover:underline"
              >
                {more ? "Vis mindre" : "Vis mer"}
              </button>
            ) : null}
          </>
        ) : null}
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[12.5px]">
          {data.agent.modelLabel ? (
            <>
              <dt className="text-(--agenci-ink-3)">Modell</dt>
              <dd className="text-right text-(--agenci-ink)">
                {data.agent.modelLabel}
              </dd>
            </>
          ) : null}
          <dt className="text-(--agenci-ink-3)">Opprettet</dt>
          <dd className="text-right text-(--agenci-ink)">
            {formatLongDate(data.agent.createdAt)}
          </dd>
          <dt className="text-(--agenci-ink-3)">Sist endret</dt>
          <dd className="text-right text-(--agenci-ink)">
            {formatLongDate(data.agent.updatedAt)}
          </dd>
        </dl>
      </section>

      <section className="border-t border-(--agenci-line) pt-5">
        <p className={captionClass}>Merkevare</p>
        {b ? (
          <>
            <div className="mt-3 flex items-center gap-3">
              {b.logoUrl ? (
                <img
                  src={b.logoUrl}
                  alt=""
                  className="size-10 rounded-[10px] border border-(--agenci-line) bg-white object-contain p-1"
                />
              ) : null}
              <div className="min-w-0">
                {b.sourceUrl ? (
                  <a
                    href={b.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-[13px] font-medium text-(--agenci-ink) hover:underline"
                  >
                    {b.sourceUrl
                      .replace(/^https?:\/\/(www\.)?/, "")
                      .replace(/\/$/, "")}
                  </a>
                ) : null}
                <p className="text-[12px] text-(--agenci-ink-3)">
                  Hentet automatisk {formatLongDate(b.extractedAt)}
                </p>
              </div>
            </div>
            {colors.length ? (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {colors.map((c) => (
                  <div key={c.label} className="min-w-0">
                    <span
                      className="block h-9 rounded-[10px] border border-black/5"
                      style={{ background: c.value }}
                    />
                    <p className="mt-1 truncate text-[12px] text-(--agenci-ink-3)">
                      {c.label}
                    </p>
                    <p
                      className={cn(
                        dataTextClass,
                        "truncate text-[12px] text-(--agenci-ink)",
                      )}
                    >
                      {c.value.toUpperCase()}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
            {b.fontFamilyPrimary || b.fontFamilyHeading ? (
              <p className="mt-3 text-[12.5px] text-(--agenci-ink-2)">
                Skrift:{" "}
                <span className="text-(--agenci-ink)">
                  {[b.fontFamilyHeading, b.fontFamilyPrimary]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </p>
            ) : null}
          </>
        ) : (
          <p className="mt-2 text-[13px] text-(--agenci-ink-3)">
            Ingen merkevare hentet ennå. Den hentes fra nettsiden når agenten
            opprettes.
          </p>
        )}
      </section>

      <p className="rounded-[10px] bg-[#f6f7f6] px-3 py-2.5 text-[12.5px] leading-snug text-(--agenci-ink-2) dark:bg-white/[0.04]">
        Klikk på en kilde eller en prikk i grafen for å se nøyaktig hva agenten
        vet — eller søk i kunnskapen.
      </p>
    </div>
  );
}

// ─── Search results ──────────────────────────────────────────────────────────

function SearchPanel({
  data,
  query,
  onSelect,
}: {
  data: KnowledgeOverview;
  query: string;
  onSelect: (s: GraphSelection) => void;
}) {
  const hits = data.sources.flatMap((s) =>
    s.chunks.filter((c) => chunkMatches(c, query)).map((c) => ({ s, c })),
  );
  const sourcesHit = new Set(hits.map((h) => h.s.id)).size;

  return (
    <div className="flex min-h-0 flex-col">
      <p className={captionClass}>Søk i kunnskapen</p>
      <h3 className="mt-2 text-[15px] font-semibold text-(--agenci-ink)">
        {hits.length
          ? `${hits.length} treff i ${sourcesHit} ${sourcesHit === 1 ? "kilde" : "kilder"}`
          : "Agenten vet ingenting om dette"}
      </h3>
      <p className="mt-1 text-[12.5px] text-(--agenci-ink-3)">
        {hits.length
          ? "Dette er bitene agenten kan hente når kunder spør om «" +
            query +
            "»."
          : "Legg til en nettside eller et dokument som dekker temaet, så kan agenten svare."}
      </p>
      <ul className="mt-3 flex flex-col gap-1.5">
        {hits.slice(0, 40).map(({ s, c }) => (
          <li key={`${s.id}:${c.index}`}>
            <button
              type="button"
              onClick={() =>
                onSelect({ kind: "chunk", sourceId: s.id, index: c.index })
              }
              className="w-full rounded-[10px] px-2.5 py-2 text-left transition-colors hover:bg-[#f6f7f6] dark:hover:bg-white/5"
            >
              <span className="flex items-center gap-2 text-[13px] font-medium text-(--agenci-ink)">
                <TypeDot type={s.type} />
                <span className="truncate">{c.title}</span>
              </span>
              <span className="mt-0.5 block truncate pl-4 text-[12px] text-(--agenci-ink-3)">
                {s.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Source detail ───────────────────────────────────────────────────────────

function SourcePanel({
  source,
  onSelect,
  onDelete,
  deleting,
  readOnly,
}: {
  source: KnowledgeSource;
  onSelect: (s: GraphSelection) => void;
  onDelete: () => void;
  deleting: boolean;
  readOnly: boolean;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="flex min-h-0 flex-col">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className="mb-3 inline-flex items-center gap-1 self-start text-[12.5px] text-(--agenci-ink-3) hover:text-(--agenci-ink)"
      >
        <ArrowLeftIcon
          className="size-3.5"
          strokeWidth={1.5}
          absoluteStrokeWidth
        />
        Oversikt
      </button>
      <div className="flex items-center gap-2">
        <TypeDot type={source.type} />
        <p className={captionClass}>{TYPE_META[source.type].label}</p>
        <span className="ml-auto">
          <SourceStatus source={source} />
        </span>
      </div>
      <h3 className="mt-2 text-[16px] leading-snug font-semibold break-words text-(--agenci-ink)">
        {source.name}
      </h3>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Biter" value={fmt(source.chunkCount)} />
        <Stat label="Ord" value={fmt(source.words)} />
        <Stat
          label="Lagt til"
          value={new Date(source.createdAt).toLocaleDateString("nb-NO", {
            day: "numeric",
            month: "short",
          })}
        />
      </div>
      {source.status === "FAILED" ? (
        <p className="mt-3 rounded-[10px] bg-[#F9E2DF] px-3 py-2 text-[12.5px] text-[#B2463A]">
          Kilden kunne ikke leses. Fjern den og prøv å legge den til på nytt.
        </p>
      ) : isSourceBusy(source) ? (
        <p className="mt-3 rounded-[10px] bg-[#FBEBDD] px-3 py-2 text-[12.5px] text-[#B06A34]">
          Leses og indekseres nå — agenten kan bruke den om et øyeblikk.
        </p>
      ) : null}
      <div className="mt-3 flex gap-2">
        {source.url ? (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-(--agenci-line) bg-white px-3.5 text-[13px] text-(--agenci-ink) transition-colors hover:bg-[#f6f7f6] dark:bg-transparent"
          >
            <ExternalLinkIcon
              className="size-3.5"
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
            Åpne kilde
          </a>
        ) : null}
        <button
          type="button"
          disabled={readOnly || deleting}
          title={
            readOnly ? "Slå av demodata for å endre kunnskapsbasen" : undefined
          }
          onClick={() => (confirm ? onDelete() : setConfirm(true))}
          onBlur={() => setConfirm(false)}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] transition-colors disabled:opacity-40",
            confirm
              ? "bg-[#B2463A] text-white"
              : "border border-(--agenci-line) bg-white text-(--agenci-ink-2) hover:text-[#B2463A] dark:bg-transparent",
          )}
        >
          <Trash2Icon
            className="size-3.5"
            strokeWidth={1.5}
            absoluteStrokeWidth
          />
          {deleting ? "Fjerner…" : confirm ? "Bekreft fjerning" : "Fjern"}
        </button>
      </div>

      <p className={cn(captionClass, "mt-5")}>Hva agenten vet herfra</p>
      <ol className="mt-2 flex flex-col">
        {source.chunks.map((c, i) => (
          <li key={c.index}>
            <button
              type="button"
              onClick={() =>
                onSelect({ kind: "chunk", sourceId: source.id, index: c.index })
              }
              className="flex w-full items-baseline gap-3 rounded-[10px] px-2 py-1.5 text-left transition-colors hover:bg-[#f6f7f6] dark:hover:bg-white/5"
            >
              <span
                className={cn(
                  dataTextClass,
                  "w-5 shrink-0 text-right text-[12px] text-(--agenci-ink-3)",
                )}
              >
                {i + 1}
              </span>
              <span className="truncate text-[13px] text-(--agenci-ink)">
                {c.title}
              </span>
            </button>
          </li>
        ))}
        {source.chunks.length === 0 ? (
          <li className="px-2 text-[12.5px] text-(--agenci-ink-3)">
            Ingen kunnskapsbiter ennå.
          </li>
        ) : null}
      </ol>
    </div>
  );
}

// ─── Chunk detail ────────────────────────────────────────────────────────────

function ChunkPanel({
  agentId,
  source,
  index,
  onSelect,
}: {
  agentId: string;
  source: KnowledgeSource;
  index: number;
  onSelect: (s: GraphSelection) => void;
}) {
  const { data: detail, isPending } = useKnowledgeSourceQuery(
    agentId,
    source.id,
  );
  const pos = source.chunks.findIndex((c) => c.index === index);
  const summary = source.chunks[pos];
  const full = detail?.chunks.find((c) => c.index === index);
  const go = (d: number) => {
    const next = source.chunks[pos + d];
    if (next)
      onSelect({ kind: "chunk", sourceId: source.id, index: next.index });
  };

  return (
    <div className="flex min-h-0 flex-col">
      <button
        type="button"
        onClick={() => onSelect({ kind: "source", sourceId: source.id })}
        className="mb-3 inline-flex items-center gap-1 self-start text-[12.5px] text-(--agenci-ink-3) hover:text-(--agenci-ink)"
      >
        <ArrowLeftIcon
          className="size-3.5"
          strokeWidth={1.5}
          absoluteStrokeWidth
        />
        <span className="max-w-[240px] truncate">{source.name}</span>
      </button>
      <div className="flex items-center gap-2">
        <TypeDot type={source.type} />
        <p className={captionClass}>
          Kunnskapsbit {pos + 1} av {source.chunks.length}
        </p>
        <span className="ml-auto flex gap-1">
          <button
            type="button"
            aria-label="Forrige"
            disabled={pos <= 0}
            onClick={() => go(-1)}
            className="flex size-7 items-center justify-center rounded-full border border-(--agenci-line) text-(--agenci-ink-2) hover:text-(--agenci-ink) disabled:opacity-30"
          >
            <ChevronLeftIcon
              className="size-3.5"
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
          </button>
          <button
            type="button"
            aria-label="Neste"
            disabled={pos >= source.chunks.length - 1}
            onClick={() => go(1)}
            className="flex size-7 items-center justify-center rounded-full border border-(--agenci-line) text-(--agenci-ink-2) hover:text-(--agenci-ink) disabled:opacity-30"
          >
            <ChevronRightIcon
              className="size-3.5"
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
          </button>
        </span>
      </div>
      <h3 className="mt-2 text-[16px] leading-snug font-semibold text-(--agenci-ink)">
        {summary?.title ?? "Kunnskapsbit"}
      </h3>
      <div className="mt-3 rounded-[12px] border border-(--agenci-line) bg-white p-3.5 dark:bg-transparent">
        {isPending && !full ? (
          <div className="space-y-2">
            {[90, 100, 80, 95].map((w) => (
              <div
                key={w}
                className="h-3 animate-pulse rounded bg-[#f1f3f2]"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        ) : (
          <p className="text-[13.5px] leading-relaxed whitespace-pre-line text-(--agenci-ink) [font-family:var(--font-agenci-voice)]">
            {full?.text ?? summary?.excerpt}
          </p>
        )}
      </div>
      <p className="mt-2 text-[12px] text-(--agenci-ink-3)">
        Slik ser teksten ut når agenten henter den for å svare en kunde.
      </p>
    </div>
  );
}

// ─── Switch ──────────────────────────────────────────────────────────────────

export function KnowledgePanel({
  agentId,
  data,
  query,
  selection,
  onSelect,
  onDelete,
  deleting,
  readOnly,
}: {
  agentId: string;
  data: KnowledgeOverview;
  query: string;
  selection: GraphSelection;
  onSelect: (s: GraphSelection) => void;
  onDelete: (sourceId: string) => void;
  deleting: boolean;
  readOnly: boolean;
}) {
  const source = selection
    ? data.sources.find((s) => s.id === selection.sourceId)
    : undefined;

  if (selection?.kind === "chunk" && source) {
    return (
      <ChunkPanel
        agentId={agentId}
        source={source}
        index={selection.index}
        onSelect={onSelect}
      />
    );
  }
  if (selection?.kind === "source" && source) {
    return (
      <SourcePanel
        source={source}
        onSelect={onSelect}
        onDelete={() => onDelete(source.id)}
        deleting={deleting}
        readOnly={readOnly}
      />
    );
  }
  if (query.trim()) {
    return <SearchPanel data={data} query={query.trim()} onSelect={onSelect} />;
  }
  return <AgentPanel data={data} />;
}
