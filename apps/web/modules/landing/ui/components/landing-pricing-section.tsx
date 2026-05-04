"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@workspace/ui/components/button";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
  LANDING_AUTH_PATHS,
  LANDING_SECTION_IDS,
  landingSectionHref,
} from "@/modules/landing/constants";
import { cn } from "@workspace/ui/lib/utils";

const plans = [
  {
    name: "Gratis",
    price: "0",
    unit: "kr",
    period: null,
    blurb: "Kom i gang uten kortinfo. Se hvordan Agenci fungerer for bedriften din.",
    bullets: [
      "Chat-widget på nettsiden",
      "Alle innkommende samtaler",
      "Manuell oppfølging fra dashboard",
    ],
    cta: "Start gratis",
    ctaStyle: "secondary" as const,
    href: LANDING_AUTH_PATHS.signUp,
    featured: false,
  },
  {
    name: "Pro",
    price: "499",
    unit: "kr",
    period: "/ mnd",
    blurb: "Alt du trenger for å la AI-en jobbe for deg, døgnet rundt.",
    bullets: [
      "AI-assistent svarer automatisk",
      "Last opp FAQ og produktsider",
      "Tilpass utseende og tone",
      "Opptil 5 i teamet",
      "14 dager gratis — ingen kortinfo",
    ],
    cta: "Prøv 14 dager gratis",
    ctaStyle: "primary" as const,
    href: LANDING_AUTH_PATHS.signUp,
    featured: true,
  },
  {
    name: "Enterprise",
    price: null,
    unit: null,
    period: null,
    blurb: "Skreddersydd oppsett for større team med spesifikke krav og volum.",
    bullets: [
      "Dedikert onboarding og støtte",
      "SLA og egne integrasjoner",
      "Volumpriser og tilpasset avtale",
    ],
    cta: "Ta kontakt",
    ctaStyle: "secondary" as const,
    href: landingSectionHref("contact"),
    featured: false,
  },
] as const;

export function LandingPricingSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id={LANDING_SECTION_IDS.pricing}
      data-landing-nav-surface="dark"
      className="bg-[#080808]"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-28 xl:px-8">

        {/* Header */}
        <motion.div
          className="mb-14"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-5 font-mono text-[11px] tracking-[0.2em] text-[#333]">PRISER</p>
          <h2
            id="pricing-heading"
            className="max-w-xl text-[2rem] font-semibold leading-[1.06] tracking-[-0.055em] text-[#f0eeeb] sm:text-[2.4rem] md:text-[2.8rem]"
          >
            Start gratis. Betal bare når du ser verdien.
          </h2>
          <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-[#555]">
            Gratis konto for å komme i gang. Pro-planen gir deg AI-assistenten med 14 dagers prøveperiode. Ingen kortinfo kreves.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-3 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.article
              key={plan.name}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative flex flex-col rounded-xl border p-7",
                plan.featured
                  ? "border-[#2a2a2a] bg-[#0f0f0f]"
                  : "border-[#1a1a1a] bg-[#0a0a0a]",
              )}
            >
              {/* Plan */}
              <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.25em] text-[#444]">
                {plan.name}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1.5">
                {plan.price !== null ? (
                  <>
                    <span className="text-[2.4rem] font-semibold leading-none tracking-[-0.04em] text-[#f0eeeb]">
                      {plan.price}
                    </span>
                    <span className="text-[15px] text-[#444]">
                      {plan.unit}{plan.period}
                    </span>
                  </>
                ) : (
                  <span className="text-[1.5rem] font-semibold leading-none tracking-[-0.03em] text-[#f0eeeb]">
                    Kontakt oss
                  </span>
                )}
              </div>

              <p className="mt-4 text-[13px] leading-relaxed text-[#555]">{plan.blurb}</p>

              {/* Divider */}
              <div className="my-6 h-px bg-[#1a1a1a]" />

              {/* Bullets */}
              <ul className="flex flex-1 flex-col gap-2.5">
                {plan.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <Check
                      className="mt-0.5 size-3.5 shrink-0 text-[#444]"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    <span className="text-[13px] text-[#888]">{b}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-8">
                {plan.ctaStyle === "primary" ? (
                  <Button
                    className="h-9 w-full rounded-lg bg-white text-[13px] font-medium text-black hover:bg-white/90"
                    asChild
                  >
                    <AuthAwareLink href={plan.href} loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}>
                      {plan.cta}
                    </AuthAwareLink>
                  </Button>
                ) : plan.href !== LANDING_AUTH_PATHS.signUp ? (
                  <Button
                    variant="outline"
                    className="h-9 w-full rounded-lg border-[#222] bg-transparent text-[13px] font-medium text-[#888] hover:border-[#333] hover:bg-[#111] hover:text-[#ccc]"
                    asChild
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="h-9 w-full rounded-lg border-[#222] bg-transparent text-[13px] font-medium text-[#888] hover:border-[#333] hover:bg-[#111] hover:text-[#ccc]"
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
