import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { Button } from "@workspace/ui/components/button";
import { LANDING_AUTH_PATHS } from "@/modules/landing/constants";

export const metadata: Metadata = {
  title: "Slik fungerer det",
  description:
    "Tre steg: installer widget, koble kunnskap, styr i dashboard. Slik kommer Agenci på luften.",
};

const steps = [
  {
    n: "01",
    title: "Installer widget",
    body: "Legg inn én kodesnutt på nettsiden. Widgeten blir tilgjengelig der dere vil ha den — vanligvis hjørnet eller en dedikert knapp.",
  },
  {
    n: "02",
    title: "Koble kunnskap",
    body: "Importer eller lim inn FAQ, retningslinjer og produkttekster. Agenci bruker dette som grunnlag for svar innenfor rammene dere setter.",
  },
  {
    n: "03",
    title: "Styr og forbedre",
    body: "Følg med på samtaler, juster tone og innhold, og eskalér til teamet når en sak krever menneske.",
  },
] as const;

export default function HvordanDetVirkerPage() {
  return (
    <MarketingPageLayout>
      <article className="landing-section-mesh border-b border-border/40">
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-20 md:px-6">
          <p className="text-sm font-medium text-primary">Slik fungerer det</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Fra idé til live på kort tid
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Agenci er laget for team som vil ha resultater uten tunge prosjekter. Her er flyten, steg
            for steg.
          </p>
        </div>
        <div className="mx-auto max-w-2xl space-y-6 px-4 pb-16 md:px-6">
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative rounded-2xl border border-border/60 bg-card/70 p-6 pl-14 dark:bg-card/40"
            >
              <span className="absolute left-5 top-6 text-xs font-bold tabular-nums text-primary">
                {s.n}
              </span>
              <h2 className="text-lg font-semibold text-foreground">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-20 text-center md:px-6">
          <Button asChild size="lg" className="rounded-2xl">
            <Link href={LANDING_AUTH_PATHS.signUp}>Opprett konto</Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Eller gå tilbake til{" "}
            <Link href="/#how-it-works" className="font-medium text-foreground underline-offset-4 hover:underline">
              den interaktive oversikten på forsiden
            </Link>
            .
          </p>
        </div>
      </article>
    </MarketingPageLayout>
  );
}
