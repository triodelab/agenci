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

type LandingDashboardPreviewProps = {
  className?: string;
  /** Større typografi, mer luft og bredere forhåndsvisning (f.eks. på landing) */
  comfortable?: boolean;
};

/**
 * Mini «Widget Tilpasning»-dashboard for landing: lys app-chrome som i produktet,
 * med forhåndsvisning som veksler mellom lys og mørk widget-modus.
 */
export function LandingDashboardPreview({
  className,
  comfortable = false,
}: LandingDashboardPreviewProps) {
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
      className={cn(
        "mx-auto w-full max-w-[min(100%,72rem)] overflow-hidden border border-zinc-200/90 bg-zinc-50 text-zinc-900 shadow-[0_28px_90px_-24px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/5",
        comfortable ? "rounded-3xl" : "rounded-2xl",
        className,
      )}
    >
      {/* Top bar — lys som i app */}
      <div
        className={cn(
          "flex shrink-0 items-center gap-3 border-b border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-900",
          comfortable
            ? "h-12 px-5 sm:h-14 sm:px-6"
            : "h-11 px-4 sm:h-12 sm:px-5",
        )}
      >
        <span
          className={cn(
            "font-bold tracking-tight",
            comfortable ? "text-sm sm:text-base" : "text-xs sm:text-sm",
          )}
        >
          AGENCI
        </span>
        <span
          className={cn(
            "hidden text-zinc-500 sm:inline dark:text-zinc-400",
            comfortable ? "text-sm" : "text-xs",
          )}
        >
          Tilpasning / <span className="text-zinc-700 dark:text-zinc-300">Widget</span>
        </span>
        <span
          className={cn(
            "ml-auto rounded-md border border-zinc-200 bg-zinc-50 font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
            comfortable ? "px-3 py-1.5 text-xs sm:text-sm" : "px-2.5 py-1 text-[10px] sm:text-xs",
          )}
        >
          Free
        </span>
      </div>

      <div
        className={cn(
          "flex",
          comfortable
            ? "min-h-[300px] sm:min-h-[400px] lg:min-h-[480px] xl:min-h-[520px]"
            : "min-h-[280px] sm:min-h-[340px] lg:min-h-[400px]",
        )}
      >
        <aside
          className={cn(
            "hidden shrink-0 border-r border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-900 sm:block",
            comfortable
              ? "w-[24%] max-w-[17rem] py-4 pl-4 pr-2.5 lg:max-w-[19rem] xl:max-w-[20.5rem]"
              : "w-[28%] max-w-[15.5rem] py-3 pl-3 pr-2",
          )}
        >
          <NavBlockLight
            comfortable={comfortable}
            label="Kundetjeneste"
            items={[
              { icon: Inbox, label: "Konversasjoner" },
              { icon: Library, label: "Ressurser" },
              { icon: MessageCircle, label: "Spørreside" },
            ]}
          />
          <NavBlockLight
            comfortable={comfortable}
            label="Organisasjoner"
            items={[
              { icon: LineChart, label: "Markedsundersøkelser" },
              { icon: Bot, label: "Digital arbeidere" },
            ]}
          />
          <NavBlockLight
            comfortable={comfortable}
            label="Tilpasning"
            items={[
              { icon: Palette, label: "Widget tilpasning", active: true },
              { icon: Plug, label: "Integrasjoner" },
              { icon: Sparkles, label: "AI-assistent" },
            ]}
          />
          <NavBlockLight
            comfortable={comfortable}
            label="Konto"
            items={[
              { icon: CreditCard, label: "Planer & faktura" },
              { icon: UserRound, label: "Kontoinformasjon" },
            ]}
          />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col sm:flex-row">
          {/* Innstillinger — venstre kolonne */}
          <div
            className={cn(
              "flex w-full flex-col border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-900 sm:border-r",
              comfortable ? "p-5 sm:w-[30%] sm:p-6 lg:w-[28%] lg:p-7" : "p-4 sm:w-[40%] sm:p-5",
            )}
          >
            <h3
              className={cn(
                "font-semibold tracking-tight",
                comfortable ? "text-base sm:text-lg" : "text-sm sm:text-base",
              )}
            >
              Widget tilpasning
            </h3>
            <p
              className={cn(
                "mt-1 leading-snug text-zinc-500 dark:text-zinc-400",
                comfortable ? "text-sm" : "text-xs",
              )}
            >
              Tilpass utseende og hent kode for nettsiden.
            </p>

            <p
              className={cn(
                "mb-1.5 mt-4 font-medium uppercase tracking-wide text-zinc-400",
                comfortable ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs",
              )}
            >
              Posisjon
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {["Sentert", "Høyre", "Venstre"].map((p, i) => (
                <span
                  key={p}
                  className={cn(
                    "rounded-lg font-medium",
                    comfortable
                      ? "px-3.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
                      : "px-3 py-1 text-[10px] sm:text-xs",
                    i === 0
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-400",
                  )}
                >
                  {p}
                </span>
              ))}
            </div>

            <div className={cn("mt-4", comfortable ? "space-y-4" : "space-y-3")}>
              <FakeSlider comfortable={comfortable} label="Bredde" value="420 px" pct={72} />
              <FakeSlider comfortable={comfortable} label="Høyde" value="580 px" pct={68} />
              <FakeSlider comfortable={comfortable} label="Avrunding" value="16 px" pct={40} />
            </div>

            <p
              className={cn(
                "mb-1.5 mt-4 font-medium uppercase tracking-wide text-zinc-400",
                comfortable ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs",
              )}
            >
              Tema
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border font-medium transition-colors",
                  comfortable
                    ? "px-4 py-2.5 text-xs sm:py-3 sm:text-sm"
                    : "px-3 py-2 text-[10px] sm:text-xs",
                  theme === "light"
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
                )}
              >
                {theme === "light" ? (
                  <span className="size-2 shrink-0 rounded-full bg-blue-400 shadow-[0_0_0_2px_rgba(59,130,246,0.35)]" />
                ) : null}
                <Sun
                  className={cn("shrink-0", comfortable ? "size-4 sm:size-[1.125rem]" : "size-3.5 sm:size-4")}
                  strokeWidth={2}
                />
                Lys
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border font-medium transition-colors",
                  comfortable
                    ? "px-4 py-2.5 text-xs sm:py-3 sm:text-sm"
                    : "px-3 py-2 text-[10px] sm:text-xs",
                  theme === "dark"
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
                )}
              >
                {theme === "dark" ? (
                  <span className="size-2 shrink-0 rounded-full bg-blue-400 shadow-[0_0_0_2px_rgba(59,130,246,0.35)]" />
                ) : null}
                <Moon
                  className={cn("shrink-0", comfortable ? "size-4 sm:size-[1.125rem]" : "size-3.5 sm:size-4")}
                  strokeWidth={2}
                />
                Mørk
              </button>
            </div>

            <div
              className={cn(
                "mt-3 grid grid-cols-4",
                comfortable ? "gap-2.5 sm:gap-3" : "gap-2 sm:gap-2.5",
              )}
            >
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
                    "rounded-full ring-1 ring-black/10 dark:ring-white/15",
                    comfortable ? "size-6 sm:size-7" : "size-5 sm:size-6",
                    c,
                  )}
                />
              ))}
            </div>

            <div className={cn("mt-auto space-y-2", comfortable ? "pt-5" : "pt-4")}>
              <div
                className={cn(
                  "rounded-lg bg-zinc-900 text-center font-medium text-white dark:bg-white dark:text-zinc-900",
                  comfortable ? "py-3 text-sm sm:py-3.5 sm:text-base" : "py-2.5 text-xs sm:py-3",
                )}
              >
                Lagre og hent kode
              </div>
              <div
                className={cn(
                  "flex items-center justify-center gap-1.5 font-medium text-zinc-500 dark:text-zinc-400",
                  comfortable ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs",
                )}
              >
                <Code2 className={cn("shrink-0", comfortable ? "size-4" : "size-3.5")} />
                Kopier embed-kode
              </div>
            </div>
          </div>

          {/* Forhåndsvisning — animert lys/mørk */}
          <PreviewCanvas
            comfortable={comfortable}
            theme={theme}
            reducedMotion={!!reducedMotion}
          />
        </div>
      </div>
    </div>
  );
}

