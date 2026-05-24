"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { landingSectionHref } from "@/modules/landing/constants";

/* ── Sketch-style isometric icons (simple wireframe SVGs) ── */

function IconConversions() {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" fill="none" aria-hidden>
      <rect x="4" y="6" width="18" height="13" rx="2" stroke="#888" strokeWidth="0.85" fill="none" />
      <path d="M8 22 L8 19 L22 19 L22 6" stroke="#888" strokeWidth="0.7" fill="none" strokeLinejoin="round" />
      <line x1="8" y1="10" x2="16" y2="10" stroke="#aaa" strokeWidth="0.7" />
      <line x1="8" y1="13" x2="14" y2="13" stroke="#aaa" strokeWidth="0.7" />
    </svg>
  );
}

function IconKnowledge() {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" fill="none" aria-hidden>
      <rect x="5" y="4" width="16" height="20" rx="1.5" stroke="#888" strokeWidth="0.85" fill="none" />
      <line x1="9" y1="9" x2="17" y2="9" stroke="#aaa" strokeWidth="0.7" />
      <line x1="9" y1="12" x2="17" y2="12" stroke="#aaa" strokeWidth="0.7" />
      <line x1="9" y1="15" x2="14" y2="15" stroke="#aaa" strokeWidth="0.7" />
      <rect x="8" y="3" width="16" height="20" rx="1.5" stroke="#999" strokeWidth="0.75" fill="none" />
    </svg>
  );
}

function IconLiveChat() {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" fill="none" aria-hidden>
      <path d="M5 6 L27 6 L27 19 L18 19 L14 24 L14 19 L5 19 Z" stroke="#888" strokeWidth="0.85" fill="none" strokeLinejoin="round" />
      <circle cx="12" cy="12.5" r="1.2" fill="#999" />
      <circle cx="16" cy="12.5" r="1.2" fill="#999" />
      <circle cx="20" cy="12.5" r="1.2" fill="#999" />
    </svg>
  );
}

function IconHandover() {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" fill="none" aria-hidden>
      <circle cx="10" cy="9" r="4" stroke="#888" strokeWidth="0.85" fill="none" />
      <circle cx="22" cy="9" r="4" stroke="#888" strokeWidth="0.85" fill="none" />
      <path d="M4 22 C4 16 8 14 10 14 C12 14 14 15 16 15 C18 15 20 14 22 14 C24 14 28 16 28 22" stroke="#888" strokeWidth="0.85" fill="none" strokeLinecap="round" />
      <line x1="13" y1="9" x2="19" y2="9" stroke="#bbb" strokeWidth="0.75" />
      <polyline points="17 7 19 9 17 11" stroke="#bbb" strokeWidth="0.7" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

function IconAnalytics() {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" fill="none" aria-hidden>
      <line x1="5" y1="23" x2="27" y2="23" stroke="#888" strokeWidth="0.85" />
      <line x1="5" y1="23" x2="5" y2="5" stroke="#888" strokeWidth="0.85" />
      <rect x="8" y="14" width="4" height="9" stroke="#999" strokeWidth="0.75" fill="none" />
      <rect x="14" y="9" width="4" height="14" stroke="#999" strokeWidth="0.75" fill="none" />
      <rect x="20" y="17" width="4" height="6" stroke="#999" strokeWidth="0.75" fill="none" />
    </svg>
  );
}

function IconCustomization() {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" fill="none" aria-hidden>
      <circle cx="16" cy="14" r="5" stroke="#888" strokeWidth="0.85" fill="none" />
      <circle cx="16" cy="14" r="2" stroke="#aaa" strokeWidth="0.7" fill="none" />
      <line x1="16" y1="5" x2="16" y2="8" stroke="#999" strokeWidth="0.85" />
      <line x1="16" y1="20" x2="16" y2="23" stroke="#999" strokeWidth="0.85" />
      <line x1="7" y1="14" x2="10" y2="14" stroke="#999" strokeWidth="0.85" />
      <line x1="22" y1="14" x2="25" y2="14" stroke="#999" strokeWidth="0.85" />
      <line x1="9.5" y1="7.5" x2="11.6" y2="9.6" stroke="#bbb" strokeWidth="0.7" />
      <line x1="20.4" y1="18.4" x2="22.5" y2="20.5" stroke="#bbb" strokeWidth="0.7" />
    </svg>
  );
}

function IconIntegrations() {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" fill="none" aria-hidden>
      <rect x="3" y="11" width="8" height="6" rx="1.5" stroke="#888" strokeWidth="0.85" fill="none" />
      <rect x="21" y="11" width="8" height="6" rx="1.5" stroke="#888" strokeWidth="0.85" fill="none" />
      <rect x="12" y="5" width="8" height="6" rx="1.5" stroke="#888" strokeWidth="0.85" fill="none" />
      <rect x="12" y="17" width="8" height="6" rx="1.5" stroke="#888" strokeWidth="0.85" fill="none" />
      <line x1="11" y1="14" x2="12" y2="14" stroke="#bbb" strokeWidth="0.75" />
      <line x1="20" y1="14" x2="21" y2="14" stroke="#bbb" strokeWidth="0.75" />
      <line x1="16" y1="11" x2="16" y2="8.5" stroke="#bbb" strokeWidth="0.75" />
      <line x1="16" y1="17" x2="16" y2="19.5" stroke="#bbb" strokeWidth="0.75" />
    </svg>
  );
}

