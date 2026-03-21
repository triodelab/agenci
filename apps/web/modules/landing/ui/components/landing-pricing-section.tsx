"use client";

import {
  LANDING_AUTH_PATHS,
  LANDING_SECTION_IDS,
} from "@/modules/landing/constants";
import { LandingGradientText } from "@/modules/landing/ui/components/landing-gradient-text";
import { LandingSectionHeader } from "@/modules/landing/ui/components/landing-section-header";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { motion, useReducedMotion } from "motion/react";

const plans = [
  {
    name: "Starter",
    price: "Gratis",
    description: "Test Agenci på ekte trafikk uten risiko.",
    features: [
      "Widget på nettsiden",
      "Grunnleggende svar og oppsett",
      "Kom i gang på minutter",
    ],
    cta: { label: "Start gratis", href: LANDING_AUTH_PATHS.signIn },
    highlight: false,
  },
  {
    name: "Pro",
    price: "Kontakt oss",
    description: "For team som vil kutte kø, øke konvertering og eie dialogen.",
    features: [
      "Alt i Starter",
      "Innboks og human takeover",
      "KPI og samtaleinnsikt",
      "Innholdskontroll og branding",
    ],
    cta: { label: "Snakk med oss", href: LANDING_AUTH_PATHS.signIn },
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Tilpasset",
    description: "Sikkerhet, avtaler og skreddersøm for større organisasjoner.",
    features: [
      "Alt i Pro",
      "Voice (Premium)",
      "Compliance og sikkerhetskrav",
      "Integrasjoner og API",
    ],
    cta: { label: "Book samtale", href: LANDING_AUTH_PATHS.signIn },
    highlight: false,
  },
] as const;

export function LandingPricingSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id={LANDING_SECTION_IDS.pricing}
      aria-labelledby="pricing-heading"
      className="relative scroll-mt-24 overflow-hidden border-b border-border/40 bg-background py-20 md:py-28"
    >
      <div
        aria-hidden
        className="landing-section-mesh pointer-events-none absolute inset-0 -z-10 opacity-50"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(125%_125%_at_50%_0%,transparent_0%,var(--color-background)_78%)]"
      />

      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <LandingSectionHeader
          eyebrow="Priser"
          titleId="pricing-heading"
          title={
            <>
              Planer som vokser med <LandingGradientText>behovet</LandingGradientText>
            </>
          }
          description="Start enkelt. Oppgrader når dere ser effekt. Voice og enterprise er for team som vil helt ut."
        />

        <div className="mt-14 grid gap-6 md:mt-16 md:grid-cols-3 md:items-stretch [&>*]:h-full">
          {plans.map((p, index) => (
            <motion.div
              key={p.name}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: index * 0.07 }}
              className={cn("h-full", p.highlight && "md:-translate-y-1")}
            >
              <Card
                className={cn(
                  "flex h-full flex-col overflow-hidden border-border/55 bg-card/95 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.14)] transition-shadow duration-300 dark:shadow-[0_24px_70px_-40px_rgba(0,0,0,0.35)]",
                  p.highlight &&
                    "border-primary/30 shadow-[0_32px_80px_-36px_rgba(37,99,235,0.22)] ring-1 ring-primary/15 dark:shadow-[0_32px_80px_-36px_rgba(37,99,235,0.18)]",
                )}
              >
                {p.highlight ? (
                  <div
                    aria-hidden
                    className="h-1 w-full bg-gradient-to-r from-primary via-sky-500 to-violet-500"
                  />
                ) : null}
                <CardHeader className="relative shrink-0 pb-2">
                  {p.highlight ? (
                    <span
                      className="mb-3 inline-flex w-fit rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      role="status"
                    >
                      Anbefalt for vekst
                    </span>
                  ) : null}
                  <p className="text-sm font-semibold text-muted-foreground">{p.name}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{p.price}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col pt-2">
                  <ul className="flex-1 space-y-3 text-sm text-muted-foreground">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-3">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background">
                          <Check className="size-3 text-primary" aria-hidden />
                        </span>
                        <span className="leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Button
                      asChild
                      size="lg"
                      className={cn(
                        "w-full rounded-xl",
                        p.highlight &&
                          "shadow-[0_12px_32px_-8px_color-mix(in_oklab,var(--primary)_40%,transparent)]",
                        !p.highlight &&
                          "border-primary/20 bg-background hover:border-primary/35 hover:bg-primary/[0.06]",
                      )}
                      variant={p.highlight ? "default" : "outline"}
                    >
                      {p.name === "Enterprise" ? (
                        <Link
                          href={`/#${LANDING_SECTION_IDS.contact}`}
                          className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          aria-label="Book samtale – gå til kontaktskjema"
                        >
                          {p.cta.label}
                        </Link>
                      ) : (
                        <AuthAwareLink
                          href={p.cta.href}
                          loggedInHref={LANDING_AUTH_PATHS.appHome}
                        >
                          {p.cta.label}
                        </AuthAwareLink>
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
