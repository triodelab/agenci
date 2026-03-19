"use client";

import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import { motion, useReducedMotion } from "motion/react";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  MessageCircleQuestion,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { TextEffect } from "@workspace/ui/components/text-effect";
import { cn } from "@workspace/ui/lib/utils";

type UseCaseFlow = {
  id: string;
  eyebrow: string;
  problemTitle: string;
  problemDescription: string;
  solutionTitle: string;
  solutionDescription: string;
  problemIcon: React.ComponentType<{ className?: string }>;
  solutionIcon: React.ComponentType<{ className?: string }>;
};

const useCaseFlows: UseCaseFlow[] = [
  {
    id: "faq",
    eyebrow: "01 / SUPPORT LOAD",
    problemTitle: "Repetitive spørsmål",
    problemDescription:
      "Teamet bruker tid på det samme igjen og igjen. Manuelle svar stjeler fokus fra komplekse saker og lavverdi-oppgaver.",
    solutionTitle: "Automatiserte kvalitetssvar",
    solutionDescription:
      "Agenci svarer konsistent på gjentatte spørsmål og eskalerer sømløst når dialogen faktisk trenger et menneske.",
    problemIcon: MessageCircleQuestion,
    solutionIcon: CheckCircle2,
  },
  {
    id: "speed",
    eyebrow: "02 / RESPONSE TIME",
    problemTitle: "Langsom responstid",
    problemDescription:
      "Kunder venter på svar utenfor åpningstid. Det skaper friksjon, lavere tillit og tapte henvendelser.",
    solutionTitle: "Svar på sekunder, 24/7",
    solutionDescription:
      "Agenci leverer øyeblikkelige svar hele døgnet, slik at kunden får hjelp med en gang og teamet slipper etterslep.",
    problemIcon: Clock3,
    solutionIcon: Sparkles,
  },
  {
    id: "insights",
    eyebrow: "03 / VISIBILITY",
    problemTitle: "Manglende innsikt",
    problemDescription:
      "Det er vanskelig a se hvilke tema som driver trykk, hvilke svar som fungerer og hvor kundereisen stopper opp.",
    solutionTitle: "Tydelig innsikt i dashboard",
    solutionDescription:
      "Agenci samler samtaledata i tydelige mønstre, slik at teamet kan optimalisere innhold, rutiner og kundeopplevelse.",
    problemIcon: BarChart3,
    solutionIcon: TrendingUp,
  },
];

function AbstractConnector({ active }: { active: boolean }) {
  return (
    <div className="relative hidden h-full min-h-[220px] items-center justify-center lg:flex">
      <motion.svg
        width="138"
        height="96"
        viewBox="0 0 138 96"
        className="relative"
        initial={false}
      >
        <motion.path
          d="M8 26 H52 C60 26 63 31 66 39 L70 53 C73 61 78 66 86 66 H130"
          fill="none"
          className="stroke-foreground/65"
          strokeWidth="1.9"
          strokeLinecap="round"
          initial={{ pathLength: 0.2, opacity: 0.45 }}
          animate={active ? { pathLength: 1, opacity: 1 } : { pathLength: 0.5, opacity: 0.55 }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
        />

        <motion.circle
          cx="8"
          cy="26"
          r="4"
          className="fill-foreground/85"
          animate={active ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0.75 }}
          transition={{ duration: 0.25 }}
        />
        <motion.circle
          cx="130"
          cy="66"
          r="4"
          className="fill-foreground/85"
          animate={active ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0.75 }}
          transition={{ duration: 0.25, delay: 0.15 }}
        />
      </motion.svg>
    </div>
  );
}

function FlowCard({
  icon: Icon,
  label,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex h-full min-h-[280px] flex-col rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-card/95 p-8 shadow-[0_16px_48px_-24px_rgba(15,23,42,0.12)] transition-all duration-300 hover:border-border hover:shadow-[0_24px_60px_-28px_rgba(15,23,42,0.16)] dark:shadow-[0_16px_48px_-24px_rgba(0,0,0,0.35)]">
      <div className="mb-3 flex items-start gap-4">
        <span className="inline-flex size-12 items-center justify-center rounded-xl border border-border/70 bg-background/90 text-primary shadow-sm">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
          <h3 className="mt-1 text-[1.55rem] font-semibold leading-tight tracking-tight md:text-[1.7rem] lg:whitespace-nowrap">
            {title}
          </h3>
        </div>
      </div>
      <p className="mt-2 text-base leading-relaxed text-muted-foreground md:text-lg">{description}</p>
    </div>
  );
}

function FlowRow({ flow, index }: { flow: UseCaseFlow; index: number }) {
  const reducedMotion = !!useReducedMotion();
  const rowDelay = index * 0.08;

  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 22 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: rowDelay }}
      className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-muted/25 p-5 backdrop-blur-sm md:p-7 dark:bg-muted/15"
    >
      <div className="mb-4">
        <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{flow.eyebrow}</span>
      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-[1fr_auto_1fr]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, x: -18 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, delay: rowDelay + 0.05 }}
          className={cn(index % 2 === 1 && "lg:translate-y-2")}
        >
          <FlowCard
            icon={flow.problemIcon}
            label="Problem"
            title={flow.problemTitle}
            description={flow.problemDescription}
          />
        </motion.div>

        <AbstractConnector active />

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, x: 18 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, delay: rowDelay + 0.12 }}
          className={cn(index % 2 === 0 && "lg:translate-y-2")}
        >
          <FlowCard
            icon={flow.solutionIcon}
            label="Løsning"
            title={flow.solutionTitle}
            description={flow.solutionDescription}
          />
        </motion.div>
      </div>
    </motion.article>
  );
}

export function LandingUseCasesSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.useCases}
      aria-labelledby="use-cases-heading"
      className="relative overflow-hidden bg-background py-24 md:py-36"
    >
      <div
        aria-hidden
        className="landing-section-mesh pointer-events-none absolute inset-0 -z-10 opacity-80"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div id="use-cases-heading" className="mx-auto max-w-3xl text-center">
          <TextEffect
            preset="fade-in-blur"
            speedSegment={0.35}
            as="h2"
            className="text-balance text-4xl font-semibold tracking-tight lg:text-5xl"
          >
            Problem og løsning i en ren, tydelig flyt
          </TextEffect>

          <TextEffect
            per="line"
            preset="fade-in-blur"
            speedSegment={0.35}
            delay={0.2}
            as="p"
            className="mt-5 text-balance text-base text-muted-foreground md:text-lg"
          >
            En abstrakt visualisering av hvordan Agenci tar deg fra friksjon til kontroll — med minst mulig støy.
          </TextEffect>
        </div>

        <div className="mt-14 space-y-7 md:mt-16">
          {useCaseFlows.map((flow, index) => (
            <FlowRow key={flow.id} flow={flow} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