function PreviewCanvas({
  theme,
  reducedMotion,
  comfortable,
}: {
  theme: "light" | "dark";
  reducedMotion: boolean;
  comfortable: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden transition-[background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        comfortable ? "p-4 sm:p-6 lg:p-8" : "p-3 sm:p-5 lg:p-6",
        theme === "light" ? "bg-[#e4e4e8]" : "bg-[#0c0c0f]",
      )}
    >
      {/* Ambient glow */}
      <motion.div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl",
          comfortable
            ? "size-[min(560px,70vw)] max-h-[min(560px,100%)] max-w-[min(560px,100%)]"
            : "size-[min(420px,55vw)] max-h-[min(420px,100%)] max-w-[min(420px,100%)]",
        )}
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
            <Icon
              className={cn(
                comfortable ? "size-[1.125rem] sm:size-5" : "size-4 sm:size-[1.125rem]",
              )}
              strokeWidth={2}
            />
          </span>
        ))}
      </div>

      <div className="relative z-[1] flex flex-1 items-center justify-center py-2 sm:py-4">
        <motion.div
          className={cn(
            "relative w-full",
            comfortable
              ? "max-w-[min(94vw,380px)] sm:max-w-[440px] lg:max-w-[520px] xl:max-w-[560px]"
              : "max-w-[min(92vw,300px)] sm:max-w-[340px] lg:max-w-[400px]",
          )}
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
          <AnimatedWidget comfortable={comfortable} theme={theme} />
        </motion.div>
      </div>

      <motion.p
        className={cn(
          "relative z-[1] mt-2 text-center font-medium",
          comfortable ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs",
        )}
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

