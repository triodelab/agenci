"use client";

import { motion, useReducedMotion } from "motion/react";
import { LANDING_SECTION_IDS } from "@/modules/landing/constants";

const FEATURES = [
  {
    step: "01",
    label: "Oppsett",
    heading: "Kom i gang på under 5 minutter",
    description:
      "Ingen utvikler nødvendig. Lim inn én kodelinje, konfigurer agenten din i dashboardet, og du er live. Enkelt å endre når som helst.",
    large: true,
  },
  {
    step: "02",
    label: "Chat-widget",
    heading: "En chatbot som aldri sover",
    description:
      "Plasser Agenci på nettsiden og la den håndtere kundespørsmål rundt klokka. Fra timer til sekunder.",
    large: false,
  },
  {
    step: "03",
    label: "Kunnskapsbase",
    heading: "Lær den alt om din bedrift",
    description:
      "Last opp PDF-er, koble til nettsidene dine og legg til FAQ. Agenci lærer og svarer presist — basert nøyaktig på din informasjon.",
    large: false,
  },
  {
    step: "04",
    label: "Tilpasning",
    heading: "Ditt merke, ditt utseende",
    description:
      "Tilpass farger, tekster og oppførsel slik at det passer merkevaren din perfekt. Sett opp på minutter.",
    large: true,
  },
  {
    step: "05",
    label: "Integrasjoner",
    heading: "Koble til systemene dere bruker",
    description:
      "Koble Agenci til CRM, e-post og nettbutikk slik at data flyter dit det trengs. Starter med widget — vokser med bedriften.",
    large: true,
  },
  {
    step: "06",
    label: "Timebestilling",
    heading: "Kunder booker time i chatten",
    description:
      "Agenci håndterer hele bookingflyten automatisk — tjeneste, dato, tid og bekreftelse. Du administrerer alt i dashboardet.",
    large: false,
  },
];

function FeatureCard({
  feature,
  index,
  reduceMotion,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
  reduceMotion: boolean;
}) {
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.07, ease }}
      className={`relative overflow-hidden bg-[#EEEBE6] p-7 md:p-9 ${
        feature.large ? "col-span-1 md:col-span-2" : "col-span-1"
      }`}
    >
      {/* Ghost number */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-0 select-none text-[8rem] font-black leading-none tracking-tighter text-[#D9D4CE] md:text-[10rem]"
      >
        {feature.step}
      </span>

      <div className="relative">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A9188]">
          {feature.step} — {feature.label}
        </p>
        <h3 className="mb-3 text-[1.3rem] font-bold leading-[1.15] tracking-[-0.03em] text-[#1C1C1C] md:text-[1.5rem]">
          {feature.heading}
        </h3>
        <p className="max-w-[38ch] text-[14px] leading-[1.7] text-[#6B6B6B]">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

export function LandingPlatformSection() {
  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      id={LANDING_SECTION_IDS.product}
      data-landing-nav-surface="light"
      className="bg-[#F9F9F9]"
      aria-labelledby="platform-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-28 xl:px-8">

        {/* Heading */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="mb-10"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A9188]">
            Produktet
          </p>
          <h2
            id="platform-heading"
            className="max-w-xl text-[2.2rem] font-bold leading-[1.06] tracking-[-0.04em] text-[#1C1C1C] sm:text-[2.8rem]"
          >
            Alt du trenger for
            <br />
            kundekommunikasjon
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FeatureCard
              key={feature.step}
              feature={feature}
              index={i}
              reduceMotion={reduceMotion ?? false}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
