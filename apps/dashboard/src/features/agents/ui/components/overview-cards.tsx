/**
 * Agent overview tiles (reference: smart-home overview, warm palette).
 * Every number is derived from the conversations and knowledge-base sources
 * passed in — real data, or the seeded demo set when "Demodata" is on.
 * Type, radii, segment control and status tones follow apps/web/DESIGN.md.
 */
import { Link, useParams } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import { ClockIcon, Maximize2Icon, MessageCircleIcon } from "lucide-react";
import { Fragment, useId, useMemo, useState } from "react";
import { Segment } from "@/components/segment";
import type { AgentDocument } from "@/features/agents/queries/agents-queries";
import type { ConversationSummary } from "@/features/conversations/queries/conversations-queries";
import {
  ContactAvatar,
  contactName,
  dataTextClass,
  StatusPill,
} from "@/features/conversations/ui/components/conversation-ui";

// ─── Palette (reference: warm neutrals, peach, soft blue) ───────────────────

const PEACH = "#E49A62";
const BLUE = "#7F9CE0";

// ─── Primitives ──────────────────────────────────────────────────────────────

const DAY = 86_400_000;

export const tileClass =
  "relative flex min-h-0 flex-col overflow-hidden rounded-[16px] border border-white/80 bg-white p-4 shadow-[0_1px_3px_rgb(5_6_7/0.07),0_14px_34px_-14px_rgb(5_6_7/0.22)] dark:border-white/5 dark:bg-(--card)";

export const captionClass = cn(
  dataTextClass,
  "text-[12px] font-medium tracking-[0.06em] uppercase text-(--agenci-ink-3)",
);

const bigNumberClass =
  "[font-family:var(--font-agenci-title)] text-[36px] font-medium leading-none tracking-[-0.05em] tabular-nums text-(--agenci-ink)";

type Target = "conversations" | "files";

function useAgentParams() {
  return useParams({ from: "/_authed/org/$orgSlug/agents/$agentId/" });
}

