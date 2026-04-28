import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { MarketingSubpageCta } from "@/modules/landing/ui/components/marketing-subpage-cta";
import { Button, buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
  LANDING_AUTH_PATHS,
  LANDING_MARKETING_EYEBROW_CLASS,
  LANDING_MARKETING_FEATURE_CARD_CLASS,
  LANDING_MARKETING_H1_CLASS,
  LANDING_MARKETING_ICON_TILE_CLASS,
  LANDING_MARKETING_LEAD_CLASS,
  LANDING_MARKETING_OUTLINE_CTA_CLASS,
  LANDING_MARKETING_PRIMARY_CTA_CLASS,
  landingSectionHref,
} from "@/modules/landing/constants";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { Plug, Webhook, Database, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Integrasjoner",
  description:
    "Koble Agenci-chatten til nettside, kunnskapskilder og CRM/e-post slik at samtaler og leads havner der teamet jobber.",
};

const items = [
  {
    icon: Plug,
    title: "Widget & nettside",
    text: "Lim inn script-tag eller bruk anbefalt plassering. Fungerer med de fleste CMS og rammeverk.",
  },
  {
    icon: Database,
    title: "Kunnskapskilder",
    text: "Synkroniser eller lim inn innhold fra FAQ, Notion-lignende kilder og interne guider (etter behov i deres oppsett).",
  },
  {
    icon: Webhook,
    title: "Utvidelser i appen",
    text: "I dashboardet finner dere integrasjoner og tilpasninger som teamet kan aktivere steg for steg.",
  },
] as const;

export default function IntegrasjonerMarketingPage() {
  return (
    <MarketingPageLayout>
      <article className="landing-section-mesh border-b border-border/40">
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-20 md:px-6">
          <p className={cn("text-sm", LANDING_MARKETING_EYEBROW_CLASS)}>Integrasjoner</p>
          <h1 className={cn("mt-3", LANDING_MARKETING_H1_CLASS)}>
            La chatten snakke med systemene dere allerede bruker
          </h1>
          <p className={cn("mt-5", LANDING_MARKETING_LEAD_CLASS)}>
            Start med widget og kunnskap på nettsiden. Når dere er klare, kobler dere Agenci til CRM,
            e-post og andre verktøy via integrasjonspanelet i appen — uten at hver samtale blir en manuell
            copy-paste-jobb.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <AuthAwareLink
              href={LANDING_AUTH_PATHS.signIn}
              loggedInHref="/integrations"
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex items-center gap-2 border-0",
                LANDING_MARKETING_PRIMARY_CTA_CLASS,
              )}
            >
              Åpne integrasjoner
              <ArrowRight className="size-4" />
            </AuthAwareLink>
            <Button asChild variant="outline" size="lg" className={LANDING_MARKETING_OUTLINE_CTA_CLASS}>
              <Link href={landingSectionHref("integrations")}>
                Se partnerlogoer på forsiden
              </Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-3xl space-y-6 px-4 md:px-6">
          {items.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className={cn("flex items-start gap-4 md:gap-5", LANDING_MARKETING_FEATURE_CARD_CLASS)}
            >
              <div className={cn(LANDING_MARKETING_ICON_TILE_CLASS, "size-11")}>
                <Icon className="size-5" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <MarketingSubpageCta />
      </article>
    </MarketingPageLayout>
  );
}
