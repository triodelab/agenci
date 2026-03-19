"use client";

import { cn } from "@workspace/ui/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Code2,
  CreditCard,
  Inbox,
  Library,
  LineChart,
  MessageCircle,
  Monitor,
  Moon,
  Palette,
  Plug,
  Smartphone,
  Sparkles,
  Sun,
  Tablet,
  UserRound,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const THEME_INTERVAL_MS = 4200;

/**
 * Mini «Widget Tilpasning»-dashboard for landing: lys app-chrome som i produktet,
 * med forhåndsvisning som veksler mellom lys og mørk widget-modus.
 */
export function LandingDashboardPreview() {
  const reducedMotion = useReducedMotion();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setTheme((t) => (t === "light" ? "dark" : "light"));
    }, THEME_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  return (
    <div
      aria-hidden
      className="mx-auto w-full max-w-[min(100%,72rem)] overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-50 text-zinc-900 shadow-[0_28px_90px_-24px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/5"
    >
      {/* Top bar — lys som i app */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-zinc-200/90 bg-white px-4 sm:h-12 sm:px-5 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="text-xs font-bold tracking-tight sm:text-sm">AGENCI</span>
        <span className="hidden text-xs text-zinc-500 sm:inline dark:text-zinc-400">
          Tilpasning / <span className="text-zinc-700 dark:text-zinc-300">Widget</span>
        </span>
        <span className="ml-auto rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-medium text-zinc-500 sm:text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          Free
        </span>
      </div>

      <div className="flex min-h-[280px] sm:min-h-[340px] lg:min-h-[400px]">
        <aside className="hidden w-[28%] max-w-[15.5rem] shrink-0 border-r border-zinc-200/90 bg-white py-3 pl-3 pr-2 dark:border-zinc-800 dark:bg-zinc-900 sm:block">
          <NavBlockLight
            label="Kundetjeneste"
            items={[
              { icon: Inbox, label: "Konversasjoner" },
              { icon: Library, label: "Ressurser" },
              { icon: MessageCircle, label: "Spørreside" },
            ]}
          />
          <NavBlockLight
            label="Organisasjoner"
            items={[
              { icon: LineChart, label: "Markedsundersøkelser" },
              { icon: Bot, label: "Digital arbeidere" },
            ]}
          />
          <NavBlockLight
            label="Tilpasning"
            items={[
              { icon: Palette, label: "Widget tilpasning", active: true },
              { icon: Plug, label: "Integrasjoner" },
              { icon: Sparkles, label: "AI-assistent" },
            ]}
          />
          <NavBlockLight
            label="Konto"
            items={[
              { icon: CreditCard, label: "Planer & faktura" },
              { icon: UserRound, label: "Kontoinformasjon" },
            ]}
          />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col sm:flex-row">
          {/* Innstillinger — venstre kolonne */}
          <div className="flex w-full flex-col border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:w-[40%] sm:border-r sm:p-5">
            <h3 className="text-sm font-semibold tracking-tight sm:text-base">Widget tilpasning</h3>
            <p className="mt-1 text-xs leading-snug text-zinc-500 dark:text-zinc-400">
              Tilpass utseende og hent kode for nettsiden.
            </p>

            <p className="mb-1.5 mt-4 text-[10px] font-medium uppercase tracking-wide text-zinc-400 sm:text-xs">
              Posisjon
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["Sentert", "Høyre", "Venstre"].map((p, i) => (
                <span
                  key={p}
                  className={cn(
                    "rounded-lg px-3 py-1 text-[10px] font-medium sm:text-xs",
                    i === 0
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-400",
                  )}
                >
                  {p}
                </span>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <FakeSlider label="Bredde" value="420 px" pct={72} />
              <FakeSlider label="Høyde" value="580 px" pct={68} />
              <FakeSlider label="Avrunding" value="16 px" pct={40} />
            </div>

            <p className="mb-1.5 mt-4 text-[10px] font-medium uppercase tracking-wide text-zinc-400 sm:text-xs">
              Tema
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-medium transition-colors sm:text-xs",
                  theme === "light"
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
                )}
              >
                {theme === "light" ? (
                  <span className="size-2 shrink-0 rounded-full bg-blue-400 shadow-[0_0_0_2px_rgba(59,130,246,0.35)]" />
                ) : null}
                <Sun className="size-3.5 shrink-0 sm:size-4" strokeWidth={2} />
                Lys
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-medium transition-colors sm:text-xs",
                  theme === "dark"
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
                )}
              >
                {theme === "dark" ? (
                  <span className="size-2 shrink-0 rounded-full bg-blue-400 shadow-[0_0_0_2px_rgba(59,130,246,0.35)]" />
                ) : null}
                <Moon className="size-3.5 shrink-0 sm:size-4" strokeWidth={2} />
                Mørk
              </button>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-2.5">
              {[
                "bg-blue-500",
                "bg-emerald-500",
                "bg-rose-400",
                "bg-amber-500",
                "bg-teal-600",
                "bg-sky-500",
                "bg-violet-500",
                "bg-orange-500",
              ].map((c, i) => (
                <span
                  key={i}
                  className={cn(
                    "size-5 rounded-full ring-1 ring-black/10 sm:size-6 dark:ring-white/15",
                    c,
                  )}
                />
              ))}
            </div>

            <div className="mt-auto space-y-2 pt-4">
              <div className="rounded-lg bg-zinc-900 py-2.5 text-center text-xs font-medium text-white sm:py-3 dark:bg-white dark:text-zinc-900">
                Lagre og hent kode
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium text-zinc-500 sm:text-xs dark:text-zinc-400">
                <Code2 className="size-3.5 shrink-0" />
                Kopier embed-kode
              </div>
            </div>
          </div>

          {/* Forhåndsvisning — animert lys/mørk */}
          <PreviewCanvas theme={theme} reducedMotion={!!reducedMotion} />
        </div>
      </div>
    </div>
  );
}

