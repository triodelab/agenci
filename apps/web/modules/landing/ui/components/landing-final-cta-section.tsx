"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
  LANDING_AUTH_PATHS,
  LANDING_SECTION_IDS,
  landingSectionHref,
} from "@/modules/landing/constants";

export function LandingFinalCtaSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.finalCta}
      data-landing-nav-surface="dark"
      className="border-t border-[#1a1a1a] bg-black px-6 py-20 md:py-28 xl:px-8"
      aria-labelledby="final-cta-heading"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* CTA panel */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] px-8 py-16 md:px-16 md:py-20">
          <p className="mb-5 font-mono text-[11px] tracking-[0.2em] text-[#333]">KOM I GANG</p>
          <h2
            id="final-cta-heading"
            className="max-w-3xl text-[2rem] font-semibold leading-[1.06] tracking-[-0.055em] text-[#f0eeeb] sm:text-[2.6rem] md:text-[3.2rem]"
          >
            Prøv det gratis — se selv om det funker for deg
          </h2>
          <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-[#555]">
            Opprett konto og ha widgeten live på nettsiden din i dag. Ingen kortinfo, ingen binding.
            Ser du ikke verdien innen 14 dager, koster det deg ingenting.
          </p>
          <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button
              className="h-9 rounded-full bg-white px-6 text-[13px] font-medium text-black hover:bg-white/90"
              asChild
            >
              <AuthAwareLink href={LANDING_AUTH_PATHS.signUp} loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}>
                Start gratis i dag
              </AuthAwareLink>
            </Button>
            <Button
              variant="ghost"
              className="h-9 rounded-full px-6 text-[13px] font-medium text-[#555] hover:bg-white/[0.05] hover:text-[#888]"
              asChild
            >
              <Link href={landingSectionHref("contact")}>Book en demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
