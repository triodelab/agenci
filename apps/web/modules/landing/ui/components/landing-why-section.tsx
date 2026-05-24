"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
  LANDING_AUTH_PATHS,
  LANDING_SECTION_IDS,
  landingSectionHref,
} from "@/modules/landing/constants";

/* ── Small wireframe isometric cube icons ── */

function CubeAdaptive() {
  return (
    <svg width="36" height="32" viewBox="0 0 36 32" fill="none" aria-hidden>
      <path d="M18 2 L34 10 L18 18 L2 10 Z" stroke="#999" strokeWidth="0.85" fill="none" />
      <path d="M2 10 L2 22 L18 30 L18 18" stroke="#999" strokeWidth="0.85" fill="none" />
      <path d="M34 10 L34 22 L18 30" stroke="#999" strokeWidth="0.85" fill="none" />
      {/* inner lines suggesting depth */}
      <line x1="18" y1="2" x2="18" y2="18" stroke="#bbb" strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1="2" y1="10" x2="34" y2="10" stroke="#bbb" strokeWidth="0.5" strokeDasharray="2 2" />
    </svg>
  );
}

function CubeSpeed() {
  return (
    <svg width="36" height="32" viewBox="0 0 36 32" fill="none" aria-hidden>
      <path d="M18 2 L34 10 L18 18 L2 10 Z" stroke="#999" strokeWidth="0.85" fill="none" />
      <path d="M2 10 L2 22 L18 30 L18 18" stroke="#999" strokeWidth="0.85" fill="none" />
      <path d="M34 10 L34 22 L18 30" stroke="#999" strokeWidth="0.85" fill="none" />
      {/* lightning bolt on top face */}
      <path d="M20 6 L16 11 L19 11 L15 16 L22 10 L18.5 10 Z" stroke="#aaa" strokeWidth="0.7" fill="none" />
    </svg>
  );
}

function CubeGear() {
  return (
    <svg width="36" height="32" viewBox="0 0 36 32" fill="none" aria-hidden>
      <path d="M18 2 L34 10 L18 18 L2 10 Z" stroke="#999" strokeWidth="0.85" fill="none" />
      <path d="M2 10 L2 22 L18 30 L18 18" stroke="#999" strokeWidth="0.85" fill="none" />
      <path d="M34 10 L34 22 L18 30" stroke="#999" strokeWidth="0.85" fill="none" />
      {/* small gear on top face */}
      <circle cx="18" cy="10" r="2.5" stroke="#aaa" strokeWidth="0.7" fill="none" />
      <circle cx="18" cy="10" r="1" stroke="#aaa" strokeWidth="0.6" fill="none" />
      <line x1="18" y1="6.5" x2="18" y2="7.5" stroke="#aaa" strokeWidth="0.7" />
      <line x1="18" y1="12.5" x2="18" y2="13.5" stroke="#aaa" strokeWidth="0.7" />
      <line x1="14.5" y1="10" x2="15.5" y2="10" stroke="#aaa" strokeWidth="0.7" />
      <line x1="20.5" y1="10" x2="21.5" y2="10" stroke="#aaa" strokeWidth="0.7" />
    </svg>
  );
}

const ROWS = [
  {
    id: "adaptiv",
    Icon: CubeAdaptive,
    title: "Svar som høres ut som deg — ikke som en generisk robot",
    lead: "Last opp din FAQ, prisliste eller retningslinjer. Agenci svarer kun fra det du har lagt inn.",
    body: "Andre AI-løsninger gjetter og finner på. Agenci er låst til innholdet ditt — ingen hallusinasjoner, ingen svar utenfor kontekst. Kunden stiller spørsmålet, Agenci finner svaret i dokumentene dine og formulerer det klart og naturlig.",
  },
  {
    id: "rask",
    Icon: CubeSpeed,
    title: "I drift på 5 minutter — ingen IT-avdeling nødvendig",
    lead: "Lim inn én kodelinje på nettsiden. Resten gjør du i dashboardet, uten teknisk hjelp.",
    body: "De fleste løsninger tar dager å konfigurere og krever en utvikler. Med Agenci er du live på under 5 minutter. Gjør endringer i dashboardet — de trer i kraft med én gang. Prisen endrer seg heller ikke selv om volumet firedobles.",
  },
  {
    id: "verdi",
    Icon: CubeGear,
    title: "Fornøyde kunder — fra det første svaret",
    lead: "Kunder som venter på svar, bytter til konkurrenten. Agenci svarer innen sekunder, hele dagen.",
    body: "Agenci forstår kontekst og håndterer oppfølgingsspørsmål. Når den er usikker, sier den fra i stedet for å gjette. Du ser alle samtaler live og kan ta over med ett klikk — kunden slipper å forklare alt på nytt.",
  },
] as const;

