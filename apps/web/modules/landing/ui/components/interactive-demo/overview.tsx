import { Clock, MessageCircle, User } from "lucide-react";
import { useMemo, useState } from "react";
import type { ConversationStatus, DemoState, DemoView } from "./demo-state";
import { DEMO_AGENT } from "./demo-navigation";
import s from "./interactive-demo.module.css";

type OpenConversations = (
  query?: string,
  filter?: ConversationStatus | "all",
  id?: string | null,
) => void;

/** Segmented pill control, same look as the dashboard's period switches. */
function Segments<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (next: T) => void;
  label: string;
}) {
  return (
    <div className={s.segments} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          type="button"
          key={o.id}
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ───────────────────────────── Varsler ───────────────────────────── */

type Recent = { who: string; topic: string; age: string; handedOver?: boolean; anon?: boolean };

/** A good day in the inbox: the agent closes almost everything itself. */
const RECENT: Recent[] = [
  { who: "Emma Solberg", topic: "Levering i helgen", age: "nå" },
  { who: "Sofie Haugen", topic: "Bytte av gave", age: "4 min" },
  { who: "Arne Berg", topic: "Time flyttet til fredag", age: "8 min" },
  { who: "Ingrid Solberg", topic: "Spørsmål om faktura", age: "12 min", handedOver: true },
  { who: "Anonym besøkende", topic: "Åpningstider i romjula", age: "20 min", anon: true },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

function RecentCard({ demoData }: { demoData: boolean }) {
  const rows = demoData ? RECENT : [];
  return (
    <section className={s.card}>
      <header className={s.cardHead}>
        <h4>
          <MessageCircle size={15} className={s.alertIcon} />
          Siste samtaler
        </h4>
        {demoData && <span className={s.goodBadge}>↑ 24 løst i dag</span>}
      </header>
      <ul className={s.alertList}>
        {rows.map((a) => (
          <li key={`${a.who}-${a.topic}`}>
            <span className={s.alertAvatar} data-team={!!a.handedOver}>
              {a.anon ? <User size={13} strokeWidth={1.6} /> : initials(a.who)}
            </span>
            <span className={s.alertText}>
              <strong>{a.who}</strong>
              <small>{a.topic}</small>
            </span>
            <span className={s.alertSide}>
              <em>{a.age}</em>
              <span className={s.alertChip} data-team={!!a.handedOver}>
                {a.handedOver ? "Hos teamet" : "Løst"}
              </span>
            </span>
          </li>
        ))}
        {!rows.length && <li className={s.emptyLine}>Ingen samtaler ennå.</li>}
      </ul>
    </section>
  );
}

/* ─────────────────────────── Løst av agenten ─────────────────────────── */

const RESOLUTION = { solved: 184, team: 21, waiting: 9, trend: 6 } as const;

/** Minutes a person would spend on one routine enquiry. */
const MINUTES_PER_ENQUIRY = 10;

/** Share of conversations the agent closed on its own, as a ring. */
function ResolutionCard({ demoData }: { demoData: boolean }) {
  const r = demoData ? RESOLUTION : { solved: 0, team: 0, waiting: 0, trend: 0 };
  const total = r.solved + r.team + r.waiting;
  const pct = total ? Math.round((r.solved / total) * 100) : 0;
  const hours = Math.round((r.solved * MINUTES_PER_ENQUIRY) / 60);
  const gap = total ? 1.6 : 0;
  const parts = [
    { key: "agent", label: "Agent", n: r.solved },
    { key: "team", label: "Team", n: r.team },
    { key: "wait", label: "Venter", n: r.waiting },
  ];
  let start = 0;
  const arcs = parts.map((p) => {
    const len = total ? (p.n / total) * 100 : 0;
    const arc = { ...p, from: start, len: Math.max(0, len - gap) };
    start += len;
    return arc;
  });

  return (
    <section className={s.card}>
      <header className={s.cardHead}>
        <h4>Løst av {DEMO_AGENT}</h4>
        <span className={s.savedPill}>
          <Clock size={12} strokeWidth={1.8} />≈ {hours} t spart
        </span>
      </header>
      <div className={s.ringWrap}>
        <svg className={s.ring} viewBox="0 0 140 140" aria-hidden="true">
          <defs>
            <linearGradient id="demo-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#1c1c1a" />
              <stop offset="1" stopColor="#57574f" />
            </linearGradient>
          </defs>
          <circle className={s.ringTrack} cx="70" cy="70" r="56" pathLength={100} />
          {arcs.map((a) => (
            <circle
              key={a.key}
              className={s.ringArc}
              data-part={a.key}
              cx="70"
              cy="70"
              r="56"
              pathLength={100}
              strokeDasharray={`${a.len} ${100 - a.len}`}
              strokeDashoffset={-a.from}
            />
          ))}
        </svg>
        <div className={s.ringCenter}>
          <strong>
            {pct}
            <sup>%</sup>
          </strong>
          <small>løst uten team</small>
          {r.trend > 0 && <em>↑ {r.trend} poeng</em>}
        </div>
      </div>
      <ul className={s.ringLegend}>
        {parts.map((p) => (
          <li key={p.key}>
            <b>{p.n}</b>
            <small>
              <i data-part={p.key} />
              {p.label}
            </small>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ──────────────────────────── Samtaler ──────────────────────────── */

type Series = { labels: string[]; now: number[]; prev: number[] };
const SERIES: Record<"day" | "week" | "month", Series> = {
  day: {
    labels: ["00", "04", "08", "12", "16", "20", "24"],
    now: [1, 0, 3, 9, 7, 11, 4],
    prev: [0, 1, 4, 7, 8, 8, 3],
  },
  week: {
    labels: ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"],
    now: [9, 12, 8, 11, 17, 7, 5],
    prev: [10, 9, 9, 10, 12, 6, 5],
  },
  month: {
    labels: ["U35", "U36", "U37", "U38", "U39"],
    now: [38, 52, 47, 61, 55],
    prev: [41, 44, 50, 49, 56],
  },
};

/** Smooth path through points (Catmull-Rom → cubic Bézier). */
function smooth(points: [number, number][]) {
  return points
    .map(([x, y], i) => {
      if (i === 0) return `M${x} ${y}`;
      const p0 = points[i - 2] ?? points[i - 1]!;
      const p1 = points[i - 1]!;
      const p2 = points[i + 1] ?? [x, y];
      const c1 = [p1[0] + (x - p0[0]) / 6, p1[1] + (y - p0[1]) / 6];
      const c2 = [x - (p2[0] - p1[0]) / 6, y - (p2[1] - p1[1]) / 6];
      return `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${x} ${y}`;
    })
    .join(" ");
}

function ConversationsCard({ demoData }: { demoData: boolean }) {
  const data = SERIES.week;
  const now = demoData ? data.now : data.now.map(() => 0);
  const total = now.reduce((a, b) => a + b, 0);
  const prevTotal = data.prev.reduce((a, b) => a + b, 0);
  const delta = demoData ? Math.round(((total - prevTotal) / prevTotal) * 100) : 0;
  const max = Math.max(...data.now, ...data.prev) * 1.2;
  const toPoints = (values: readonly number[]): [number, number][] =>
    values.map((v, i) => [(i / (values.length - 1)) * 300, 120 - (v / max) * 110]);
  const pts = toPoints(now);
  const line = smooth(pts);
  const prev = smooth(toPoints(data.prev));
  const peakIndex = now.indexOf(Math.max(...now));
  const [px, py] = pts[peakIndex] ?? [0, 120];

  return (
    <section className={s.card}>
      <header className={s.cardHead}>
        <h4>Samtaler</h4>
        <Segments
          label="Tidsrom"
          value="week"
          onChange={() => {}}
          options={[
            { id: "day", label: "Døgn" },
            { id: "week", label: "Uke" },
            { id: "month", label: "Mnd" },
          ]}
        />
      </header>
      <div className={s.bigStat}>
        <strong>{total}</strong>
        <em className={s.delta} data-down={delta < 0}>
          {delta > 0 ? "↑" : delta < 0 ? "↓" : "±"} {Math.abs(delta)} %
        </em>
      </div>
      <div className={s.chartBox}>
        <svg className={s.lineChart} viewBox="0 0 300 124" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="demo-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#e0894f" stopOpacity="0.35" />
              <stop offset="1" stopColor="#e0894f" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="demo-line" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#efb48a" />
              <stop offset="1" stopColor="#d9743a" />
            </linearGradient>
          </defs>
          {[30, 60, 90].map((y) => (
            <line key={y} x1="0" x2="300" y1={y} y2={y} className={s.gridLine} />
          ))}
          <path d={`${line} L300 124 L0 124Z`} fill="url(#demo-area)" />
          <path d={prev} className={s.prevLine} />
          <path d={line} className={s.nowLine} stroke="url(#demo-line)" />
        </svg>
        {demoData && (
          <span
            className={s.peak}
            style={{ left: `${(px / 300) * 100}%`, top: `${(py / 124) * 100}%` }}
          >
            <b>{now[peakIndex]}</b>
          </span>
        )}
      </div>
      <div className={s.axis}>
        {data.labels.map((l, i) => (
          <span key={`${l}-${i}`} data-peak={i === peakIndex}>
            {l}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────── Når kundene chatter ─────────────────────── */

const DAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 07–22

function activity(day: number, hour: number, period: "7d" | "30d") {
  const office = Math.exp(-((hour - 13) ** 2) / 18);
  const evening = Math.exp(-((hour - 20.5) ** 2) / 3) * (day === 3 ? 1.35 : 0.8);
  const weekend = day >= 5 ? 0.55 : 1;
  const noise = ((day * 7 + hour * 13) % 5) / 12;
  const v = (office * 0.9 + evening + noise) * weekend;
  return Math.round(v * (period === "30d" ? 5 : 1.4));
}

function HeatmapCard({
  demoData,
  openConversations,
}: {
  demoData: boolean;
  openConversations: OpenConversations;
}) {
  const [period, setPeriod] = useState<"7d" | "30d">("30d");
  const grid = useMemo(
    () =>
      DAYS.map((_, d) => HOURS.map((h) => (demoData ? activity(d, h, period) : 0))),
    [period, demoData],
  );
  const max = Math.max(1, ...grid.flat());
  const busiest = useMemo(() => {
    let best = { d: 0, h: HOURS[0]!, v: -1 };
    grid.forEach((row, d) =>
      row.forEach((v, i) => {
        if (v > best.v) best = { d, h: HOURS[i]!, v };
      }),
    );
    return best;
  }, [grid]);
  const [hover, setHover] = useState<{ d: number; h: number; v: number } | null>(null);
  const shown = hover ?? busiest;

  return (
    <section className={`${s.card} ${s.heatCard}`}>
      <header className={s.cardHead}>
        <div>
          <h4>Når kundene chatter</h4>
          <small>
            Samtaler per ukedag og time, siste {period === "30d" ? "30" : "7"} dager
          </small>
        </div>
        <div className={s.headActions}>
          <Segments
            label="Periode"
            value={period}
            onChange={setPeriod}
            options={[
              { id: "7d", label: "7 D" },
              { id: "30d", label: "30 D" },
            ]}
          />
          <button type="button" className={s.pill} onClick={() => openConversations()}>
            Se samtaler
          </button>
        </div>
      </header>
      <div className={s.heatBody}>
        <div className={s.heat} onMouseLeave={() => setHover(null)}>
          {grid.map((row, d) => (
            <div key={DAYS[d]} className={s.heatRow}>
              <span>{DAYS[d]}</span>
              {row.map((v, i) => (
                <i
                  key={HOURS[i]}
                  title={`${DAYS[d]} ${HOURS[i]}–${HOURS[i]! + 1}: ${v} samtaler`}
                  style={{ opacity: 0.1 + (v / max) * 0.9 }}
                  onMouseEnter={() => setHover({ d, h: HOURS[i]!, v })}
                />
              ))}
            </div>
          ))}
        </div>
        <div className={s.busiest}>
          <small>{hover ? "Valgt time" : "Travlest"}</small>
          <strong>
            {DAYS[shown.d]} {shown.h}–{shown.h + 1}
          </strong>
          <p>
            {shown.v} samtaler siste {period === "30d" ? "30" : "7"} dager
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Kunnskapsbase ─────────────────────────── */

function KnowledgeCard({
  state,
  navigate,
}: {
  state: DemoState;
  navigate: (view: DemoView) => void;
}) {
  const extra = 19; // pages crawled from the website in the demo
  const total = state.sources.length + extra;
  return (
    <section className={s.card}>
      <header className={s.cardHead}>
        <h4>Kunnskapsbase</h4>
        <button type="button" className={s.pill} onClick={() => navigate("knowledge")}>
          Alle
        </button>
      </header>
      <div className={s.bigStat}>
        <strong>{total}</strong>
        <small className={s.unit}>Kilder</small>
        <em className={s.goodBadge}>Alt klart</em>
      </div>
      <p className={s.statLine}>Oppdatert i dag kl. 06:00</p>
      <ul className={s.sourceMini}>
        {state.sources.map((src) => (
          <li key={src.id}>
            <i data-on={src.enabled} aria-hidden="true" />
            {src.title}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────────────────────────── Oversikt ───────────────────────────── */

export function DemoOverview({
  state,
  demoData,
  navigate,
  openConversations,
}: {
  state: DemoState;
  demoData: boolean;
  navigate: (view: DemoView) => void;
  openConversations: OpenConversations;
}) {
  return (
    <div className={s.overview}>
      <header className={s.greeting}>
        <h3>God dag, Demobruker</h3>
        <p>
          <i aria-hidden="true" />
          <strong>{DEMO_AGENT}</strong> er aktiv og svarer kunder
        </p>
      </header>
      <div className={s.overviewGrid}>
        <RecentCard demoData={demoData} />
        <ResolutionCard demoData={demoData} />
        <ConversationsCard demoData={demoData} />
        <HeatmapCard demoData={demoData} openConversations={openConversations} />
        <KnowledgeCard state={state} navigate={navigate} />
      </div>
    </div>
  );
}
