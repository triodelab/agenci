/**
 * Building blocks for the admin area: cards, stats, badges, tables, a bar
 * chart, drawers and a proper confirm dialog.
 */
import { cn } from "@workspace/ui/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, DownloadIcon, SearchIcon, XIcon } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AgenciLoader } from "@/components/agenci-loader";

/* ── Formatting ───────────────────────────────────────────────────── */

export const num = (n: number) => new Intl.NumberFormat("nb-NO").format(n);
export const kr = (n: number, decimals = 0) =>
  `${new Intl.NumberFormat("nb-NO", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n)} kr`;
export const krOre = (ore: number) => kr(Math.round(ore / 100));
export const when = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleString("nb-NO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "–";
export const day = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" }) : "–";
export function ago(d: string | Date | null | undefined) {
  if (!d) return "–";
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "nå";
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86_400) return `${Math.floor(s / 3600)} t`;
  return `${Math.floor(s / 86_400)} d`;
}
export function bytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} kB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

/* ── Surfaces ─────────────────────────────────────────────────────── */

export const cardCls =
  "rounded-[18px] border border-(--dash-edge)/70 bg-(--dash-surface) shadow-[0_1px_2px_rgb(5_6_7/0.04),0_10px_28px_-18px_rgb(5_6_7/0.18)] dark:border-white/5 dark:bg-(--card)";

export function Card({ title, action, children, className, pad = true }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={cn(cardCls, "min-w-0 overflow-hidden", className)}>
      {title ? (
        <header className="flex items-center gap-3 px-5 pt-4 pb-3">
          <h2 className="min-w-0 flex-1 truncate text-[14px] font-semibold text-(--agenci-ink)">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className={pad ? "px-5 pb-5" : ""}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="[font-family:var(--font-agenci-title)] text-[26px] leading-tight font-medium tracking-[-0.03em] text-(--agenci-ink)">{title}</h1>
        {description ? <p className="mt-1 text-[13.5px] text-(--agenci-ink-2)">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "good" | "bad" | "warn" }) {
  return (
    <div className={cn(cardCls, "p-4")}>
      <p className="text-[12px] text-(--agenci-ink-3)">{label}</p>
      <p
        className={cn(
          "mt-1.5 [font-family:var(--font-agenci-title)] text-[26px] leading-none font-medium tracking-[-0.03em] tabular-nums",
          tone === "good" ? "text-[#2f6b3c]" : tone === "bad" ? "text-[#b23a2e]" : tone === "warn" ? "text-[#a35d17]" : "text-(--agenci-ink)",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1.5 truncate text-[12px] text-(--agenci-ink-3)">{hint}</p> : null}
    </div>
  );
}

export function Loading({ h = 240 }: { h?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ height: h }}>
      <AgenciLoader size={34} decorative />
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-5 py-10 text-center text-[13.5px] text-(--agenci-ink-3)">{children}</p>;
}

/* ── Badges ───────────────────────────────────────────────────────── */

const TONES: Record<string, string> = {
  developer: "bg-[#eef1fb] text-[#3949ab]",
  trialing: "bg-[#fdf3e6] text-[#a35d17]",
  active: "bg-[#e9f4ec] text-[#2f6b3c]",
  paid: "bg-[#e9f4ec] text-[#2f6b3c]",
  COMPLETED: "bg-[#e9f4ec] text-[#2f6b3c]",
  resolved: "bg-[#e9f4ec] text-[#2f6b3c]",
  charging: "bg-[#eef1fb] text-[#3949ab]",
  past_due: "bg-[#fbeceb] text-[#b23a2e]",
  failed: "bg-[#fbeceb] text-[#b23a2e]",
  FAILED: "bg-[#fbeceb] text-[#b23a2e]",
  escalated: "bg-[#fbeceb] text-[#b23a2e]",
  unresolved: "bg-[#fdf3e6] text-[#a35d17]",
  PENDING: "bg-[#fdf3e6] text-[#a35d17]",
  PROCESSING: "bg-[#fdf3e6] text-[#a35d17]",
  INDEXING: "bg-[#fdf3e6] text-[#a35d17]",
  pending: "bg-[#fdf3e6] text-[#a35d17]",
};
const LABELS: Record<string, string> = {
  developer: "Utvikler",
  trialing: "Prøveperiode",
  active: "Aktiv",
  paid: "Betalt",
  charging: "Trekkes",
  past_due: "Betaling feilet",
  failed: "Feilet",
  trial_ended: "Prøve utløpt",
  canceled: "Sagt opp",
  needs_registration: "Ikke registrert",
  pending: "Venter",
  COMPLETED: "Klar",
  FAILED: "Feilet",
  PENDING: "I kø",
  PROCESSING: "Leser",
  INDEXING: "Indekserer",
  unresolved: "Uavklart",
  escalated: "Til teamet",
  resolved: "Løst",
  owner: "Eier",
  admin: "Admin",
  member: "Medlem",
};
export function Badge({ status, children }: { status: string; children?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap", TONES[status] ?? "bg-(--dash-subtle) text-(--agenci-ink-2) dark:bg-white/5")}>
      {children ?? LABELS[status] ?? status}
    </span>
  );
}

/* ── Buttons ──────────────────────────────────────────────────────── */

export const btn =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-(--agenci-line) bg-(--dash-surface) px-3 text-[12.5px] font-medium text-(--agenci-ink-2) transition-colors hover:text-(--agenci-ink) hover:border-(--agenci-ink-3) disabled:opacity-50 dark:bg-transparent";
export const btnInk =
  "inline-flex h-8 items-center gap-1.5 rounded-full bg-(--agenci-ink) px-3.5 text-[12.5px] font-medium text-white transition-colors hover:bg-(--agenci-accent-hover) disabled:opacity-50 dark:text-[#0b0c0e]";
export const btnDanger =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-[#e8c3bf] bg-[#fbeceb] px-3 text-[12.5px] font-medium text-[#b23a2e] transition-colors hover:bg-[#f7dedb] disabled:opacity-50";

export function SearchBox({ value, onChange, placeholder = "Søk" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-(--agenci-ink-3)" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-56 rounded-full border border-(--agenci-line) bg-(--dash-surface) pr-3 pl-8 text-[12.5px] text-(--agenci-ink) outline-none focus:border-(--agenci-ink-3) dark:bg-transparent"
      />
    </label>
  );
}

/* ── CSV ──────────────────────────────────────────────────────────── */

export function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0] as object);
  const cell = (v: unknown) => {
    const s = v == null ? "" : v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[";\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  const csv = [cols.join(";"), ...rows.map((r) => cols.map((c) => cell(r[c])).join(";"))].join("\n");
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `${name}-${new Date().toISOString().slice(0, 10)}.csv` });
  a.click();
  URL.revokeObjectURL(url);
}

export function CsvButton({ name, rows }: { name: string; rows: Record<string, unknown>[] }) {
  return (
    <button type="button" className={btn} disabled={!rows.length} onClick={() => downloadCsv(name, rows)}>
      <DownloadIcon className="size-3.5" /> CSV
    </button>
  );
}

/* ── Sortable table ───────────────────────────────────────────────── */

export type Column<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  sort?: (row: T) => number | string;
  align?: "right";
  className?: string;
};

