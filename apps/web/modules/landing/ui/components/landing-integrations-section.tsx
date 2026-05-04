"use client";

import { motion, useReducedMotion } from "motion/react";
import { LANDING_SECTION_IDS } from "@/modules/landing/constants";

const integrations = [
  { label: "CRM & kundelister", available: true },
  { label: "E-post", available: true },
  { label: "Nettbutikk", available: false },
  { label: "Hjelpdesk", available: false },
  { label: "Intern chat", available: false },
  { label: "Egne API-er", available: true },
] as const;

export function LandingIntegrationsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id={LANDING_SECTION_IDS.integrations}
      data-landing-nav-surface="dark"
      className="border-t border-[#1a1a1a] bg-black"
      aria-labelledby="integrations-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-28 xl:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 xl:gap-28">

          {/* Left */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-5 font-mono text-[11px] tracking-[0.2em] text-[#333]">
              INTEGRASJONER
            </p>
            <h2
              id="integrations-heading"
              className="text-[2rem] font-semibold leading-[1.06] tracking-[-0.055em] text-[#f0eeeb] sm:text-[2.4rem] md:text-[2.8rem]"
            >
              Koble chatten til systemene dere allerede bruker
            </h2>
            <p className="mt-6 max-w-sm text-[14px] leading-[1.75] text-[#555]">
              Start med widgeten på nettsiden. Koble til CRM, e-post og nettbutikk
              etterhvert — slik at data flyter dit det trengs.
            </p>
            <p className="mt-6 text-[12px] text-[#333]">
              Flere integrasjoner under utvikling
            </p>
          </motion.div>

          {/* Right — integration grid */}
          <motion.div
            className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            {integrations.map((item, i) => (
              <motion.div
                key={item.label}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 + i * 0.04, duration: 0.35 }}
                className="flex flex-col justify-between rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-4 transition-[border-color] duration-200 hover:border-[#282828]"
              >
                <div className="mb-3 size-6 rounded-md bg-[#1a1a1a]" />
                <div>
                  <p className="text-[13px] font-medium text-[#aaa]">{item.label}</p>
                  {!item.available && (
                    <span className="mt-1 block text-[10px] uppercase tracking-widest text-[#333]">
                      Snart
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
