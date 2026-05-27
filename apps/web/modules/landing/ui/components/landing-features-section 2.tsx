"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Clock, BookOpen, BarChart2, Paintbrush, UserCheck } from "lucide-react";
import { LANDING_SECTION_IDS } from "@/modules/landing/constants";

const SMALL_FEATURES = [
  {
    icon: BookOpen,
    title: "Kunnskap fra dine dokumenter",
    body: "PDF, nettsider og FAQ — agenten svarer kun fra det du lastet opp. Aldri generelle fraser.",
  },
  {
    icon: Clock,
    title: "Alltid tilgjengelig",
    body: "24/7, uten ventetid eller ekstrakostnader for deg.",
  },
  {
    icon: UserCheck,
    title: "Menneskelig overlevering",
    body: "Ta over samtalen med ett klikk. Full historikk følger med.",
  },
  {
    icon: BarChart2,
    title: "Innsikt fra samtaler",
    body: "Se hva kundene spør om. Oppdage hull i innholdet ditt.",
  },
  {
    icon: Paintbrush,
    title: "Tilpass merket ditt",
    body: "Farger, posisjon, navn og tone — matcher din merkeprofil perfekt.",
  },
] as const;

export function LandingFeaturesSection() {
  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      id={LANDING_SECTION_IDS.useCases}
      data-landing-nav-surface="light"
      className="border-t border-[#E4DFD9] bg-[#F9F9F9]"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32 xl:px-8">

        {/* Header */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="mb-14"
        >
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">
            Funksjonalitet
          </p>
          <h2
            id="features-heading"
            className="max-w-2xl text-[2rem] font-bold leading-[1.07] tracking-[-0.038em] text-[#1C1C1C] sm:text-[2.6rem] md:text-[3.2rem]"
          >
            Alt du trenger for kundeservice på nettsiden
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.75] text-[#6B6B6B]">
            Fra kunnskap til svar — ett system som håndterer hele flyten, alltid.
          </p>
        </motion.div>

        {/* Bento grid — 3-col on desktop */}
        <div className="grid gap-4 lg:grid-cols-3">

          {/* ── Row 1 ── */}

          {/* Large card: Chat in action */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease }}
            className="overflow-hidden rounded-2xl bg-[#161616] ring-1 ring-[#2a2a2a] lg:col-span-2"
          >
            <div className="relative h-[260px] overflow-hidden">
              <Image
                src="/keyFeatures.png"
                alt="Agenci chat widget på en norsk nettbutikk"
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#161616]/20 to-[#161616]" />
            </div>
            <div className="px-6 pb-6 pt-3">
              <h3 className="text-[1.1rem] font-bold tracking-[-0.022em] text-[#f2f3f5]">
                AI-agenten din på jobb — 24/7
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#9ca3af]">
                Besøkende får svar om produkter, priser, levering og retur umiddelbart — på nettsiden din, hele døgnet.
              </p>
            </div>
          </motion.div>

          {/* Small card 1 */}
          <SmallCard feature={SMALL_FEATURES[0]} delay={0.08} reduceMotion={reduceMotion ?? false} ease={ease} />

          {/* ── Row 2 ── */}

          {/* Small card 2 */}
          <SmallCard feature={SMALL_FEATURES[1]} delay={0.04} reduceMotion={reduceMotion ?? false} ease={ease} />

          {/* Large card: Dashboard */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: 0.12, ease }}
            className="overflow-hidden rounded-2xl bg-[#161616] ring-1 ring-[#2a2a2a] lg:col-span-2"
          >
            <div className="relative h-[260px] overflow-hidden">
              <Image
                src="/screenshot1.png"
                alt="Agenci dashboard med oversikt over samtaler"
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#161616]/20 to-[#161616]" />
            </div>
            <div className="px-6 pb-6 pt-3">
              <h3 className="text-[1.1rem] font-bold tracking-[-0.022em] text-[#f2f3f5]">
                Full oversikt i dashboardet
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#9ca3af]">
                Alle samtaler, all historikk samlet på ett sted — søk, filtrer og ta over direkte.
              </p>
            </div>
          </motion.div>

          {/* ── Row 3 — three small cards ── */}
          {SMALL_FEATURES.slice(2).map((feature, i) => (
            <SmallCard
              key={feature.title}
              feature={feature}
              delay={i * 0.07}
              reduceMotion={reduceMotion ?? false}
              ease={ease}
            />
          ))}

        </div>
      </div>
    </section>
  );
}

function SmallCard({
  feature,
  delay,
  reduceMotion,
  ease,
}: {
  feature: (typeof SMALL_FEATURES)[number];
  delay: number;
  reduceMotion: boolean;
  ease: readonly [number, number, number, number];
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, delay, ease: [...ease] as [number, number, number, number] }}
      className="rounded-2xl border border-[#E4DFD9] bg-[#faf7f2] p-6"
    >
      <div className="mb-5 flex size-10 items-center justify-center rounded-[10px] border border-[#E4DFD9] bg-[#F9F9F9]">
        <feature.icon className="size-5 text-[#6B6B6B]" strokeWidth={1.75} />
      </div>
      <h3 className="text-[13.5px] font-semibold leading-snug text-[#1C1C1C]">{feature.title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-[#6B6B6B]">{feature.body}</p>
    </motion.div>
  );
}
