import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { MarketingSubpageCta } from "@/modules/landing/ui/components/marketing-subpage-cta";
import { LANDING_CONTACT_PAGE_PATH, LANDING_MARKETING_EYEBROW_CLASS } from "@/modules/landing/constants";
import { cn } from "@workspace/ui/lib/utils";

export const metadata: Metadata = {
  title: "Vilkår",
  description:
    "Vilkår for bruk av Agenci — tjenestens omfang, ansvar og generelle bruksregler.",
};

export default function VilkarPage() {
  return (
    <MarketingPageLayout>
      <article className="landing-section-mesh border-b border-border/40">
        <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
          <p className={cn("text-sm", LANDING_MARKETING_EYEBROW_CLASS)}>Juridisk</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Vilkår for bruk
          </h1>
          <p className="mt-5 text-sm text-muted-foreground">
            Sist oppdatert: {new Date().toLocaleDateString("no-NO", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="mt-10 space-y-10">
            <section>
            <h2 className="text-xl font-semibold text-foreground">Avtalen</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Bruk av Agenci reguleres av den avtalen dere inngår (ordre, nettskjema eller elektronisk
              aksept), eventuelle tilleggsvilkår for spesifikke moduler, og disse generelle vilkårene
              der de ikke er i strid med avtalen.
            </p>
            </section>

            <section>
            <h2 className="text-xl font-semibold text-foreground">Tjenesten</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Agenci leveres «som den er» med den funksjonalitet som er tilgjengelig i deres plan.
              Vi streber etter høy oppetid, men garanterer ikke uavbrutt tilgang. Planlagt vedlikehold
              varsles når det er praktisk mulig.
            </p>
            </section>

            <section>
            <h2 className="text-xl font-semibold text-foreground">Dere som kunde</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Dere er ansvarlige for innhold dere laster inn, for å ha nødvendige rettigheter til
              materiale som brukes i AI/kunnskapsgrunnlag, og for å følge gjeldende lov (inkl.
              markedsførings- og personvernregler).
            </p>
            </section>

            <section>
            <h2 className="text-xl font-semibold text-foreground">Ansvar</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Indirekte tap, driftstap eller følgeskader begrenses i henhold til avtalen. Ingenting i
              disse vilkårene begrenser rettigheter som ikke kan fravikes etter ufravikelig lov.
            </p>
            </section>

            <section>
            <h2 className="text-xl font-semibold text-foreground">Kontakt</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Spørsmål om vilkår: bruk{" "}
              <Link href={LANDING_CONTACT_PAGE_PATH} className="font-medium text-foreground underline-offset-4 hover:underline">
                kontaktskjemaet
              </Link>
              . Fullstendige avtaler bør tilpasses av juridisk rådgiver før signering.
            </p>
            </section>
          </div>
        </div>
        <MarketingSubpageCta />
      </article>
    </MarketingPageLayout>
  );
}
