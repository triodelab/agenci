"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
  LANDING_AUTH_PATHS,
  LANDING_NAV_TONE_BOUNDARY_ID,
  landingSectionHref,
} from "@/modules/landing/constants";

const HEADLINE = ["En chatbot", "som kjenner", "bedriften din —", "og svarer for deg, hele døgnet."];

const HERO_IMAGES = [
  { src: "/Produktet/chatwidget.png", alt: "Chat-widget", label: "Chat-widget" },
  { src: "/Produktet/oppsett.png", alt: "Oppsett", label: "Oppsett" },
  { src: "/Produktet/kunnskap.png", alt: "Kunnskapsbase", label: "Kunnskapsbase" },
  { src: "/Produktet/tilpassning.png", alt: "Tilpasning", label: "Tilpasning" },
  { src: "/Produktet/integregring.png", alt: "Integrasjoner", label: "Integrasjoner" },
];

export function LandingHeroSection() {
  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;
  const [activeImage, setActiveImage] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (reduceMotion) return;
    intervalRef.current = setInterval(() => {
      setActiveImage((i) => (i + 1) % HERO_IMAGES.length);
    }, 4500);
  }, [reduceMotion]);

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startInterval]);

  const handleTabClick = (i: number) => {
    setActiveImage(i);
    startInterval();
  };

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
          aria-label="En chatbot som kjenner bedriften din — og svarer for deg, hele døgnet."
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
          <div className="flex items-center gap-0 overflow-x-auto border-b border-white/[0.07]">
            {HERO_IMAGES.map((img, i) => (
              <button
                key={img.label}
                onClick={() => handleTabClick(i)}
                className={`relative shrink-0 px-4 py-2 text-[11px] font-medium tracking-[0.01em] transition-colors ${
                  i === activeImage
                    ? "text-white/80"
                    : "text-white/25 hover:text-white/50"
                }`}
              >
                {img.label}
                {i === activeImage && (
                  <motion.span
                    layoutId="hero-tab-indicator"
                    className="absolute inset-x-0 bottom-0 h-[1px] bg-white/40"
                  />
                )}
              </button>
            ))}
          </div>
          <div className="relative h-[min(50vh,520px)] w-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={HERO_IMAGES[activeImage].src}
                  alt={HERO_IMAGES[activeImage].alt}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-cover object-top"
                  priority={activeImage === 0}
                />
              </motion.div>
            </AnimatePresence>
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
