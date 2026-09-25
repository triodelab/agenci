/**
 * Agent overview tiles (reference: smart-home overview, warm palette).
 * Every number is derived from the conversations and knowledge-base sources
 * passed in — real data, or the seeded demo set when "Demodata" is on.
 * Type, radii, segment control and status tones follow apps/web/DESIGN.md.
 */
import { Link, useParams } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import { ChevronRightIcon, Maximize2Icon, SunIcon } from "lucide-react";
import { Fragment, useEffect, useId, useMemo, useState } from "react";
import { Segment } from "@/components/segment";
import type { AgentDocument } from "@/features/agents/queries/agents-queries";
import type { ConversationSummary } from "@/features/conversations/queries/conversations-queries";
import {
  contactName,
  dataTextClass,
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
      {value > 0 ? "+ " : value < 0 ? "− " : ""}
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

// ─── Alerts ──────────────────────────────────────────────────────────────────

type Alert = {
  key: string;
  title: string;
  detail: string;
  tone: "warn" | "bad";
  conversationId?: string;
  at?: string;
};

export function buildAlerts(
  conversations: ConversationSummary[],
  documents: AgentDocument[],
  agentStatus: string | undefined,
): Alert[] {
  const alerts: Alert[] = [];
  if (agentStatus === "FAILED") {
    alerts.push({
      key: "agent-failed",
      title: "Indekseringen feilet",
      detail: "Agenten kan ikke svare før kunnskapsbasen er indeksert.",
      tone: "bad",
    });
  }
  const conv = (
    c: ConversationSummary,
    title: string,
    tone: Alert["tone"],
  ) => ({
    key: c.threadId,
    title,
    detail: `${contactName(c.contact)} · ${c.firstMessage ?? "Ny samtale"}`,
    tone,
    conversationId: c.threadId,
    at: c.updatedAt,
  });
  for (const c of conversations.filter((c) => c.status === "escalated")) {
    alerts.push(conv(c, "Eskalert til et menneske", "bad"));
  }
  for (const d of documents.filter((d) => d.status === "FAILED")) {
    alerts.push({
      key: d.id,
      title: "Kilde feilet",
      detail: sourceName(d),
      tone: "bad",
    });
  }
  for (const c of conversations.filter((c) => c.status === "unresolved")) {
    alerts.push(conv(c, "Venter på oppfølging", "warn"));
  }
  for (const d of documents.filter((d) =>
    ["PENDING", "PROCESSING", "INDEXING"].includes(d.status),
  )) {
    alerts.push({
      key: d.id,
      title: "Kilde indekseres",
      detail: sourceName(d),
      tone: "warn",
    });
  }
  return alerts;
}

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

export function AlertsTile({ alerts }: { alerts: Alert[] }) {
  const params = useAgentParams();
  const [filter, setFilter] = useState<"all" | "bad">("all");
  const shown =
    filter === "bad" ? alerts.filter((a) => a.tone === "bad") : alerts;
  const rowClass =
    "group -mx-2 flex items-center gap-3 rounded-[10px] border-b border-[#EEF0EF] px-2 py-2.5 transition-colors duration-150 last:border-b-0 hover:bg-white dark:border-white/5 dark:hover:bg-white/5";

  return (
    <section className={tileClass}>
      <TileTitle
        aside={
          <Segment
            label="Varsler"
            options={[
              { value: "all", label: "Alle" },
              { value: "bad", label: "Kritiske" },
            ]}
            value={filter}
            onChange={setFilter}
          />
        }
      >
        <span
          aria-hidden
          className="flex size-4 items-center justify-center rounded-full bg-(--agenci-ink) text-[10px] leading-none font-semibold text-white dark:text-[#0b0c0e]"
        >
          !
        </span>
        Varsler
        <span
          className={cn(dataTextClass, "font-normal text-(--agenci-ink-3)")}
        >
          {alerts.length}
        </span>
      </TileTitle>

      {shown.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-[13px] font-medium text-(--agenci-ink)">
            Ingen varsler
          </p>
          <p className="mt-1 text-[12px] text-(--agenci-ink-3)">
            Alt er i orden akkurat nå.
          </p>
        </div>
      ) : (
        <ul className="mt-2 min-h-0 flex-1 overflow-y-auto pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {shown.map((a) => {
            const body = (
              <>
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    a.tone === "bad" ? "bg-[#D9493E]" : "bg-[#E49A62]",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="truncate text-[13px] font-medium text-(--agenci-ink)">
                      {a.title}
                    </span>
                    {a.at ? (
                      <span
                        className={cn(
                          dataTextClass,
                          "ml-auto shrink-0 text-[12px] text-(--agenci-ink-3)",
                        )}
                      >
                        {ago(a.at)}
                      </span>
                    ) : null}
                  </span>
                  <span className="block truncate text-[12px] text-(--agenci-ink-3)">
                    {a.detail}
                  </span>
                </span>
                <ChevronRightIcon
                  className="size-4 shrink-0 text-(--agenci-ink-3) transition-transform duration-150 group-hover:translate-x-0.5"
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                />
              </>
            );
            return (
              <li key={a.key}>
                {a.conversationId ? (
                  <Link
                    to="/org/$orgSlug/agents/$agentId/conversations/$conversationId"
                    params={{ ...params, conversationId: a.conversationId }}
                    className={rowClass}
                  >
                    {body}
                  </Link>
                ) : (
                  <TargetLink
                    to={a.conversationId ? "conversations" : "files"}
                    className={rowClass}
                  >
                    {body}
                  </TargetLink>
                )}
              </li>
            );
          })}
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

/**
 * One wave period is half the SVG, so sliding it by -50 % loops seamlessly.
 * The line is the surface (for the shine); the shape fills down to the body.
 */
const WAVE_LINE =
  "M0 30 C100 6 200 6 300 30 S500 54 600 30 S800 6 900 30 S1100 54 1200 30";
const WAVE_SHAPE = `${WAVE_LINE} V60 H0 Z`;

/** Colour follows quality: red (low) → amber → green (high). */
function waterHue(rate: number | null) {
  if (rate === null) return 210; // no data: calm neutral blue-grey
  return rate < 50 ? 4 + rate * 0.62 : 35 + (rate - 50) * 2.2;
}

const WAVE_LAYERS = [
  // back → front: taller/lighter/slower behind, lower/deeper/faster in front
  { cls: "agenci-water-back", h: 46, speed: 11, reverse: true, delay: -3 },
  { cls: "agenci-water-mid", h: 38, speed: 7.5, reverse: false, delay: -5 },
  { cls: "agenci-water-front", h: 30, speed: 5, reverse: true, delay: 0 },
];

const BUBBLES = [
  { left: "14%", size: 6, delay: 0, dur: 5.5 },
  { left: "33%", size: 4, delay: 2.2, dur: 4.6 },
  { left: "58%", size: 7, delay: 1.1, dur: 6.2 },
  { left: "79%", size: 5, delay: 3.4, dur: 5 },
];

/**
 * Water that rises to `level` % of the tile: three drifting wave layers, a
 * shine on the surface and a few rising bubbles. Colour eases from red to
 * green with the rate. It fills up from empty on mount; all motion is
 * dropped for prefers-reduced-motion.
 */
function WaterFill({ level }: { level: number | null }) {
  const [shown, setShown] = useState<number | null>(null);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setShown(level));
    return () => window.cancelAnimationFrame(id);
  }, [level]);
  // Keep some water even at 0 % so the surface is visible.
  const height = 10 + ((shown ?? 0) / 100) * 70;

  return (
    <div
      aria-hidden
      className="agenci-water pointer-events-none absolute inset-x-0 bottom-0 -z-10 dark:opacity-40"
      style={
        {
          height: `${height}%`,
          "--water-h": waterHue(shown),
        } as React.CSSProperties
      }
    >
      {WAVE_LAYERS.map((w) => (
        <svg
          key={w.cls}
          aria-hidden="true"
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          className={cn("agenci-wave absolute left-0 w-[200%]", w.cls)}
          style={{
            height: w.h,
            bottom: "calc(100% - 2px)",
            animationDuration: `${w.speed}s`,
            animationDirection: w.reverse ? "reverse" : "normal",
            animationDelay: `${w.delay}s`,
          }}
        >
          <path d={WAVE_SHAPE} />
          {w.cls === "agenci-water-front" ? (
            <path
              d={WAVE_LINE}
              fill="none"
              stroke="white"
              strokeOpacity={0.55}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
        </svg>
      ))}
      <div className="agenci-water-body absolute inset-0 overflow-hidden">
        {BUBBLES.map((b) => (
          <span
            key={b.left}
            className="agenci-bubble absolute bottom-0 rounded-full border border-white/70 bg-white/25"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.dur}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function ResolutionTile({
  agentName,
  conversations,
}: {
  agentName: string;
  conversations: ConversationSummary[];
}) {
  const [range, setRange] = useState<Range>("30");
  const days = Number(range);
  const now = Date.now();
  const cur = rateIn(conversations, now - days * DAY, now + 1);
  const prev = rateIn(conversations, now - 2 * days * DAY, now - days * DAY);
  const trend =
    cur.rate !== null && prev.rate !== null ? cur.rate - prev.rate : null;

  const stats = [
    { label: "Løst", value: cur.resolved },
    { label: "Uavkl.", value: cur.unresolved },
    { label: "Eskal.", value: cur.escalated },
  ];

  return (
    <section className={cn(tileClass, "isolate")}>
      <WaterFill level={cur.rate} />
      <TileTitle
        aside={
          <Segment
            label="Periode"
            options={RANGES}
            value={range}
            onChange={setRange}
          />
        }
      >
        {agentName}
      </TileTitle>

      <div className="relative mt-3 flex items-start justify-between">
        <div>
          <p className={bigNumberClass}>
            {cur.rate ?? "—"}
            {cur.rate !== null ? (
              <span className="ml-0.5 align-top text-[18px] tracking-normal text-(--agenci-ink-2)">
                %
              </span>
            ) : null}
          </p>
          <p
            className={cn(
              dataTextClass,
              "mt-2 flex gap-3 text-[12px] text-(--agenci-ink-2)",
            )}
          >
            {stats.map((s) => (
              <span key={s.label}>
                <span className="text-(--agenci-ink-3)">{s.label}</span>{" "}
                {s.value}
              </span>
            ))}
          </p>
        </div>
        <SunIcon
          className="size-5 text-(--agenci-ink-2)"
          strokeWidth={1.5}
          absoluteStrokeWidth
        />
      </div>

      <TargetLink
        to="conversations"
        className="group relative mt-auto block pb-1 transition-opacity"
      >
        <p className="text-[13px] font-medium text-(--agenci-ink)">
          Løsningsgrad
          {trend !== null && trend !== 0 ? (
            <span className="font-normal text-(--agenci-ink-2)">
              {" "}
              · {trend > 0 ? "opp" : "ned"} {Math.abs(trend)} poeng
            </span>
          ) : null}
        </p>
        <p className="text-[12px] text-(--agenci-ink-2)">
          {cur.total
            ? `${cur.resolved} av ${cur.total} samtaler merket som løst`
            : `Ingen samtaler siste ${days} dager`}
        </p>
      </TargetLink>
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

const OUTCOME = [
  { key: "resolved", label: "Løst", color: "#5FA06F" },
  { key: "unresolved", label: "Uavklart", color: PEACH },
  { key: "escalated", label: "Eskalert", color: "#D9493E" },
] as const;

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
    const outcome = OUTCOME.map((o) => ({
      ...o,
      value: all.filter((c) => c.status === o.key).length,
    }));
    return {
      cur,
      prev,
      total: all.length,
      prevTotal: prev.reduce((s, v) => s + v, 0),
      outcome,
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
        <div className="mb-0.5 flex flex-col gap-1">
          <DeltaChip value={delta} />
          <span className="text-[12px] text-(--agenci-ink-3)">
            {PERIOD_COMPARE[period]}
          </span>
        </div>
      </div>

      <div className={cn(captionClass, "mt-4 flex items-center gap-4")}>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="h-[2px] w-3 rounded-full"
            style={{ background: PEACH }}
          />
          Nå
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="w-3 border-t border-dashed border-[#A9AEB3]"
          />
          Forrige
        </span>
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
                hover === i && "text-(--agenci-ink)",
              )}
              style={{ left: `${x(i)}%` }}
            >
              {b.label}
            </span>
          ) : null,
        )}
      </div>

      {/* Outcome */}
      <div className="mt-4 pb-6">
        <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-[#f3f5f4]">
          {data.total > 0
            ? data.outcome.map((o) =>
                o.value > 0 ? (
                  <span
                    key={o.key}
                    className="h-full transition-[width] duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
                    style={{
                      width: `${(o.value / data.total) * 100}%`,
                      background: o.color,
                    }}
                  />
                ) : null,
              )
            : null}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {data.outcome.map((o) => (
            <div key={o.key} className="min-w-0">
              <p className="flex items-center gap-1.5 text-[12px] text-(--agenci-ink-3)">
                <span
                  aria-hidden
                  className="size-1.5 rounded-full"
                  style={{ background: o.color }}
                />
                {o.label}
              </p>
              <p
                className={cn(dataTextClass, "text-[13px] text-(--agenci-ink)")}
              >
                {o.value}
                <span className="ml-1 text-(--agenci-ink-3)">
                  {data.total
                    ? `${Math.round((o.value / data.total) * 100)} %`
                    : "–"}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
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
