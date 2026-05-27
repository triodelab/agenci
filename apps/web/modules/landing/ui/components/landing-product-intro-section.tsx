"use client";

import { motion, useReducedMotion } from "motion/react";

const STATS = [
  {
    value: "< 5 min",
    label: "Oppsett og lansering",
    sub: "Ingen utvikling nødvendig",
  },
  {
    value: "24/7",
    label: "Alltid tilgjengelig",
    sub: "Automatisk kundehjelp",
  },
  {
    value: "100%",
    label: "Dine egne data",
    sub: "Ingen hallusinasjoner",
  },
] as const;

export function LandingProductIntroSection() {
  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      data-landing-nav-surface="dark"
      className="bg-[#1C1C1C]"
      aria-labelledby="product-intro-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-28 xl:px-8">
        {/* Heading */}
        <motion.h2
          id="product-intro-heading"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="mb-16 text-[2rem] font-bold leading-[1.06] tracking-[-0.04em] text-white sm:text-[2.5rem]"
        >
          Resultater du merker
          <br />
          fra dag én.
        </motion.h2>

        {/* Stats grid */}
        <div className="grid grid-cols-1 divide-y divide-[#2a2a2a] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.value}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.52, delay: i * 0.09, ease }}
              className="py-10 sm:px-10 sm:first:pl-0 sm:last:pr-0"
            >
              <div className="text-[3.2rem] font-bold leading-[1] tracking-[-0.04em] text-white sm:text-[3.6rem]">
                {stat.value}
              </div>
              <div className="mt-3 text-[15px] font-semibold text-white/80">
                {stat.label}
              </div>
              <div className="mt-1 text-[13px] leading-[1.55] text-[#6B6B6B]">
                {stat.sub}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
