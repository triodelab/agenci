import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { MarketingSignupCtaLink } from "@/modules/landing/ui/components/marketing-signup-cta-link";
import { MarketingSubpageCta } from "@/modules/landing/ui/components/marketing-subpage-cta";
import { Button } from "@workspace/ui/components/button";
import {
  LANDING_MARKETING_EYEBROW_CLASS,
  LANDING_MARKETING_FEATURE_CARD_CLASS,
  LANDING_MARKETING_H1_CLASS,
  LANDING_MARKETING_ICON_TILE_CLASS,
  LANDING_MARKETING_LEAD_CLASS,
  LANDING_MARKETING_OUTLINE_CTA_CLASS,
  LANDING_MARKETING_PRIMARY_CTA_CLASS,
  landingSectionHref,
} from "@/modules/landing/constants";
import { cn } from "@workspace/ui/lib/utils";
import {
  BookOpen,
  Code2,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Produkt",
  description:
    "Agenci: KI-chat på nettsiden som bygger på deres innhold, samtaler og dashboard i én løsning — med menneskelig overtagelse når det trengs.",
};

const bullets = [
  {
    icon: Code2,
    title: "Widget på minutter",
    text: "Én embed-kode. Tilpass utseende, plassering og tema uten å røre koden på nytt.",
  },
  {
    icon: BookOpen,
    title: "Kunnskap som AI forstår",
    text: "FAQ, dokumentasjon og interne rutiner blir søkbare svar — med kontroll på hva som sies.",
  },
  {
    icon: MessageSquare,
    title: "Samtaler samlet",
    text: "Se historikk, eskalér til menneske når det trengs, og hold samme tone på tvers av kanaler.",
  },
  {
    icon: LayoutDashboard,
    title: "Styring i dashboard",
    text: "Innsikt i tema, responstid og volum — slik at dere kan forbedre innhold og kundeopplevelse.",
  },
  {
    icon: Shield,
    title: "Trygghet",
    text: "GDPR-fokus, kryptering i transitt og tydelig eierskap til policy og innhold.",
  },
  {
    icon: Sparkles,
    title: "Voice (Premium)",
    text: "Utvid med tale der det gir mening for merkevaren og kundereisen.",
  },
] as const;

export default function ProduktPage() {
  return (
    <MarketingPageLayout>
      <article className="landing-section-mesh border-b border-border/40">
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-20 md:px-6">
          <p className={cn("text-sm", LANDING_MARKETING_EYEBROW_CLASS)}>Produkt</p>
          <h1 className={cn("mt-3", LANDING_MARKETING_H1_CLASS)}>
            Alt i én løsning: chat på nettsiden, kunnskap og kontroll for teamet
          </h1>
          <p className={cn("mt-5", LANDING_MARKETING_LEAD_CLASS)}>
            Besøkende får svar i chatvinduet. Assistenten bruker det dere har publisert og lastet opp — ikke
            generiske fraser. Alt dere trenger for å følge opp ligger i samme dashboard.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className={LANDING_MARKETING_PRIMARY_CTA_CLASS}>
              <MarketingSignupCtaLink loggedInBehavior="app">Kom i gang</MarketingSignupCtaLink>
            </Button>
            <Button asChild variant="outline" size="lg" className={LANDING_MARKETING_OUTLINE_CTA_CLASS}>
              <Link href={landingSectionHref("product")}>Se oversikt på forsiden</Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-20 md:px-6">
          <ul className="grid gap-6 sm:grid-cols-2">
            {bullets.map(({ icon: Icon, title, text }) => (
              <li key={title} className={LANDING_MARKETING_FEATURE_CARD_CLASS}>
                <div className={LANDING_MARKETING_ICON_TILE_CLASS}>
                  <Icon className="size-5" strokeWidth={2} />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>
        </div>
        <MarketingSubpageCta />
      </article>
    </MarketingPageLayout>
  );
}
