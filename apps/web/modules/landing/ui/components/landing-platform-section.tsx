"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { LANDING_SECTION_IDS } from "@/modules/landing/constants";

const AUTO_MS = 4500;

/* ─────────────────────────────────────────────────────────────────
   Feature data
───────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    id: "oppsett",
    step: "01",
    label: "Oppsett",
    heading: "Kom i gang på under 5 minutter",
    description: "Ingen utvikler nødvendig. Lim inn én kodelinje, konfigurer agenten din i dashboardet, og du er live. Enkelt å endre når som helst.",
    image: "/Produktet/oppsett.png",
  },
  {
    id: "chat-widget",
    step: "02",
    label: "Chat-widget",
    heading: "En chatbot som aldri sover",
    description: "Plasser Agenci på nettsiden din og la den håndtere kundespørsmål rundt klokka. Reduser responstid fra timer til sekunder — automatisk.",
    image: "/Produktet/chatwidget.png",
    portrait: true,
  },
  {
    id: "kunnskapsbase",
    step: "03",
    label: "Kunnskapsbase",
    heading: "Lær den alt om din bedrift",
    description: "Last opp PDF-er, koble til nettsidene dine og legg til FAQ. Agenci lærer av kildene og svarer presist — basert nøyaktig på din informasjon.",
    image: "/Produktet/kunnskap.png",
  },
  {
    id: "tilpasning",
    step: "04",
    label: "Tilpasning",
    heading: "Ditt merke, ditt utseende",
    description: "Tilpass farger, tekster og oppførsel slik at det passer merkevaren din perfekt. Sett opp på minutter — endre når som helst.",
    image: "/Produktet/tilpassning.png",
  },
  {
    id: "integrasjoner",
    step: "05",
    label: "Integrasjoner",
    heading: "Koble til systemene dere bruker",
    description: "Koble Agenci til CRM, e-post og nettbutikk slik at data flyter dit det trengs. Starter med widget — vokser med bedriften.",
    image: "/Produktet/integregring.png",
  },
];

/* ─────────────────────────────────────────────────────────────────
   Section
───────────────────────────────────────────────────────────────── */

export function LandingPlatformSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [tabProgress, setTabProgress] = useState(0);
  const reduceMotion = useReducedMotion();
  const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

  /* Auto-advance every AUTO_MS ms, reset on activeIndex change */
  useEffect(() => {
    if (reduceMotion) return;
    setTabProgress(0);
    const start = Date.now();
    const id = setInterval(() => {
      const p = (Date.now() - start) / AUTO_MS;
      if (p >= 1) {
        clearInterval(id);
        setActiveIndex((prev) => (prev + 1) % FEATURES.length);
      } else {
        setTabProgress(p);
      }
    }, 40);
    return () => clearInterval(id);
  }, [activeIndex, reduceMotion]);

  const goTo = (i: number) => {
    if (i === activeIndex) return;
    setActiveIndex(i);
  };

  const active = FEATURES[activeIndex]!;

  return (
    <section
      id={LANDING_SECTION_IDS.product}
      data-landing-nav-surface="dark"
      className="bg-[#1C1C1C]"
      aria-labelledby="platform-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-28 xl:px-8">

        {/* Section heading */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="mb-12"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9ca3af]">
            Produktet
          </p>
          <h2
            id="platform-heading"
            className="max-w-xl text-[2.2rem] font-bold leading-[1.06] tracking-[-0.04em] text-white sm:text-[2.8rem]"
          >
            Alt du trenger for
            <br />
            kundekommunikasjon
          </h2>
        </motion.div>

        {/* Tab bar */}
        <div
          className="mb-10 grid border-b border-white/[0.07]"
          style={{ gridTemplateColumns: `repeat(${FEATURES.length}, minmax(0, 1fr))` }}
        >
          {FEATURES.map((f, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={f.id}
                onClick={() => goTo(i)}
                className="relative pb-5 pr-4 text-left transition-opacity"
                style={{ opacity: isActive ? 1 : 0.35 }}
              >
                <span className="mb-1 block text-[11px] font-semibold tracking-[0.08em] text-[#9ca3af]">
                  {f.step}
                </span>
                <span className="block text-[13px] font-semibold text-white">
                  {f.label}
                </span>

                {/* Progress indicator */}
                <div className="absolute bottom-0 left-0 right-4 h-[2px] bg-white/[0.06]">
                  {isActive && (
                    <div
                      className="h-full bg-white/70 transition-none"
                      style={{ width: `${tabProgress * 100}%` }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Content panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="grid items-start gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
              {/* Left: text */}
              <div className="md:pt-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9ca3af]">
                  {active.step} — {active.label}
                </p>
                <h3 className="mb-5 text-[2rem] font-bold leading-[1.1] tracking-[-0.038em] text-white sm:text-[2.4rem]">
                  {active.heading}
                </h3>
                <p className="text-[16px] leading-[1.72] text-[#666]">
                  {active.description}
                </p>
              </div>

              {/* Right: screenshot */}
              <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#111] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.7)]">
                {/* Browser chrome */}
                <div className="flex h-8 shrink-0 items-center gap-[5px] border-b border-white/[0.07] px-4">
                  <span className="size-[6px] rounded-full bg-white/[0.10]" />
                  <span className="size-[6px] rounded-full bg-white/[0.10]" />
                  <span className="size-[6px] rounded-full bg-white/[0.10]" />
                </div>
                {"portrait" in active && active.portrait ? (
                  <div className="flex h-[420px] items-center justify-center p-8">
                    <Image
                      src={active.image}
                      alt={active.heading}
                      width={652}
                      height={1038}
                      className="h-full w-auto object-contain"
                      priority
                    />
                  </div>
                ) : (
                  <div className="relative w-full">
                    <Image
                      src={active.image}
                      alt={active.heading}
                      width={1200}
                      height={750}
                      className="w-full object-cover object-top"
                      priority
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
