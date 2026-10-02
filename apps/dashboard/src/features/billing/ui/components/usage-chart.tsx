import { cn } from "@workspace/ui/lib/utils";
import { useState } from "react";

/** Conversations this month: daily bars, running total, pace and the plan limit. */
export function UsageChart({ days, limit }: { days: number[]; limit: number }) {
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
