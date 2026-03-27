"use client";

import { useCallback, useEffect, useState } from "react";

import { cn } from "@workspace/ui/lib/utils";

const ROTATE_MS = 3000;

/** Vekselvis svart og hvit (dark → light → dark → light), uavhengig av app-tema */
const SLIDES = [
  {
    kicker: "Om Agenci",
    title: "Svar fra deres egne kilder",
    body:
      "Chat som er forankret i innholdet dere legger inn — med mulighet til å ta over samtalen når det trengs.",
    variant: "dark" as const,
  },
  {
    kicker: "Tips",
    title: "Sterkere treff i samtaler",
    body:
      "Oppdater kunnskapsbasen med FAQ og produkttekster. Jo tydeligere kilder, jo bedre svar.",
    variant: "light" as const,
  },
  {
    kicker: "Widget",
    title: "Tilpass utseendet",
    body:
      "Farger, velkomsttekst og forslag finner dere under Widget-tilpasning — samme uttrykk som på nettsiden.",
    variant: "dark" as const,
  },
  {
    kicker: "Veien videre",
    title: "Mer i dashboardet",
    body:
      "Vi bygger videre på innsikt, integrasjoner og rapporter. Tilbakemeldinger hjelper oss å prioritere.",
    variant: "light" as const,
  },
];

export function DashboardOverviewSpotlight() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) {
      return;
    }
    const id = window.setInterval(advance, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [advance, paused, reduceMotion]);

  const slide = SLIDES[index]!;

  return (
    <section
      aria-label="Nyheter og tips"
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        Nytt & tips
      </p>
      <div
        aria-live="polite"
        className={cn(
          "relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-3xl border p-8 transition-[box-shadow,background-color,border-color] duration-500 sm:min-h-[320px] sm:p-10",
          slide.variant === "dark" && [
            /* Alltid mørk «kortflate» — ikke semantic foreground (blir hvitt i dark mode og gir hvitt-på-hvitt med kicker/brødtekst) */
            "border-white/10 bg-zinc-950 text-zinc-50",
            "shadow-[0_28px_64px_-28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.1)]",
            "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:content-[''] before:bg-[radial-gradient(ellipse_90%_55%_at_100%_-10%,rgba(255,255,255,0.14),transparent_55%)]",
          ],
          slide.variant === "light" && [
            "border-zinc-200/90 bg-white text-zinc-950",
            "shadow-[0_24px_56px_-32px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.95)]",
            "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:content-[''] before:bg-[radial-gradient(ellipse_85%_55%_at_100%_0%,rgba(0,0,0,0.04),transparent_55%)]",
          ],
        )}
      >
        <div className="relative z-[1] flex flex-1 flex-col">
          <span
            className={cn(
              "inline-flex w-fit max-w-full rounded-full border px-3 py-1.5 text-[10px] font-semibold tracking-[0.22em] uppercase",
              slide.variant === "dark"
                ? "border-white/20 bg-white/[0.08] text-white/85"
                : "border-zinc-200 bg-zinc-100/90 text-zinc-600",
            )}
          >
            {slide.kicker}
          </span>
          <p
            className={cn(
              "mt-5 text-[1.35rem] font-semibold leading-[1.2] tracking-[-0.025em] sm:text-[1.5rem] sm:leading-[1.15]",
              slide.variant === "dark" ? "text-zinc-50" : "text-zinc-950",
            )}
          >
            {slide.title}
          </p>
          <p
            className={cn(
              "mt-4 max-w-[22rem] text-[15px] leading-[1.65] sm:text-[15.5px]",
              slide.variant === "dark"
                ? "text-white/[0.82]"
                : "text-zinc-600",
            )}
          >
            {slide.body}
          </p>
        </div>

        <div className="relative z-[1] mt-8 flex gap-2 pt-2">
          {SLIDES.map((_, i) => (
            <button
              aria-current={i === index ? "true" : undefined}
              aria-label={`Slide ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                slide.variant === "dark"
                  ? i === index
                    ? "w-10 bg-white"
                    : "w-2 bg-white/30 hover:bg-white/45"
                  : i === index
                    ? "w-10 bg-zinc-900"
                    : "w-2 bg-zinc-300 hover:bg-zinc-400",
              )}
              key={i}
              onClick={() => setIndex(i)}
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
