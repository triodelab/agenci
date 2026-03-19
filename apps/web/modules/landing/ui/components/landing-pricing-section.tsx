"use client";

import {
  LANDING_AUTH_PATHS,
  LANDING_SECTION_IDS,
} from "@/modules/landing/constants";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { AnimatedGroup } from "@workspace/ui/components/animated-group";
import { TextEffect } from "@workspace/ui/components/text-effect";
import { motion, useReducedMotion } from "motion/react";

const transitionVariants = {
  item: {
    hidden: { opacity: 0, filter: "blur(12px)", y: 16 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { type: "spring" as const, bounce: 0.25, duration: 1.2 },
    },
  },
};

const plans = [
  {
    name: "Starter",
    price: "Gratis",
    description: "Perfekt for å teste Agenci og komme live raskt.",
    features: [
      "Widget på nettsiden",
      "Grunnleggende svar",
      "Enkel konfigurering",
    ],
    cta: { label: "Start gratis", href: LANDING_AUTH_PATHS.signIn },
    highlight: false,
  },
  {
    name: "Pro",
    price: "Kontakt oss",
    description:
      "For team som vil redusere supportkostnader og øke konvertering.",
    features: [
      "Alt i Starter",
      "Inbox + human takeover",
      "KPIer og innsikt",
      "Content control",
      "Widget branding",
    ],
    cta: { label: "Kom i gang", href: LANDING_AUTH_PATHS.signIn },
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Tilpasset",
    description:
      "Sikkerhet, compliance og premium features for større organisasjoner.",
    features: [
      "Alt i Pro",
      "Voice (Premium)",
      "Sikkerhetskrav/avtale",
      "Integrasjoner og API",
    ],
    cta: { label: "Snakk med oss", href: LANDING_AUTH_PATHS.signIn },
    highlight: false,
  },
] as const;

export function LandingPricingSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id={LANDING_SECTION_IDS.pricing}
      aria-labelledby="pricing-heading"
      className="relative overflow-hidden bg-background py-24 md:py-36"
    >
      <div
        aria-hidden
        className="landing-section-mesh pointer-events-none absolute inset-0 -z-10 opacity-60"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_0%,transparent_0%,var(--color-background)_78%)]"
      />

      <div className="mx-auto max-w-6xl px-6">
        <div id="pricing-heading" className="mx-auto max-w-3xl text-center">
          <AnimatedGroup variants={transitionVariants}>
            <TextEffect
              preset="fade-in-blur"
              speedSegment={0.3}
              as="h2"
              className="text-balance text-4xl font-semibold tracking-tight lg:text-[2.75rem]"
            >
              Prisplaner som skalerer med deg
            </TextEffect>
            <TextEffect
              per="line"
              preset="fade-in-blur"
              speedSegment={0.3}
              delay={0.35}
              as="p"
              className="mt-6 text-balance text-lg text-muted-foreground"
            >
              Start gratis. Oppgrader når du ser effekten. Voice er premium for
              team som vil ta neste steg.
            </TextEffect>
          </AnimatedGroup>
        </div>

        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3 md:items-stretch [&>*]:h-full">
          {plans.map((p, index) => (
            <motion.div
              key={p.name}
              initial={reduced ? false : { opacity: 0, y: 24, scale: 0.97 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.42, delay: index * 0.08 }}
              className={cn("h-full", p.highlight && "md:-mt-2 md:mb-2")}
            >
              <Card
                className={cn(
                  "relative flex h-full flex-col overflow-hidden border-border/55 bg-card/95 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.12)] transition-all duration-300 dark:shadow-[0_20px_60px_-32px_rgba(0,0,0,0.35)]",
                  p.highlight &&
                    "border-primary/25 shadow-[0_28px_70px_-28px_rgba(37,99,235,0.25)] ring-2 ring-primary/20 dark:shadow-[0_28px_70px_-28px_rgba(37,99,235,0.2)]",
                )}
              >
                {p.highlight ? (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-blue-400 to-violet-500"
                  />
                ) : null}
                <CardHeader className="relative shrink-0">
                  {p.highlight ? (
                    <div
                      className="mb-4 inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      role="status"
                    >
                      Mest populær
                    </div>
                  ) : null}
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="mt-2 text-3xl font-semibold">{p.price}</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                </CardHeader>
                <CardContent className="relative flex-1 flex flex-col min-h-0">
                  <ul className="mt-2 space-y-3 text-sm text-muted-foreground flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full border border-border/60">
                          <Check className="size-3 text-foreground" aria-hidden />
                        </span>
                        <span className="leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 shrink-0">
                    <Button
                      asChild
                      size="lg"
                      className={cn("w-full rounded-xl", p.highlight && "shadow-md")}
                      variant={p.highlight ? "default" : "outline"}
                    >
                      {p.name === "Enterprise" ? (
                        <Link
                          href={`/#${LANDING_SECTION_IDS.contact}`}
                          className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          aria-label="Snakk med oss – gå til kontaktskjema"
                        >
                          {p.cta.label}
                        </Link>
                      ) : (
                        <AuthAwareLink>{p.cta.label}</AuthAwareLink>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