function TargetLink({
  to,
  className,
  children,
  ...rest
}: {
  to: Target;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
  title?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const params = useAgentParams();
  return (
    <Link
      to={
        to === "files"
          ? "/org/$orgSlug/agents/$agentId/files"
          : "/org/$orgSlug/agents/$agentId/conversations"
      }
      params={params}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
}

function TileTitle({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-7 shrink-0 items-center gap-2">
      <h3 className="flex items-center gap-2 text-[13px] font-semibold tracking-[-0.01em] text-(--agenci-ink)">
        {children}
      </h3>
      <div className="ml-auto flex items-center gap-2">{aside}</div>
    </div>
  );
}

function ExpandLink({ to, label }: { to: Target; label: string }) {
  return (
    <TargetLink
      to={to}
      aria-label={label}
      title={label}
      className="absolute right-3 bottom-3 flex size-7 items-center justify-center rounded-full text-(--agenci-ink-3) transition-[color,background-color,transform] duration-150 hover:bg-white hover:text-(--agenci-ink) active:scale-95 dark:hover:bg-white/10"
    >
      <Maximize2Icon
        className="size-3.5"
        strokeWidth={1.5}
        absoluteStrokeWidth
      />
    </TargetLink>
  );
}

function HeaderPill({
  to,
  children,
}: {
  to: Target;
  children: React.ReactNode;
}) {
  return (
    <TargetLink
      to={to}
      className={cn(
        captionClass,
        "rounded-full border border-[#E4E8E5] bg-white px-2.5 py-0.5 text-(--agenci-ink-2) transition-[color,transform] duration-150 hover:text-(--agenci-ink) active:scale-[0.97] dark:border-white/10 dark:bg-transparent",
      )}
    >
      {children}
    </TargetLink>
  );
}

/** Change vs. previous period (reference: "+8%" red / "+4%" green chips). */
function DeltaChip({
  value,
  goodWhenUp = true,
  suffix = " %",
}: {
  value: number | null;
  goodWhenUp?: boolean;
  suffix?: string;
}) {
  if (value === null) {
    return (
      <span
        className={cn(
          dataTextClass,
          "rounded-full bg-white px-2 py-px text-[12px] text-(--agenci-ink-3)",
        )}
      >
        Ny
      </span>
    );
  }
  const good = value === 0 ? null : value > 0 === goodWhenUp;
  return (
    <span
      className={cn(
        dataTextClass,
        "rounded-full px-2 py-px text-[12px] font-medium",
        good === null && "bg-white text-(--agenci-ink-2)",
        good === true && "bg-[#E2F2E5] text-[#2F7D46]",
        good === false && "bg-[#F9E2DF] text-[#B2463A]",
      )}
    >
      {value > 0 ? "↑ " : value < 0 ? "↓ " : ""}
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

export function TonePill({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "bad" | "neutral";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        dataTextClass,
        "inline-flex shrink-0 items-center rounded-full px-2 py-px text-[12px] font-medium",
        tone === "ok" && "bg-[#E2F2E5] text-[#2F7D46]",
        tone === "warn" && "bg-[#FBEBDD] text-[#B06A34]",
        tone === "bad" && "bg-[#F9E2DF] text-[#B2463A]",
        tone === "neutral" && "bg-white text-(--agenci-ink-2)",
      )}
    >
      {children}
    </span>
  );
}

type Range = "7" | "30";
const RANGES: { value: Range; label: string }[] = [
  { value: "7", label: "7 d" },
  { value: "30", label: "30 d" },
];

function niceMax(n: number) {
  if (n <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(n));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * pow >= n) ?? 10;
  return step * pow;
}

// ─── Recent conversations ────────────────────────────────────────────────────
function sourceName(d: AgentDocument) {
  return (
    d.documentName ??
    d.webpageUrl?.replace(/^https?:\/\//, "") ??
    d.mediaName ??
    "Uten navn"
  );
}

function ago(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 60) return `${Math.max(min, 1)} min`;
  if (min < 60 * 24) return `${Math.round(min / 60)} t`;
  return `${Math.round(min / 1440)} d`;
}

/** The latest conversations and how each one ended — calm, at a glance. */
export function RecentTile({
  conversations,
}: {
  conversations: ConversationSummary[];
}) {
  const params = useAgentParams();
  const recent = conversations.slice(0, 6);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const resolvedToday = conversations.filter(
    (c) =>
      c.status === "resolved" &&
      new Date(c.updatedAt).getTime() >= startOfDay.getTime(),
  ).length;

  return (
    <section className={tileClass}>
      <TileTitle
        aside={
          resolvedToday > 0 ? (
            <TonePill tone="ok">↑ {resolvedToday} løst i dag</TonePill>
          ) : null
        }
      >
        <MessageCircleIcon
          className="size-4"
          strokeWidth={1.5}
          absoluteStrokeWidth
        />
        Siste samtaler
      </TileTitle>

      {recent.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-[13px] font-medium text-(--agenci-ink)">
            Ingen samtaler ennå
          </p>
          <p className="mt-1 text-[12px] text-(--agenci-ink-3)">
            De dukker opp her så snart kundene skriver.
          </p>
        </div>
      ) : (
        <ul className="mt-2 min-h-0 flex-1 overflow-y-auto pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {recent.map((c) => (
            <li key={c.threadId}>
              <Link
                to="/org/$orgSlug/agents/$agentId/conversations/$conversationId"
                params={{ ...params, conversationId: c.threadId }}
                className="group -mx-2 flex items-center gap-3 rounded-[10px] border-b border-[#EEF0EF] px-2 py-2.5 transition-colors duration-150 last:border-b-0 hover:bg-[#f7f8f7] dark:border-white/5 dark:hover:bg-white/5"
              >
                <span className="relative">
                  <ContactAvatar contact={c.contact} size={32} />
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-white dark:border-(--card)",
                      c.status === "resolved"
                        ? "bg-[#5FA06F]"
                        : c.status === "escalated"
                          ? "bg-[#D9493E]"
                          : "bg-[#E49A62]",
                    )}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-(--agenci-ink)">
                    {contactName(c.contact)}
                  </span>
                  <span className="block truncate text-[12px] text-(--agenci-ink-3)">
                    {c.firstMessage ?? "Ny samtale"}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={cn(
                      dataTextClass,
                      "text-[11.5px] text-(--agenci-ink-3)",
                    )}
                  >
                    {ago(c.updatedAt)}
                  </span>
                  <StatusPill
                    status={c.status}
                    className="px-2 text-[11px] leading-4"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <ExpandLink to="conversations" label="Åpne samtaler" />
    </section>
  );
}

// ─── Resolution rate (reference: weather, warm sun) ─────────────────────────

function rateIn(
  conversations: ConversationSummary[],
  from: number,
  to: number,
) {
  const inRange = conversations.filter((c) => {
    const t = new Date(c.createdAt).getTime();
    return t >= from && t < to;
  });
  const count = (s: ConversationSummary["status"]) =>
    inRange.filter((c) => c.status === s).length;
  return {
    total: inRange.length,
    resolved: count("resolved"),
    unresolved: count("unresolved"),
    escalated: count("escalated"),
    rate: inRange.length
      ? Math.round((count("resolved") / inRange.length) * 100)
      : null,
  };
}

