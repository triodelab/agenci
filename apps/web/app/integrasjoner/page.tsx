import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { MarketingSubpageCta } from "@/modules/landing/ui/components/marketing-subpage-cta";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { LANDING_AUTH_PATHS, landingSectionHref } from "@/modules/landing/constants";
import { Plug, Webhook, Database, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Integrasjoner",
  description:
    "Koble Agenci til nettsiden din, kunnskapskilder og teamverktøy. Fungerer med WordPress, Webflow, Framer og de fleste CMS.",
  alternates: { canonical: "/integrasjoner" },
};

const items = [
  {
    icon: Plug,
    title: "Widget & nettside",
    text: "Lim inn script-tag eller bruk anbefalt plassering. Fungerer med de fleste CMS og rammeverk — WordPress, Webflow, Framer, egenutviklet.",
  },
  {
    icon: Database,
    title: "Kunnskapskilder",
    text: "Synkroniser eller lim inn innhold fra FAQ, Notion-lignende kilder og interne guider. AI-en svarer kun på det dere setter inn — ingen gjetting.",
  },
  {
    icon: Webhook,
    title: "Utvidelser i appen",
    text: "I dashboardet finner dere integrasjoner og tilpasninger teamet kan aktivere steg for steg — uten bistand fra utvikler.",
  },
] as const;

export default function IntegrasjonerMarketingPage() {
  return (
    <MarketingPageLayout>
      {/* Hero */}
      <section className="bg-[#1C1C1C]">
        <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-24 xl:px-8">
          <p className="text-[13px] font-medium uppercase tracking-[0.4px] text-[#6b7280]">
            Integrasjoner
          </p>
          <h1 className="mt-5 max-w-2xl text-[40px] font-semibold leading-[1.15] tracking-[-1px] text-[#f2f3f5] sm:text-[44px]">
            La chatten snakke med systemene dere allerede bruker
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-[1.65] text-[#9ca3af]">
            Start med widget og kunnskap på nettsiden. Når dere er klare, kobler dere Agenci til
            CRM, e-post og andre verktøy via integrasjonspanelet — uten at hver samtale blir en
            manuell copy-paste-jobb.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <AuthAwareLink
              href={LANDING_AUTH_PATHS.signIn}
              loggedInHref="/integrations"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-5 text-[14px] font-semibold text-[#1C1C1C] shadow-[0_4px_24px_-4px_rgba(255,255,255,0.2)] transition-colors hover:bg-[#f2f3f5]"
            >
              Åpne integrasjoner
              <ArrowRight className="size-4" />
            </AuthAwareLink>
            <Link
              href={landingSectionHref("integrations")}
              className="inline-flex h-10 items-center rounded-lg border border-[#2a2a2a] bg-transparent px-5 text-[14px] font-medium text-[#9ca3af] transition-colors hover:border-[#3a3a3a] hover:text-[#f2f3f5]"
            >
              Se partnerlogoer på forsiden
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="border-t border-[#2a2a2a] bg-[#1C1C1C]">
        <div className="mx-auto max-w-[1200px] space-y-4 px-6 py-16 md:py-20 xl:px-8">
          {items.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex items-start gap-5 rounded-[12px] border border-[#2a2a2a] bg-[#161616] p-6 transition-[border-color] duration-200 hover:border-[#3a3a3a]"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-[#9ca3af]">
                <Icon className="size-5" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-[17px] font-semibold tracking-[-0.025em] text-[#f2f3f5]">
                  {title}
                </h2>
                <p className="mt-2 text-[14px] leading-[1.65] text-[#6b7280]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <MarketingSubpageCta />
    </MarketingPageLayout>
  );
}
