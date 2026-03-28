import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { MarketingSubpageCta } from "@/modules/landing/ui/components/marketing-subpage-cta";
import { Button, buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { LANDING_AUTH_PATHS, LANDING_MARKETING_EYEBROW_CLASS } from "@/modules/landing/constants";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { Plug, Webhook, Database, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Integrasjoner",
  description:
    "Koble Agenci til nettside, kunnskapskilder og arbeidsflyt. Les om integrasjoner og åpne integrasjonspanel i appen.",
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
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Koble Agenci til deres stack
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Start enkelt på nettsiden, bygg ut med kunnskap og — når dere er klare — bruk
            integrasjonspanelet i appen for å gå dypere.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <AuthAwareLink
              href={LANDING_AUTH_PATHS.signIn}
              loggedInHref="/integrations"
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex items-center gap-2 rounded-2xl border-0 bg-[#2DD4BF] font-semibold text-neutral-950 shadow-[0_14px_36px_-14px_rgba(45,212,191,0.35)] hover:bg-[#2DD4BF]/90",
              )}
            >
              Åpne integrasjoner
              <ArrowRight className="size-4" />
            </AuthAwareLink>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-2xl border-[#2DD4BF]/45 hover:bg-[#2DD4BF]/10"
            >
              <Link href="/#integrations">Se partnerlogoer på forsiden</Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-3xl space-y-6 px-4 md:px-6">
          {items.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex gap-4 rounded-2xl border border-border/60 bg-card/60 p-6 dark:bg-card/40"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#2DD4BF]/12 text-[#0f766e]">
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
