"use client";

import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import { LandingContactForm } from "./landing-contact-form";

export function LandingContactSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.contact}
      data-landing-nav-surface="dark"
      className="relative scroll-mt-24 overflow-hidden border-t border-white/[0.07] bg-[#050507] py-20 md:py-28"
      aria-labelledby="contact-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(45,212,191,0.07),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-[min(40vh,420px)] w-[min(100vw,720px)] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.05),transparent_68%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-2xl px-4 md:px-6">
        <h2
          id="contact-heading"
          className="text-balance text-center text-2xl font-semibold tracking-tight text-white md:text-3xl"
        >
          Kontakt oss
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-[15px] leading-relaxed text-zinc-400 md:text-base">
          Book en demo, spør om pris eller send en kort melding — vi svarer vanligvis innen én
          arbeidsdag.
        </p>
        <LandingContactForm variant="dark" className="mt-10" />
      </div>
    </section>
  );
}
