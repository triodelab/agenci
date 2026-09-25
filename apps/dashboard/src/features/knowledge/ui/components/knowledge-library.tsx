/**
 * Source library — one calm list instead of a card wall.
 *
 * - Composition bar: where the agent's knowledge comes from.
 * - Webpages grouped under their website (collapsible, with a tree line), so
 *   the list mirrors how the site is built; documents and media as flat lists.
 * - Each row is one line: icon, name, a slim meter (knowledge vs. the biggest
 *   source), chunk count, status, date. Actions appear on hover.
 * Hover a row to highlight it in the graph; click to open it.
 */
import { cn } from "@workspace/ui/lib/utils";
import {
  ChevronRightIcon,
  ExternalLinkIcon,
  FileTextIcon,
  FilmIcon,
  GlobeIcon,
  LoaderIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Segment } from "@/components/segment";
import {
  isSourceBusy,
  type KnowledgeSource,
} from "../../queries/knowledge-queries";
import { TYPE_META } from "./knowledge-graph";

type SourceType = KnowledgeSource["type"];
export type PendingUpload = { id: string; name: string; type: SourceType };

const TYPE_ICON = {
  WEBPAGE: GlobeIcon,
  DOCUMENT: FileTextIcon,
  MEDIA: FilmIcon,
} as const;

const fmt = (n: number) => n.toLocaleString("nb-NO");
const data = "[font-family:var(--font-agenci-data)] tabular-nums";