/** Minutes a person would spend on one routine enquiry (for "timer spart"). */
const MINUTES_PER_ENQUIRY = 10;

const RING_PARTS = [
  { key: "resolved", label: "Agent", color: "url(#agenci-ring)", dot: "#1F2224" },
  { key: "escalated", label: "Team", color: PEACH, dot: PEACH },
  { key: "unresolved", label: "Venter", color: "#D9DCDA", dot: "#C9CDCB" },
] as const;

/**
 * Share of the last 30 days the agent closed on its own, as a ring, with the
 * team time that saved. Every number comes from the conversations passed in.
 */
export function ResolutionTile({
  agentName,
  conversations,
}: {
  agentName: string;
  conversations: ConversationSummary[];
}) {
  const now = Date.now();
  const cur = rateIn(conversations, now - 30 * DAY, now + 1);
  const prev = rateIn(conversations, now - 60 * DAY, now - 30 * DAY);
  const trend =
    cur.rate !== null && prev.rate !== null ? cur.rate - prev.rate : null;
  const hours = Math.round((cur.resolved * MINUTES_PER_ENQUIRY) / 60);
  const gap = cur.total ? 1.6 : 0;
  let start = 0;
  const arcs = RING_PARTS.map((p) => {
    const len = cur.total ? (cur[p.key] / cur.total) * 100 : 0;
    const arc = { ...p, from: start, len: Math.max(0, len - gap) };
    start += len;
    return arc;
  });

  return (
    <section className={tileClass}>
      <TileTitle
        aside={
          hours > 0 ? (
            <span
              className={cn(
                dataTextClass,
                "inline-flex items-center gap-1.5 rounded-full bg-(--agenci-ink) px-2.5 py-0.5 text-[12px] text-white dark:text-[#0b0c0e]",
              )}
            >
              <ClockIcon className="size-3" strokeWidth={2} />≈ {hours} t spart
            </span>
          ) : null
        }
      >
        Løst av {agentName}
      </TileTitle>

      <TargetLink
        to="conversations"
        className="relative grid min-h-0 flex-1 place-items-center"
        aria-label="Åpne samtaler"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 140 140"
          className="size-[min(190px,100%)] -rotate-90 drop-shadow-[0_12px_20px_rgb(28_28_26/0.12)]"
        >
          <defs>
            <linearGradient id="agenci-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#1F2224" />
              <stop offset="1" stopColor="#5A5E5C" />
            </linearGradient>
          </defs>
          <circle
            cx="70"
            cy="70"
            r="56"
            fill="none"
            stroke="#F0F1F0"
            strokeWidth={13}
            pathLength={100}
          />
          {arcs.map((a) =>
            a.len > 0 ? (
              <circle
                key={a.key}
                cx="70"
                cy="70"
                r="56"
                fill="none"
                stroke={a.color}
                strokeWidth={13}
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${a.len} ${100 - a.len}`}
                strokeDashoffset={-a.from}
                className="transition-[stroke-dasharray,stroke-dashoffset] duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
              />
            ) : null,
          )}
        </svg>
        <div className="absolute grid justify-items-center text-center">
          <p className={bigNumberClass}>
            {cur.rate ?? "—"}
            {cur.rate !== null ? (
              <span className="ml-0.5 align-top text-[18px] tracking-normal text-(--agenci-ink-2)">
                %
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-[12px] text-(--agenci-ink-3)">
            løst uten team
          </p>
          {trend !== null && trend > 0 ? (
            <span className="mt-1.5">
              <TonePill tone="ok">↑ {trend} poeng</TonePill>
            </span>
          ) : null}
        </div>
      </TargetLink>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {RING_PARTS.map((p) => (
          <div
            key={p.key}
            className="rounded-[12px] bg-[#f5f6f5] px-3 py-2 dark:bg-white/5"
          >
            <p
              className={cn(
                dataTextClass,
                "text-[17px] leading-tight text-(--agenci-ink)",
              )}
            >
              {cur[p.key]}
            </p>
            <p className="flex items-center gap-1.5 text-[12px] text-(--agenci-ink-3)">
              <span
                aria-hidden
                className="size-1.5 rounded-full"
                style={{ background: p.dot }}
              />
              {p.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Conversations over time: trend + outcome ───────────────────────────────
// Answers "how many conversations are we getting, is it growing, and how did
// they end?" — smooth area for this period, dashed line for the previous one,
// and an outcome bar (løst / uavklart / eskalert) underneath.

type Period = "day" | "week" | "month";
const PERIODS: { value: Period; label: string }[] = [
  { value: "day", label: "Døgn" },
  { value: "week", label: "Uke" },
  { value: "month", label: "Mnd" },
];
const PERIOD_COMPARE: Record<Period, string> = {
  day: "mot forrige døgn",
  week: "mot forrige uke",
  month: "mot forrige 30 d",
};
const WEEKDAY_SHORT = ["S", "M", "T", "O", "T", "F", "L"];

function periodBuckets(period: Period, now: Date, offset: number) {
  if (period === "day") {
    const end = new Date(now);
    end.setMinutes(0, 0, 0);
    end.setHours(end.getHours() + 1);
    const endMs = end.getTime() - offset * DAY;
    return Array.from({ length: 24 }, (_, i) => {
      const start = endMs - (24 - i) * 3_600_000;
      const d = new Date(start);
      return {
        start,
        end: start + 3_600_000,
        label: i % 6 === 0 ? String(d.getHours()).padStart(2, "0") : "",
        long: `kl. ${String(d.getHours()).padStart(2, "0")}:00`,
      };
    });
  }
  const n = period === "week" ? 7 : 30;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const endMs = today.getTime() + DAY - offset * n * DAY;
  return Array.from({ length: n }, (_, i) => {
    const start = endMs - (n - i) * DAY;
    const d = new Date(start);
    return {
      start,
      end: start + DAY,
      label:
        period === "week"
          ? (WEEKDAY_SHORT[d.getDay()] ?? "")
          : i % 7 === 0 || i === n - 1
            ? String(d.getDate())
            : "",
      long: d.toLocaleDateString("nb-NO", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    };
  });
}

/** Catmull-Rom → cubic Bézier, clamped so the curve never dips below 0. */
function smoothPath(pts: [number, number][]) {
  if (pts.length === 0) return "";
  const clampY = (y: number) => Math.min(100, Math.max(0, y));
  const first = pts[0] as [number, number];
  let d = `M${first[0]},${first[1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i] as [number, number];
    const p2 = pts[i + 1] as [number, number];
    const p3 = pts[i + 2] ?? p2;
    if (!p0 || !p3) continue;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = clampY(p1[1] + (p2[1] - p0[1]) / 6);
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = clampY(p2[1] - (p3[1] - p1[1]) / 6);
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function ConversationsChartTile({
  conversations,
}: {
  conversations: ConversationSummary[];
}) {
  const [period, setPeriod] = useState<Period>("week");
  const [hover, setHover] = useState<number | null>(null);
  const gradientId = useId();

  const data = useMemo(() => {
    const now = new Date();
    const count = (b: { start: number; end: number }) =>
      conversations.filter((c) => {
        const t = new Date(c.createdAt).getTime();
        return t >= b.start && t < b.end;
      });
    const cur = periodBuckets(period, now, 0).map((b) => {
      const list = count(b);
      return {
        ...b,
        total: list.length,
        resolved: list.filter((c) => c.status === "resolved").length,
        escalated: list.filter((c) => c.status === "escalated").length,
        list,
      };
    });
    const prev = periodBuckets(period, now, 1).map((b) => count(b).length);
    const all = cur.flatMap((b) => b.list);
    return {
      cur,
      prev,
      total: all.length,
      prevTotal: prev.reduce((s, v) => s + v, 0),
    };
  }, [conversations, period]);

  const max = niceMax(
    Math.max(...data.cur.map((b) => b.total), ...data.prev, 1),
  );
  const n = data.cur.length;
  const x = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const y = (v: number) => 100 - (v / max) * 92;
  const curPts = data.cur.map((b, i) => [x(i), y(b.total)] as [number, number]);
  const prevPts = data.prev.map((v, i) => [x(i), y(v)] as [number, number]);
  const line = smoothPath(curPts);
  const delta =
    data.prevTotal === 0
      ? null
      : Math.round(((data.total - data.prevTotal) / data.prevTotal) * 100);
  const active = hover !== null ? data.cur[hover] : undefined;
  const peakIndex = data.cur.reduce(
    (best, b, i) => (b.total > (data.cur[best]?.total ?? -1) ? i : best),
    0,
  );
  const peak = data.cur[peakIndex];
  const activeX = hover !== null ? x(hover) : 0;

  return (
    <section className={tileClass}>
      <TileTitle
        aside={
          <Segment
            label="Periode"
            options={PERIODS}
            value={period}
            onChange={(p) => {
              setHover(null);
              setPeriod(p);
            }}
          />
        }
      >
        Samtaler
      </TileTitle>

      <div className="mt-3 flex items-end gap-2">
        <p className={bigNumberClass}>{data.total}</p>
        <div className="mb-1" title={PERIOD_COMPARE[period]}>
          <DeltaChip value={delta} />
        </div>
      </div>

      {/* Area chart */}
      <div className="relative mt-2 min-h-[120px] flex-1">
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={PEACH} stopOpacity={0.32} />
              <stop offset="100%" stopColor={PEACH} stopOpacity={0} />
            </linearGradient>
          </defs>
          {[0, 50, 100].map((p) => (
            <line
              key={p}
              x1="0"
              x2="100"
              y1={100 - p * 0.92}
              y2={100 - p * 0.92}
              stroke="#EEF0EF"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path
            d={smoothPath(prevPts)}
            fill="none"
            stroke="#A9AEB3"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
          <path d={`${line} L100,100 L0,100 Z`} fill={`url(#${gradientId})`} />
          <path
            d={line}
            fill="none"
            stroke={PEACH}
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Peak of the period: a glowing dot with its value. */}
        {!active && peak && peak.total > 0 ? (
          <span
            aria-hidden
            className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-white bg-[#D9743A] shadow-[0_0_0_5px_rgb(217_116_58/0.18),0_4px_10px_rgb(217_116_58/0.35)]"
            style={{ left: `${x(peakIndex)}%`, top: `${y(peak.total)}%` }}
          >
            <span
              className={cn(
                dataTextClass,
                "absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 rounded-[7px] bg-(--agenci-ink) px-2 py-0.5 text-[11.5px] font-medium text-white dark:text-[#0b0c0e]",
              )}
            >
              {peak.total}
            </span>
          </span>
        ) : null}

        {/* hover crosshair, dot and tooltip (HTML so they stay round/crisp) */}
        {active ? (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 w-px bg-(--agenci-ink)/15"
              style={{ left: `${activeX}%` }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#E49A62] shadow-[0_0_0_3px_rgb(228_154_98/0.25)]"
              style={{ left: `${activeX}%`, top: `${y(active.total)}%` }}
            />
            <div
              className={cn(
                "pointer-events-none absolute top-0 z-10 min-w-[128px] rounded-[10px] bg-white px-3 py-2 shadow-[0_1px_2px_rgb(5_6_7/0.06),0_8px_24px_-8px_rgb(5_6_7/0.2)] dark:bg-(--card)",
                activeX > 60
                  ? "-translate-x-[calc(100%+10px)]"
                  : "translate-x-[10px]",
              )}
              style={{ left: `${activeX}%` }}
            >
              <p className="text-[12px] text-(--agenci-ink-3)">{active.long}</p>
              <p className="mt-0.5 text-[13px] font-medium text-(--agenci-ink)">
                {active.total} {active.total === 1 ? "samtale" : "samtaler"}
              </p>
              <p
                className={cn(
                  dataTextClass,
                  "mt-0.5 text-[12px] text-(--agenci-ink-2)",
                )}
              >
                {active.resolved} løst · {active.escalated} eskalert
              </p>
            </div>
          </>
        ) : null}

        <div className="absolute inset-0 flex">
          {data.cur.map((b, i) => (
            <button
              key={b.start}
              type="button"
              aria-label={`${b.long}: ${b.total} samtaler`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="h-full flex-1 outline-none"
            />
          ))}
        </div>
      </div>

      <div
        className={cn(
          dataTextClass,
          "relative mt-1.5 h-4 text-[12px] text-(--agenci-ink-3)",
        )}
      >
        {data.cur.map((b, i) =>
          b.label ? (
            <span
              key={b.start}
              className={cn(
                "absolute -translate-x-1/2",
                i === 0 && "translate-x-0",
                i === n - 1 && "-translate-x-full",
                (hover === i || (hover === null && i === peakIndex)) &&
                  "text-(--agenci-ink)",
              )}
              style={{ left: `${x(i)}%` }}
            >
              {b.label}
            </span>
          ) : null,
        )}
      </div>

      <div className="pb-6" />
      <ExpandLink to="conversations" label="Åpne samtaler" />
    </section>
  );
}

// ─── When customers chat: weekday × hour heatmap ────────────────────────────
// Answers "when do customers need us?" — calm ink scale, office hours
// (Mon–Fri 08–16) outlined so "utenfor kontortid" is visible in the grid.

const DAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const DAYS_LONG = [
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
  "søndag",
];
const hh = (h: number) => String(h).padStart(2, "0");
/** JS getDay() (0 = søndag) → 0 = mandag. */
const mondayFirst = (d: Date) => (d.getDay() + 6) % 7;
const OFFICE = { fromHour: 8, toHour: 16, days: 5 };
const isOfficeHours = (day: number, hour: number) =>
  day < OFFICE.days && hour >= OFFICE.fromHour && hour < OFFICE.toHour;

const HEAT_EMPTY = "#F1F3F2";
function heatColor(v: number, max: number) {
  if (v === 0) return HEAT_EMPTY;
  return `rgb(36 50 54 / ${0.12 + (v / max) * 0.8})`;
}

function Insight({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-[10px] bg-[#f6f7f6] px-3.5 py-3 dark:bg-white/[0.04]">
      <p className={captionClass}>{label}</p>
      <p className="mt-1 [font-family:var(--font-agenci-title)] text-[20px] leading-tight font-medium tracking-[-0.025em] text-(--agenci-ink)">
        {value}
      </p>
      <p className="mt-0.5 text-[12px] leading-snug text-(--agenci-ink-3)">
        {sub}
      </p>
    </div>
  );
}

export function ActivityTile({
  conversations,
  now,
}: {
  conversations: ConversationSummary[];
  now: Date;
}) {
  const [range, setRange] = useState<Range>("30");
  const [hover, setHover] = useState<{ day: number; hour: number } | null>(
    null,
  );
  const nowMs = now.getTime();

  const stats = useMemo(() => {
    const since = nowMs - Number(range) * DAY;
    const grid = Array.from({ length: 7 }, () =>
      Array.from({ length: 24 }, () => 0),
    );
    let total = 0;
    let outside = 0;
    let today = 0;
    const startOfToday = new Date(nowMs);
    startOfToday.setHours(0, 0, 0, 0);
    for (const c of conversations) {
      const d = new Date(c.createdAt);
      const t = d.getTime();
      if (t >= startOfToday.getTime()) today++;
      if (t < since) continue;
      const day = mondayFirst(d);
      const hour = d.getHours();
      const row = grid[day];
      if (row) row[hour] = (row[hour] ?? 0) + 1;
      total++;
      if (!isOfficeHours(day, hour)) outside++;
    }
    let peak: { day: number; hour: number; v: number } | null = null;
    grid.forEach((row, day) => {
      row.forEach((v, hour) => {
        if (v > 0 && (!peak || v > peak.v)) peak = { day, hour, v };
      });
    });
    return {
      grid,
      total,
      outside,
      today,
      peak: peak as { day: number; hour: number; v: number } | null,
      max: Math.max(...grid.flat(), 1),
    };
  }, [conversations, nowMs, range]);

  const weeks = Number(range) / 7;
  const nowDay = mondayFirst(now);
  const nowHour = now.getHours();
  const usualNow = (stats.grid[nowDay]?.[nowHour] ?? 0) / weeks;
  const outsidePct = stats.total
    ? Math.round((stats.outside / stats.total) * 100)
    : null;
  const fmt = (v: number) =>
    v.toLocaleString("nb-NO", { maximumFractionDigits: 1 });

  return (
    <section className={cn(tileClass, "md:col-span-2")}>
      <TileTitle
        aside={
          <>
            <Segment
              label="Periode"
              options={RANGES}
              value={range}
              onChange={setRange}
            />
            <HeaderPill to="conversations">Se samtaler</HeaderPill>
          </>
        }
      >
        Når kundene chatter
      </TileTitle>
      <p className="mt-1 text-[12.5px] text-(--agenci-ink-3)">
        Samtaler per ukedag og time, siste {range} dager
      </p>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-5 pb-6 lg:flex-row">
        {/* Heatmap */}
        <div className="flex min-h-[220px] min-w-0 flex-1 flex-col">
          <div
            className="relative grid min-h-0 flex-1 gap-1"
            style={{
              gridTemplateColumns: "4px 34px repeat(24, minmax(0, 1fr))",
              gridTemplateRows: "repeat(7, minmax(0, 1fr)) 18px 24px",
            }}
          >
            {/* Office hours: a thin rail beside Man–Fre and a labelled
                track under 08–16 — marks the range without covering cells. */}
            <span
              aria-hidden
              className="w-[2px] justify-self-start rounded-full bg-(--agenci-ink)/25"
              style={{ gridColumn: 1, gridRow: `1 / span ${OFFICE.days}` }}
            />
            <span
              className={cn(
                captionClass,
                "mt-1.5 flex items-center justify-center gap-1.5 rounded-full bg-[#EEF0EF] text-(--agenci-ink-2) dark:bg-white/5",
              )}
              style={{
                gridColumn: `${OFFICE.fromHour + 3} / span ${OFFICE.toHour - OFFICE.fromHour}`,
                gridRow: 9,
              }}
            >
              Kontortid
            </span>

            {DAYS.map((label, day) => (
              <Fragment key={label}>
                <span
                  className={cn(
                    dataTextClass,
                    "flex items-center text-[12px] transition-colors duration-150",
                    hover?.day === day || (!hover && day === nowDay)
                      ? "text-(--agenci-ink)"
                      : "text-(--agenci-ink-3)",
                  )}
                  style={{ gridColumn: 2, gridRow: day + 1 }}
                >
                  {label}
                </span>
                {Array.from({ length: 24 }, (_, hour) => {
                  const v = stats.grid[day]?.[hour] ?? 0;
                  const isNow = day === nowDay && hour === nowHour;
                  const isHover = hover?.day === day && hover.hour === hour;
                  const dim =
                    hover !== null && hover.day !== day && hover.hour !== hour;
                  return (
                    <button
                      key={hh(hour)}
                      type="button"
                      aria-label={`${DAYS_LONG[day]} kl. ${hh(hour)}: ${v} samtaler`}
                      onMouseEnter={() => setHover({ day, hour })}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover({ day, hour })}
                      onBlur={() => setHover(null)}
                      className={cn(
                        "relative min-h-0 rounded-[5px] outline-none transition-[opacity,transform,box-shadow] duration-150",
                        dim && "opacity-45",
                        isHover &&
                          "z-20 scale-[1.18] shadow-[0_4px_12px_-4px_rgb(5_6_7/0.35)]",
                        isNow &&
                          "ring-2 ring-white shadow-[0_0_0_3.5px_rgb(36_50_54)]",
                      )}
                      style={{
                        background: heatColor(v, stats.max),
                        gridColumn: hour + 3,
                        gridRow: day + 1,
                      }}
                    >
                      {isHover ? (
                        <span
                          className={cn(
                            "pointer-events-none absolute bottom-[calc(100%+8px)] z-30 w-max rounded-[10px] bg-(--agenci-ink) px-3 py-2 text-left text-white shadow-[0_8px_24px_-8px_rgb(5_6_7/0.4)] dark:bg-white dark:text-[#0b0c0e]",
                            hour > 16
                              ? "right-0"
                              : hour < 4
                                ? "left-0"
                                : "left-1/2 -translate-x-1/2",
                          )}
                        >
                          <span className="block text-[12px] opacity-70">
                            {DAYS_LONG[day]} kl. {hh(hour)}–
                            {hh((hour + 1) % 24)}
                            {isOfficeHours(day, hour)
                              ? ""
                              : " · utenfor kontortid"}
                          </span>
                          <span className="block text-[13px] font-medium">
                            {v} {v === 1 ? "samtale" : "samtaler"}
                            <span className="font-normal opacity-70">
                              {" "}
                              · snitt {fmt(v / weeks)} per uke
                            </span>
                          </span>
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </Fragment>
            ))}
            {Array.from({ length: 24 }, (_, hour) => (
              <span
                key={hh(hour)}
                className={cn(
                  dataTextClass,
                  "text-[12px] leading-[18px] transition-colors duration-150",
                  hover?.hour === hour
                    ? "text-(--agenci-ink)"
                    : "text-(--agenci-ink-3)",
                )}
                style={{ gridColumn: hour + 3, gridRow: 8 }}
              >
                {hour % 3 === 0 ? hh(hour) : ""}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-(--agenci-ink-3)">
            <span className="flex items-center gap-1.5">
              Færre
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <span
                  key={t}
                  aria-hidden
                  className="size-2.5 rounded-[3px]"
                  style={{
                    background:
                      t === 0
                        ? HEAT_EMPTY
                        : `rgb(36 50 54 / ${0.12 + t * 0.8})`,
                  }}
                />
              ))}
              Flere
            </span>
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-2.5 rounded-[3px] bg-white shadow-[0_0_0_1.5px_rgb(36_50_54)]"
              />
              Nå
            </span>
          </div>
        </div>

        {/* Insights */}
        <div className="grid shrink-0 content-start gap-2.5 sm:grid-cols-3 lg:w-[230px] lg:grid-cols-1">
          <Insight
            label="Travlest"
            value={
              stats.peak
                ? `${DAYS[stats.peak.day]} ${hh(stats.peak.hour)}–${hh((stats.peak.hour + 1) % 24)}`
                : "—"
            }
            sub={
              stats.peak
                ? `${stats.peak.v} samtaler siste ${range} dager`
                : "Ingen samtaler ennå"
            }
          />
          <Insight
            label="Utenfor kontortid"
            value={outsidePct === null ? "—" : `${outsidePct} %`}
            sub={
              outsidePct === null
                ? "Man–fre 08–16"
                : `${stats.outside} samtaler mens dere var stengt — agenten svarte på alle`
            }
          />
          <Insight
            label="I dag"
            value={`${stats.today} ${stats.today === 1 ? "samtale" : "samtaler"}`}
            sub={`Vanligvis ${fmt(usualNow)} kl. ${hh(nowHour)} på en ${DAYS_LONG[nowDay]}`}
          />
        </div>
      </div>
      <ExpandLink to="conversations" label="Åpne samtaler" />
    </section>
  );
}

// ─── Knowledge base (reference: water) ───────────────────────────────────────

export function KnowledgeTile({ documents }: { documents: AgentDocument[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const busyStatuses = ["PENDING", "PROCESSING", "INDEXING"];
  const group = (pred: (d: AgentDocument) => boolean) => documents.filter(pred);

  const rows = [
    {
      label: "Nettsider",
      items: group((d) => d.type === "WEBPAGE"),
      color: BLUE,
    },
    {
      label: "Dokumenter",
      items: group((d) => d.type === "DOCUMENT"),
      color: BLUE,
    },
    { label: "Media", items: group((d) => d.type === "MEDIA"), color: BLUE },
    {
      label: "Indekseres",
      items: group((d) => busyStatuses.includes(d.status)),
      color: PEACH,
    },
    {
      label: "Feilet",
      items: group((d) => d.status === "FAILED"),
      color: "#D9493E",
    },
  ];
  const busy = rows[3]?.items.length ?? 0;
  const failed = rows[4]?.items.length ?? 0;
  const ready = documents.filter((d) => d.status === "COMPLETED").length;
  const max = niceMax(Math.max(...rows.map((r) => r.items.length), 1));
  const hovered = rows.find((r) => r.label === hover);

  return (
    <section className={tileClass}>
      <TileTitle aside={<HeaderPill to="files">Alle</HeaderPill>}>
        Kunnskapsbase
      </TileTitle>

      <div className="mt-3 flex items-start gap-2">
        <p className={bigNumberClass}>{documents.length}</p>
        <span className={cn(captionClass, "mt-1")}>kilder</span>
        <span className="mt-1 ml-auto">
          {failed > 0 ? (
            <TonePill tone="bad">{failed} feilet</TonePill>
          ) : busy > 0 ? (
            <TonePill tone="warn">{busy} indekseres</TonePill>
          ) : documents.length > 0 ? (
            <TonePill tone="ok">Klar</TonePill>
          ) : (
            <TonePill tone="neutral">Tom</TonePill>
          )}
        </span>
      </div>
      <p className="mt-2 min-h-[18px] truncate text-[12px] text-(--agenci-ink-2)">
        {hovered
          ? hovered.items.length
            ? hovered.items.slice(0, 3).map(sourceName).join(", ") +
              (hovered.items.length > 3 ? ` +${hovered.items.length - 3}` : "")
            : `Ingen ${hovered.label.toLowerCase()}`
          : `${ready} av ${documents.length} klare for agenten`}
      </p>

      <div className="mt-auto pt-2 pb-6">
        <div className="grid grid-cols-[80px_1fr] items-center gap-x-3">
          {rows.map((r) => (
            <TargetLink
              key={r.label}
              to="files"
              className="col-span-2 grid grid-cols-subgrid items-center outline-none"
              onMouseEnter={() => setHover(r.label)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(r.label)}
              onBlur={() => setHover(null)}
            >
              <span
                className={cn(
                  "truncate py-1 text-[12px] transition-colors",
                  hover === r.label
                    ? "text-(--agenci-ink)"
                    : "text-(--agenci-ink-2)",
                )}
              >
                {r.label}
              </span>
              <span className="relative flex h-full items-center gap-2 py-1">
                <span
                  className="h-[3px] rounded-full transition-[width] duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
                  style={{
                    width: `${(r.items.length / max) * 100}%`,
                    background: r.color,
                    opacity: hover && hover !== r.label ? 0.35 : 1,
                  }}
                />
                <span
                  className={cn(
                    dataTextClass,
                    "text-[12px] text-(--agenci-ink-3)",
                  )}
                >
                  {r.items.length}
                </span>
              </span>
            </TargetLink>
          ))}
          <span />
          <div
            className={cn(
              dataTextClass,
              "mt-1 flex justify-between border-t border-[#E4E8E5] pt-1 text-[12px] text-(--agenci-ink-3)",
            )}
          >
            <span>0</span>
            <span>{max / 2}</span>
            <span>{max}</span>
          </div>
        </div>
      </div>
      <ExpandLink to="files" label="Åpne kunnskapsbasen" />
    </section>
  );
}
