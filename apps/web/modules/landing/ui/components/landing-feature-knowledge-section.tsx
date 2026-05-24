"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { CheckIcon } from "lucide-react";

const BULLETS = [
  "PDF-er, nettsider, fritekst og FAQ-filer",
  "Automatisk re-indeksering når innholdet endres",
  "Klar til bruk på under 10 minutter",
];

export function LandingFeatureKnowledgeSection() {
  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      data-landing-nav-surface="light"
      className="border-t border-[#E4DFD9] bg-[#F9F9F9]"
      aria-labelledby="feature-knowledge-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32 xl:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20 xl:gap-28">

          {/* Left — screenshot */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease }}
            className="relative order-2 lg:order-1"
          >
            {/* Subtle warm glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 rounded-[40px] opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(168,152,126,0.2), transparent 70%)",
              }}
            />

            {/* Browser frame */}
            <div className="relative overflow-hidden rounded-xl shadow-[0_24px_48px_-12px_rgba(26,20,16,0.18)] ring-1 ring-[#E4DFD9]">
              {/* Chrome */}
              <div className="flex h-8 items-center gap-1.5 border-b border-[#E4DFD9] bg-[#e8e2d8] px-4">
                <span className="size-2.5 rounded-full bg-[#c8bfb0]" />
                <span className="size-2.5 rounded-full bg-[#c8bfb0]" />
                <span className="size-2.5 rounded-full bg-[#c8bfb0]" />
                <span className="ml-3 h-3 w-44 rounded-sm bg-[#E4DFD9]" />
              </div>
              {/* Screenshot */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src="/screenshot3.png"
                  alt="Agenci kunnskapsbase — opplastede dokumenter og treningsdata"
                  fill
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </motion.div>

          {/* Right — text */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="order-1 lg:order-2"
          >
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">
              Kunnskapsbase
            </p>
            <h2
              id="feature-knowledge-heading"
              className="text-[1.85rem] font-bold leading-[1.08] tracking-[-0.038em] text-[#1C1C1C] sm:text-[2.2rem] md:text-[2.8rem]"
            >
              Lær opp agenten med ditt innhold.{" "}
              <span className="text-[#a8987e]">På 10 minutter.</span>
            </h2>
            <p className="mt-5 text-[15px] leading-[1.75] text-[#6B6B6B]">
              Last opp dokumenter, pek på nettsider, lim inn FAQ. Agenci indekserer alt automatisk
              og svarer kun ut fra det du har delt — aldri generelle fraser eller gjetninger.
            </p>

            <ul className="mt-8 space-y-3.5">
              {BULLETS.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#E4DFD9]">
                    <CheckIcon className="size-3 text-[#6B6B6B]" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span className="text-[14px] leading-relaxed text-[#6B6B6B]">{bullet}</span>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
