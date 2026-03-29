import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { MarketingSubpageCta } from "@/modules/landing/ui/components/marketing-subpage-cta";
import { LANDING_CONTACT_PAGE_PATH } from "@/modules/landing/constants";

const accentLink =
  "font-medium text-foreground underline decoration-[#2DD4BF]/45 underline-offset-2 hover:text-[#0f766e] hover:decoration-[#2DD4BF]";

const updated = new Date("2026-03-27");

const COMPANY_LEGAL_LINE =
  process.env.NEXT_PUBLIC_COMPANY_LEGAL_LINE ??
  "Agenci — [sett inn fullt selskapsnavn, organisasjonsnummer og forretningsadresse]";

export const metadata: Metadata = {
  title: "Vilkår for bruk",
  description:
    "Generelle vilkår for bruk av Agenci — konto, tjeneste, betaling, ansvar og oppsigelse.",
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
      <article className="border-b border-border/40 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-16 lg:py-20">
          <header className="border-b border-border/50 pb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Juridisk
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-[2rem] md:leading-tight">
              Vilkår for bruk
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Gjelder bruk av Agenci-plattformen, nettsider og relaterte tjenester levert av{" "}
              {COMPANY_LEGAL_LINE.split("—")[0]?.trim() ?? "Agenci"}.
            </p>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <div>
                <dt className="sr-only">Sist oppdatert</dt>
                <dd>
                  <span className="font-medium text-foreground">Sist oppdatert:</span>{" "}
                  {updated.toLocaleDateString("no-NO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
              <div>
                <dt className="sr-only">Versjon</dt>
                <dd>
                  <span className="font-medium text-foreground">Versjon:</span> 2.0
                </dd>
              </div>
            </dl>
          </header>

          <nav
            aria-label="Innhold i vilkårene"
            className="my-10 rounded-2xl border border-[#2DD4BF]/20 bg-card/90 p-5 shadow-sm ring-1 ring-[#2DD4BF]/10 backdrop-blur-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0f766e]">Innhold</p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] leading-snug text-foreground marker:font-semibold marker:text-[#2DD4BF]">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-[15px] text-foreground underline-offset-2 hover:text-[#0f766e] hover:underline"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="space-y-14 text-[15px] leading-relaxed text-muted-foreground">
            <LegalSection id="innledning" title="1. Innledning og aksept">
              <p>
                Disse vilkårene («Vilkårene») utgjør en bindende avtale mellom deg som bruker eller
                representant for en organisasjon («Kunden», «dere») og leverandør av Agenci
                («vi», «oss»), jf. opplysninger under{" "}
                <a href="#kontakt" className={accentLink}>
                  kontakt
                </a>
                .
              </p>
              <p className="mt-4">
                Ved å opprette konto, bruke tjenesten eller fortsette å bruke Agenci etter at endrede
                vilkår er publisert, bekrefter dere at dere har lest, forstått og akseptert Vilkårene.
                Hvis dere ikke aksepterer Vilkårene, skal dere ikke bruke tjenesten.
              </p>
              <p className="mt-4">
                Der det finnes en egen skriftlig kundeavtale, tilleggsvilkår for bestemte moduler eller
                databehandleravtale (DPA), gjelder disse foran Vilkårene i tilfelle motstrid, med
                mindre annet fremgår av avtalen.
              </p>
              <p className="mt-4">
                Vår behandling av personopplysninger er beskrevet i{" "}
                <Link href="/personvern" className={accentLink}>
                  personvernerklæringen
                </Link>
                .
              </p>
            </LegalSection>

            <LegalSection id="definisjoner" title="2. Definisjoner">
              <ul className="list-disc space-y-2 pl-5 marker:text-[#2DD4BF]">
                <li>
                  <strong className="font-medium text-foreground">«Tjenesten»:</strong> Agenci sin
                  skybaserte plattform, herunder nettsider, dashboard, chat-widget, API-er og tilhørende
                  funksjonalitet slik den tilbys i deres abonnement eller pilot.
                </li>
                <li>
                  <strong className="font-medium text-foreground">«Kundedata»:</strong> Innhold,
                  meldinger, filer, kunnskapsgrunnlag, innstillinger og annet materiale som dere
                  laster opp, genererer eller på annen måte tilfører Tjenesten.
                </li>
                <li>
                  <strong className="font-medium text-foreground">«Brukere»:</strong> Personer dere
                  gir tilgang til Kundens konto (f.eks. administratorer og kundeservice).
                </li>
              </ul>
            </LegalSection>

            <LegalSection id="tjenesten" title="3. Tjenesten">
              <p>
                Vi leverer Tjenesten som et verktøy for kundeservice, kunnskapsstyring og tilknyttede
                arbeidsflyter. Funksjonalitet, grenser og tilgjengelige integrasjoner kan variere med
                plan, region og løpende produktutvikling.
              </p>
              <p className="mt-4">
                Vi kan oppdatere, utvide eller begrense deler av Tjenesten for å ivareta sikkerhet,
                lovkrav eller drift, så lenge det ikke vesentlig svekker avtalt kjernefunksjonalitet uten
                saklig grunn. Vesentlige negative endringer i forhold til betalt avtale bør varsles med
                rimelig frist der det er praktisk mulig.
              </p>
            </LegalSection>

            <LegalSection id="konto" title="4. Konto, tilgang og sikkerhet">
              <p>
                Dere er ansvarlige for at opplysninger ved registrering er riktige, og for å holde
                passord, API-nøkler og tilsvarende konfidensielt. All aktivitet som skjer via deres
                konto tillegges Kunden med mindre dere uten ugrunnet opphold dokumenterer misbruk.
              </p>
              <p className="mt-4">
                Dere skal sørge for at Brukere som inviteres har nødvendig kompetanse og at tilganger
                tilpasses rollen (least privilege). Ved mistanke om uautorisert tilgang skal dere
                varsle oss og endre legitimasjon.
              </p>
              <p className="mt-4">
                Vi kan kreve flerfaktorautentisering eller andre sikkerhetstiltak der det er nødvendig
                for å beskytte Tjenesten eller oppfylle lovkrav.
              </p>
            </LegalSection>

            <LegalSection id="abonnement" title="5. Abonnement, priser og betaling">
              <p>
                Priser, faktureringsfrekvens og betalingsmåte fremgår av valgt plan, bestillingsflyt
                eller tilbud. Med mindre annet er avtalt, kan priser justeres med skriftlig varsel
                (f.eks. e-post eller varsel i produktet) minst 30 dager før endringen trer i kraft for
                eksisterende kunder.
              </p>
              <p className="mt-4">
                Ved forsinket betaling kan vi etter påminnelse begrense tilgang eller stanse Tjenesten
                til utestående er gjort opp, uten at det fritar for betalingsplikten for perioden.
              </p>
              <p className="mt-4">
                Eventuelle gebyrer fra betalingsleverandør eller offentlige avgifter utenom våre priser
                kan tillegges i henhold til gjeldende regler.
              </p>
            </LegalSection>

            <LegalSection id="kundedata" title="6. Kundens innhold og data">
              <p>
                Kunden beholder eierskap og immaterielle rettigheter til Kundedata. Kunden gir oss en
                begrenset, ikke-eksklusiv lisens til å drifte, lagre, sikkerhetskopiere og prosessere
                Kundedata kun for å levere og forbedre Tjenesten i samsvar med avtalen og gjeldende lov.
              </p>
              <p className="mt-4">
                Kunden er alene ansvarlig for at Kundedata ikke krenker tredjeparts rettigheter, og at
                bruk i AI, widget og kunnskapsbase er i samsvar med markedsføringsloven,
                personvernregler og bransjestandarder som gjelder for dere.
              </p>
              <p className="mt-4">
                Ved opphør kan eksport eller sletting av data skje i tråd med produktets funksjonalitet
                og personvernerklæringen, med mindre annet følger av lov eller særskilt avtale.
              </p>
            </LegalSection>

            <LegalSection id="akseptabel-bruk" title="7. Akseptabel bruk">
              <p>Dere skal ikke:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-[#2DD4BF]">
                <li>
                  bruke Tjenesten til ulovlige formål, krenkende innhold, spam, svindel eller
                  systematisk overbelastning av infrastruktur;
                </li>
                <li>
                  omgå tekniske begrensninger, lisensvilkår eller sikkerhetstiltak, eller forsøke
                  uautorisert tilgang til data som ikke tilhører Kunden;
                </li>
                <li>
                  reverse-engineere Tjenesten eller fjerne merknader om opphavsrett, unntatt i den grad
                  ufravikelig lov tillater det.
                </li>
              </ul>
              <p className="mt-4">
                Brudd kan medføre suspensjon eller oppsigelse av tilgang, og eventuelt erstatningskrav
                der det er grunnlag for det.
              </p>
            </LegalSection>

            <LegalSection id="integrasjoner" title="8. Integrasjoner og tredjeparter">
              <p>
                Tjenesten kan koble til eller vise innhold fra tredjeparter (f.eks. autentisering,
                betaling, stemmeleverandører). Slike tjenester reguleres av tredjepartens vilkår og
                personvern. Vi er ikke ansvarlige for tredjeparts tilgjengelighet, priser eller
                innhold, men vil rimelig assistere ved feilsøking innenfor vår kontroll.
              </p>
            </LegalSection>

            <LegalSection id="ip" title="9. Immaterielle rettigheter">
              <p>
                Agenci, merkevarer, grensesnitt, dokumentasjon og underliggende programvare som vi
                leverer, tilhører oss eller våre lisensgivere. Kunden får en tidsbegrenset,
                ikke-eksklusiv rett til å bruke Tjenesten i samsvar med Vilkårene.
              </p>
              <p className="mt-4">
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
                eller upassende forslag. Kunden er ansvarlig for kvalitetssikring, menneskelig kontroll
                der det kreves av lov eller egen policy, og for ikke å stole utelukkende på automatiserte
                svar i kritisk kommunikasjon uten intern vurdering.
              </p>
            </LegalSection>

            <LegalSection id="ansvar" title="12. Ansvar og ansvarsbegrensning">
              <p>
                I den grad loven tillater det, er vårt samlede ansvar overfor Kunden begrenset til det
                Kunden har betalt oss for Tjenesten i de siste tolv (12) månedene før kravet oppstod,
                eller — hvis det er lavere — til direkte dokumenterbart tap. Vi er ikke ansvarlige for
                indirekte tap, tapt fortjeneste, goodwill, driftstap eller følgeskader, med mindre
                ufravikelig lov tilsier noe annet.
              </p>
              <p className="mt-4">
                Ingenting i Vilkårene begrenser ansvar som ikke kan fravikes etter norsk lov, herunder
                ved grov uaktsomhet eller forsett.
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
                Begge parter kan si opp avtalen i samsvar med valgt bindingsperiode og oppsigelsesfrist
                som fremgår av bestilling eller kundeavtale. Vi kan suspendere eller avslutte tilgang
                ved vesentlig mislighold, betalingsmislighold etter påminnelse, eller ved
                sikkerhetsmessig nødvendighet.
              </p>
              <p className="mt-4">
                Ved opphør opphører retten til å bruke Tjenesten. Bestemmelser som naturlig skal overleve
                (f.eks. ansvarsbegrensning, lovvalg, immaterielle rettigheter, taushetsplikt) gjelder
                videre.
              </p>
            </LegalSection>

            <LegalSection id="tvist" title="15. Lovvalg, tvister og verneting">
              <p>
                Vilkårene reguleres av norsk lov. Tvister skal søkes løst i minnelighet. Dersom det ikke
                lykkes innen rimelig tid, kan hver part bringe saken inn for norske domstoler med
                verneting i saksøktes verneting etter norsk prosessrett, med mindre ufravikelige regler
                for forbrukere tilsier noe annet.
              </p>
            </LegalSection>

            <LegalSection id="ovrige" title="16. Øvrige bestemmelser">
              <p>
                Hele avtalen utgjøres av Vilkårene sammen med eventuell kundeavtale og tillegg. Hvis en
                bestemmelse er ugyldig, skal øvrige bestemmelser fortsatt gjelde i størst mulig grad.
              </p>
              <p className="mt-4">
                Vi kan endre Vilkårene. Vesentlige endringer varsles på e-post eller i produktet med
                rimelig frist. Fortsatt bruk etter ikrafttredelse utgjør aksept med mindre oppsigelse er
                tillatt etter egen avtale.
              </p>
              <p className="mt-4">
                Vi kan overføre rettigheter og forpliktelser under avtalen ved virksomhetsoverdragelse
                eller omorganisering, forutsatt at Kundens rettigheter ikke vesentlig forringes.
              </p>
            </LegalSection>

            <LegalSection id="kontakt" title="17. Kontakt">
              <p>
                Juridiske og avtalemessige henvendelser rettes til kontaktpunktet angitt på{" "}
                <Link href={LANDING_CONTACT_PAGE_PATH} className={accentLink}>
                  kontaktsiden
                </Link>
                . For personvern, se{" "}
                <Link href="/personvern" className={accentLink}>
                  personvernerklæringen
                </Link>
                .
              </p>
              <p className="mt-4 text-sm">
                <span className="font-medium text-foreground">Behandlingsansvarlig / leverandør:</span>{" "}
                {COMPANY_LEGAL_LINE}
              </p>
            </LegalSection>
          </div>

          <p className="mt-14 rounded-xl border border-[#2DD4BF]/25 bg-[#2DD4BF]/[0.07] px-4 py-3 text-sm leading-relaxed text-muted-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]">
            <strong className="font-medium text-foreground">Merk:</strong> Disse vilkårene er ment som
            et profesjonelt utgangspunkt for typisk B2B-SaaS. Konkret selskapsinformasjon, særskilte
            bransjekrav, SLA og fullstendige erstatningsregler bør avklares med juridisk rådgiver og
            eventuelt innarbeides i egen kundeavtale før signering.
          </p>
        </div>
        <MarketingSubpageCta />
      </article>
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
    <section id={id} className="scroll-mt-28">
      <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
