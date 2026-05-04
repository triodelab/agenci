"use client";

import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import { LandingContactForm } from "./landing-contact-form";

export function LandingContactSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.contact}
      data-landing-nav-surface="dark"
      className="bg-[#010102]"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-[96px] xl:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.5fr] lg:gap-20 xl:gap-24">

          {/* Left */}
          <div>
            <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.4px] text-[#8a8f98]">
              Kontakt
            </p>
            <h2
              id="contact-heading"
              className="text-[40px] font-semibold leading-[1.15] tracking-[-1px] text-[#f7f8f8] sm:text-[44px]"
            >
              La oss ta en prat
            </h2>
            <p className="mt-5 max-w-sm text-[16px] leading-[1.5] tracking-[-0.05px] text-[#d0d6e0]">
              Demo, pristilbud eller spørsmål om oppsett — vi svarer vanligvis innen én arbeidsdag.
            </p>

            <div className="mt-10 space-y-6">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.4px] text-[#62666d]">
                  E-post
                </p>
                <p className="mt-1.5 text-[14px] text-[#d0d6e0]">hei@agenci.no</p>
              </div>
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.4px] text-[#62666d]">
                  Responstid
                </p>
                <p className="mt-1.5 text-[14px] text-[#d0d6e0]">Innen én arbeidsdag</p>
              </div>
            </div>
          </div>

          {/* Right — form panel (surface-2 lift over canvas) */}
          <div className="rounded-[12px] border border-[#23252a] bg-[#141516] p-8 md:p-10">
            <LandingContactForm variant="dark" />
          </div>
        </div>
      </div>
    </section>
  );
}
