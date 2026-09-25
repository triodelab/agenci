/**
 * Knowledge assistant: ask in plain Norwegian what the agent knows. Answers
 * come from the real knowledge base (vector search, or a whole source when one
 * is in focus) and cite the chunks they used — citations are clickable and
 * open the chunk in the graph + panel.
 */
import { cn } from "@workspace/ui/lib/utils";
import { ArrowUpIcon, SparklesIcon, XIcon } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  type KnowledgeCitation,
  type KnowledgeSource,
  useAskKnowledgeMutation,
} from "../../queries/knowledge-queries";
import { TYPE_META } from "./knowledge-graph";

type Turn =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "assistant";
      text: string;
      citations: KnowledgeCitation[];
      mode: "source" | "search" | "inventory";
      error?: boolean;
    };

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/** Reveals text progressively for a live, "typing" feel. */
function useTypewriter(text: string, enabled: boolean) {
  const [shown, setShown] = useState(enabled ? 0 : text.length);
  useEffect(() => {
    if (!enabled || prefersReducedMotion()) {
      setShown(text.length);
      return;
    }
    setShown(0);
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const step = Math.max(1, Math.round(((now - last) / 1000) * 260));
      last = now;
      setShown((n) => {
        const next = Math.min(text.length, n + step);
        if (next < text.length) raf = requestAnimationFrame(tick);
        return next;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, enabled]);
  return text.slice(0, shown);
}

/** Minimal markdown: **bold**, "- " bullets, and [n] citation pills. */
function RichText({
  text,
  citations,
  onCite,
}: {
  text: string;
  citations: KnowledgeCitation[];
  onCite: (c: KnowledgeCitation) => void;
}) {
  const byN = new Map(citations.map((c) => [c.n, c]));
  const inline = (line: string, key: string) =>
    line.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((part, i) => {
      const k = `${key}-${i}`;
      const bold = part.match(/^\*\*([^*]+)\*\*$/);
      if (bold)
        return (
          <strong key={k} className="font-semibold text-(--agenci-ink)">
            {bold[1]}
          </strong>
        );
      const cite = part.match(/^\[(\d+)\]$/);
      if (cite) {
        const c = byN.get(Number(cite[1]));
        return c ? (
          <button
            key={k}
            type="button"
            onClick={() => onCite(c)}
            title={`${c.title} · ${c.sourceName}`}
            className="mx-0.5 inline-flex h-[18px] min-w-[18px] -translate-y-px items-center justify-center rounded-full bg-(--agenci-ink) px-1 align-middle text-[12px] leading-none font-medium text-white transition-transform hover:scale-110 dark:text-[#0b0c0e]"
          >
            {c.n}
          </button>
        ) : (
          <span key={k} className="text-(--agenci-ink-3)">
            {part}
          </span>
        );
      }
      return <Fragment key={k}>{part}</Fragment>;
    });

  const blocks: { list: boolean; lines: string[] }[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    const isItem = /^\s*[-*•]\s+/.test(line);
    const last = blocks.at(-1);
    if (!line.trim()) {
      blocks.push({ list: false, lines: [] });
      continue;
    }
    if (last && last.list === isItem && (isItem || last.lines.length))
      last.lines.push(line);
    else blocks.push({ list: isItem, lines: [line] });
  }

  return (
    <div className="space-y-2">
      {blocks
        .filter((b) => b.lines.length)
        .map((b, bi) =>
          b.list ? (
            <ul key={`b${bi}`} className="space-y-1">
              {b.lines.map((l, li) => (
                <li key={`l${bi}-${li}`} className="flex gap-2">
                  <span
                    aria-hidden
                    className="mt-[9px] size-1 shrink-0 rounded-full bg-(--agenci-ink-3)"
                  />
                  <span>
                    {inline(l.replace(/^\s*[-*•]\s+/, ""), `i${bi}-${li}`)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p key={`b${bi}`}>{inline(b.lines.join(" "), `p${bi}`)}</p>
          ),
        )}
    </div>
  );
}

function AssistantTurn({
  turn,
  live,
  onCite,
}: {
  turn: Extract<Turn, { role: "assistant" }>;
  live: boolean;
  onCite: (c: KnowledgeCitation) => void;
}) {
  const text = useTypewriter(turn.text, live);
  const done = text.length === turn.text.length;
  return (
    <div className="kb-card-in flex gap-3">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-(--agenci-ink) text-white dark:text-[#0b0c0e]">
        <SparklesIcon
          className="size-3.5"
          strokeWidth={1.5}
          absoluteStrokeWidth
        />
      </span>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "rounded-[16px] rounded-tl-[6px] border px-4 py-3 text-[14px] leading-relaxed text-(--agenci-ink) [font-family:var(--font-agenci-voice)]",
            turn.error
              ? "border-[#F0CFCB] bg-[#FFF9F8] text-[#B2463A]"
              : "border-(--agenci-line) bg-white dark:bg-transparent",
          )}
        >
          <RichText text={text} citations={turn.citations} onCite={onCite} />
          {!done ? (
            <span className="kb-caret ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-(--agenci-ink)" />
          ) : null}
        </div>
        {done && turn.citations.length ? (
          <div className="kb-card-in mt-2.5">
            <p className="mb-1.5 text-[12px] font-medium tracking-[0.06em] text-(--agenci-ink-3) uppercase [font-family:var(--font-agenci-data)]">
              Kilder brukt
            </p>
            <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
              {turn.citations.map((c) => (
                <button
                  key={`${c.documentId}:${c.chunkIndex}`}
                  type="button"
                  onClick={() => onCite(c)}
                  className="group rounded-[12px] border border-(--agenci-line) bg-white px-3 py-2.5 text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-14px_rgb(5_6_7/0.3)] dark:bg-transparent"
                >
                  <span className="flex items-center gap-2 text-[12px] text-(--agenci-ink-3)">
                    <span className="flex size-[18px] items-center justify-center rounded-full bg-(--agenci-ink) text-[12px] leading-none font-medium text-white dark:text-[#0b0c0e]">
                      {c.n}
                    </span>
                    <span
                      aria-hidden
                      className="size-1.5 rounded-full"
                      style={{ background: TYPE_META[c.sourceType].color }}
                    />
                    <span className="truncate">{c.sourceName}</span>
                  </span>
                  <span className="mt-1 block truncate text-[13px] font-semibold text-(--agenci-ink)">
                    {c.title}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-(--agenci-ink-2)">
                    {c.excerpt}
                  </span>
                  <span className="mt-1.5 block text-[12px] text-(--agenci-ink-3) opacity-0 transition-opacity group-hover:opacity-100">
                    Vis i grafen →
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const THINKING = [
  "Søker i kunnskapsbasen…",
  "Leser kunnskapsbitene…",
  "Skriver svar…",
];

function Thinking() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setStep((s) => Math.min(s + 1, THINKING.length - 1)),
      1100,
    );
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="kb-card-in flex items-center gap-3">
      <span className="kb-breathe flex size-7 shrink-0 items-center justify-center rounded-full bg-(--agenci-ink) text-white dark:text-[#0b0c0e]">
        <SparklesIcon
          className="size-3.5"
          strokeWidth={1.5}
          absoluteStrokeWidth
        />
      </span>
      <div className="flex items-center gap-2 rounded-full border border-(--agenci-line) bg-white px-3.5 py-2 text-[13px] text-(--agenci-ink-2) dark:bg-transparent">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="kb-dot size-1.5 rounded-full bg-(--agenci-ink-3)"
              style={{ animationDelay: `${i * 160}ms` }}
            />
          ))}
        </span>
        <span key={step} className="kb-card-in">
          {THINKING[step]}
        </span>
      </div>
    </div>
  );
}

export function KnowledgeAssistant({
  agentId,
  agentName,
  sources,
  focusSource,
  demo,
  onClearFocus,
  onShowChunk,
}: {
  agentId: string;
  agentName: string;
  sources: KnowledgeSource[];
  focusSource: KnowledgeSource | null;
  demo: boolean;
  onClearFocus: () => void;
  onShowChunk: (documentId: string, index: number) => void;
}) {
  const ask = useAskKnowledgeMutation(agentId);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [liveId, setLiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = useMemo(() => {
    const biggest = [...sources].sort((a, b) => b.chunkCount - a.chunkCount)[0];
    const list = [
      focusSource ? `Forklar hva agenten vet fra ${focusSource.name}` : null,
      !focusSource && biggest ? `Hva vet agenten om ${biggest.name}?` : null,
      "Oppsummer det viktigste agenten vet",
      sources.some((s) => s.status === "FAILED")
        ? "Hvilke kilder har feilet, og hvorfor betyr det noe?"
        : null,
      "Hva mangler kunnskapsbasen for å svare kundene godt?",
      "Hva svarer agenten om retur og levering?",
    ];
    return list.filter((s): s is string => Boolean(s)).slice(0, 4);
  }, [sources, focusSource]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns.length, ask.isPending]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || ask.isPending) return;
    setDraft("");
    const userTurn: Turn = {
      id: `u${Date.now()}`,
      role: "user",
      text: question,
    };
    const history = turns
      .slice(-6)
      .filter((t) => !(t.role === "assistant" && t.error))
      .map((t) => ({ role: t.role, content: t.text.slice(0, 4000) }));
    setTurns((t) => [...t, userTurn]);
    try {
      const res = await ask.mutateAsync({
        question,
        documentId: focusSource?.id,
        history,
      });
      const id = `a${Date.now()}`;
      setLiveId(id);
      setTurns((t) => [
        ...t,
        {
          id,
          role: "assistant",
          text: res.answer,
          citations: res.citations,
          mode: res.mode,
        },
      ]);
    } catch (error) {
      setTurns((t) => [
        ...t,
        {
          id: `e${Date.now()}`,
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "Noe gikk galt. Prøv igjen.",
          citations: [],
          mode: "inventory",
          error: true,
        },
      ]);
    }
    inputRef.current?.focus();
  };

  return (
    <section className="mt-6 overflow-hidden rounded-[24px] border border-(--agenci-line) bg-white shadow-[0_1px_3px_rgb(5_6_7/0.07),0_14px_34px_-14px_rgb(5_6_7/0.22)] dark:bg-(--card)">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-(--agenci-line) px-5 py-4">
        <span className="kb-breathe flex size-9 items-center justify-center rounded-full bg-(--agenci-ink) text-white dark:text-[#0b0c0e]">
          <SparklesIcon
            className="size-4"
            strokeWidth={1.5}
            absoluteStrokeWidth
          />
        </span>
        <div className="min-w-0">
          <h2 className="[font-family:var(--font-agenci-title)] text-[20px] leading-tight font-medium tracking-[-0.025em] text-(--agenci-ink)">
            Kunnskapsassistent
          </h2>
          <p className="text-[13px] text-(--agenci-ink-2)">
            Spør om hva {agentName} vet. Svarene hentes fra kunnskapsbasen i
            sanntid, med kildene de bygger på.
          </p>
        </div>
        {turns.length ? (
          <button
            type="button"
            onClick={() => setTurns([])}
            className="ml-auto text-[12.5px] text-(--agenci-ink-3) hover:text-(--agenci-ink)"
          >
            Ny samtale
          </button>
        ) : null}
      </div>

      {/* Conversation */}
      <div
        ref={listRef}
        className="max-h-[520px] min-h-[180px] space-y-5 overflow-y-auto px-5 py-5"
      >
        {turns.length === 0 ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-[13.5px] text-(--agenci-ink-2)">
              Prøv for eksempel:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-full border border-(--agenci-line) bg-[#f7f8f7] px-3.5 py-1.5 text-[13px] text-(--agenci-ink) transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-white active:scale-[0.98] dark:bg-white/5"
                >
                  {s}
                </button>
              ))}
            </div>
            {demo ? (
              <p className="text-[12px] text-(--agenci-ink-3)">
                Assistenten svarer alltid ut fra den ekte kunnskapsbasen, også
                når demodata vises over.
              </p>
            ) : null}
          </div>
        ) : null}
        {turns.map((t) =>
          t.role === "user" ? (
            <div key={t.id} className="kb-card-in flex justify-end">
              <p className="max-w-[80%] rounded-[16px] rounded-br-[6px] bg-(--agenci-ink) px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap text-white dark:text-[#0b0c0e]">
                {t.text}
              </p>
            </div>
          ) : (
            <AssistantTurn
              key={t.id}
              turn={t}
              live={t.id === liveId}
              onCite={(c) => onShowChunk(c.documentId, c.chunkIndex)}
            />
          ),
        )}
        {ask.isPending ? <Thinking /> : null}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
        className="border-t border-(--agenci-line) bg-[#fafbfa] px-4 py-3 dark:bg-white/[0.02]"
      >
        {focusSource ? (
          <div className="mb-2 flex">
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white py-1 pr-1 pl-2.5 text-[12px] text-(--agenci-ink-2) shadow-[0_1px_2px_rgb(5_6_7/0.06)] dark:bg-white/5">
              <span
                aria-hidden
                className="size-1.5 rounded-full"
                style={{ background: TYPE_META[focusSource.type].color }}
              />
              Fokus:{" "}
              <span className="truncate font-medium text-(--agenci-ink)">
                {focusSource.name}
              </span>
              <button
                type="button"
                aria-label="Fjern fokus"
                onClick={onClearFocus}
                className="flex size-5 items-center justify-center rounded-full text-(--agenci-ink-3) hover:bg-[#f3f5f4] hover:text-(--agenci-ink)"
              >
                <XIcon
                  className="size-3"
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                />
              </button>
            </span>
          </div>
        ) : null}
        <div className="flex items-end gap-2 rounded-[16px] border border-(--agenci-line) bg-white p-1.5 pl-4 transition-shadow focus-within:shadow-[0_0_0_3px_rgb(36_50_54/0.08)] dark:bg-transparent">
          <textarea
            ref={inputRef}
            value={draft}
            rows={1}
            onChange={(e) => {
              setDraft(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(draft);
              }
            }}
            placeholder={
              focusSource
                ? `Spør om ${focusSource.name}…`
                : "Spør om hva agenten vet… (Enter for å sende)"
            }
            aria-label="Spørsmål til kunnskapsassistenten"
            className="max-h-[140px] min-h-[36px] flex-1 resize-none bg-transparent py-2 text-[14px] text-(--agenci-ink) outline-none placeholder:text-(--agenci-ink-3)"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!draft.trim() || ask.isPending}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--agenci-ink) text-white transition-[transform,opacity] duration-150 hover:scale-105 active:scale-95 disabled:opacity-30 dark:text-[#0b0c0e]"
          >
            <ArrowUpIcon
              className="size-4"
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
          </button>
        </div>
      </form>
    </section>
  );
}
