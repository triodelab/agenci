"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, LayoutDashboard, Package, Zap } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { heroCtas, heroMiniFeatures } from "@/modules/landing/content/hero";
import { LANDING_AUTH_PATHS } from "@/modules/landing/constants";
import { cn } from "@workspace/ui/lib/utils";

const miniFeatureIcons = [LayoutDashboard, Zap, Package];

const container = {
  hidden: { opacity: 0 },
  visible: (reduced: boolean) => ({
    opacity: 1,
    transition: {
      staggerChildren: reduced ? 0 : 0.1,
      delayChildren: reduced ? 0 : 0.12,
    },
  }),
};

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

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
          Agenci · bygget for norsk kundeservice
        </span>
      </motion.div>

      <motion.h1
        id="hero-heading"
        initial={reduced ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.06 }}
        className="mx-auto mt-10 max-w-4xl text-center text-4xl font-semibold leading-[1.08] tracking-tight text-foreground md:mt-12 md:text-5xl lg:text-[3.35rem] lg:leading-[1.06]"
      >
        <span className="block">Automatiser kundeservice</span>
        <span className="mt-1 block bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent md:mt-1.5">
          og salg med AI
        </span>
      </motion.h1>

      <motion.p
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, delay: 0.14 }}
        className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-muted-foreground md:text-lg md:leading-relaxed"
      >
        Rask, presis support døgnet rundt — med widget, dashboard og kontroll på
        innhold. Sett opp på minutter, skaler uten friksjon.
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
                className="group h-12 rounded-2xl bg-primary px-7 text-base font-medium text-primary-foreground shadow-[0_12px_40px_-12px_rgba(37,99,235,0.55)] transition-all hover:bg-primary/92 hover:shadow-[0_16px_48px_-12px_rgba(37,99,235,0.45)]"
              >
                <AuthAwareLink
                  href={LANDING_AUTH_PATHS.signIn}
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
              className="h-12 rounded-2xl border-border/80 bg-background/80 px-7 text-base backdrop-blur-sm"
            >
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          );
        })}
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        custom={!!reduced}
        className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-5 md:mt-20 md:grid-cols-3 md:gap-5"
      >
        {heroMiniFeatures.map((feat, i) => {
          const Icon = miniFeatureIcons[i % miniFeatureIcons.length]!;
          return (
            <motion.div
              key={feat.title}
              variants={item}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className={cn(
                  "group relative h-full rounded-2xl border border-border/60 bg-card/90 p-6 text-center shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] transition-all duration-300",
                  "hover:-translate-y-1 hover:border-border hover:shadow-[0_20px_50px_-20px_rgba(15,23,42,0.12)]",
                  "dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]",
                )}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                />
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-border/70 bg-background/80 text-primary">
                  <Icon className="size-5" />
                </div>
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  {feat.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feat.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
