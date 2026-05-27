"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { CheckIcon } from "lucide-react";

const BULLETS = [
  "Svarer om produkter, priser, lagerstatus og levering",
  "Forklarer returpolicy og garantier ordrett fra dine docs",
  "Eskalerer komplekse saker til deg — med full historikk",
];

export function LandingFeatureContextSection() {
  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      data-landing-nav-surface="dark"
      className="border-t border-[#2a2a2a] bg-[#161616]"
      aria-labelledby="feature-context-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32 xl:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20 xl:gap-28">

          {/* Left — text */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
          >
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
              Se det i praksis
            </p>
            <h2
              id="feature-context-heading"
              className="text-[1.85rem] font-bold leading-[1.08] tracking-[-0.038em] text-[#f2f3f5] sm:text-[2.2rem] md:text-[2.8rem]"
            >
              Kundene dine er online.{" "}
              <span className="text-[#6b7280]">Agenci svarer for deg.</span>
            </h2>
            <p className="mt-5 text-[15px] leading-[1.75] text-[#6b7280]">
              Mange bestillinger tapes fordi ingen svarer på et enkelt spørsmål om frakt eller retur.
              Agenci er der — klar med riktig svar, basert på nøyaktig ditt innhold.
            </p>

            <ul className="mt-8 space-y-3.5">
              {BULLETS.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2a2a2a]">
                    <CheckIcon className="size-3 text-[#9ca3af]" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span className="text-[14px] leading-relaxed text-[#9ca3af]">{bullet}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — screenshot */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, delay: 0.1, ease }}
            className="relative"
          >
            {/* Glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-10 rounded-[40px] opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(61,61,255,0.18), transparent 70%)",
              }}
            />

            {/* Browser frame */}
            <div className="relative overflow-hidden rounded-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] ring-1 ring-[#2a2a2a]">
              {/* Chrome */}
              <div className="flex h-8 items-center gap-1.5 border-b border-[#2a2a2a] bg-[#1a1a1a] px-4">
                <span className="size-2.5 rounded-full bg-[#2a2a2a]" />
                <span className="size-2.5 rounded-full bg-[#2a2a2a]" />
                <span className="size-2.5 rounded-full bg-[#2a2a2a]" />
                <span className="ml-3 h-3 w-44 rounded-sm bg-[#2a2a2a]" />
              </div>
              {/* Screenshot */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src="/keyFeatures.png"
                  alt="Agenci chat widget i aksjon på en norsk nettbutikk"
                  fill
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
