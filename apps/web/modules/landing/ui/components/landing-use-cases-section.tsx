"use client";

import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import {
  LandingGradientText,
  landingIconSurfaceClassName,
} from "@/modules/landing/ui/components/landing-gradient-text";
import { LandingSectionHeader } from "@/modules/landing/ui/components/landing-section-header";
import { cn } from "@workspace/ui/lib/utils";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  MessageCircleQuestion,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const stories = [
  {
    id: "load",
    kicker: "Supporttrykk",
    problem: "Gjentatte spørsmål spiser kapasitet",
    problemBody:
      "Teamet svarer på det samme om og om igjen. Komplekse saker venter fordi innboksen er full av lavterskel-henvendelser.",
    solution: "Automatiserte svar med kvalitet",
    solutionBody:
      "Agenci tar de forutsigbare spørsmålene med konsistente svar og eskalerer når dialogen krever menneske.",
    problemIcon: MessageCircleQuestion,
    solutionIcon: CheckCircle2,
  },
  {
    id: "speed",
    kicker: "Tilgjengelighet",
    problem: "Kunder venter utenfor åpningstid",
    problemBody:
      "Lang responstid gir lavere tillit og tapte leads — spesielt når konkurrentene svarer med én gang.",
    solution: "Svar på sekunder, døgnet rundt",
    solutionBody:
      "Besøkende får hjelp når de trenger det. Teamet våkner ikke til en uoversiktlig kø.",
    problemIcon: Clock3,
    solutionIcon: Sparkles,
  },
  {
    id: "insight",
    kicker: "Innsikt",
    problem: "Lite synlighet i hva kunder egentlig lurer på",
    problemBody:
      "Uten struktur er det vanskelig å vite hvilke tema som brenner, hvilke svar som fungerer og hvor dere mister folk.",
    solution: "Mønstre dere kan handle på",
    solutionBody:
      "Dashboardet samler samtaler og tema slik at dere kan skjerpe innhold, produkt og rutiner — ikke bare «svare mer».",
    problemIcon: BarChart3,
    solutionIcon: TrendingUp,
  },
] as const;

export function LandingUseCasesSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id={LANDING_SECTION_IDS.useCases}
      aria-labelledby="use-cases-heading"
      className="relative scroll-mt-24 border-b border-border/40 bg-muted/20 py-20 md:py-28 dark:bg-muted/5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent_55%)] dark:bg-[radial-gradient(ellipse_90%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent_55%)]"
      />

      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <LandingSectionHeader
          eyebrow="Resultat"
          titleId="use-cases-heading"
          title={
            <>
              Derfor velger team <LandingGradientText>Agenci</LandingGradientText>
            </>
          }
          description="Tre typiske utfordringer — og hvordan plattformen er bygget for å løse dem uten å ofre kontroll eller merkevare."
        />

        <div className="mt-14 space-y-6 md:mt-16 md:space-y-8">
          {stories.map((story, index) => (
            <motion.article
              key={story.id}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="overflow-hidden rounded-[1.75rem] border border-border/50 bg-background shadow-[0_32px_80px_-48px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_80px_-48px_rgba(0,0,0,0.4)]"
            >
              <div className="grid md:grid-cols-2">
                <div
                  className={cn(
                    "border-b border-border/50 p-6 md:border-b-0 md:border-r md:p-8 lg:p-10",
                    "bg-gradient-to-br from-rose-500/[0.04] via-background to-background dark:from-rose-500/[0.07]",
                  )}
                >
                  <StoryBlock
                    variant="problem"
                    kicker={story.kicker}
                    title={story.problem}
                    body={story.problemBody}
                    Icon={story.problemIcon}
                  />
                </div>
                <div
                  className={cn(
                    "p-6 md:p-8 lg:p-10",
                    "bg-gradient-to-br from-emerald-500/[0.05] via-background to-background dark:from-emerald-500/[0.08]",
                  )}
                >
                  <StoryBlock
                    variant="solution"
                    kicker="Med Agenci"
                    title={story.solution}
                    body={story.solutionBody}
                    Icon={story.solutionIcon}
                  />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoryBlock({
  variant,
  kicker,
  title,
  body,
  Icon,
}: {
  variant: "problem" | "solution";
  kicker: string;
  title: string;
  body: string;
  Icon: (typeof stories)[number]["problemIcon"];
}) {
  const isProblem = variant === "problem";
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            isProblem
              ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
              : landingIconSurfaceClassName(),
          )}
        >
          <Icon className="size-5" strokeWidth={2} />
        </span>
        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.18em]",
            isProblem ? "text-rose-600/90 dark:text-rose-400/90" : "text-primary",
          )}
        >
          {kicker}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-semibold tracking-tight md:text-2xl">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground md:text-base md:leading-relaxed">
        {body}
      </p>
    </div>
  );
}
