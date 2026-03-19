"use client";

import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Bot,
  Code2,
  Database,
  Gauge,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    id: "widget",
    number: "01",
    title: "Koble inn widget",
    label: "Live",
    description:
      "Legg inn ett lite script. Widgeten blir automatisk tilgjengelig på alle sider uten ekstra deploy-runder.",
    points: ["1 linje kode", "Rask installasjon", "Live umiddelbart"],
    icon: Code2,
  },
  {
    id: "knowledge",
    number: "02",
    title: "Bygg kunnskapsmotor",
    label: "Neste",
    description:
      "Importer FAQ, docs og rutiner. Agenci strukturerer dataen og gjør den søkbar, trygg og svar-klar.",
    points: ["FAQ + docs", "Versjonskontroll", "Bedre svar over tid"],
    icon: Database,
  },
  {
    id: "optimize",
    number: "03",
    title: "Optimaliser i dashboard",
    label: "Alltid på",
    description:
      "Se hva kundene spør om, hvilke svar som fungerer, og juster tone og innhold i sanntid fra ett sted.",
    points: ["Samtaleinnsikt", "Mål konvertering", "Kontroll per tema"],
    icon: MessageSquareText,
  },
] as const;

function WidgetPreview() {
  return (
    <div
      className="relative h-full min-h-[320px] rounded-[28px] border border-[var(--podium-border)] p-4"
      style={{ background: "var(--podium-bg-fade)", boxShadow: "var(--podium-shadow)" }}
    >
      <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.03),transparent_32%)]" />
      <div className="relative flex h-full flex-col">
        <div
          className="mb-4 flex items-center justify-between rounded-2xl border border-[var(--podium-card-border)] px-4 py-3"
          style={{ backgroundColor: "var(--podium-card-bg)" }}
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--podium-card-muted)" }}>
              Agenci widget
            </p>
            <p className="mt-1 text-sm font-medium" style={{ color: "var(--podium-card-text)" }}>
              Aktiv på nettsiden
            </p>
          </div>
          <div className="rounded-full border border-[var(--podium-card-border)] bg-white/[0.03] px-2.5 py-1 text-[11px]" style={{ color: "var(--podium-card-muted)" }}>
            Live
          </div>
        </div>
        <div className="grid flex-1 gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-[var(--podium-card-border)] p-4" style={{ backgroundColor: "var(--podium-card-bg)" }}>
            <div className="mb-4 h-3 w-32 rounded-full bg-white/10" />
            <div className="space-y-3">
              <div className="rounded-2xl border border-[var(--podium-card-border)] bg-white/[0.03] p-4">
                <div className="mb-2 h-2.5 w-24 rounded-full bg-white/15" />
                <div className="h-2 w-full rounded-full bg-white/10" />
                <div className="mt-2 h-2 w-4/5 rounded-full bg-white/10" />
              </div>
              <div className="rounded-2xl border border-[var(--podium-card-border)] bg-white/[0.03] p-4">
                <div className="mb-2 h-2.5 w-20 rounded-full bg-white/15" />
                <div className="h-2 w-11/12 rounded-full bg-white/10" />
                <div className="mt-2 h-2 w-2/3 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-[var(--podium-card-border)] p-4" style={{ backgroundColor: "var(--podium-card-bg)" }}>
              <div className="mb-3 flex items-center gap-2" style={{ color: "var(--podium-card-muted)" }}>
                <Bot className="size-4" />
                <span className="text-sm">Chat panel</span>
              </div>
              <div className="space-y-2">
                <div className="ml-auto h-8 w-24 rounded-2xl bg-white/10" />
                <div className="h-8 w-32 rounded-2xl bg-white/10" />
                <div className="h-8 w-28 rounded-2xl bg-white/10" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-[var(--podium-card-border)] p-3 text-center" style={{ backgroundColor: "var(--podium-card-bg)" }}>
                <Gauge className="mx-auto mb-2 size-4" style={{ color: "var(--podium-card-muted)" }} />
                <p className="text-[11px]" style={{ color: "var(--podium-card-muted)" }}>Speed</p>
              </div>
              <div className="rounded-2xl border border-[var(--podium-card-border)] p-3 text-center" style={{ backgroundColor: "var(--podium-card-bg)" }}>
                <Database className="mx-auto mb-2 size-4" style={{ color: "var(--podium-card-muted)" }} />
                <p className="text-[11px]" style={{ color: "var(--podium-card-muted)" }}>Data</p>
              </div>
              <div className="rounded-2xl border border-[var(--podium-card-border)] p-3 text-center" style={{ backgroundColor: "var(--podium-card-bg)" }}>
                <ShieldCheck className="mx-auto mb-2 size-4" style={{ color: "var(--podium-card-muted)" }} />
                <p className="text-[11px]" style={{ color: "var(--podium-card-muted)" }}>Control</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KnowledgePreview() {
  return (
    <div
      className="relative h-full min-h-[320px] rounded-[28px] border border-[var(--podium-border)] p-4"
      style={{ background: "var(--podium-bg-fade)", boxShadow: "var(--podium-shadow)" }}
    >
      <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.03),transparent_34%)]" />
      <div className="relative grid h-full gap-4 md:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-[var(--podium-card-border)] p-4" style={{ backgroundColor: "var(--podium-card-bg)" }}>
          <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--podium-card-muted)" }}>
            Kilder
          </p>
          <div className="mt-4 space-y-3">
            {["FAQ", "Dokumentasjon", "PDF", "Nettsider", "Interne rutiner"].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-xl border border-[var(--podium-card-border)] bg-white/[0.03] px-3 py-2"
              >
                <span className="text-sm" style={{ color: "var(--podium-card-text)" }}>{item}</span>
                <span className="text-[11px]" style={{ color: "var(--podium-card-muted)" }}>Koblet</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--podium-card-border)] p-4" style={{ backgroundColor: "var(--podium-card-bg)" }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--podium-card-muted)" }}>
                Kunnskapsmotor
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--podium-card-text)" }}>
                Strukturert og søkbar kunnskap
              </p>
            </div>
            <div className="rounded-full border border-[var(--podium-card-border)] bg-white/[0.03] px-2.5 py-1 text-[11px]" style={{ color: "var(--podium-card-muted)" }}>
              Sync
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[var(--podium-card-border)] bg-white/[0.03] p-4"
              >
                <div className="mb-2 h-2.5 w-20 rounded-full bg-white/15" />
                <div className="h-2 w-full rounded-full bg-white/10" />
                <div className="mt-2 h-2 w-3/4 rounded-full bg-white/10" />
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-5 w-14 rounded-full bg-white/10" />
                  <div className="h-5 w-10 rounded-full bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div
      className="relative h-full min-h-[320px] rounded-[28px] border border-[var(--podium-border)] p-4"
      style={{ background: "var(--podium-bg-fade)", boxShadow: "var(--podium-shadow)" }}
    >
      <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03),transparent_32%)]" />
      <div className="relative grid h-full gap-4 md:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl border border-[var(--podium-card-border)] p-4" style={{ backgroundColor: "var(--podium-card-bg)" }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--podium-card-muted)" }}>
                Dashboard
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--podium-card-text)" }}>Samtaler og innsikt</p>
            </div>
            <div className="rounded-full border border-[var(--podium-card-border)] bg-white/[0.03] px-2.5 py-1 text-[11px]" style={{ color: "var(--podium-card-muted)" }}>
              24/7
            </div>
          </div>
          <div className="grid h-[220px] grid-cols-12 gap-2 rounded-2xl border border-[var(--podium-card-border)] bg-white/[0.03] p-4">
            {[35, 55, 48, 72, 68, 90, 64, 84, 58, 76, 94, 70].map((h, i) => (
              <div key={i} className="flex items-end">
                <div
                  className="w-full rounded-t-md bg-white/14"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[var(--podium-card-border)] p-4" style={{ backgroundColor: "var(--podium-card-bg)" }}>
            <div className="mb-3 h-2.5 w-24 rounded-full bg-white/15" />
            <div className="text-3xl font-semibold" style={{ color: "var(--podium-card-text)" }}>+38%</div>
            <p className="mt-1 text-sm" style={{ color: "var(--podium-card-muted)" }}>Bedre svarrate</p>
          </div>
          <div className="rounded-2xl border border-[var(--podium-card-border)] p-4" style={{ backgroundColor: "var(--podium-card-bg)" }}>
            <div className="mb-3 h-2.5 w-20 rounded-full bg-white/15" />
            <div className="text-3xl font-semibold" style={{ color: "var(--podium-card-text)" }}>124</div>
            <p className="mt-1 text-sm" style={{ color: "var(--podium-card-muted)" }}>Samtaler denne uken</p>
          </div>
          <div className="rounded-2xl border border-[var(--podium-card-border)] p-4" style={{ backgroundColor: "var(--podium-card-bg)" }}>
            <div className="mb-3 h-2.5 w-28 rounded-full bg-white/15" />
            <div className="space-y-2">
              <div className="h-9 rounded-xl bg-white/10" />
              <div className="h-9 rounded-xl bg-white/10" />
              <div className="h-9 rounded-xl bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepPreview({ index }: { index: number }) {
  if (index === 0) return <WidgetPreview />;
  if (index === 1) return <KnowledgePreview />;
  return <DashboardPreview />;
}

export function LandingHowItWorksSection() {
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [pinMode, setPinMode] = useState<"before" | "pinned" | "after">("before");

  const totalScrollable = useMemo(() => {
    if (viewportHeight <= 0) return 0;
    return Math.max((steps.length - 1) * viewportHeight, 1);
  }, [viewportHeight]);

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      const section = sectionRef.current;
      if (!section) return;

      const vh = window.innerHeight;
      setViewportHeight(vh);

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const total = Math.max((steps.length - 1) * vh, 1);
      const start = sectionTop;
      const end = sectionTop + total;
      const y = window.scrollY;

      if (y < start) {
        setPinMode("before");
        setActiveIndex(0);
        return;
      }

      if (y >= end) {
        setPinMode("after");
        setActiveIndex(steps.length - 1);
        return;
      }

      setPinMode("pinned");
      const passed = Math.min(Math.max(y - start, 0), total);
      const progress = passed / total;
      const idx = Math.min(steps.length - 1, Math.floor(progress * steps.length));
      setActiveIndex(idx);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    compute();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const progressPercent = useMemo(() => {
    if (steps.length <= 1) return 0;
    return (activeIndex / (steps.length - 1)) * 100;
  }, [activeIndex]);

  const activeStep =
    steps[Math.min(Math.max(activeIndex, 0), steps.length - 1)]!;

  return (
    <section
      id={LANDING_SECTION_IDS.howItWorks}
      aria-labelledby="how-it-works-heading"
      className="relative overflow-visible bg-background py-6 md:py-10"
    >
      <div
        aria-hidden
        className="landing-section-mesh pointer-events-none absolute inset-0 -z-10"
      />

      <div
        ref={sectionRef}
        className="relative"
        style={{
          height:
            viewportHeight > 0
              ? `${viewportHeight + totalScrollable}px`
              : `${steps.length * 100}vh`,
        }}
      >
        <div
          className={[
            "inset-x-0 z-20",
            pinMode === "pinned" ? "fixed top-0" : "absolute",
          ].join(" ")}
          style={{
            top: pinMode === "after" ? `${totalScrollable}px` : 0,
            height: viewportHeight > 0 ? `${viewportHeight}px` : "100vh",
          }}
        >
          <div className="flex h-full items-center">
            <div className="mx-auto w-full max-w-7xl px-6">
              <div className="space-y-6 py-6 md:py-8">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="mb-4 inline-flex rounded-full border border-border/60 bg-background/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur-sm">
                      Hvordan det fungerer
                    </p>
                    <h2
                      id="how-it-works-heading"
                      className="text-balance text-4xl font-semibold tracking-tight lg:text-[2.75rem] lg:leading-tight"
                    >
                      Fra installasjon til{" "}
                      <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        målbar verdi
                      </span>
                    </h2>
                    <p className="mt-5 text-balance text-lg leading-relaxed text-muted-foreground">
                      Scroll gjennom flyten. Veivisningen viser hvor du er i prosessen — innholdet
                      skifter steg for steg.
                    </p>
                  </div>

                <div className="rounded-[2rem] border border-border/50 bg-gradient-to-b from-card/95 via-card/90 to-card/80 p-6 shadow-[0_32px_100px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:shadow-[0_32px_100px_-40px_rgba(0,0,0,0.5)] md:p-8">
                  <div className="mb-8">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Roadmap
                      </p>

                      <div className="relative hidden md:block">
                        <div className="pointer-events-none absolute left-[7%] right-[7%] top-[58px] h-px bg-border/70" />
                        <motion.div
                          className="pointer-events-none absolute left-[7%] top-[58px] h-px bg-primary"
                          animate={{ width: `${86 * (progressPercent / 100)}%` }}
                          transition={{
                            duration: reducedMotion ? 0 : 0.35,
                            ease: "easeInOut",
                          }}
                        />
                        <div className="grid grid-cols-3 gap-4">
                          {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index === activeIndex;
                            const isDone = index < activeIndex;
                            return (
                              <div key={step.id} className="group relative text-center">
                                <div
                                  className={[
                                    "mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-300",
                                    isActive
                                      ? "border-foreground/25 bg-background text-foreground shadow-[0_0_0_6px_rgba(15,23,42,0.08)]"
                                      : isDone
                                      ? "border-border/80 bg-background text-muted-foreground"
                                      : "border-border bg-background text-muted-foreground",
                                  ].join(" ")}
                                >
                                  <Icon className="size-5" />
                                </div>
                                <div className="mt-4">
                                  <p
                                    className={[
                                      "text-sm font-medium transition-colors",
                                      isActive ? "text-foreground" : "text-muted-foreground",
                                    ].join(" ")}
                                  >
                                    {step.title}
                                  </p>
                                  <p
                                    className={[
                                      "mt-1 text-[11px] uppercase tracking-[0.16em]",
                                      isActive ? "text-muted-foreground" : "text-muted-foreground/70",
                                    ].join(" ")}
                                  >
                                    {step.label}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-3 md:hidden">
                        {steps.map((step, index) => {
                          const Icon = step.icon;
                          const isActive = index === activeIndex;
                          return (
                            <div
                              key={step.id}
                              className={[
                                "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
                                isActive
                                  ? "border-border bg-background"
                                  : "border-border/60 bg-background/70",
                              ].join(" ")}
                            >
                              <div
                                className={[
                                  "flex h-10 w-10 items-center justify-center rounded-xl border",
                                  isActive
                                    ? "border-foreground/20 bg-background text-foreground"
                                    : "border-border text-muted-foreground",
                                ].join(" ")}
                              >
                                <Icon className="size-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{step.title}</p>
                                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                                  {step.label}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeStep.id + "-copy"}
                          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="rounded-2xl border border-border/50 bg-background/70 p-6 shadow-inner backdrop-blur-sm md:p-8 dark:bg-background/40"
                        >
                          <div className="mb-5 flex items-center gap-3">
                            <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-border bg-background px-3 text-xs font-semibold text-muted-foreground">
                              {activeStep.number}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                              Aktivt steg
                            </span>
                          </div>
                          <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
                            {activeStep.title}
                          </h3>
                          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                            {activeStep.description}
                          </p>
                          <ul className="mt-6 space-y-3">
                            {activeStep.points.map((point) => (
                              <li
                                key={point}
                                className="flex items-center gap-3 text-sm text-muted-foreground"
                              >
                                <span className="size-2 rounded-full bg-primary/70" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      </AnimatePresence>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeStep.id + "-preview"}
                          initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
                          animate={
                            reducedMotion
                              ? { opacity: 1 }
                              : { opacity: 1, y: 0, scale: 1 }
                          }
                          exit={
                            reducedMotion
                              ? { opacity: 0 }
                              : { opacity: 0, y: -12, scale: 0.985 }
                          }
                          transition={{ duration: 0.35, ease: "easeOut" }}
                        >
                          <StepPreview index={activeIndex} />
                        </motion.div>
                      </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
