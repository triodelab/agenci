"use client";

import { motion, useReducedMotion } from "motion/react";
import { LANDING_SECTION_IDS } from "@/modules/landing/constants";

const STEPS = [
  {
    n: "01",
    title: "Last opp din kunnskap",
    body: "Koble nettsiden din, last opp PDF-er, FAQ og retningslinjer. Agenci indekserer innholdet automatisk — ingen manuell konfigurasjon.",
  },
  {
    n: "02",
    title: "AI-agenten lærer seg bedriften din",
    body: "Agenten svarer kun basert på det du har lastet opp. Ingen generelle fraser, ingen hallusinasjoner. Presist og pålitelig.",
  },
  {
    n: "03",
    title: "Lim inn én linje — du er live",
    body: "Kopier én kodelinje inn på siden. Chat-widgeten er aktiv. Besøkende får svar umiddelbart, 24/7, uten at du trenger å være tilgjengelig.",
  },
] as const;

export function LandingWorkflowSection() {
  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      id={LANDING_SECTION_IDS.workflow}
      data-landing-nav-surface="dark"
      className="border-t border-[#2a2a2a] bg-[#161616]"
      aria-labelledby="workflow-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32 xl:px-8">

        {/* Heading */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
            Slik fungerer det
          </p>
          <h2
            id="workflow-heading"
            className="max-w-2xl text-[2rem] font-bold leading-[1.07] tracking-[-0.038em] text-[#f2f3f5] sm:text-[2.6rem] md:text-[3.2rem]"
          >
            Kom i gang på 5 minutter.{" "}
            <span className="text-[#6b7280]">Ingen utvikler nødvendig.</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="mt-16 md:mt-20">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease }}
              className="flex items-start gap-8 border-t border-[#2a2a2a] py-10 first:border-t-0 md:gap-16"
            >
              <span className="w-10 shrink-0 pt-1 text-[13px] font-semibold tabular-nums text-[#3d4149]">
                {step.n}
              </span>
              <div className="grid flex-1 gap-4 sm:grid-cols-[1fr_1.4fr] sm:gap-10 sm:items-start">
                <h3 className="text-[1.15rem] font-semibold leading-snug tracking-[-0.022em] text-[#f2f3f5] sm:text-[1.25rem]">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-[1.75] text-[#6b7280]">
                  {step.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
