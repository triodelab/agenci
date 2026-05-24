"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
  LANDING_AUTH_PATHS,
  LANDING_NAV_TONE_BOUNDARY_ID,
  landingSectionHref,
} from "@/modules/landing/constants";

const HEADLINE = ["Kundestøtte", "som", "aldri", "sover"];

export function LandingHeroSection() {
  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      className="relative overflow-hidden bg-[#1C1C1C] pt-[4.25rem]"
      aria-labelledby="landing-hero-heading"
      id={LANDING_NAV_TONE_BOUNDARY_ID}
      data-landing-nav-surface="dark"
    >
      {/* Orthogonal grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.020) 0px, rgba(255,255,255,0.020) 1px, transparent 1px, transparent 72px)",
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.020) 0px, rgba(255,255,255,0.020) 1px, transparent 1px, transparent 72px)",
          ].join(", "),
        }}
      />

      {/* Subtle top vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 35% at 50% 0%, rgba(255,255,255,0.04), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-[1200px] px-6 xl:px-8">
        {/* Badge */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="pt-16 md:pt-22"
        >
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60" />
            <span className="text-[12px] font-medium tracking-[0.01em] text-white/48">
              AI-chat for norske nettsider
            </span>
          </div>
        </motion.div>

        {/* Headline — words stagger in */}
        <h1
          id="landing-hero-heading"
          className="mb-7"
          aria-label="Kundestøtte som aldri sover"
        >
          {HEADLINE.map((word, i) => (
            <motion.span
              key={word}
              initial={reduceMotion ? false : { opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.72,
                delay: 0.08 + i * 0.10,
                ease,
              }}
              className="mr-[0.22em] inline-block text-[3rem] font-bold leading-[1.04] tracking-[-0.044em] text-white sm:text-[4rem] md:text-[5rem] lg:text-[5.8rem]"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.45, ease }}
          className="mb-9 max-w-[450px] text-[17px] leading-[1.62] tracking-[-0.01em] text-[#6B6B6B]"
        >
          Kunder som ikke får svar, bytter til konkurrenten. Agenci svarer på spørsmålene dine automatisk — presist, med din kunnskap, hele døgnet.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.53, ease }}
          className="mb-14 flex flex-wrap items-center gap-3"
        >
          <AuthAwareLink
            href={LANDING_AUTH_PATHS.signUp}
            loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
            className="inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-[14px] font-semibold text-[#1C1C1C] transition-all hover:bg-white/90 active:scale-[0.98]"
          >
            Start gratis
          </AuthAwareLink>
          <Link
            href={landingSectionHref("contact")}
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/[0.10] px-7 text-[14px] font-medium text-white/52 transition-all hover:border-white/[0.20] hover:text-white/78"
          >
            Book en demo
          </Link>
        </motion.div>

      </div>

      {/* Product screenshot */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.64, ease }}
        className="relative mx-auto max-w-[1200px]"
      >
        <div className="overflow-hidden border border-b-0 border-white/[0.07] bg-[#111]">
          <div className="flex h-[30px] shrink-0 items-center gap-[6px] border-b border-white/[0.07] px-4">
            <span className="size-[7px] rounded-full bg-white/[0.10]" />
            <span className="size-[7px] rounded-full bg-white/[0.10]" />
            <span className="size-[7px] rounded-full bg-white/[0.10]" />
          </div>
          <div className="relative h-[min(50vh,520px)] w-full overflow-hidden">
            <Image
              src="/screenshot1.png"
              alt="Agenci dashboard"
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover object-top"
              priority
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#F9F9F9] to-transparent"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
