"use client";

import { BookOpen, MessageSquare, Users } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { LANDING_ACCENT_CTA_BG, LANDING_SECTION_IDS } from "@/modules/landing/constants";

const features = [
  {
    n: "01",
    title: "Svar på sekunder, ikke timer",
    body:
      "Besøkende spør — assistenten svarer umiddelbart. Pris, leveringstid, returpolicy, åpningstider. Ingen ventetid, ingen tapte kunder fordi ingen var tilgjengelig.",
    icon: MessageSquare,
  },
  {
    n: "02",
    title: "Dine svar, ikke generelle fraser",
    body:
      "Du laster opp det du allerede har — FAQ, produktbeskrivelser, retningslinjer. Assistenten svarer bare ut fra dette. Ingen hallusinasjoner, ingen svar som skader merkevaren din.",
    icon: BookOpen,
  },
  {
    n: "03",
    title: "Et menneske når det trengs",
    body:
      "Noen spørsmål trenger deg. Du ser alle samtaler i dashboardet, kan ta over når som helst, og kunden slipper å forklare alt på nytt — historikken er der.",
    icon: Users,
  },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 32 },
  },
};

export function LandingWorkflowSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id={LANDING_SECTION_IDS.workflow}
      data-landing-nav-surface="light"
      className="relative z-10 scroll-mt-24 overflow-hidden border-t border-zinc-200/60 bg-[#fafafa] text-zinc-900"
      aria-labelledby="workflow-heading"
    >
      {/* Myk atmosfære — store, nesten usynlige lys */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(45,212,191,0.06),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[20%] top-1/4 h-[min(70vh,520px)] w-[min(80vw,560px)] rounded-full bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.04),transparent_65%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[15%] bottom-0 h-[min(50vh,400px)] w-[min(70vw,480px)] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent_68%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-20 md:px-10 md:pb-32 md:pt-28 lg:px-12">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-700/85 md:text-xs">
            Slik fungerer det
          </p>
          <h2
            id="workflow-heading"
            className="mt-4 text-balance text-3xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-4xl md:text-[2.35rem] md:leading-[1.12]"
          >
            Ikke en generisk chatbot. En assistent som faktisk kan bedriften din.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-pretty text-[15px] leading-relaxed text-zinc-600 md:mt-6 md:text-lg md:leading-relaxed">
            De fleste chatboter svarer med generelle fraser. Agenci svarer med det du har skrevet —
            og hjelper deg å aldri miste en kunde fordi ingen var tilgjengelig.
          </p>
        </motion.div>

        <motion.ul
          className="relative mx-auto mt-20 grid max-w-5xl gap-0 md:mt-24 md:grid-cols-3 md:divide-x md:divide-zinc-200/90"
          variants={reduceMotion ? undefined : container}
          initial={reduceMotion ? undefined : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, margin: "-40px" }}
        >
          {features.map((f) => (
            <motion.li
              key={f.n}
              variants={reduceMotion ? undefined : item}
              className="group relative flex flex-col border-b border-zinc-200/70 px-0 py-10 first:pt-0 last:border-b-0 md:border-b-0 md:px-8 md:py-0 md:first:pl-0 md:last:pr-0 lg:px-10"
            >
              <div className="mb-6 space-y-4 md:mb-8">
                <span
                  className="block font-mono text-[2.65rem] font-extralight leading-none tabular-nums text-zinc-200 transition-colors duration-300 group-hover:text-teal-100/80 md:text-[3rem]"
                  aria-hidden
                >
                  {f.n}
                </span>
                <span
                  className="inline-flex size-11 items-center justify-center rounded-2xl border border-zinc-200/90 bg-white/95 shadow-[0_1px_0_0_rgba(255,255,255,0.95)_inset] transition-[transform,box-shadow,border-color,color] duration-300 group-hover:-translate-y-0.5 group-hover:border-teal-200/70 group-hover:shadow-md md:size-12"
                  style={{ color: LANDING_ACCENT_CTA_BG }}
                >
                  <f.icon className="size-5 md:size-[1.35rem]" strokeWidth={1.5} />
                </span>
              </div>
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-zinc-950 transition-colors duration-300 group-hover:text-zinc-800 md:text-xl">
                {f.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-zinc-600 md:mt-3.5 md:leading-[1.65]">
                {f.body}
              </p>
            </motion.li>
          ))}
        </motion.ul>

        {/* Tynn signatur-linje */}
        <div
          aria-hidden
          className="mx-auto mt-20 h-px max-w-md bg-gradient-to-r from-transparent via-zinc-300/90 to-transparent md:mt-24"
        />
        <div
          aria-hidden
          className="mx-auto mt-2 h-px max-w-[12rem] bg-gradient-to-r from-transparent opacity-80"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent, ${LANDING_ACCENT_CTA_BG}55, transparent)`,
          }}
        />
      </div>
    </section>
  );
}
