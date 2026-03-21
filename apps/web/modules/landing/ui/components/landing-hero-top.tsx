"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { heroCtas, heroStats } from "@/modules/landing/content/hero";
import {
  LANDING_AUTH_PATHS,
  LANDING_SECTION_IDS,
} from "@/modules/landing/constants";
import { LandingGradientText } from "@/modules/landing/ui/components/landing-gradient-text";

export function LandingHeroTop() {
  const reduced = useReducedMotion();

  return (
    <div className="relative z-10 mx-auto max-w-[1200px] px-4 pt-28 md:px-6 md:pt-[5.5rem]">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex justify-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/90 px-4 py-2 text-sm font-medium text-foreground shadow-sm ring-1 ring-black/[0.04] backdrop-blur-md dark:ring-white/[0.06]">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/50 opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Bygget for norsk kundeservice · klar for EU/EØS
        </span>
      </motion.div>

      <motion.h1
        id="hero-heading"
        initial={reduced ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.06 }}
        className="mx-auto mt-10 max-w-[18ch] text-center text-4xl font-semibold leading-[1.06] tracking-tight text-foreground sm:max-w-none md:mt-12 md:text-5xl lg:max-w-4xl lg:text-[3.5rem] lg:leading-[1.05]"
      >
        <span className="block">Kundeservice som</span>
        <LandingGradientText className="mt-1 block md:mt-1.5">
          jobber mens dere sover
        </LandingGradientText>
      </motion.h1>

      <motion.p
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, delay: 0.14 }}
        className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-muted-foreground md:text-lg md:leading-relaxed"
      >
        Agenci kombinerer widget, AI og dashboard slik at besøkende får presise svar døgnet rundt — og
        teamet beholder kontroll på innhold, tone og eskalering.
      </motion.p>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.22 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-3"
      >
        {heroCtas.map((cta) => {
          if (cta.variant === "primary") {
            return (
              <Button
                key={cta.label}
                asChild
                size="lg"
                className="group h-12 rounded-2xl bg-primary px-7 text-base font-medium text-primary-foreground shadow-[0_12px_40px_-12px_color-mix(in_oklab,var(--primary)_45%,transparent)] transition-all hover:bg-primary/92 hover:shadow-[0_16px_48px_-12px_color-mix(in_oklab,var(--primary)_38%,transparent)]"
              >
                <AuthAwareLink
                  href={cta.href}
                  loggedInHref={LANDING_AUTH_PATHS.appHome}
                  className="inline-flex items-center gap-2"
                >
                  {cta.label}
                  <ArrowUpRight className="size-4 opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </AuthAwareLink>
              </Button>
            );
          }
          return (
            <Button
              key={cta.label}
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-2xl border-primary/20 bg-background/80 px-7 text-base backdrop-blur-sm hover:border-primary/40 hover:bg-primary/[0.06]"
            >
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          );
        })}
      </motion.div>

      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.26 }}
        className="mt-5 text-center"
      >
        <Link
          href={`/#${LANDING_SECTION_IDS.product}`}
          className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground"
        >
          Utforsk produktet ↓
        </Link>
      </motion.p>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.28 }}
        className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 md:mt-12 md:gap-4"
      >
        {heroStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/50 bg-card/50 px-3 py-4 text-center backdrop-blur-sm dark:bg-card/30 md:px-4 md:py-5"
          >
            <p className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{stat.value}</p>
            <p className="mt-1.5 text-xs leading-snug text-muted-foreground md:text-[13px]">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
