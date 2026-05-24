import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { MarketingSubpageCta } from "@/modules/landing/ui/components/marketing-subpage-cta";
import { LANDING_CONTACT_PAGE_PATH } from "@/modules/landing/constants";

const accentLink =
  "text-[#9ca3af] underline-offset-2 decoration-[#9ca3af]/30 hover:text-[#f2f3f5] hover:underline transition-colors";

const updated = new Date("2026-03-27");

const COMPANY_LEGAL_LINE =
  process.env.NEXT_PUBLIC_COMPANY_LEGAL_LINE ??
  "Hassan Triodelab DA, org.nr. 835 796 892, Gildevangen 16 B, 0585 Oslo";

export const metadata: Metadata = {
  title: "Vilkår for bruk",
  description:
    "Generelle vilkår for bruk av Agenci — konto, tjeneste, betaling, ansvar og oppsigelse.",
  alternates: { canonical: "/vilkar" },
  robots: { index: true, follow: true },
};

const toc = [
  { id: "innledning", label: "Innledning og aksept" },
  { id: "definisjoner", label: "Definisjoner" },
  { id: "tjenesten", label: "Tjenesten" },
  { id: "konto", label: "Konto, tilgang og sikkerhet" },
  { id: "abonnement", label: "Abonnement, priser og betaling" },
  { id: "kundedata", label: "Kundens innhold og data" },
  { id: "akseptabel-bruk", label: "Akseptabel bruk" },
  { id: "integrasjoner", label: "Integrasjoner og tredjeparter" },
  { id: "ip", label: "Immaterielle rettigheter" },
  { id: "tilgjengelighet", label: "Tilgjengelighet og endringer" },
  { id: "ai", label: "Kunstig intelligens og automatiserte svar" },
  { id: "ansvar", label: "Ansvar og ansvarsbegrensning" },
  { id: "skadeslos", label: "Erstatning og skadesløsholdelse" },
  { id: "opphor", label: "Opphør, suspensjon og sletting" },
  { id: "tvist", label: "Lovvalg, tvister og verneting" },
  { id: "ovrige", label: "Øvrige bestemmelser" },
  { id: "kontakt", label: "Kontakt" },
] as const;