function AnimatedWidget({
  theme,
  comfortable,
}: {
  theme: "light" | "dark";
  comfortable: boolean;
}) {
  const isLight = theme === "light";
  return (
    <div
      data-theme={theme}
      className={cn(
        "relative overflow-hidden border transition-[background-color,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        comfortable ? "rounded-2xl sm:rounded-[1.25rem]" : "rounded-2xl sm:rounded-[1.125rem]",
        isLight
          ? "border-zinc-200/90 bg-white shadow-[0_24px_60px_-18px_rgba(15,23,42,0.14)]"
          : "border-zinc-700/90 bg-zinc-900 shadow-[0_28px_70px_-14px_rgba(0,0,0,0.58)]",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between border-b transition-colors duration-700",
          comfortable ? "px-4 py-3 sm:px-5 sm:py-3.5" : "px-3 py-2.5 sm:px-4 sm:py-3",
          isLight ? "border-zinc-100 bg-white" : "border-zinc-800 bg-zinc-900",
        )}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "shrink-0 rounded-lg bg-gradient-to-br transition-opacity duration-700",
              comfortable ? "size-6 sm:size-7" : "size-5 sm:size-6",
              isLight ? "from-blue-500 to-indigo-600" : "from-blue-400 to-violet-600",
            )}
          />
          <span
            className={cn(
              "font-semibold transition-colors duration-700",
              comfortable ? "text-sm sm:text-base" : "text-xs sm:text-sm",
              isLight ? "text-zinc-900" : "text-zinc-100",
            )}
          >
            trondelab.no
          </span>
        </div>
        <span
          className={cn(
            "flex shrink-0 items-center gap-1.5 leading-none",
            comfortable ? "text-sm sm:text-base" : "text-xs sm:text-sm",
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
          "transition-colors duration-700",
          comfortable ? "space-y-3 p-4 sm:space-y-3.5 sm:p-5" : "space-y-2.5 p-3 sm:space-y-3 sm:p-4",
          isLight ? "bg-white" : "bg-zinc-900",
        )}
      >
        <p
          className={cn(
            "rounded-xl border italic leading-relaxed transition-colors duration-700",
            comfortable ? "px-3.5 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm" : "px-3 py-2 text-[10px] sm:text-xs",
            isLight
              ? "border-zinc-100 bg-zinc-50 text-zinc-700"
              : "border-zinc-800 bg-zinc-800/80 text-zinc-300",
          )}
        >
          Hei! Jeg hjelper deg med bestilling, levering og kontakt.
        </p>
        <div className={cn("flex flex-wrap", comfortable ? "gap-2 sm:gap-2.5" : "gap-1.5 sm:gap-2")}>
          {["Åpningstider", "Bestill", "Kontakt oss"].map((q) => (
            <span
              key={q}
              className={cn(
                "rounded-full border font-medium transition-colors duration-700",
                comfortable
                  ? "px-3 py-1.5 text-[11px] sm:px-3.5 sm:py-2 sm:text-xs"
                  : "px-2.5 py-1 text-[9px] sm:text-[10px]",
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
              "max-w-[90%] rounded-2xl rounded-tr-md font-medium transition-colors duration-700",
              comfortable ? "px-3.5 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm" : "px-3 py-2 text-[10px] sm:text-xs",
              isLight ? "bg-blue-600 text-white" : "bg-blue-500 text-white",
            )}
          >
            Hvor lang er leveringstiden?
          </span>
        </div>
        <p
          className={cn(
            "rounded-xl border italic leading-relaxed transition-colors duration-700",
            comfortable ? "px-3.5 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm" : "px-3 py-2 text-[10px] sm:text-xs",
            isLight
              ? "border-zinc-100 bg-zinc-50 text-zinc-700"
              : "border-zinc-800 bg-zinc-800/80 text-zinc-300",
          )}
        >
          Vanligvis 2–4 virkedager. Vil du se status på en ordre?
        </p>
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border transition-colors duration-700",
            comfortable ? "px-3.5 py-2.5 sm:px-4 sm:py-3" : "px-3 py-2 sm:py-2.5",
            isLight
              ? "border-zinc-200 bg-zinc-50"
              : "border-zinc-700 bg-zinc-950/80",
          )}
        >
          <span
            className={cn(
              "flex-1 truncate italic transition-colors duration-700",
              comfortable ? "text-sm" : "text-[10px] sm:text-xs",
              isLight ? "text-zinc-400" : "text-zinc-500",
            )}
          >
            Skriv melding…
          </span>
          <span
            className={cn(
              "grid shrink-0 place-items-center rounded-xl transition-colors duration-700",
              comfortable ? "size-9 text-sm sm:size-10 sm:text-base" : "size-7 text-xs sm:size-8 sm:text-sm",
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
  comfortable,
}: {
  label: string;
  items: { icon: LucideIcon; label: string; active?: boolean }[];
  comfortable: boolean;
}) {
  return (
    <div className={cn("last:mb-0", comfortable ? "mb-4" : "mb-3")}>
      <p
        className={cn(
          "px-1.5 font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500",
          comfortable ? "mb-2 text-[10px] sm:text-xs" : "mb-1.5 text-[9px]",
        )}
      >
        {label}
      </p>
      <ul className={cn(comfortable ? "space-y-1.5" : "space-y-1")}>
        {items.map(({ icon: Icon, label: itemLabel, active }) => (
          <li key={itemLabel}>
            <span
              className={cn(
                "flex items-center rounded-lg transition-colors",
                comfortable
                  ? "gap-2.5 px-2.5 py-2 text-[11px] sm:gap-3 sm:px-3 sm:py-2 sm:text-xs"
                  : "gap-2 px-2 py-1.5 text-[10px] sm:text-[11px]",
                active
                  ? "bg-zinc-900 font-medium text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-500 dark:text-zinc-400",
              )}
            >
              <Icon
                className={cn(
                  "shrink-0 opacity-90",
                  comfortable ? "size-3.5 sm:size-4" : "size-3 sm:size-3.5",
                )}
                strokeWidth={2}
              />
              <span className="truncate">{itemLabel}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FakeSlider({
  label,
  value,
  pct,
  comfortable,
}: {
  label: string;
  value: string;
  pct: number;
  comfortable: boolean;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span
          className={cn(
            "font-medium text-zinc-500 dark:text-zinc-400",
            comfortable ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs",
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "tabular-nums text-zinc-700 dark:text-zinc-300",
            comfortable ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs",
          )}
        >
          {value}
        </span>
      </div>
      <div
        className={cn(
          "overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800",
          comfortable ? "h-2 sm:h-2.5" : "h-1.5 sm:h-2",
        )}
      >
        <div
          className="h-full rounded-full bg-zinc-800 dark:bg-zinc-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