function shortDate(iso: string) {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "I dag";
  if (days === 1) return "I går";
  if (days < 7) return `${days} d siden`;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

function splitHost(s: KnowledgeSource) {
  const slash = s.name.indexOf("/");
  return slash > 0
    ? { host: s.name.slice(0, slash), path: s.name.slice(slash) }
    : { host: s.name, path: "/" };
}

function Status({ source }: { source: KnowledgeSource }) {
  if (source.status === "FAILED")
    return (
      <span className="flex items-center gap-1.5 text-[12.5px] text-[#B2463A]">
        <span className="size-1.5 rounded-full bg-[#B2463A]" />
        Feilet
      </span>
    );
  if (isSourceBusy(source))
    return (
      <span className="flex items-center gap-1.5 text-[12.5px] text-[#B06A34]">
        <LoaderIcon
          className="size-3 animate-spin"
          strokeWidth={1.5}
          absoluteStrokeWidth
        />
        {source.status === "PENDING"
          ? "Venter"
          : source.status === "PROCESSING"
            ? "Leser"
            : "Indekserer"}
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-[12.5px] text-(--agenci-ink-2)">
      <span className="size-1.5 rounded-full bg-[#3F7A4A]" />
      Klar
    </span>
  );
}

const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[minmax(0,1fr)_120px_64px_96px_84px]";

function SourceRow({
  source,
  label,
  indent,
  max,
  selected,
  busyAction,
  onHover,
  onSelect,
  onRetry,
  onRemove,
}: {
  source: KnowledgeSource;
  label: string;
  indent: boolean;
  max: number;
  selected: boolean;
  busyAction: boolean;
  onHover: (id: string | null) => void;
  onSelect: () => void;
  onRetry: () => void;
  onRemove: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const Icon = TYPE_ICON[source.type];
  const color = TYPE_META[source.type].color;
  const failed = source.status === "FAILED";

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover only mirrors the row into the graph; the row itself is a button
    <div
      className={cn(
        "group relative rounded-[10px] transition-colors duration-150",
        selected
          ? "bg-[#f1f3f2] dark:bg-white/[0.06]"
          : "hover:bg-[#f7f8f7] dark:hover:bg-white/[0.03]",
        indent && "ml-[26px]",
      )}
      onMouseEnter={() => onHover(source.id)}
      onMouseLeave={() => {
        onHover(null);
        setConfirm(false);
      }}
    >
      {indent ? (
        <span
          aria-hidden
          className="absolute top-0 bottom-0 -left-[14px] w-px bg-(--agenci-line)"
        />
      ) : null}
      {selected ? (
        <span
          aria-hidden
          className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-(--agenci-ink)"
        />
      ) : null}
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          ROW_GRID,
          "w-full px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-(--agenci-ink-3) rounded-[10px]",
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          {indent ? null : (
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-[8px]"
              style={{
                background: `color-mix(in srgb, ${color} 10%, white)`,
                color,
              }}
            >
              <Icon
                className="size-3.5"
                strokeWidth={1.5}
                absoluteStrokeWidth
              />
            </span>
          )}
          <span
            className={cn(
              "truncate text-[13.5px]",
              failed ? "text-[#B2463A]" : "text-(--agenci-ink)",
              indent ? "font-normal" : "font-medium",
            )}
          >
            {label}
          </span>
        </span>
        <span className="hidden items-center md:flex">
          <span className="h-1 w-full overflow-hidden rounded-full bg-[#eef0ef] dark:bg-white/10">
            <span
              className="block h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
              style={{
                width: `${(source.chunkCount / max) * 100}%`,
                background: color,
                opacity: 0.8,
              }}
            />
          </span>
        </span>
        <span
          className={cn(
            data,
            "hidden text-right text-[12.5px] text-(--agenci-ink) md:block",
          )}
        >
          {fmt(source.chunkCount)}
        </span>
        <span className="hidden md:block">
          <Status source={source} />
        </span>
        <span
          className={cn(
            data,
            "text-right text-[12px] text-(--agenci-ink-3) transition-opacity group-hover:opacity-0",
          )}
        >
          {shortDate(source.createdAt)}
        </span>
      </button>

      {/* Hover actions (sit over the date column) */}
      <span className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        {failed ? (
          <button
            type="button"
            onClick={onRetry}
            disabled={busyAction}
            className="inline-flex h-7 items-center gap-1 rounded-full bg-(--agenci-ink) px-2.5 text-[12px] font-medium text-white disabled:opacity-50 dark:text-[#0b0c0e]"
          >
            <RotateCcwIcon
              className="size-3"
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
            Prøv igjen
          </button>
        ) : null}
        {source.url ? (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Åpne kilde"
            title="Åpne kilde"
            className="flex size-7 items-center justify-center rounded-full bg-white text-(--agenci-ink-2) shadow-[0_1px_2px_rgb(5_6_7/0.08)] hover:text-(--agenci-ink) dark:bg-white/10"
          >
            <ExternalLinkIcon
              className="size-3.5"
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => (confirm ? onRemove() : setConfirm(true))}
          disabled={busyAction}
          aria-label="Fjern kilde"
          title={confirm ? "Klikk igjen for å fjerne" : "Fjern kilde"}
          className={cn(
            "flex h-7 items-center justify-center gap-1 rounded-full text-[12px] font-medium shadow-[0_1px_2px_rgb(5_6_7/0.08)] disabled:opacity-50",
            confirm
              ? "bg-[#B2463A] px-2.5 text-white"
              : "w-7 bg-white text-(--agenci-ink-2) hover:text-[#B2463A] dark:bg-white/10",
          )}
        >
          <Trash2Icon
            className="size-3.5"
            strokeWidth={1.5}
            absoluteStrokeWidth
          />
          {confirm ? "Fjern" : null}
        </button>
      </span>
    </div>
  );
}

function PendingRow({ upload }: { upload: PendingUpload }) {
  const Icon = TYPE_ICON[upload.type];
  return (
    <div className={cn(ROW_GRID, "kb-card-in rounded-[10px] px-3 py-2.5")}>
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-[#f3f5f4] text-(--agenci-ink-2) dark:bg-white/5">
          <Icon className="size-3.5" strokeWidth={1.5} absoluteStrokeWidth />
        </span>
        <span className="truncate text-[13.5px] font-medium text-(--agenci-ink)">
          {upload.name}
        </span>
      </span>
      <span className="kb-shimmer hidden h-1 rounded-full bg-[linear-gradient(90deg,#eef0ef_0%,#d7dcd9_40%,#eef0ef_80%)] bg-[length:200%_100%] md:block" />
      <span className="hidden md:block" />
      <span className="hidden items-center gap-1.5 text-[12.5px] text-(--agenci-ink-2) md:flex">
        <LoaderIcon
          className="size-3 animate-spin"
          strokeWidth={1.5}
          absoluteStrokeWidth
        />
        Laster opp
      </span>
      <span />
    </div>
  );
}

function SiteGroup({
  host,
  pages,
  ...rowProps
}: {
  host: string;
  pages: KnowledgeSource[];
} & Omit<
  Parameters<typeof SourceRow>[0],
  | "source"
  | "label"
  | "indent"
  | "selected"
  | "onSelect"
  | "onRetry"
  | "onRemove"
> & {
    selectedId: string | null;
    onSelect: (id: string) => void;
    onRetry: (s: KnowledgeSource) => void;
    onRemove: (id: string) => void;
  }) {
  const [open, setOpen] = useState(pages.length <= 6);
  const home = pages.find((p) => splitHost(p).path === "/");
  const subs = pages.filter((p) => p !== home);
  const chunks = pages.reduce((n, p) => n + p.chunkCount, 0);
  const busy = pages.filter(isSourceBusy).length;
  const failed = pages.filter((p) => p.status === "FAILED").length;
  const color = TYPE_META.WEBPAGE.color;
  const { selectedId, onSelect, onRetry, onRemove, max, busyAction, onHover } =
    rowProps;

  const row = (p: KnowledgeSource, label: string, indent: boolean) => (
    <SourceRow
      key={p.id}
      source={p}
      label={label}
      indent={indent}
      max={max}
      selected={selectedId === p.id}
      busyAction={busyAction}
      onHover={onHover}
      onSelect={() => onSelect(p.id)}
      onRetry={() => onRetry(p)}
      onRemove={() => onRemove(p.id)}
    />
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors hover:bg-[#f7f8f7] dark:hover:bg-white/[0.03]"
      >
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-[8px]"
          style={{
            background: `color-mix(in srgb, ${color} 10%, white)`,
            color,
          }}
        >
          <GlobeIcon
            className="size-3.5"
            strokeWidth={1.5}
            absoluteStrokeWidth
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-semibold text-(--agenci-ink)">
            {host}
          </span>
          <span className="block text-[12px] text-(--agenci-ink-3)">
            {pages.length} {pages.length === 1 ? "side" : "sider"} ·{" "}
            {fmt(chunks)} biter
            {busy ? ` · ${busy} indekseres` : ""}
            {failed ? ` · ${failed} feilet` : ""}
          </span>
        </span>
        <ChevronRightIcon
          className={cn(
            "size-4 text-(--agenci-ink-3) transition-transform duration-200",
            open && "rotate-90",
          )}
          strokeWidth={1.5}
          absoluteStrokeWidth
        />
      </button>
      {/* Smooth collapse via grid rows */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="pt-0.5 pb-1">
            {home ? row(home, "Forside", true) : null}
            {subs.map((p) => row(p, splitHost(p).path, true))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-2 px-3 text-[12px] font-medium tracking-[0.06em] text-(--agenci-ink-3) uppercase [font-family:var(--font-agenci-data)]">
        {title}
        <span className="tracking-normal">{count}</span>
      </p>
      {children}
    </div>
  );
}

type Sort = "new" | "most" | "az";
const SORTS: { value: Sort; label: string }[] = [
  { value: "new", label: "Nyeste" },
  { value: "most", label: "Størst" },
  { value: "az", label: "A–Å" },
];

export function KnowledgeLibrary({
  sources,
  pending,
  typeFilter,
  selectedId,
  busyAction,
  onHover,
  onSelect,
  onRetry,
  onRemove,
  onAddWebpage,
  onUpload,
}: {
  sources: KnowledgeSource[];
  pending: PendingUpload[];
  typeFilter: "all" | SourceType;
  selectedId: string | null;
  busyAction: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onRetry: (source: KnowledgeSource) => void;
  onRemove: (id: string) => void;
  onAddWebpage: () => void;
  onUpload: () => void;
}) {
  const [sort, setSort] = useState<Sort>("new");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return [...sources]
      .filter((s) => !needle || s.name.toLowerCase().includes(needle))
      .sort((a, b) =>
        sort === "most"
          ? b.chunkCount - a.chunkCount
          : sort === "az"
            ? a.name.localeCompare(b.name, "nb")
            : b.createdAt.localeCompare(a.createdAt),
      );
  }, [sources, sort, search]);

  const max = Math.max(...sources.map((s) => s.chunkCount), 1);
  const totalChunks = sources.reduce((n, s) => n + s.chunkCount, 0);
  const composition = (["WEBPAGE", "DOCUMENT", "MEDIA"] as const)
    .map((t) => {
      const list = sources.filter((s) => s.type === t);
      return {
        t,
        count: list.length,
        chunks: list.reduce((n, s) => n + s.chunkCount, 0),
      };
    })
    .filter((c) => c.count > 0);

  const sites = useMemo(() => {
    const map = new Map<string, KnowledgeSource[]>();
    for (const s of filtered.filter((x) => x.type === "WEBPAGE")) {
      const { host } = splitHost(s);
      map.set(host, [...(map.get(host) ?? []), s]);
    }
    return [...map.entries()];
  }, [filtered]);
  const docs = filtered.filter((s) => s.type === "DOCUMENT");
  const media = filtered.filter((s) => s.type === "MEDIA");
  const show = (t: SourceType) => typeFilter === "all" || typeFilter === t;

  const rowShared = { max, busyAction, onHover };
  const flatRow = (s: KnowledgeSource) => (
    <SourceRow
      key={s.id}
      source={s}
      label={s.name}
      indent={false}
      selected={selectedId === s.id}
      onSelect={() => onSelect(s.id)}
      onRetry={() => onRetry(s)}
      onRemove={() => onRemove(s.id)}
      {...rowShared}
    />
  );

  const empty = !filtered.length && !pending.length;

  return (
    <section className="mt-6 rounded-[24px] border border-(--agenci-line) bg-white p-2 shadow-[0_1px_3px_rgb(5_6_7/0.07),0_14px_34px_-14px_rgb(5_6_7/0.22)] dark:bg-(--card)">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 px-3 pt-3 pb-2">
        <div className="min-w-0">
          <h2 className="[font-family:var(--font-agenci-title)] text-[20px] leading-tight font-medium tracking-[-0.025em] text-(--agenci-ink)">
            Kildebibliotek
          </h2>
          <p className="text-[13px] text-(--agenci-ink-2)">
            {fmt(sources.length)} kilder · {fmt(totalChunks)} kunnskapsbiter
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative flex h-8 items-center">
            <SearchIcon
              aria-hidden
              className="pointer-events-none absolute left-2.5 size-3.5 text-(--agenci-ink-3)"
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Finn kilde"
              aria-label="Finn kilde"
              className="h-8 w-[170px] rounded-full border border-(--agenci-line) bg-white pr-3 pl-8 text-[13px] text-(--agenci-ink) outline-none transition-[width,border-color] duration-200 placeholder:text-(--agenci-ink-3) focus:w-[220px] focus:border-(--agenci-ink-3) dark:bg-transparent"
            />
          </div>
          <Segment
            label="Sorter"
            options={SORTS}
            value={sort}
            onChange={setSort}
          />
        </div>
      </div>

      {/* Composition */}
      {totalChunks > 0 ? (
        <div className="px-3 pb-3">
          <div className="flex h-1.5 gap-[3px] overflow-hidden rounded-full">
            {composition.map((c) => (
              <span
                key={c.t}
                className="h-full rounded-full transition-[flex-grow] duration-500"
                style={{
                  flexGrow: Math.max(c.chunks, 1),
                  background: TYPE_META[c.t].color,
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {composition.map((c) => (
              <span
                key={c.t}
                className="flex items-center gap-1.5 text-[12px] text-(--agenci-ink-2)"
              >
                <span
                  aria-hidden
                  className="size-1.5 rounded-full"
                  style={{ background: TYPE_META[c.t].color }}
                />
                {TYPE_META[c.t].plural}
                <span className={cn(data, "text-(--agenci-ink-3)")}>
                  {c.count} · {Math.round((c.chunks / totalChunks) * 100)} %
                </span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Column labels */}
      <div
        className={cn(
          ROW_GRID,
          "hidden border-t border-(--agenci-line) px-5 pt-3 pb-1.5 md:grid",
        )}
      >
        {["Kilde", "Kunnskap", "Biter", "Status", "Lagt til"].map((h, i) => (
          <span
            key={h}
            className={cn(
              "text-[12px] font-medium tracking-[0.06em] text-(--agenci-ink-3) uppercase [font-family:var(--font-agenci-data)]",
              (i === 2 || i === 4) && "text-right",
            )}
          >
            {h}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-4 px-2 pt-1 pb-2">
        {pending.length ? (
          <Section title="Laster opp" count={pending.length}>
            {pending.map((p) => (
              <PendingRow key={p.id} upload={p} />
            ))}
          </Section>
        ) : null}

        {show("WEBPAGE") && sites.length ? (
          <Section
            title="Nettsider"
            count={sites.reduce((n, [, p]) => n + p.length, 0)}
          >
            {sites.map(([host, pages]) => (
              <SiteGroup
                key={host}
                host={host}
                pages={pages}
                selectedId={selectedId}
                onSelect={onSelect}
                onRetry={onRetry}
                onRemove={onRemove}
                {...rowShared}
              />
            ))}
          </Section>
        ) : null}

        {show("DOCUMENT") && docs.length ? (
          <Section title="Dokumenter" count={docs.length}>
            {docs.map(flatRow)}
          </Section>
        ) : null}

        {show("MEDIA") && media.length ? (
          <Section title="Lyd og video" count={media.length}>
            {media.map(flatRow)}
          </Section>
        ) : null}

        {empty ? (
          <p className="px-3 py-6 text-center text-[13px] text-(--agenci-ink-3)">
            {search
              ? `Ingen kilder matcher «${search}».`
              : "Ingen kilder her ennå."}
          </p>
        ) : null}
      </div>

      {/* Add / drop row */}
      <div className="mx-2 mb-2 flex flex-wrap items-center gap-3 rounded-[14px] border border-dashed border-(--agenci-ink-3)/35 px-4 py-3">
        <span className="flex size-7 items-center justify-center rounded-full bg-[#f3f5f4] text-(--agenci-ink-2) dark:bg-white/5">
          <UploadIcon
            className="size-3.5"
            strokeWidth={1.5}
            absoluteStrokeWidth
          />
        </span>
        <span className="text-[13px] text-(--agenci-ink-2)">
          Slipp filer hvor som helst på siden, eller
        </span>
        <span className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-(--agenci-ink) px-3 text-[12.5px] font-medium text-white transition-transform active:scale-[0.97] dark:text-[#0b0c0e]"
          >
            <UploadIcon
              className="size-3.5"
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
            Last opp
          </button>
          <button
            type="button"
            onClick={onAddWebpage}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-(--agenci-line) bg-white px-3 text-[12.5px] font-medium text-(--agenci-ink) transition-transform active:scale-[0.97] dark:bg-transparent"
          >
            <PlusIcon
              className="size-3.5"
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
            Nettside
          </button>
        </span>
      </div>
    </section>
  );
}