export function DataTable<T>({ rows, columns, onRow, initialSort, empty = "Ingenting her ennå." }: { rows: T[]; columns: Column<T>[]; onRow?: (row: T) => void; initialSort?: { key: string; dir: 1 | -1 }; empty?: string }) {
  const [sort, setSort] = useState(initialSort ?? null);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sort) return rows;
    const get = col.sort;
    return [...rows].sort((a, b) => {
      const x = get(a);
      const y = get(b);
      return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
    });
  }, [rows, sort, columns]);
  if (!rows.length) return <Empty>{empty}</Empty>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-y border-(--agenci-line) bg-(--dash-subtle-2) text-left text-[11.5px] tracking-[0.02em] text-(--agenci-ink-3) uppercase dark:border-white/5 dark:bg-white/[0.03]">
            {columns.map((c) => (
              <th key={c.key} className={cn("h-9 px-4 font-medium whitespace-nowrap first:pl-5 last:pr-5", c.align === "right" && "text-right")}>
                {c.sort ? (
                  <button
                    type="button"
                    onClick={() => setSort((s) => (s?.key === c.key ? { key: c.key, dir: (s.dir * -1) as 1 | -1 } : { key: c.key, dir: -1 }))}
                    className="inline-flex items-center gap-1 uppercase hover:text-(--agenci-ink)"
                  >
                    {c.label}
                    {sort?.key === c.key ? sort.dir === 1 ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" /> : null}
                  </button>
                ) : (
                  c.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr
              // biome-ignore lint/suspicious/noArrayIndexKey: rows are display-only
              key={i}
              onClick={onRow ? () => onRow(r) : undefined}
              className={cn("border-b border-(--agenci-line)/70 last:border-0 dark:border-white/5", onRow && "cursor-pointer hover:bg-(--dash-subtle-2) dark:hover:bg-white/[0.03]")}
            >
              {columns.map((c) => (
                <td key={c.key} className={cn("h-11 px-4 align-middle first:pl-5 last:pr-5", c.align === "right" && "text-right tabular-nums", c.className)}>
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Bar chart ────────────────────────────────────────────────────── */

export function BarChart({ data, height = 140, label }: { data: { day: string; n: number }[]; height?: number; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.n));
  const total = data.reduce((s, d) => s + d.n, 0);
  const shown = hover !== null ? data[hover] : null;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="[font-family:var(--font-agenci-title)] text-[24px] leading-none font-medium tracking-[-0.03em] text-(--agenci-ink) tabular-nums">
          {num(shown ? shown.n : total)}
        </p>
        <p className="text-[12px] text-(--agenci-ink-3)">
          {shown ? new Date(shown.day).toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "short" }) : `${label} siste ${data.length} dager`}
        </p>
      </div>
      <div className="flex items-end gap-[3px]" style={{ height }} onMouseLeave={() => setHover(null)}>
        {data.map((d, i) => (
          <div key={d.day} className="flex h-full flex-1 items-end" onMouseEnter={() => setHover(i)}>
            <div
              className={cn("w-full rounded-t-[3px] transition-colors", hover === i ? "bg-(--agenci-ink)" : d.n ? "bg-(--agenci-ink)/70 dark:bg-white/60" : "bg-(--dash-subtle) dark:bg-white/10")}
              style={{ height: `${Math.max(d.n ? 6 : 3, (d.n / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-(--agenci-ink-3)">
        <span>{data[0] ? new Date(data[0].day).toLocaleDateString("nb-NO", { day: "numeric", month: "short" }) : ""}</span>
        <span>I dag</span>
      </div>
    </div>
  );
}

/* ── Overlays ─────────────────────────────────────────────────────── */

export function Drawer({ title, subtitle, onClose, children, wide }: { title: ReactNode; subtitle?: ReactNode; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/25 backdrop-blur-[1px]" onClick={onClose} role="presentation">
      <div
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={() => {}}
        className={cn("flex h-full w-full flex-col bg-(--dash-surface) shadow-2xl dark:bg-(--card)", wide ? "max-w-[860px]" : "max-w-[620px]")}
      >
        <div className="flex items-start gap-3 border-b border-(--agenci-line) px-6 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[16px] font-semibold text-(--agenci-ink)">{title}</h2>
            {subtitle ? <p className="mt-0.5 truncate text-[12.5px] text-(--agenci-ink-3)">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} aria-label="Lukk" className="rounded-full p-1.5 text-(--agenci-ink-2) hover:bg-(--dash-subtle)">
            <XIcon className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export type ConfirmRequest = {
  title: string;
  body: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  /** The user must type this exactly (e.g. the organization's name). */
  typeToConfirm?: string;
  onConfirm: () => unknown;
};

export function useConfirm() {
  const [req, setReq] = useState<ConfirmRequest | null>(null);
  const dialog = req ? <ConfirmDialog req={req} onClose={() => setReq(null)} /> : null;
  return { confirm: setReq, dialog };
}

function ConfirmDialog({ req, onClose }: { req: ConfirmRequest; onClose: () => void }) {
  const [typed, setTyped] = useState("");
  const ok = !req.typeToConfirm || typed.trim() === req.typeToConfirm.trim();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4" onClick={onClose} role="presentation">
      <div role="alertdialog" onClick={(e) => e.stopPropagation()} onKeyDown={() => {}} className={cn(cardCls, "w-full max-w-[440px] p-6")}>
        <h3 className="text-[16px] font-semibold text-(--agenci-ink)">{req.title}</h3>
        <div className="mt-2 text-[13.5px] leading-relaxed text-(--agenci-ink-2)">{req.body}</div>
        {req.typeToConfirm ? (
          <label className="mt-4 block">
            <span className="text-[12.5px] text-(--agenci-ink-3)">
              Skriv <strong className="font-medium text-(--agenci-ink)">{req.typeToConfirm}</strong> for å bekrefte
            </span>
            <input
              // biome-ignore lint/a11y/noAutofocus: the only field in the dialog
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="mt-1.5 h-9 w-full rounded-[10px] border border-(--agenci-line) bg-transparent px-3 text-[13.5px] outline-none focus:border-(--agenci-ink-3)"
            />
          </label>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={btn} onClick={onClose}>
            Avbryt
          </button>
          <button
            type="button"
            disabled={!ok}
            className={req.danger ? btnDanger : btnInk}
            onClick={() => {
              void req.onConfirm();
              onClose();
            }}
          >
            {req.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function KeyValues({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[140px_minmax(0,1fr)] gap-x-4 gap-y-2 text-[13px]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-(--agenci-ink-3)">{k}</dt>
          <dd className="min-w-0 truncate text-(--agenci-ink)">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