function PreviewCanvas({
  theme,
  reducedMotion,
}: {
  theme: "light" | "dark";
  reducedMotion: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col overflow-hidden p-3 transition-[background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:p-5 lg:p-6",
        theme === "light" ? "bg-[#e4e4e8]" : "bg-[#0c0c0f]",
      )}
    >
      {/* Ambient glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[min(420px,55vw)] max-h-[min(420px,100%)] max-w-[min(420px,100%)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        initial={false}
        animate={{
          opacity: theme === "light" ? 0.55 : 0.45,
          background:
            theme === "light"
              ? "radial-gradient(circle, rgba(59,130,246,0.22) 0%, rgba(147,197,253,0.12) 40%, transparent 70%)"
              : "radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(59,130,246,0.15) 45%, transparent 72%)",
        }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* «Enhet»-verktøylinje */}
      <div className="relative z-[1] mb-2 flex justify-end gap-1 sm:mb-3">
        {[Monitor, Tablet, Smartphone].map((Icon, i) => (
          <span
            key={i}
            className={cn(
              "rounded-lg p-1.5 transition-colors duration-500 sm:p-2",
              theme === "light"
                ? i === 0
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-400"
                : i === 0
                  ? "bg-zinc-800 text-zinc-100 shadow-md shadow-black/30"
                  : "text-zinc-600",
            )}
          >
            <Icon className="size-4 sm:size-[1.125rem]" strokeWidth={2} />
          </span>
        ))}
      </div>

      <div className="relative z-[1] flex flex-1 items-center justify-center py-2">
        <motion.div
          className="relative w-full max-w-[min(92vw,300px)] sm:max-w-[340px] lg:max-w-[400px]"
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [0, -8, 0],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          <motion.div
            className="absolute -inset-4 rounded-3xl opacity-60 blur-2xl sm:-inset-5"
            animate={{
              boxShadow:
                theme === "light"
                  ? "0 24px 60px -12px rgba(15,23,42,0.18)"
                  : "0 32px 70px -14px rgba(0,0,0,0.7)",
            }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          <AnimatedWidget theme={theme} />
        </motion.div>
      </div>

      <motion.p
        className="relative z-[1] mt-2 text-center text-[10px] font-medium sm:text-xs"
        initial={false}
        animate={{
          color: theme === "light" ? "rgb(113 113 122)" : "rgb(161 161 170)",
        }}
        transition={{ duration: 0.5 }}
      >
        Forhåndsvisning · {theme === "light" ? "Lys modus" : "Mørk modus"}
      </motion.p>
    </div>
  );
}

