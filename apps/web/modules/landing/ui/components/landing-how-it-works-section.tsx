"use client";

import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import {
  LandingGradientText,
  landingIconSurfaceClassName,
  landingStepBadgeShellClassName,
} from "@/modules/landing/ui/components/landing-gradient-text";
import { LandingSectionHeader } from "@/modules/landing/ui/components/landing-section-header";
import { cn } from "@workspace/ui/lib/utils";
import { Code2, Database, LineChart, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

const phases = [
  {
    step: "01",
    title: "Installer på nettsiden",
    lead: "Én kodesnutt — ingen deploy-maraton.",
    body: "Lim inn scriptet der dere vil ha widgeten. Den følger besøkende på tvers av sider og kan matches til merkevaren.",
    icon: Code2,
    points: ["Rask onboarding", "Lys og mørk modus", "Tilpasset plassering"],
  },
  {
    step: "02",
    title: "Gi AI-en kunnskap",
    lead: "FAQ, dokumentasjon og rutiner — strukturert og søkbart.",
    body: "Agenci bruker innholdet dere allerede har. Dere setter grenser for hva som er innafor og hvordan svar skal formuleres.",
    icon: Database,
    points: ["Versjonering av innhold", "Tydelig scope", "Tryggere svar"],
  },
  {
    step: "03",
    title: "Mål, juster, skaler",
    lead: "Dashboardet er kommandosenteret.",
    body: "Se temaer, responstid og volum. Juster tone og policy — og la teamet ta over når samtalen krever menneske.",
    icon: LineChart,
    points: ["Sanntidsinnsikt", "Human handoff", "Kontinuerlig forbedring"],
  },
] as const;

export function LandingHowItWorksSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id={LANDING_SECTION_IDS.howItWorks}
      aria-labelledby="how-it-works-heading"
      className="relative scroll-mt-24 border-b border-border/40 bg-background py-20 md:py-28"
    >
      <div
        aria-hidden
        className="landing-section-mesh pointer-events-none absolute inset-0 -z-10 opacity-[0.45]"
      />
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <LandingSectionHeader
          eyebrow="Fra null til verdi"
          titleId="how-it-works-heading"
          title={
            <>
              Tre faser — <LandingGradientText>uten støy</LandingGradientText>
            </>
          }
          description="Ingen «black box». Dere ser flyten, kontrollerer innholdet og bygger tillit hos kundene steg for steg."
        />

        <div className="relative mt-14 md:mt-16">
          <div
            aria-hidden
            className="absolute left-4 right-4 top-10 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:left-8 lg:right-8 lg:block"
          />
          <ol className="relative grid gap-8 lg:grid-cols-3 lg:gap-6">
            {phases.map((phase, i) => {
              const Icon = phase.icon;
              return (
                <motion.li
                  key={phase.step}
                  initial={reduced ? false : { opacity: 0, y: 24 }}
                  whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
        className="relative"
      >
        <div
                    className={cn(
                      "h-full rounded-3xl border border-border/50 bg-gradient-to-b from-card/90 to-card/60 p-6 shadow-[0_28px_90px_-50px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:from-card/50 dark:to-card/25 dark:shadow-[0_28px_90px_-50px_rgba(0,0,0,0.45)] md:p-8",
                      "lg:pt-14",
                    )}
                  >
                    <span
                      className={cn(
                        "mb-5 inline-flex size-11 items-center justify-center rounded-2xl lg:absolute lg:left-1/2 lg:top-0 lg:mb-0 lg:-translate-x-1/2 lg:-translate-y-1/2",
                        landingStepBadgeShellClassName(),
                      )}
                    >
                      <LandingGradientText className="text-sm font-bold tabular-nums">
                        {phase.step}
                      </LandingGradientText>
                    </span>
                    <span
                      className={cn(
                        "flex size-11 items-center justify-center rounded-2xl ring-1 ring-primary/20",
                        landingIconSurfaceClassName(),
                      )}
                    >
                      <Icon className="size-5 text-primary" strokeWidth={2} />
                            </span>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight md:text-2xl">
                      {phase.title}
                          </h3>
                    <p className="mt-2 text-sm font-medium text-foreground/90">{phase.lead}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{phase.body}</p>
                    <ul className="mt-6 space-y-2.5 border-t border-border/40 pt-6 text-sm text-muted-foreground">
                      {phase.points.map((p) => (
                        <li key={p} className="flex gap-2">
                          <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={2} />
                          {p}
                              </li>
                            ))}
                          </ul>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          whileInView={reduced ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto mt-14 max-w-xl text-center text-sm text-muted-foreground md:mt-16"
        >
          Ønsker du samme flyt som egen side?{" "}
          <Link
            href="/hvordan-det-virker"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Slik fungerer det
          </Link>
        </motion.p>
      </div>
    </section>
  );
}
