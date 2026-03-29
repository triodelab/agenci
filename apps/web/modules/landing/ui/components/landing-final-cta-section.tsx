"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
  LANDING_ACCENT_CTA_BG,
  LANDING_AUTH_PATHS,
  LANDING_SECTION_IDS,
  landingSectionHref,
} from "@/modules/landing/constants";

const ctaStyle = { backgroundColor: LANDING_ACCENT_CTA_BG } as const;

export function LandingFinalCtaSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.finalCta}
      data-landing-nav-surface="dark"
      className="relative scroll-mt-24 overflow-hidden border-t border-white/10 bg-zinc-950 py-20 md:py-28"
      aria-labelledby="final-cta-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-30%,rgba(45,212,191,0.12),transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-[min(50vh,420px)] w-[min(120vw,900px)] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.06),transparent_65%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl px-5 text-center md:px-10">
        <h2
          id="final-cta-heading"
          className="text-balance text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl md:text-[2.15rem] md:leading-[1.15]"
        >
          Klar for en roligere kundereise?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-zinc-400 md:text-lg">
          Book en kort gjennomgang, eller opprett konto og utforsk i eget tempo — vi er her når dere vil
          sparre.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            size="lg"
            className="h-12 min-w-[11rem] rounded-full px-8 text-[15px] font-semibold text-neutral-950 shadow-[0_0_40px_-12px_rgba(45,212,191,0.35)]"
            style={ctaStyle}
            asChild
          >
            <Link href={landingSectionHref("contact")}>Book en demo</Link>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="h-12 rounded-full px-8 text-[15px] font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white"
            asChild
          >
            <AuthAwareLink href={LANDING_AUTH_PATHS.signUp} loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}>
              Opprett konto
            </AuthAwareLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
