"use client";

import Link from "next/link";
import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { Button } from "@workspace/ui/components/button";
import { ChevronRight } from "lucide-react";
import { AnimatedGroup } from "@workspace/ui/components/animated-group";
import { TextEffect } from "@workspace/ui/components/text-effect";

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

export function LandingCtaSection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden py-24 md:py-32"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.08] via-background to-violet-500/[0.07] dark:from-primary/[0.12] dark:via-background dark:to-violet-500/[0.1]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-40 [background:radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(37,99,235,0.15),transparent_55%)] dark:opacity-50"
      />
      <div
        id="cta-heading"
        className="relative mx-auto max-w-4xl rounded-[2rem] border border-border/50 bg-card/85 px-8 py-14 text-center shadow-[0_32px_100px_-48px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:bg-card/60 dark:shadow-[0_32px_100px_-48px_rgba(0,0,0,0.55)] md:px-14 md:py-16"
      >
        <AnimatedGroup variants={transitionVariants}>
          <TextEffect
            preset="fade-in-blur"
            speedSegment={0.3}
            as="h2"
            className="text-balance text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.75rem]"
          >
            Klar til å automatisere kundeservice?
          </TextEffect>
          <TextEffect
            per="line"
            preset="fade-in-blur"
            speedSegment={0.3}
            delay={0.2}
            as="p"
            className="mt-5 text-balance text-lg leading-relaxed text-muted-foreground"
          >
            Start gratis i dag. Ingen kredittkort påkrevd.
          </TextEffect>
        </AnimatedGroup>
        <AnimatedGroup
          variants={transitionVariants}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="h-12 w-full rounded-2xl px-8 shadow-lg shadow-primary/25 sm:w-auto"
          >
            <AuthAwareLink className="inline-flex items-center gap-2">
              <span>Kom i gang gratis</span>
              <ChevronRight className="size-4" aria-hidden />
            </AuthAwareLink>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 w-full rounded-2xl border-border/70 bg-background/80 backdrop-blur-sm sm:w-auto"
          >
            <Link
              href={`/#${LANDING_SECTION_IDS.contact}`}
              aria-label="Book demo – gå til kontaktskjema"
            >
              Book demo
            </Link>
          </Button>
        </AnimatedGroup>
      </div>
    </section>
  );
}
