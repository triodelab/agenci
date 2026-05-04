"use client";

import { motion, useReducedMotion } from "motion/react";
import { LANDING_SECTION_IDS } from "@/modules/landing/constants";

const features = [
  {
    n: "01",
    title: "Svar på sekunder, ikke timer",
    body: "Besøkende spør — assistenten svarer umiddelbart. Pris, leveringstid, returpolicy, åpningstider. Ingen ventetid, ingen tapte kunder.",
  },
  {
    n: "02",
    title: "Dine svar, ikke generelle fraser",
    body: "Last opp det du allerede har — FAQ, produktbeskrivelser, retningslinjer. Assistenten svarer bare ut fra dette. Ingen hallusinasjoner.",
  },
  {
    n: "03",
    title: "Et menneske når det trengs",
    body: "Se alle samtaler live i dashboardet. Ta over når som helst. Kunden slipper å forklare alt på nytt — historikken er der.",
  },
] as const;

export function LandingWorkflowSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id={LANDING_SECTION_IDS.workflow}
      data-landing-nav-surface="dark"
      className="bg-[#010102]"
      aria-labelledby="workflow-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-28 xl:px-8">

        {/* Large split statement — Linear style: bright + muted in one headline */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            id="workflow-heading"
            className="max-w-5xl text-[2rem] font-semibold leading-[1.06] tracking-[-0.055em] sm:text-[2.6rem] md:text-[3.2rem] lg:text-[3.8rem]"
          >
            <span className="text-[#f7f8f8]">Ikke en generisk chatbot.{" "}</span>
            <span className="text-[#8a8f98]">En assistent som faktisk kan bedriften din.</span>
          </h2>
        </motion.div>

        {/* Horizontal rule */}
        <div className="mt-16 h-px w-full bg-[#23252a] md:mt-20" />

        {/* Feature list — no cards, just text columns like Linear */}
        <div className="mt-14 grid gap-10 sm:grid-cols-3 md:mt-16 md:gap-14">
          {features.map((f, i) => (
            <motion.div
              key={f.n}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mb-5 text-[13px] font-medium text-[#5e6ad2]">
                {f.n}
              </p>
              <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.02em] text-[#f7f8f8]">
                {f.title}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.7] text-[#d0d6e0]">
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