function IconMultiTeam() {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" fill="none" aria-hidden>
      <circle cx="16" cy="8" r="3.5" stroke="#888" strokeWidth="0.85" fill="none" />
      <circle cx="8" cy="10" r="2.8" stroke="#888" strokeWidth="0.8" fill="none" />
      <circle cx="24" cy="10" r="2.8" stroke="#888" strokeWidth="0.8" fill="none" />
      <path d="M6 22 C6 17.5 9 16 11 16 C12.5 16 14 17 16 17 C18 17 19.5 16 21 16 C23 16 26 17.5 26 22"
        stroke="#888" strokeWidth="0.85" fill="none" strokeLinecap="round" />
      <path d="M2 22 C2 19 4 18 6 17" stroke="#aaa" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      <path d="M30 22 C30 19 28 18 26 17" stroke="#aaa" strokeWidth="0.7" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function IconPrivacy() {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" fill="none" aria-hidden>
      <path d="M16 4 L26 8 L26 16 C26 21 21 25 16 26 C11 25 6 21 6 16 L6 8 Z"
        stroke="#888" strokeWidth="0.85" fill="none" strokeLinejoin="round" />
      <polyline points="11 14 14 17 21 11" stroke="#aaa" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCustomSetup() {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" fill="none" aria-hidden>
      <rect x="5" y="5" width="22" height="18" rx="2" stroke="#888" strokeWidth="0.85" fill="none" />
      <line x1="5" y1="10" x2="27" y2="10" stroke="#bbb" strokeWidth="0.7" />
      <circle cx="8.5" cy="7.5" r="1" fill="#aaa" />
      <circle cx="12" cy="7.5" r="1" fill="#aaa" />
      <line x1="9" y1="15" x2="16" y2="15" stroke="#bbb" strokeWidth="0.75" />
      <line x1="9" y1="18" x2="20" y2="18" stroke="#bbb" strokeWidth="0.75" />
      <path d="M21 16 L24 19 L21 22" stroke="#999" strokeWidth="0.75" fill="none" strokeLinecap="round" />
    </svg>
  );
}

const MODULES = [
  { id: "konversjoner", label: "Konversjoner", desc: "Gjør besøkende til kunder — automatisk", Icon: IconConversions },
  { id: "kunnskapsbase", label: "Kunnskapsbase", desc: "Last opp PDF, nettside og FAQ som kilde", Icon: IconKnowledge },
  { id: "live-samtaler", label: "Live-samtaler", desc: "Se alle samtaler i sanntid fra dashboardet", Icon: IconLiveChat },
  { id: "menneskelig-overlevering", label: "Menneskelig overlevering", desc: "Koble inn et menneske akkurat når det trengs", Icon: IconHandover },
  { id: "analyser", label: "Analyser", desc: "Forstå hva kundene faktisk spør om", Icon: IconAnalytics },
  { id: "widget-tilpasning", label: "Widget-tilpasning", desc: "Tilpass farger, tekster og oppførsel", Icon: IconCustomization },
  { id: "integrasjoner", label: "Integrasjoner", desc: "Koble til CRM, e-post og nettbutikk", Icon: IconIntegrations },
  { id: "flerteam", label: "Flerteam", desc: "Håndter flere avdelinger fra ett sted", Icon: IconMultiTeam },
  { id: "personvern", label: "Personvern & GDPR", desc: "GDPR-kompatibel — data eies alltid av deg", Icon: IconPrivacy },
  { id: "tilpasset-oppsett", label: "Tilpasset oppsett", desc: "Skreddersydd løsning for større organisasjoner", Icon: IconCustomSetup },
] as const;

export function LandingModulesSection() {
  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  // First 9 are regular cards, last 1 goes with a CTA card spanning 2 cols
  const regularModules = MODULES.slice(0, 9);
  const lastModule = MODULES[9];

  return (
    <section
      data-landing-nav-surface="light"
      className="bg-[#F9F9F9]"
      aria-labelledby="modules-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-28 xl:px-8">

        {/* Heading */}
        <motion.h2
          id="modules-heading"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease }}
          className="mb-10 text-[2rem] font-bold leading-[1.06] tracking-[-0.04em] text-[#1C1C1C] sm:text-[2.6rem] md:text-[3rem]"
        >
          Alt du trenger —
          <br />
          ingenting du ikke trenger
        </motion.h2>

        {/* 3-col grid */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">

          {/* First 9 regular cards */}
          {regularModules.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.07, ease }}
              className="bg-[#EEEBE6] px-5 py-8"
            >
              <div className="mb-5">
                <mod.Icon />
              </div>
              <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#1C1C1C]">
                {mod.label}
              </p>
              <p className="mt-1.5 text-[13px] leading-[1.55] text-[#737373]">
                {mod.desc}
              </p>
            </motion.div>
          ))}

          {/* Last row: 1 regular card + 1 CTA card (col-span-2) */}
          <motion.div
            key={lastModule.id}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, ease }}
            className="bg-[#EEEBE6] px-5 py-8"
          >
            <div className="mb-5">
              <lastModule.Icon />
            </div>
            <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#1C1C1C]">
              {lastModule.label}
            </p>
            <p className="mt-1.5 text-[13px] leading-[1.55] text-[#737373]">
              {lastModule.desc}
            </p>
          </motion.div>

          {/* CTA card — spans 2 cols */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: 0.07, ease }}
            className="col-span-1 bg-[#EEEBE6] px-5 py-8 sm:col-span-2 md:col-span-2"
          >
            <p className="mb-2 text-[1.1rem] font-bold tracking-[-0.025em] text-[#1C1C1C]">
              Trenger du noe annet?
            </p>
            <p className="mb-5 text-[14px] leading-[1.6] text-[#666]">
              Vi hører på deg. Ta kontakt og vi bygger det du trenger.
            </p>
            <Link
              href={landingSectionHref("contact")}
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#1C1C1C] px-6 text-[13px] font-semibold text-white transition-colors hover:bg-[#2E2E2E]"
            >
              Book en demo
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
