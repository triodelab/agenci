"use client";

import { motion, useReducedMotion } from "motion/react";
import { LANDING_SECTION_IDS } from "@/modules/landing/constants";

const tags = [
  "CRM & kundelister",
  "E-post",
  "Nettbutikk",
  "Hjelpdesk",
  "Intern chat",
  "Egne API-er",
] as const;

export function LandingIntegrationsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id={LANDING_SECTION_IDS.integrations}
      data-landing-nav-surface="dark"
      className="relative scroll-mt-24 overflow-hidden bg-[#030306] py-24 md:py-32"
      aria-labelledby="integrations-heading"
    >
      {/* Rutenett — nesten usynlig, gir «kontrollrom»-følelse */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(180deg,black,transparent_92%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-30%,rgba(45,212,191,0.09),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-[min(55vh,480px)] w-[min(100vw,900px)] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.06),transparent_62%)] blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.07),transparent_62%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-10 lg:px-12">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-teal-400/75 md:text-xs">
            Integrasjoner
          </p>
          <h2
            id="integrations-heading"
            className="mt-8 text-balance text-[2rem] font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl md:text-[3.25rem] md:leading-[1.05]"
          >
            <span className="block">Alt i samme</span>
            <span className="mt-1 block bg-gradient-to-r from-white via-teal-100/90 to-teal-400/80 bg-clip-text text-transparent">
              strøm
            </span>
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-pretty text-[15px] leading-relaxed text-zinc-400 md:text-lg md:leading-relaxed">
            Verktøyene deres snakker sammen — ikke teamet. Én samtaleflate, data der folk faktisk jobber.
          </p>
        </motion.div>

        <motion.ul
          className="mx-auto mt-16 flex max-w-3xl flex-wrap justify-center gap-2.5 md:mt-20 md:gap-3"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {tags.map((t) => (
            <li key={t}>
              <span className="inline-flex rounded-full border border-white/[0.09] bg-white/[0.04] px-4 py-2.5 text-[13px] font-medium text-zinc-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition-[border-color,background-color] duration-300 hover:border-teal-400/25 hover:bg-white/[0.07] md:text-sm">
                {t}
              </span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
