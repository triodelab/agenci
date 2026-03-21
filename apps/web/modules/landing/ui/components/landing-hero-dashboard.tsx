"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  Activity,
  ArrowUp,
  BarChart3,
  Inbox,
  MessageCircle,
  Palette,
  Plug,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const barHeights = [40, 72, 55, 88, 48, 66, 78];

/**
 * Hero-scene: tynn app-chrome + nettside + widget + innsikt.
 * Tydelig «dashboard»-følelse uten å duplisere full widget-tilpasning (produktseksjonen).
 */
export function LandingHeroDashboard() {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden
      className="flex h-full min-h-0 w-full flex-col"
    >
      {/* App-linje — minner om ekte Agenci-topbar */}
      <div
        className={cn(
          "flex h-9 shrink-0 items-center gap-1 border-b px-3 sm:h-10 sm:gap-2 sm:px-4",
          "border-zinc-200/80 bg-white/95 dark:border-zinc-800 dark:bg-zinc-950/95",
        )}
      >
        <span className="text-[11px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-xs">
          AGENCI
        </span>
        <span className="mx-1 hidden h-3 w-px bg-zinc-200 sm:block dark:bg-zinc-700" />
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto sm:gap-2">
          {[
            { Icon: Inbox, label: "Innboks", active: true },
            { Icon: Palette, label: "Widget", active: false },
            { Icon: Plug, label: "Systemer", active: false },
            { Icon: BarChart3, label: "Rapporter", active: false },
          ].map(({ Icon, label, active }) => (
            <span
              key={label}
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[9px] font-medium sm:gap-1.5 sm:px-2 sm:text-[10px]",
                active
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-500 dark:text-zinc-400",
              )}
            >
              <Icon className="size-2.5 opacity-90 sm:size-3" strokeWidth={2} />
              <span className="hidden sm:inline">{label}</span>
            </span>
          ))}
        </div>
        <span className="hidden rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800 sm:inline dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-300">
          Live
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Simulert kundeside */}
        <div
          className={cn(
            "relative min-h-[220px] flex-1 overflow-hidden",
            "bg-gradient-to-br from-[#eceae6] via-[#e2e0dc] to-[#d8d6d2]",
            "dark:from-[#121212] dark:via-[#101010] dark:to-[#0a0a0a]",
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
            style={{
              backgroundImage: `radial-gradient(circle at center, rgba(0,0,0,0.06) 1px, transparent 1px)`,
              backgroundSize: "14px 14px",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_100%,rgba(59,130,246,0.08),transparent_55%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_70%_100%,rgba(59,130,246,0.14),transparent_55%)]" />

          <div className="relative z-[1] flex h-full flex-col p-4 sm:p-5 lg:p-7">
            <header className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="size-8 rounded-lg bg-zinc-900/90 shadow-sm dark:bg-white" />
                <div className="hidden space-y-1.5 sm:block">
                  <div className="h-2 w-20 rounded-full bg-zinc-400/35 dark:bg-zinc-600/50" />
                  <div className="h-1.5 w-14 rounded-full bg-zinc-400/20 dark:bg-zinc-600/30" />
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                {["Butikk", "Om oss", "Kontakt"].map((t) => (
                  <span
                    key={t}
                    className="hidden rounded-md px-2 py-1 text-[10px] font-medium text-zinc-500 sm:inline lg:text-[11px] dark:text-zinc-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </header>

            <div className="mt-4 flex flex-1 flex-col rounded-2xl border border-black/[0.04] bg-white/75 p-3 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:mt-5 sm:p-4 lg:rounded-3xl lg:p-5 dark:border-white/[0.06] dark:bg-zinc-900/45 dark:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.5)]">
              <div className="space-y-2">
                <div className="h-2.5 w-[45%] max-w-xs rounded-full bg-zinc-200/90 dark:bg-zinc-700/80" />
                <div className="h-2 w-[70%] max-w-md rounded-full bg-zinc-200/50 dark:bg-zinc-700/40" />
              </div>
              <div className="mt-4 grid flex-1 grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3 lg:gap-4">
                <div className="rounded-xl bg-gradient-to-br from-zinc-100/90 to-zinc-200/40 dark:from-zinc-800/80 dark:to-zinc-800/30" />
                <div className="rounded-xl bg-gradient-to-br from-zinc-100/90 to-zinc-200/40 dark:from-zinc-800/80 dark:to-zinc-800/30" />
              </div>
            </div>
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute bottom-3 right-3 z-[2] w-[min(90vw,310px)] sm:bottom-4 sm:right-4 sm:w-[min(44vw,340px)] lg:bottom-5 lg:right-5 lg:w-[min(40vw,400px)]",
              !reduced && "landing-hero-widget-float",
            )}
          >
            <div
              className={cn(
                "overflow-hidden rounded-2xl border shadow-2xl ring-1 ring-black/[0.04]",
                "border-zinc-200/90 bg-white dark:border-zinc-700 dark:bg-zinc-900",
                "dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.75)] dark:ring-white/[0.05]",
              )}
            >
              <div className="flex items-center gap-2.5 border-b border-zinc-100 px-3.5 py-3 dark:border-zinc-800">
                <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm sm:size-9">
                  <MessageCircle className="size-4 sm:size-[1.125rem]" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900 sm:text-base dark:text-zinc-100">
                    Agenci
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Vanligvis svarer vi med én gang
                  </p>
                </div>
                <span className="size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]" />
              </div>
              <div className="space-y-3 p-3.5 sm:space-y-3.5 sm:p-4 dark:bg-zinc-900">
                <div className="flex flex-wrap gap-1.5">
                  {["Levering", "Retur", "Kontakt"].map((q) => (
                    <span
                      key={q}
                      className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300"
                    >
                      {q}
                    </span>
                  ))}
                </div>
                <div className="flex justify-end">
                  <p className="max-w-[92%] rounded-2xl rounded-tr-md bg-blue-600 px-3 py-2 text-xs font-medium leading-relaxed text-white shadow-sm sm:px-3.5 sm:py-2.5 sm:text-sm">
                    Når kommer pakken min?
                  </p>
                </div>
                <div>
                  <p className="rounded-2xl rounded-tl-md border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/90 dark:text-zinc-200 sm:px-3.5 sm:py-2.5 sm:text-sm">
                    Hei! Forventet levering er 2–4 virkedager. Vil du ha sporingslenke?
                  </p>
                  <div className="mt-2 flex gap-1 pl-1">
                    <span className="size-1.5 animate-pulse rounded-full bg-zinc-400 motion-reduce:animate-none" />
                    <span className="size-1.5 animate-pulse rounded-full bg-zinc-400 motion-reduce:animate-none [animation-delay:150ms]" />
                    <span className="size-1.5 animate-pulse rounded-full bg-zinc-400 motion-reduce:animate-none [animation-delay:300ms]" />
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-200/90 bg-zinc-50/80 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-800/50 sm:px-3.5 sm:py-3">
                  <span className="text-[11px] italic text-zinc-400 sm:text-sm dark:text-zinc-500">
                    Skriv melding…
                  </span>
                  <span className="ml-auto grid size-8 place-items-center rounded-lg bg-zinc-900 text-white sm:size-9 dark:bg-white dark:text-zinc-900">
                    <ArrowUp className="size-3.5 sm:size-4" strokeWidth={2.5} />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Innsikt */}
        <aside
          className={cn(
            "flex w-full shrink-0 flex-col border-t border-black/[0.06] bg-[#f4f2ef]/95 p-4 backdrop-blur-sm sm:p-5",
            "md:w-[min(38%,340px)] md:border-l md:border-t-0 lg:w-[min(36%,380px)] lg:p-6",
            "dark:border-white/[0.07] dark:bg-zinc-950/90",
          )}
        >
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <Activity className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold tracking-tight sm:text-base">Sanntidsinnsikt</span>
            <span className="relative ml-auto flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/60 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          </div>

          <div className="mt-3 rounded-xl border border-black/[0.05] bg-white/90 p-3 dark:border-white/[0.06] dark:bg-zinc-900/70">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Henvendelser (7 d)
            </p>
            <div className="mt-3 flex h-16 items-end justify-between gap-1 px-0.5">
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  className="w-full max-w-[1.25rem] rounded-t bg-gradient-to-t from-blue-600/90 to-blue-400/70 dark:from-blue-500 dark:to-blue-400/80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="rounded-xl border border-black/[0.05] bg-white p-3 shadow-sm dark:border-white/[0.06] dark:bg-zinc-900/80">
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Svar
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50 sm:text-xl">
                &lt; 2 min
              </p>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-3" />
                +12%
              </div>
            </div>
            <div className="rounded-xl border border-black/[0.05] bg-white p-3 shadow-sm dark:border-white/[0.06] dark:bg-zinc-900/80">
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                I dag
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50 sm:text-xl">
                47
              </p>
              <p className="mt-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                løste
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-1 flex-col rounded-xl border border-black/[0.05] bg-white/90 p-3 dark:border-white/[0.06] dark:bg-zinc-900/70">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200">
              <Sparkles className="size-3.5 text-amber-500" />
              Siste fra AI
            </div>
            <ul className="space-y-2.5">
              {[
                { t: "Ordre #4821 — sporingslenke sendt", m: "for 1 min" },
                { t: "FAQ: retur innen 30 dager", m: "for 4 min" },
                { t: "Booking bekreftet — torsdag 14:00", m: "for 8 min" },
              ].map((row) => (
                <li
                  key={row.t}
                  className="flex gap-2.5 rounded-lg bg-zinc-50/90 px-2.5 py-2 dark:bg-zinc-800/50"
                >
                  <span className="mt-0.5 size-2 shrink-0 rounded-full bg-blue-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium leading-snug text-zinc-800 dark:text-zinc-100">
                      {row.t}
                    </p>
                    <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-500">
                      {row.m}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-2 text-center text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
            Forhåndsvisning · ikke ekte data
          </p>
        </aside>
      </div>
    </div>
  );
}
