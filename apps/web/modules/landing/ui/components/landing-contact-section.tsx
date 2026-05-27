"use client";

import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import { LandingContactForm } from "./landing-contact-form";

export function LandingContactSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.contact}
      data-landing-nav-surface="dark"
      className="border-t border-[#2a2a2a] bg-[#1C1C1C]"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32 xl:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.5fr] lg:gap-20 xl:gap-24">

          {/* Left */}
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
              Kontakt
            </p>
            <h2
              id="contact-heading"
              className="text-[2rem] font-bold leading-[1.07] tracking-[-0.038em] text-[#f2f3f5] sm:text-[2.6rem] md:text-[3.2rem]"
            >
              La oss ta en prat
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-[1.7] text-[#6b7280]">
              Demo, pristilbud eller spørsmål om oppsett — vi svarer vanligvis innen én arbeidsdag.
            </p>

            <div className="mt-10 space-y-6 border-t border-[#2a2a2a] pt-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3d4149]">
                  E-post
                </p>
                <p className="mt-2 text-[14px] text-[#9ca3af]">hei@agenci.no</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3d4149]">
                  Responstid
                </p>
                <p className="mt-2 text-[14px] text-[#9ca3af]">Innen én arbeidsdag</p>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="rounded-[12px] border border-[#2a2a2a] bg-[#161616] p-8 md:p-10">
            <LandingContactForm variant="dark" />
          </div>
        </div>
      </div>
    </section>
  );
}
