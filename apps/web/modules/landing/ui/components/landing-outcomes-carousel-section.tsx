"use client";

import { motion, useReducedMotion } from "motion/react";

const OUTCOMES = [
  {
    value: "40–70%",
    label: "færre rutinehenvendelser til teamet",
  },
  {
    value: "~30%",
    label: "lavere kostnad i kundeservice",
  },
  {
    value: "< 2 sek",
    label: "til første svar, hele døgnet",
  },
  {
    value: "+12%",
    label: "høyere kundetilfredshet i snitt",
  },
] as const;

export function LandingOutcomesCarouselSection() {
  const reduceMotion = useReducedMotion();
  const repeatedOutcomes = [...OUTCOMES, ...OUTCOMES];

  return (
    <section
      aria-labelledby="outcomes-heading"
      className="flex min-h-[10rem] items-center overflow-hidden bg-white py-7 text-[#17223b] md:h-[20svh] md:min-h-[12rem] md:py-0"
      data-landing-nav-surface="light"
    >
      <h2 id="outcomes-heading" className="sr-only">
        Hva Agenci kan frigjøre i kundeservice
      </h2>

      <ul className="sr-only">
        {OUTCOMES.map((outcome) => (
          <li key={outcome.value}>
            {outcome.value}: {outcome.label}
          </li>
        ))}
      </ul>

      <motion.div
        aria-hidden
        animate={reduceMotion ? { x: 0 } : { x: ["0%", "-50%"] }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 32, ease: "linear", repeat: Number.POSITIVE_INFINITY }
        }
        className="flex w-max items-center"
      >
        {repeatedOutcomes.map((outcome, index) => (
          <article
            key={`${outcome.value}-${index}`}
            className="flex w-[min(84vw,33rem)] shrink-0 items-center gap-5 border-r border-[#17223b]/15 px-6 sm:w-[min(72vw,36rem)] sm:px-10 lg:w-[38rem] lg:gap-8 lg:px-14"
          >
            <strong
              className="whitespace-nowrap text-[clamp(3rem,6vw,5.75rem)] leading-none tracking-[-0.075em]"
              style={{ fontFamily: "var(--font-agenci-title)" }}
            >
              {outcome.value}
            </strong>
            <span className="max-w-[11rem] text-[0.68rem] leading-[1.25] tracking-[0.02em] text-[#17223b]/65 uppercase sm:text-xs">
              {outcome.label}
            </span>
          </article>
        ))}
      </motion.div>
    </section>
  );
}
