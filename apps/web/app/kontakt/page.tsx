import type { Metadata } from "next";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { LandingContactForm } from "@/modules/landing/ui/components/landing-contact-form";
import { MarketingSubpageCta } from "@/modules/landing/ui/components/marketing-subpage-cta";

export const metadata: Metadata = {
  title: "Kontakt oss",
  description:
    "Book en demo, spør om pris eller send oss en melding. Vi svarer innen én arbeidsdag.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <MarketingPageLayout>
      {/* Hero */}
      <section className="bg-[#1C1C1C]">
        <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-24 xl:px-8">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.5fr] lg:gap-20 xl:gap-24">

            {/* Left — intro */}
            <div className="flex flex-col justify-center">
              <p className="text-[13px] font-medium uppercase tracking-[0.4px] text-[#6b7280]">
                Kontakt
              </p>
              <h1 className="mt-5 text-[40px] font-semibold leading-[1.15] tracking-[-1px] text-[#f2f3f5] sm:text-[44px]">
                Snakk med oss
              </h1>
              <p className="mt-5 text-[16px] leading-[1.5] tracking-[-0.05px] text-[#9ca3af]">
                Demo, pristilbud eller spørsmål om oppsett — vi svarer vanligvis innen én arbeidsdag.
              </p>

              <div className="mt-10 space-y-6">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.4px] text-[#4b5563]">
                    E-post
                  </p>
                  <p className="mt-1.5 text-[14px] text-[#9ca3af]">hei@agenci.no</p>
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.4px] text-[#4b5563]">
                    Responstid
                  </p>
                  <p className="mt-1.5 text-[14px] text-[#9ca3af]">Innen én arbeidsdag</p>
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

      <MarketingSubpageCta omitContactButton />
    </MarketingPageLayout>
  );
}