export function LandingWhySection() {
  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      data-landing-nav-surface="light"
      className="bg-[#F9F9F9]"
      aria-labelledby="why-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-28 xl:px-8">

        {/* Top heading */}
        <motion.h2
          id="why-heading"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease }}
          className="mb-12 max-w-2xl text-[2rem] font-bold leading-[1.06] tracking-[-0.04em] text-[#1C1C1C] sm:text-[2.6rem] md:text-[3rem]"
        >
          De fleste chatboter gjetter.{" "}
          <br className="hidden md:block" />
          Agenci svarer med fakta.
        </motion.h2>

        {/* Feature rows */}
        <div className="flex flex-col">
          {ROWS.map((row, i) => (
            <motion.div
              key={row.id}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease }}
              className="border-t border-[#E0DBD5] py-12 md:py-14"
            >
              {/* Mobile layout: icon + title stacked, then body */}
              <div className="flex items-start gap-4 md:hidden">
                <div className="mt-0.5 shrink-0">
                  <row.Icon />
                </div>
                <h3 className="text-[1.4rem] font-bold leading-[1.12] tracking-[-0.03em] text-[#1C1C1C]">
                  {row.title}
                </h3>
              </div>
              <div className="mt-5 md:hidden">
                <p className="text-[15px] font-semibold leading-[1.5] text-[#1C1C1C]">
                  {row.lead}
                </p>
                <p className="mt-2.5 text-[14px] leading-[1.7] text-[#666]">
                  {row.body}
                </p>
              </div>

              {/* Desktop layout: 3-column grid */}
              <div
                className="hidden md:grid md:items-start md:gap-x-14"
                style={{ gridTemplateColumns: "44px minmax(0,1fr) minmax(0,1.6fr)" }}
              >
                <div className="mt-1 shrink-0">
                  <row.Icon />
                </div>
                <h3 className="text-[1.55rem] font-bold leading-[1.12] tracking-[-0.03em] text-[#1C1C1C] lg:text-[1.75rem]">
                  {row.title}
                </h3>
                <div>
                  <p className="text-[15px] font-semibold leading-[1.5] tracking-[-0.01em] text-[#1C1C1C]">
                    {row.lead}
                  </p>
                  <p className="mt-3 text-[15px] leading-[1.7] text-[#666]">
                    {row.body}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA row */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease }}
          className="flex flex-col items-start justify-between gap-6 border-t border-[#E0DBD5] pt-10 md:flex-row md:items-center"
        >
          <h3 className="text-[1.6rem] font-bold leading-[1.1] tracking-[-0.03em] text-[#1C1C1C] md:text-[2rem]">
            Kom i gang gratis — ingen kortinfo.
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <AuthAwareLink
              href={LANDING_AUTH_PATHS.signUp}
              loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#1C1C1C] px-7 text-[14px] font-semibold text-white transition-colors hover:bg-[#2E2E2E]"
            >
              Start gratis
            </AuthAwareLink>
            <Link
              href={landingSectionHref("contact")}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#D5D0CB] px-7 text-[14px] font-medium text-[#666] transition-colors hover:border-[#1C1C1C] hover:text-[#1C1C1C]"
            >
              Book en demo
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
