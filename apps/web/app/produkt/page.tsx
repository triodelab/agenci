import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { MarketingSignupCtaLink } from "@/modules/landing/ui/components/marketing-signup-cta-link";
import { MarketingSubpageCta } from "@/modules/landing/ui/components/marketing-subpage-cta";
import { Button } from "@workspace/ui/components/button";
import {
  LANDING_MARKETING_EYEBROW_CLASS,
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
    "Agenci: AI-widget på nettsiden, kunnskapsbase, samtaler og dashboard — bygget for norsk kundeservice.",
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
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Alt dere trenger for AI-drevet kundeservice
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Agenci kobler nettsiden deres med en assistent som svarer presist, følger retningslinjene
            deres, og gir teamet full oversikt — uten at kunden merker friksjon.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-2xl bg-[#2DD4BF] font-semibold text-neutral-950 shadow-[0_14px_36px_-14px_rgba(45,212,191,0.35)] hover:bg-[#2DD4BF]/90"
            >
              <MarketingSignupCtaLink loggedInBehavior="app">Kom i gang</MarketingSignupCtaLink>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-2xl border-[#2DD4BF]/45 hover:bg-[#2DD4BF]/10"
            >
              <Link href={landingSectionHref("product")}>Se oversikt på forsiden</Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-20 md:px-6">
          <ul className="grid gap-6 sm:grid-cols-2">
            {bullets.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-sm dark:bg-card/40"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#2DD4BF]/12 text-[#0f766e]">
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