export default function VilkarPage() {
  return (
    <MarketingPageLayout>
      <div className="bg-[#1C1C1C]">
        <div className="mx-auto max-w-[720px] px-6 py-20 md:py-24 xl:px-8">

          {/* Header */}
          <header className="border-b border-[#2a2a2a] pb-10">
            <p className="text-[13px] font-medium uppercase tracking-[0.4px] text-[#4b5563]">
              Juridisk
            </p>
            <h1 className="mt-5 text-[40px] font-semibold leading-[1.15] tracking-[-1px] text-[#f2f3f5]">
              Vilkår for bruk
            </h1>
            <p className="mt-4 text-[15px] leading-[1.5] text-[#9ca3af]">
              Gjelder bruk av Agenci-plattformen, nettsider og relaterte tjenester levert av{" "}
              {COMPANY_LEGAL_LINE.split("—")[0]?.trim() ?? "Agenci"}.
            </p>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[13px] text-[#4b5563]">
              <div>
                <dt className="sr-only">Sist oppdatert</dt>
                <dd>
                  Sist oppdatert:{" "}
                  {updated.toLocaleDateString("no-NO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
              <div>
                <dt className="sr-only">Versjon</dt>
                <dd>Versjon: 2.0</dd>
              </div>
            </dl>
          </header>

          {/* TOC */}
          <nav
            aria-label="Innhold i vilkårene"
            className="my-10 rounded-[12px] border border-[#2a2a2a] bg-[#161616] p-6"
          >
            <p className="text-[12px] font-medium uppercase tracking-[0.4px] text-[#4b5563]">
              Innhold
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14px] leading-[1.5] text-[#9ca3af] marker:font-medium marker:text-[#6b7280]">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="transition-colors hover:text-[#f7f8f8]">
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Body */}
          <div className="space-y-14">
            <LegalSection id="innledning" title="1. Innledning og aksept">
              <p>
                Disse vilkårene («Vilkårene») utgjør en bindende avtale mellom deg som bruker eller
                representant for en organisasjon («Kunden», «dere») og leverandør av Agenci («vi», «oss»).
              </p>
              <p>
                Ved å opprette konto, bruke tjenesten eller fortsette å bruke Agenci etter at endrede
                vilkår er publisert, bekrefter dere at dere har lest, forstått og akseptert Vilkårene.
                Hvis dere ikke aksepterer Vilkårene, skal dere ikke bruke tjenesten.
              </p>
              <p>
                Vår behandling av personopplysninger er beskrevet i{" "}
                <Link href="/personvern" className={accentLink}>
                  personvernerklæringen
                </Link>
                .
              </p>
            </LegalSection>

            <LegalSection id="definisjoner" title="2. Definisjoner">
              <ul className="space-y-2">
                <ListItem label="«Tjenesten»">
                  Agenci sin skybaserte plattform, herunder nettsider, dashboard, chat-widget, API-er og tilhørende funksjonalitet slik den tilbys i deres abonnement eller pilot.
                </ListItem>
                <ListItem label="«Kundedata»">
                  Innhold, meldinger, filer, kunnskapsgrunnlag, innstillinger og annet materiale som dere laster opp, genererer eller på annen måte tilfører Tjenesten.
                </ListItem>
                <ListItem label="«Brukere»">
                  Personer dere gir tilgang til Kundens konto (f.eks. administratorer og kundeservice).
                </ListItem>
              </ul>
            </LegalSection>

            <LegalSection id="tjenesten" title="3. Tjenesten">
              <p>
                Vi leverer Tjenesten som et verktøy for kundeservice, kunnskapsstyring og tilknyttede
                arbeidsflyter. Funksjonalitet, grenser og tilgjengelige integrasjoner kan variere med
                plan, region og løpende produktutvikling.
              </p>
              <p>
                Vi kan oppdatere, utvide eller begrense deler av Tjenesten for å ivareta sikkerhet,
                lovkrav eller drift, så lenge det ikke vesentlig svekker avtalt kjernefunksjonalitet
                uten saklig grunn.
              </p>
            </LegalSection>

            <LegalSection id="konto" title="4. Konto, tilgang og sikkerhet">
              <p>
                Dere er ansvarlige for at opplysninger ved registrering er riktige, og for å holde
                passord, API-nøkler og tilsvarende konfidensielt. All aktivitet som skjer via deres
                konto tillegges Kunden med mindre dere uten ugrunnet opphold dokumenterer misbruk.
              </p>
              <p>
                Dere skal sørge for at Brukere som inviteres har nødvendig kompetanse og at tilganger
                tilpasses rollen (least privilege). Ved mistanke om uautorisert tilgang skal dere
                varsle oss og endre legitimasjon.
              </p>
            </LegalSection>

            <LegalSection id="abonnement" title="5. Abonnement, priser og betaling">
              <p>
                Priser, faktureringsfrekvens og betalingsmåte fremgår av valgt plan, bestillingsflyt
                eller tilbud. Med mindre annet er avtalt, kan priser justeres med skriftlig varsel
                minst 30 dager før endringen trer i kraft for eksisterende kunder.
              </p>
              <p>
                Ved forsinket betaling kan vi etter påminnelse begrense tilgang eller stanse Tjenesten
                til utestående er gjort opp, uten at det fritar for betalingsplikten for perioden.
              </p>
            </LegalSection>

            <LegalSection id="kundedata" title="6. Kundens innhold og data">
              <p>
                Kunden beholder eierskap og immaterielle rettigheter til Kundedata. Kunden gir oss en
                begrenset, ikke-eksklusiv lisens til å drifte, lagre, sikkerhetskopiere og prosessere
                Kundedata kun for å levere og forbedre Tjenesten i samsvar med avtalen og gjeldende lov.
              </p>
              <p>
                Kunden er alene ansvarlig for at Kundedata ikke krenker tredjeparts rettigheter, og at
                bruk i AI, widget og kunnskapsbase er i samsvar med gjeldende lovgivning.
              </p>
            </LegalSection>

            <LegalSection id="akseptabel-bruk" title="7. Akseptabel bruk">
              <p>Dere skal ikke:</p>
              <ul className="mt-2 space-y-2">
                <ListItem label="">
                  bruke Tjenesten til ulovlige formål, krenkende innhold, spam, svindel eller systematisk overbelastning av infrastruktur;
                </ListItem>
                <ListItem label="">
                  omgå tekniske begrensninger, lisensvilkår eller sikkerhetstiltak, eller forsøke uautorisert tilgang til data som ikke tilhører Kunden;
                </ListItem>
                <ListItem label="">
                  reverse-engineere Tjenesten eller fjerne merknader om opphavsrett, unntatt i den grad ufravikelig lov tillater det.
                </ListItem>
              </ul>
            </LegalSection>

            <LegalSection id="integrasjoner" title="8. Integrasjoner og tredjeparter">
              <p>
                Tjenesten kan koble til eller vise innhold fra tredjeparter (f.eks. autentisering,
                betaling, stemmeleverandører). Slike tjenester reguleres av tredjepartens vilkår og
                personvern. Vi er ikke ansvarlige for tredjeparts tilgjengelighet, priser eller innhold.
              </p>
            </LegalSection>

            <LegalSection id="ip" title="9. Immaterielle rettigheter">
              <p>
                Agenci, merkevarer, grensesnitt, dokumentasjon og underliggende programvare som vi
                leverer, tilhører oss eller våre lisensgivere. Kunden får en tidsbegrenset,
                ikke-eksklusiv rett til å bruke Tjenesten i samsvar med Vilkårene.
              </p>
              <p>
                Tilbakemeldinger eller forslag dere frivillig gir om produktet kan brukes av oss uten
                vederlag eller taushetsplikt, med mindre annet er skriftlig avtalt.
              </p>
            </LegalSection>

            <LegalSection id="tilgjengelighet" title="10. Tilgjengelighet og endringer">
              <p>
                Vi tilstreber høy oppetid, men garanterer ikke uavbrutt eller feilfri drift. Planlagt
                vedlikehold varsles når det er praktisk mulig. Midlertidige avvik kan forekomme ved
                force majeure, leverandørfeil eller sikkerhetshendelser.
              </p>
            </LegalSection>

            <LegalSection id="ai" title="11. Kunstig intelligens og automatiserte svar">
              <p>
                Funksjoner som bygger på språkmodeller eller annen KI kan gi unøyaktige, ufullstendige
                eller upassende forslag. Kunden er ansvarlig for kvalitetssikring og menneskelig kontroll
                der det kreves av lov eller egen policy.
              </p>
            </LegalSection>

            <LegalSection id="ansvar" title="12. Ansvar og ansvarsbegrensning">
              <p>
                I den grad loven tillater det, er vårt samlede ansvar overfor Kunden begrenset til det
                Kunden har betalt oss for Tjenesten i de siste tolv (12) månedene før kravet oppstod.
                Vi er ikke ansvarlige for indirekte tap, tapt fortjeneste, goodwill, driftstap eller
                følgeskader, med mindre ufravikelig lov tilsier noe annet.
              </p>
            </LegalSection>

            <LegalSection id="skadeslos" title="13. Erstatning og skadesløsholdelse">
              <p>
                Kunden skal holde oss skadesløse for krav fra tredjepart som skyldes Kundedata,
                Kundens bruk i strid med Vilkårene, eller Kundens manglende overholdelse av lov, så
                fremt kravet ikke skyldes vår grovt uaktsomme eller forsettlige handling.
              </p>
            </LegalSection>

            <LegalSection id="opphor" title="14. Opphør, suspensjon og sletting">
              <p>
                Begge parter kan si opp avtalen i samsvar med valgt bindingsperiode og oppsigelsesfrist.
                Vi kan suspendere eller avslutte tilgang ved vesentlig mislighold, betalingsmislighold
                etter påminnelse, eller ved sikkerhetsmessig nødvendighet.
              </p>
              <p>
                Ved opphør opphører retten til å bruke Tjenesten. Bestemmelser som naturlig skal
                overleve (f.eks. ansvarsbegrensning, lovvalg, immaterielle rettigheter) gjelder videre.
              </p>
            </LegalSection>

            <LegalSection id="tvist" title="15. Lovvalg, tvister og verneting">
              <p>
                Vilkårene reguleres av norsk lov. Tvister skal søkes løst i minnelighet. Dersom det ikke
                lykkes innen rimelig tid, kan hver part bringe saken inn for norske domstoler med
                verneting i saksøktes verneting etter norsk prosessrett.
              </p>
            </LegalSection>

            <LegalSection id="ovrige" title="16. Øvrige bestemmelser">
              <p>
                Hele avtalen utgjøres av Vilkårene sammen med eventuell kundeavtale og tillegg. Hvis en
                bestemmelse er ugyldig, skal øvrige bestemmelser fortsatt gjelde i størst mulig grad.
              </p>
              <p>
                Vi kan endre Vilkårene. Vesentlige endringer varsles på e-post eller i produktet med
                rimelig frist. Fortsatt bruk etter ikrafttredelse utgjør aksept.
              </p>
            </LegalSection>

            <LegalSection id="kontakt" title="17. Kontakt">
              <p>
                Juridiske og avtalemessige henvendelser rettes til{" "}
                <a href="mailto:post@triodelab.no" className={accentLink}>
                  post@triodelab.no
                </a>{" "}
                eller via{" "}
                <Link href={LANDING_CONTACT_PAGE_PATH} className={accentLink}>
                  kontaktsiden
                </Link>
                . For personvern, se{" "}
                <Link href="/personvern" className={accentLink}>
                  personvernerklæringen
                </Link>
                .
              </p>
              <p className="text-[13px] text-[#6b7280]">
                Leverandør: {COMPANY_LEGAL_LINE}
              </p>
            </LegalSection>
          </div>

        </div>

        <MarketingSubpageCta />
      </div>
    </MarketingPageLayout>
  );
}

function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-[18px] font-semibold leading-[1.25] tracking-[-0.4px] text-[#f2f3f5]">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-[1.65] text-[#9ca3af]">{children}</div>
    </section>
  );
}

function ListItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[14px] leading-[1.6] text-[#9ca3af]">
      <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7280]" />
      <span>
        {label && <span className="font-medium text-[#f2f3f5]">{label}: </span>}
        {children}
      </span>
    </li>
  );
}
