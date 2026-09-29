import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowUpRightIcon,
  CheckIcon,
  CreditCardIcon,
  FileTextIcon,
  SearchIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DemoSwitch } from "@/components/demo-switch";
import { useUsageQuery } from "@/features/billing/billing-queries";
import { authClient } from "@/lib/auth-client";

/** Plans as sold on agenci.no/priser (kr per month, billed monthly). */
const PLANS = [
  { id: "gratis", name: "Gratis", price: 0, limit: 50, blurb: "For å prøve Agenci på din egen nettside." },
  { id: "starter", name: "Starter", price: 499, limit: 500, blurb: "For små bedrifter som vil slippe de samme spørsmålene." },
  { id: "pro", name: "Pro", price: 1499, limit: 2000, blurb: "For bedrifter med mye trafikk og et team." },
  { id: "business", name: "Business", price: 3999, limit: 10000, blurb: "Flere nettsider, flere agenter, alt på ett sted." },
] as const;

/** No subscriptions are stored yet, so every organization is on the free plan. */
const CURRENT = PLANS[0];
const NEXT = PLANS[1];

const WEB_URL =
  (import.meta.env.VITE_WEB_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://www.agenci.no";
const PRICING_URL = `${WEB_URL}/priser`;

const cardClass =
  "rounded-[18px] border border-(--dash-edge)/80 bg-(--dash-surface) shadow-[0_1px_3px_rgb(5_6_7/0.06),0_14px_34px_-16px_rgb(5_6_7/0.18)] dark:border-white/5 dark:bg-(--card)";
const outlineBtn =
  "inline-flex h-9 items-center gap-1.5 rounded-full border border-(--agenci-line) bg-(--dash-surface) px-3.5 text-[13px] font-medium text-(--agenci-ink) transition-colors hover:bg-(--dash-subtle) dark:bg-transparent";
const inkBtn =
  "inline-flex h-9 items-center gap-1.5 rounded-full bg-(--agenci-ink) px-4 text-[13px] font-medium text-white transition-colors hover:bg-(--agenci-accent-hover) dark:text-[#0b0c0e]";

const kr = (n: number) => new Intl.NumberFormat("nb-NO").format(n);

function Ring({ value }: { value: number }) {
  const pct = Math.min(1, Math.max(0, value));
  return (
    <svg viewBox="0 0 36 36" className="size-11 shrink-0 -rotate-90" aria-hidden="true">
      <circle cx="18" cy="18" r="14.5" fill="none" style={{ stroke: "var(--chart-track)" }} strokeWidth="4.5" />
      <circle
        cx="18"
        cy="18"
        r="14.5"
        fill="none"
        style={{ stroke: pct >= 0.9 ? "#D9743A" : "var(--agenci-ink)" }}
        strokeWidth="4.5"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${pct * 100} 100`}
      />
    </svg>
  );
}

function Avatars({ names }: { names: string[] }) {
  const shown = names.slice(0, 4);
  return (
    <span className="flex items-center">
      {shown.map((n, i) => (
        <span
          key={`${n}-${i}`}
          title={n}
          className="-ml-1.5 flex size-7 items-center justify-center rounded-full border-2 border-(--dash-edge) bg-gradient-to-b from-(--dash-subtle) to-(--chart-muted) text-[10.5px] font-medium text-(--agenci-ink) first:ml-0 dark:border-(--card)"
        >
          {n
            .split(/\s+/)
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </span>
      ))}
      {names.length > shown.length ? (
        <span className="-ml-1.5 flex size-7 items-center justify-center rounded-full border-2 border-(--dash-edge) bg-(--dash-subtle) text-[10.5px] text-(--agenci-ink-2)">
          +{names.length - shown.length}
        </span>
      ) : null}
    </span>
  );
}

/* ─── Usage chart ───────────────────────────────────────────────────────── */

function UsageChart({ days, limit }: { days: number[]; limit: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cumulative = days.reduce<number[]>((acc, d) => {
    acc.push((acc.at(-1) ?? 0) + d);
    return acc;
  }, []);
  const total = cumulative.at(-1) ?? 0;
  // Project the rest of the month at the current pace (dashed).
  const pace = days.length ? total / days.length : 0;
  const projected = Math.round(pace * daysInMonth);
  const top = Math.max(limit * 1.1, projected * 1.05, total * 1.15, 4);
  const maxDaily = Math.max(1, ...days);

  const x = (i: number) => ((i + 0.5) / daysInMonth) * 100;
  const y = (v: number) => 100 - (v / top) * 100;
  const line = cumulative.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const last = cumulative.length - 1;
  const projection =
    last >= 0 && last < daysInMonth - 1
      ? `M${x(last)},${y(total)} L${x(daysInMonth - 1)},${y(projected)}`
      : "";
  const active = hover !== null && hover < days.length ? hover : null;
  const monthName = now.toLocaleDateString("nb-NO", { month: "long" });

  return (
    <div className="relative">
      <div className="relative h-[190px]" onMouseLeave={() => setHover(null)}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
          {[25, 50, 75].map((g) => (
            <line key={g} x1="0" x2="100" y1={g} y2={g} style={{ stroke: "var(--chart-grid)" }} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          {/* daily volume */}
          {days.map((d, i) => (
            <rect
              key={`b${i}`}
              x={x(i) - 100 / daysInMonth / 2 + 0.35}
              width={100 / daysInMonth - 0.7}
              y={100 - (d / maxDaily) * 28}
              height={(d / maxDaily) * 28}
              rx="0.6"
              style={{ fill: active === i ? "var(--chart-muted-dot)" : "var(--chart-track)" }}
            />
          ))}
          {/* plan limit */}
          {limit <= top ? (
            <>
              <line x1="0" x2="100" y1={y(limit)} y2={y(limit)} stroke="#D9743A" strokeWidth="1.25" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            </>
          ) : null}
          {projection ? (
            <path d={projection} fill="none" style={{ stroke: "var(--chart-axis)" }} strokeWidth="1.5" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
          ) : null}
          {line ? (
            <path d={line} fill="none" stroke="var(--agenci-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          ) : null}
        </svg>

        {limit <= top ? (
          <span
            className="absolute right-0 -translate-y-full rounded-md bg-(--dash-warn-bg) px-1.5 py-0.5 text-[11px] font-medium text-(--dash-warn)"
            style={{ top: `${y(limit)}%` }}
          >
            Grense {limit}
          </span>
        ) : null}

        {active !== null ? (
          <>
            <span className="pointer-events-none absolute inset-y-0 w-px bg-(--agenci-ink)/15" style={{ left: `${x(active)}%` }} />
            <span
              className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-(--dash-edge) bg-(--agenci-ink) shadow"
              style={{ left: `${x(active)}%`, top: `${y(cumulative[active] ?? 0)}%` }}
            />
            <div
              className={cn(
                "pointer-events-none absolute top-0 z-10 min-w-[150px] rounded-[10px] bg-(--agenci-ink) px-3 py-2 text-white shadow-lg dark:text-[#0b0c0e]",
                x(active) > 60 ? "-translate-x-[calc(100%+10px)]" : "translate-x-[10px]",
              )}
              style={{ left: `${x(active)}%` }}
            >
              <p className="text-[12px] font-medium">{active + 1}. {monthName}</p>
              <p className="mt-1 flex justify-between gap-4 text-[12px] text-white/70">
                Den dagen <span className="text-white">{days[active]}</span>
              </p>
              <p className="flex justify-between gap-4 text-[12px] text-white/70">
                Så langt <span className="text-white">{cumulative[active]}</span>
              </p>
            </div>
          </>
        ) : null}

        <div className="absolute inset-0 flex">
          {Array.from({ length: daysInMonth }, (_, i) => (
            <span
              key={i}
              className="h-full flex-1"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </div>
      </div>
      <div className="relative mt-2 h-4 text-[11.5px] text-(--agenci-ink-3) tabular-nums">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1)
          .filter((d) => d === 1 || d % 5 === 0)
          .map((d) => (
            <span key={d} className="absolute -translate-x-1/2" style={{ left: `${x(d - 1)}%` }}>
              {d}
            </span>
          ))}
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function BillingView() {
  const { data: usage, isPending } = useUsageQuery();
  const { data: org } = authClient.useActiveOrganization();
  const [bannerHidden, setBannerHidden] = useState(false);
  const [query, setQuery] = useState("");

  const used = usage?.total ?? 0;
  const share = used / CURRENT.limit;
  const trend = useMemo(() => {
    if (!usage || !usage.previousTotal) return null;
    return Math.round(((usage.total - usage.previousTotal) / usage.previousTotal) * 100);
  }, [usage]);
  const memberNames = (org?.members ?? []).map((m) => m.user?.name || m.user?.email || "?");
  const now = new Date();
  const renew = new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <header className="flex flex-wrap items-end gap-x-6 gap-y-3 px-1">
        <div className="min-w-0">
          <h1 className="[font-family:var(--font-agenci-title)] text-[24px] leading-[1.15] font-medium tracking-[-0.03em] text-(--agenci-ink)">
            Plan og faktura
          </h1>
          <p className="mt-1.5 text-[13.5px] text-(--agenci-ink-2)">
            {org ? <span className="text-(--agenci-ink)">{org.name}</span> : "Organisasjonen"} er på{" "}
            <span className="text-(--agenci-ink)">{CURRENT.name}</span>. Kvoten nullstilles {renew}.
          </p>
        </div>
        <div className="ml-auto">
          <DemoSwitch />
        </div>
      </header>

      {/* Usage banner */}
      {!bannerHidden ? (
        <section className={cn(cardClass, "flex flex-wrap items-center gap-4 px-5 py-4")}>
          <Ring value={share} />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium text-(--agenci-ink)">
              Du har brukt {isPending ? "…" : used} av {CURRENT.limit} samtaler denne måneden
            </p>
            <p className="mt-0.5 text-[13px] text-(--agenci-ink-2)">
              Med {NEXT.name} får du {kr(NEXT.limit)} samtaler i måneden, uten Agenci-merket i chatten.
            </p>
          </div>
          <span className="flex gap-2">
            <button type="button" className={outlineBtn} onClick={() => setBannerHidden(true)}>
              Skjul
            </button>
            <a href={PRICING_URL} target="_blank" rel="noreferrer" className={inkBtn}>
              Oppgrader plan
            </a>
          </span>
        </section>
      ) : null}

      {/* Plan + payment */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className={cn(cardClass, "flex flex-col")}>
          <div className="flex items-start gap-3 p-5">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-(--agenci-ink)">
                {CURRENT.name}
                <span className="inline-flex items-center gap-1 rounded-full border border-(--agenci-line) px-2 py-px text-[11.5px] font-medium text-(--dash-good)">
                  <span className="size-1.5 rounded-full bg-[#5FA06F]" />
                  Aktiv
                </span>
              </p>
              <p className="mt-1 text-[13px] text-(--agenci-ink-2)">{CURRENT.blurb}</p>
            </div>
            <a href={PRICING_URL} target="_blank" rel="noreferrer" className={outlineBtn}>
              Bytt plan
            </a>
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-(--agenci-line) px-5 py-4 dark:border-white/5">
            <p className="text-(--agenci-ink)">
              <span className="[font-family:var(--font-agenci-title)] text-[30px] leading-none font-medium tracking-[-0.03em]">
                {kr(CURRENT.price)} kr
              </span>
              <span className="ml-1 text-[13px] text-(--agenci-ink-3)">/mnd</span>
            </p>
            <span className="ml-auto flex items-center gap-2.5 text-[13px] text-(--agenci-ink-2)">
              <Avatars names={memberNames} />
              {memberNames.length} {memberNames.length === 1 ? "medlem" : "medlemmer"}
            </span>
          </div>
        </section>

        <section className={cn(cardClass, "flex flex-col")}>
          <div className="flex items-start gap-3 p-5">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-(--agenci-ink)">Betalingsmåte</p>
              <p className="mt-1 text-[13px] text-(--agenci-ink-2)">Kortet trekkes automatisk hver måned.</p>
            </div>
            <a href={PRICING_URL} target="_blank" rel="noreferrer" className={outlineBtn}>
              Legg til kort
            </a>
          </div>
          <div className="mt-auto flex items-center gap-3 border-t border-(--agenci-line) px-5 py-4 dark:border-white/5">
            <span className="flex size-10 items-center justify-center rounded-[10px] border border-dashed border-(--chart-muted-dot) text-(--agenci-ink-3)">
              <CreditCardIcon className="size-4.5" strokeWidth={1.6} />
            </span>
            <div className="min-w-0">
              <p className="text-[13.5px] font-medium text-(--agenci-ink)">Ingen kort lagt inn</p>
              <p className="text-[12.5px] text-(--agenci-ink-3)">
                Gratisplanen trenger ikke kort. Du legger det inn når du oppgraderer.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Usage chart */}
      <section className={cn(cardClass, "p-5")}>
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-(--agenci-ink)">
              Samtaler
              {trend !== null ? (
                <span
                  className={cn(
                    "rounded-full border px-2 py-px text-[11.5px] font-medium",
                    trend >= 0 ? "border-[#5FA06F]/40 text-(--dash-good)" : "border-(--agenci-line) text-(--agenci-ink-2)",
                  )}
                >
                  {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)} %
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-[13px] text-(--agenci-ink-2)">
              Du har brukt {Math.round(share * 100)} % av samtalene i planen denne måneden.
            </p>
          </div>
          <span className="flex items-center gap-4 text-[12px] text-(--agenci-ink-3)">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded-full bg-(--agenci-ink)" /> Så langt
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 border-t border-dashed border-(--chart-axis)" /> Med samme tempo
            </span>
          </span>
        </div>
        <p className="mt-4 text-(--agenci-ink)">
          <span className="[font-family:var(--font-agenci-title)] text-[30px] leading-none font-medium tracking-[-0.03em] tabular-nums">
            {used}
          </span>
          <span className="ml-1.5 text-[13px] text-(--agenci-ink-3)">av {CURRENT.limit}</span>
        </p>
        <div className="mt-4">
          {usage ? <UsageChart days={usage.days} limit={CURRENT.limit} /> : <div className="h-[206px] animate-pulse rounded-[12px] bg-(--dash-subtle)" />}
        </div>
      </section>

      {/* Invoices */}
      <section className={cn(cardClass, "overflow-hidden")}>
        <div className="flex flex-wrap items-center gap-3 px-5 pt-5 pb-4">
          <p className="flex-1 text-[15px] font-semibold text-(--agenci-ink)">Fakturaer</p>
          <label className="flex h-9 w-60 items-center gap-2 rounded-[10px] border border-(--agenci-line) bg-(--dash-surface) px-3 dark:bg-transparent">
            <SearchIcon className="size-4 text-(--agenci-ink-3)" strokeWidth={1.6} />
            <input
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              placeholder="Søk"
              className="w-full bg-transparent text-[13px] text-(--agenci-ink) outline-none placeholder:text-(--agenci-ink-3)"
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="bg-(--dash-subtle-2) dark:bg-white/5">
              <tr className="text-left text-[12.5px] text-(--agenci-ink-2)">
                <th className="h-10 px-5 font-medium">Faktura</th>
                <th className="h-10 px-3 font-medium">Dato</th>
                <th className="h-10 px-3 font-medium">Plan</th>
                <th className="h-10 px-3 font-medium">Beløp</th>
                <th className="h-10 px-5 font-medium text-right">
                  <span className="sr-only">Last ned</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-(--dash-subtle) text-(--agenci-ink-2) dark:bg-white/10">
                    <FileTextIcon className="size-4.5" strokeWidth={1.6} />
                  </span>
                  <p className="text-[14px] font-medium text-(--agenci-ink)">Ingen fakturaer ennå</p>
                  <p className="mt-1 text-[13px] text-(--agenci-ink-3)">
                    Du er på gratisplanen. Fakturaene dukker opp her når du oppgraderer.
                  </p>
                  <a href={PRICING_URL} target="_blank" rel="noreferrer" className={cn(outlineBtn, "mt-4")}>
                    Se planene <ArrowUpRightIcon className="size-3.5" strokeWidth={1.8} />
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Plan comparison */}
      <section className={cn(cardClass, "p-5")}>
        <p className="text-[15px] font-semibold text-(--agenci-ink)">Planer</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((p) => {
            const current = p.id === CURRENT.id;
            return (
              <div
                key={p.id}
                className={cn(
                  "flex flex-col rounded-[14px] border p-4",
                  current ? "border-(--agenci-ink) bg-(--dash-subtle-2) dark:bg-white/5" : "border-(--agenci-line)",
                )}
              >
                <p className="flex items-center justify-between text-[14px] font-semibold text-(--agenci-ink)">
                  {p.name}
                  {current ? <CheckIcon className="size-4" strokeWidth={2.2} /> : null}
                </p>
                <p className="mt-2 text-(--agenci-ink)">
                  <span className="text-[20px] font-medium tracking-[-0.02em]">{kr(p.price)} kr</span>
                  <span className="ml-1 text-[12.5px] text-(--agenci-ink-3)">/mnd</span>
                </p>
                <p className="mt-1 text-[12.5px] text-(--agenci-ink-2)">{kr(p.limit)} samtaler i måneden</p>
                <p className="mt-2 flex-1 text-[12.5px] text-(--agenci-ink-3)">{p.blurb}</p>
                {current ? (
                  <span className="mt-3 text-[12.5px] font-medium text-(--agenci-ink-2)">Din plan</span>
                ) : (
                  <a href={PRICING_URL} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-(--agenci-ink) hover:underline">
                    Velg {p.name} <ArrowUpRightIcon className="size-3.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <p className="px-1 pb-2 text-[12px] text-(--agenci-ink-3)">
        Priser eks. mva. Ingen bindingstid.
      </p>
    </div>
  );
}
