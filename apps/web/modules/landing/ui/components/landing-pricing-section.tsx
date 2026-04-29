"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@workspace/ui/components/button";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
  LANDING_AUTH_PATHS,
  LANDING_MARKETING_PRIMARY_CTA_SURFACE_CLASS,
  LANDING_SECTION_IDS,
  landingSectionHref,
} from "@/modules/landing/constants";
import { cn } from "@workspace/ui/lib/utils";

const plans = [
  {
    name: "Gratis",
    blurb: "Prøv Agenci uten å legge inn kortinfo. Ingen skjulte kostnader.",
    bullets: [
      "Chat-widget på nettsiden din",
      "Se alle innkommende samtaler",
      "Manuell oppfølging fra dashboard",
    ],
    cta: "Start gratis",
    href: LANDING_AUTH_PATHS.signUp,
    featured: false,
  },
  {
    name: "Pro",
    blurb: "Alt du trenger for å la AI-en jobbe for deg. 14 dager gratis — ingen kortinfo.",
    bullets: [
      "AI-assistent som svarer automatisk",
      "Last opp FAQ, dokumenter og produktsider",
      "Tilpass utseende og tone helt selv",
      "Opptil 5 i teamet",
    ],
    cta: "Prøv 14 dager gratis",
    href: LANDING_AUTH_PATHS.signUp,
    featured: true,
  },
  {
    name: "Enterprise",
    blurb: "Tilpasset oppsett for større team med spesifikke krav.",
    bullets: [
      "Dedikert onboarding og støtte",
      "SLA og egne integrasjoner",
      "Volumpriser og skreddersydd avtale",
    ],
    cta: "Ta kontakt",
    href: landingSectionHref("contact"),
    featured: false,
  },
] as const;

export function LandingPricingSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id={LANDING_SECTION_IDS.pricing}
      data-landing-nav-surface="light"
      className="relative z-10 -mt-8 scroll-mt-24 rounded-t-[2rem] border-x border-t border-zinc-200/65 bg-[#fafafa] py-20 shadow-[0_-28px_70px_-42px_rgba(0,0,0,0.52)] md:-mt-10 md:rounded-t-[2.5rem] md:py-28"
      aria-labelledby="pricing-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(45,212,191,0.045),transparent_55%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-10 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-700/85 md:text-xs">
            Priser
          </p>
          <h2
            id="pricing-heading"
            className="mt-3 text-balance text-2xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-3xl md:text-[2.1rem] md:leading-[1.15]"
          >
            Start gratis. Betal bare når du ser verdien.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-600 md:text-base">
            Gratis konto for å komme i gang. Pro-planen gir deg AI-assistenten og alt annet — med 14 dagers gratis prøveperiode. Ingen kortinfo kreves.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:mt-16 md:grid-cols-3 md:gap-5 lg:gap-6">
          {plans.map((plan, i) => (
            <motion.article
              key={plan.name}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white/95 p-7 shadow-sm md:p-8",
                plan.featured
                  ? "border-teal-400/35 shadow-[0_20px_50px_-28px_rgba(45,212,191,0.25),0_0_0_1px_rgba(45,212,191,0.12)] ring-1 ring-teal-500/15"
                  : "border-zinc-200/90",
              )}
            >
              {plan.featured ? (
                <span
                  className={cn(
                    LANDING_MARKETING_PRIMARY_CTA_SURFACE_CLASS,
                    "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[11px] uppercase tracking-wider",
                  )}
                >
                  14 dager gratis
                </span>
              ) : null}
              <h3 className="text-lg font-semibold tracking-tight text-zinc-950 md:text-xl">{plan.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{plan.blurb}</p>
              <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-zinc-700">
                {plan.bullets.map((b) => (
                  <li key={b} className="flex gap-2.5">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-teal-600"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {plan.href !== LANDING_AUTH_PATHS.signUp ? (
                  <Button
                    className={cn(
                      "h-11 w-full rounded-full font-semibold",
                      plan.featured &&
                        cn(
                          LANDING_MARKETING_PRIMARY_CTA_SURFACE_CLASS,
                          "shadow-[0_8px_28px_-10px_rgba(45,212,191,0.35)]",
                        ),
                      !plan.featured && "border-zinc-200 bg-white hover:bg-zinc-50",
                    )}
                    variant={plan.featured ? "default" : "outline"}
                    asChild
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                ) : (
                  <Button
                    className={cn(
                      "h-11 w-full rounded-full font-semibold",
                      plan.featured &&
                        cn(
                          LANDING_MARKETING_PRIMARY_CTA_SURFACE_CLASS,
                          "shadow-[0_8px_28px_-10px_rgba(45,212,191,0.35)]",
                        ),
                      !plan.featured && "border-zinc-200 bg-white hover:bg-zinc-50",
                    )}
                    variant={plan.featured ? "default" : "outline"}
                    asChild
                  >
                    <AuthAwareLink href={plan.href} loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}>
                      {plan.cta}
                    </AuthAwareLink>
                  </Button>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
