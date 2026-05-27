"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
  LANDING_AUTH_PATHS,
  LANDING_SECTION_IDS,
  landingSectionHref,
} from "@/modules/landing/constants";

/* ── Small decorative wireframe cubes ── */
function LeftCube() {
  return (
    <svg
      width="90"
      height="80"
      viewBox="0 0 90 80"
      fill="none"
      aria-hidden
      className="absolute left-[3%] top-1/2 -translate-y-1/2 opacity-30 md:left-[6%]"
    >
      <path d="M45 8 L77 24 L45 40 L13 24 Z" stroke="#8a7a68" strokeWidth="0.9" fill="none" />
      <path d="M13 24 L13 56 L45 72 L45 40" stroke="#8a7a68" strokeWidth="0.9" fill="none" />
      <path d="M77 24 L77 56 L45 72" stroke="#8a7a68" strokeWidth="0.9" fill="none" />
      {/* inner dashed */}
      <line x1="45" y1="8" x2="45" y2="40" stroke="#b0a090" strokeWidth="0.5" strokeDasharray="3 4" />
      <line x1="13" y1="24" x2="77" y2="24" stroke="#b0a090" strokeWidth="0.5" strokeDasharray="3 4" />
      {/* smaller inner cube hint */}
      <path d="M45 20 L61 28 L45 36 L29 28 Z" stroke="#a09080" strokeWidth="0.5" fill="none" />
    </svg>
  );
}

function RightCube() {
  return (
    <svg
      width="72"
      height="64"
      viewBox="0 0 72 64"
      fill="none"
      aria-hidden
      className="absolute right-[3%] top-1/2 -translate-y-1/2 opacity-25 md:right-[6%]"
    >
      <path d="M36 4 L62 16 L36 28 L10 16 Z" stroke="#8a7a68" strokeWidth="0.85" fill="none" />
      <path d="M10 16 L10 44 L36 56 L36 28" stroke="#8a7a68" strokeWidth="0.85" fill="none" />
      <path d="M62 16 L62 44 L36 56" stroke="#8a7a68" strokeWidth="0.85" fill="none" />
      <line x1="36" y1="4" x2="36" y2="28" stroke="#b0a090" strokeWidth="0.5" strokeDasharray="3 4" />
      <line x1="10" y1="16" x2="62" y2="16" stroke="#b0a090" strokeWidth="0.5" strokeDasharray="3 4" />
    </svg>
  );
}

export function LandingFinalCtaSection() {
  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      id={LANDING_SECTION_IDS.finalCta}
      data-landing-nav-surface="light"
      className="relative overflow-hidden bg-[#F9F9F9]"
      aria-labelledby="final-cta-heading"
    >
      {/* Isometric grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(60deg, rgba(0,0,0,0.025) 0px, rgba(0,0,0,0.025) 0.5px, transparent 0.5px, transparent 44px)",
            "repeating-linear-gradient(-60deg, rgba(0,0,0,0.025) 0px, rgba(0,0,0,0.025) 0.5px, transparent 0.5px, transparent 44px)",
          ].join(", "),
        }}
      />

      {/* Decorative cubes */}
      <LeftCube />
      <RightCube />

      <div className="relative mx-auto max-w-[1200px] px-6 py-24 md:py-32 xl:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <h2
            id="final-cta-heading"
            className="max-w-xl text-[2.8rem] font-bold leading-[1.06] tracking-[-0.042em] text-[#1C1C1C] sm:text-[3.5rem]"
          >
            Klar til å spare timer
            <br />
            på kundeservice?
          </h2>

          <p className="text-[16px] leading-[1.65] text-[#666]">
            Ingen kortinfo. Oppe på 5 minutter. Ingen bindingstid.
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <AuthAwareLink
              href={LANDING_AUTH_PATHS.signUp}
              loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#1C1C1C] px-8 text-[15px] font-semibold text-white transition-colors hover:bg-[#2E2E2E]"
            >
              Start gratis
            </AuthAwareLink>
            <Link
              href={landingSectionHref("contact")}
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#D5D0CB] px-8 text-[15px] font-medium text-[#666] transition-colors hover:border-[#1C1C1C] hover:text-[#1C1C1C]"
            >
              Book en demo
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