function AnimatedWidget({ theme }: { theme: "light" | "dark" }) {
  const isLight = theme === "light";
  return (
    <div
      data-theme={theme}
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-[background-color,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:rounded-[1.125rem]",
        isLight
          ? "border-zinc-200/90 bg-white shadow-[0_24px_60px_-18px_rgba(15,23,42,0.14)]"
          : "border-zinc-700/90 bg-zinc-900 shadow-[0_28px_70px_-14px_rgba(0,0,0,0.58)]",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between border-b px-3 py-2.5 transition-colors duration-700 sm:px-4 sm:py-3",
          isLight ? "border-zinc-100 bg-white" : "border-zinc-800 bg-zinc-900",
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-5 shrink-0 rounded-lg bg-gradient-to-br transition-opacity duration-700 sm:size-6",
              isLight ? "from-blue-500 to-indigo-600" : "from-blue-400 to-violet-600",
            )}
          />
          <span
            className={cn(
              "text-xs font-semibold transition-colors duration-700 sm:text-sm",
              isLight ? "text-zinc-900" : "text-zinc-100",
            )}
          >
            trondelab.no
          </span>
        </div>
        <span
          className={cn(
            "flex shrink-0 items-center gap-1.5 text-xs leading-none sm:text-sm",
            isLight ? "text-zinc-400" : "text-zinc-500",
          )}
        >
          <span className="opacity-70">↻</span>
          <span className="opacity-70">─</span>
          <span>×</span>
        </span>
      </div>

      <div
        className={cn(
          "space-y-2.5 p-3 transition-colors duration-700 sm:space-y-3 sm:p-4",
          isLight ? "bg-white" : "bg-zinc-900",
        )}
      >
        <p
          className={cn(
            "rounded-xl border px-3 py-2 text-[10px] italic leading-relaxed transition-colors duration-700 sm:text-xs",
            isLight
              ? "border-zinc-100 bg-zinc-50 text-zinc-700"
              : "border-zinc-800 bg-zinc-800/80 text-zinc-300",
          )}
        >
          Hei! Jeg hjelper deg med bestilling, levering og kontakt.
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {["Åpningstider", "Bestill", "Kontakt oss"].map((q) => (
            <span
              key={q}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[9px] font-medium transition-colors duration-700 sm:text-[10px]",
                isLight
                  ? "border-zinc-200 bg-white text-zinc-600"
                  : "border-zinc-700 bg-zinc-800/90 text-zinc-300",
              )}
            >
              {q}
            </span>
          ))}
        </div>
        <div className="flex justify-end">
          <span
            className={cn(
              "max-w-[90%] rounded-2xl rounded-tr-md px-3 py-2 text-[10px] font-medium transition-colors duration-700 sm:text-xs",
              isLight ? "bg-blue-600 text-white" : "bg-blue-500 text-white",
            )}
          >
            Hvor lang er leveringstiden?
          </span>
        </div>
        <p
          className={cn(
            "rounded-xl border px-3 py-2 text-[10px] italic leading-relaxed transition-colors duration-700 sm:text-xs",
            isLight
              ? "border-zinc-100 bg-zinc-50 text-zinc-700"
              : "border-zinc-800 bg-zinc-800/80 text-zinc-300",
          )}
        >
          Vanligvis 2–4 virkedager. Vil du se status på en ordre?
        </p>
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors duration-700 sm:py-2.5",
            isLight
              ? "border-zinc-200 bg-zinc-50"
              : "border-zinc-700 bg-zinc-950/80",
          )}
        >
          <span
            className={cn(
              "flex-1 truncate text-[10px] italic transition-colors duration-700 sm:text-xs",
              isLight ? "text-zinc-400" : "text-zinc-500",
            )}
          >
            Skriv melding…
          </span>
          <span
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-xl text-xs transition-colors duration-700 sm:size-8 sm:text-sm",
              isLight ? "bg-blue-600 text-white" : "bg-blue-500 text-white",
            )}
          >
            ➤
          </span>
        </div>
      </div>
    </div>
  );
}

function NavBlockLight({
  label,
  items,
}: {
  label: string;
  items: { icon: LucideIcon; label: string; active?: boolean }[];
}) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="mb-1.5 px-1.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      <ul className="space-y-1">
        {items.map(({ icon: Icon, label: itemLabel, active }) => (
          <li key={itemLabel}>
            <span
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] transition-colors sm:text-[11px]",
                active
                  ? "bg-zinc-900 font-medium text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-500 dark:text-zinc-400",
              )}
            >
              <Icon className="size-3 shrink-0 opacity-90 sm:size-3.5" strokeWidth={2} />
              <span className="truncate">{itemLabel}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FakeSlider({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium text-zinc-500 sm:text-xs dark:text-zinc-400">
          {label}
        </span>
        <span className="text-[10px] tabular-nums text-zinc-700 sm:text-xs dark:text-zinc-300">
          {value}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 sm:h-2 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-zinc-800 dark:bg-zinc-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
