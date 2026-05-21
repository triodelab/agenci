import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { MarketingSubpageCta } from "@/modules/landing/ui/components/marketing-subpage-cta";
import { LANDING_CONTACT_PAGE_PATH } from "@/modules/landing/constants";

const accentLink =
  "text-[#5e6ad2] underline-offset-2 decoration-[#5e6ad2]/30 hover:text-[#828fff] hover:underline transition-colors";

const updated = new Date("2026-03-27");

const COMPANY_LEGAL_LINE =
  process.env.NEXT_PUBLIC_COMPANY_LEGAL_LINE ??
  "Hassan Triodelab DA, org.nr. 835 796 892, Gildevangen 16 B, 0585 Oslo";

const PRIVACY_EMAIL = "post@triodelab.no";

export const metadata: Metadata = {
  title: "Personvernerklæring",
  description:
    "Hvordan Agenci samler inn, bruker og beskytter personopplysninger i tråd med GDPR og personopplysningsloven.",
  alternates: { canonical: "/personvern" },
  robots: { index: true, follow: true },
};

const toc = [
  { id: "innledning", label: "Innledning" },
  { id: "behandlingsansvarlig", label: "Behandlingsansvarlig" },
  { id: "opplysninger", label: "Hvilke opplysninger vi behandler" },
  { id: "formal-grunnlag", label: "Formål og rettslig grunnlag" },
  { id: "lagring", label: "Lagring og sletting" },
  { id: "deling", label: "Deling og underleverandører" },
  { id: "tredjeland", label: "Overføring til andre land" },
  { id: "rettigheter", label: "Dine rettigheter" },
  { id: "cookies", label: "Informasjonskapsler (cookies)" },
  { id: "sikkerhet", label: "Sikkerhet" },
  { id: "endringer", label: "Endringer i erklæringen" },
  { id: "kontakt-klage", label: "Kontakt og klage" },
] as const;

export default function PersonvernPage() {
  return (
    <MarketingPageLayout>
      <div className="bg-[#010102]">
        <div className="mx-auto max-w-[720px] px-6 py-20 md:py-24 xl:px-8">

          {/* Header */}
          <header className="border-b border-[#23252a] pb-10">
            <p className="text-[13px] font-medium uppercase tracking-[0.4px] text-[#62666d]">
              Juridisk
            </p>
            <h1 className="mt-5 text-[40px] font-semibold leading-[1.15] tracking-[-1px] text-[#f7f8f8]">
              Personvernerklæring
            </h1>
            <p className="mt-4 text-[15px] leading-[1.5] text-[#d0d6e0]">
              Gjelder bruk av nettside og tjenester levert av Agenci.
            </p>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[13px] text-[#62666d]">
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
                <dd>Versjon: 1.0</dd>
              </div>
            </dl>
          </header>

          {/* TOC */}
          <nav
            aria-label="Innhold i personvernerklæringen"
            className="my-10 rounded-[12px] border border-[#23252a] bg-[#0f1011] p-6"
          >
            <p className="text-[12px] font-medium uppercase tracking-[0.4px] text-[#62666d]">
              Innhold
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14px] leading-[1.5] text-[#d0d6e0] marker:font-medium marker:text-[#5e6ad2]">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="transition-colors hover:text-[#f7f8f8]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Body */}
          <div className="space-y-14">
            <LegalSection id="innledning" title="1. Innledning">
              <p>
                Denne personvernerklæringen forklarer hvordan vi behandler personopplysninger når du
                besøker våre nettsider, oppretter konto, bruker Agenci-plattformen (herunder
                dashboard, widget og relaterte funksjoner), eller kontakter oss. Vi følger
                personopplysningsloven og EUs personvernforordning (GDPR).
              </p>
              <p>
                Ved å bruke tjenesten aksepterer du denne erklæringen i den utstrekning den gjelder for
                ditt forhold til oss. Avtalevilkår og databehandleravtaler (DPA) med bedriftskunder kan
                gi ytterligere detaljer der det er relevant.
              </p>
            </LegalSection>

            <LegalSection id="behandlingsansvarlig" title="2. Behandlingsansvarlig">
              <p>
                <strong className="font-medium text-[#d0d6e0]">{COMPANY_LEGAL_LINE}</strong> er
                behandlingsansvarlig for personopplysninger som behandles i forbindelse med vår
                markedsføring, kundekontakt og leveranse av tjenesten Agenci, med mindre annet følger av
                avtale med din arbeidsgiver eller organisasjon.
              </p>
              <p>
                For henvendelser om personvern kan du kontakte oss på{" "}
                <a href={`mailto:${PRIVACY_EMAIL}`} className={accentLink}>
                  {PRIVACY_EMAIL}
                </a>{" "}
                eller via{" "}
                <Link href={LANDING_CONTACT_PAGE_PATH} className={accentLink}>
                  kontaktskjemaet
                </Link>
                . Merk henvendelsen med «Personvern».
              </p>
            </LegalSection>

            <LegalSection id="opplysninger" title="3. Hvilke opplysninger vi behandler">
              <p>Vi kan behandle følgende kategorier av opplysninger, avhengig av hvordan du bruker oss:</p>
              <ul className="mt-2 space-y-2">
                <ListItem label="Konto og identitet">
                  f.eks. navn, e-postadresse, telefonnummer og innloggingsidentifikatorer (f.eks. via innloggingsleverandør).
                </ListItem>
                <ListItem label="Drift og sikkerhet">
                  f.eks. IP-adresse, enhets- og nettleserinformasjon, tidspunkt for henvendelser, logger som er nødvendige for feilsøking, misbruksforebygging og informasjonssikkerhet.
                </ListItem>
                <ListItem label="Innhold i tjenesten">
                  tekst, filer og annet materiale du eller din organisasjon velger å laste inn i plattformen, samt samtale- og henvendelsesdata som genereres i tråd med produktets funksjon.
                </ListItem>
                <ListItem label="Kundeservice">
                  opplysninger du gir når du kontakter oss (f.eks. i skjema, e-post eller chat).
                </ListItem>
                <ListItem label="Markedsføring">
                  hvis du melder deg på nyhetsbrev eller samtykker til tilsvarende — typisk e-postadresse og preferanser.
                </ListItem>
              </ul>
            </LegalSection>

            <LegalSection id="formal-grunnlag" title="4. Formål og rettslig grunnlag">
              <p>Vi behandler personopplysninger for blant annet følgende formål:</p>
              <ul className="mt-2 space-y-2">
                <ListItem label="Levere og forbedre tjenesten">
                  utføre avtale med deg eller din organisasjon (GDPR art. 6 nr. 1 bokstav b).
                </ListItem>
                <ListItem label="Kundeservice og kommunikasjon">
                  svare på henvendelser og administrere kundeforhold (avtale og berettiget interesse, jf. art. 6 nr. 1 bokstav b og f).
                </ListItem>
                <ListItem label="Sikkerhet og misbruksforebygging">
                  berettiget interesse i å sikre stabile og trygge tjenester (art. 6 nr. 1 bokstav f).
                </ListItem>
                <ListItem label="Regnskaps- og rettslige krav">
                  oppfylle lovpålagte plikter (art. 6 nr. 1 bokstav c).
                </ListItem>
                <ListItem label="Nyhetsbrev og markedsføring">
                  der det kreves, innhentes samtykke særskilt (art. 6 nr. 1 bokstav a); du kan når som helst trekke samtykket tilbake.
                </ListItem>
              </ul>
            </LegalSection>

            <LegalSection id="lagring" title="5. Lagring og sletting">
              <p>Vi lagrer personopplysninger så lenge det er nødvendig for formålene:</p>
              <ul className="mt-2 space-y-2">
                <ListItem label="Widget-besøkende (navn, e-post, metadata)">
                  Anonymiseres automatisk etter 24 timer (ekspirasjon av sesjonen). En daglig rutine erstatter navn og e-post med anonymiserte verdier og sletter enhetsdata.
                </ListItem>
                <ListItem label="Brukerkontoer (dashboard)">
                  Slettes ved opphør av konto. Sletting i autentiseringssystemet trigges automatisk en sletting av tilknyttede data i vår database.
                </ListItem>
                <ListItem label="Samtalehistorikk">
                  Oppbevares i avtaleperioden for å muliggjøre oppfølging. Kan slettes på forespørsel.
                </ListItem>
                <ListItem label="Kontaktskjema og nyhetsbrev">
                  Kontaktskjema-data lagres ikke i vår database — det videresendes til vår e-postinnboks. Nyhetsbrev-adresser behandles frem til samtykke trekkes tilbake.
                </ListItem>
              </ul>
            </LegalSection>

            <LegalSection id="deling" title="6. Deling og underleverandører">
              <p>
                Vi deler ikke personopplysninger med tredjeparter for deres egne markedsføringsformål.
                Vi bruker følgende databehandlere (underleverandører) for å drifte tjenesten:
              </p>
              <ul className="mt-2 space-y-2">
                <ListItem label="Convex (USA/EU-west-1)">
                  Primær databaseleverandør. Alle data lagres i EU (Irland, AWS eu-west-1).
                </ListItem>
                <ListItem label="Clerk (USA)">
                  Autentisering og kontoadministrasjon. Dataoverføring skjer i henhold til EUs standardkontraktsklausuler (SCC).
                </ListItem>
                <ListItem label="OpenAI (USA)">
                  Behandler samtaleinnhold for å generere AI-svar. Dataoverføring skjer i henhold til SCC. OpenAI beholder ikke data for trening av modeller via API.
                </ListItem>
                <ListItem label="Sentry / Functional Software (USA/EU)">
                  Feilsporing og overvåking. Data lagres i Sentrys EU-region (Tyskland). Ingen video- eller sesjonsopptak er aktivert.
                </ListItem>
                <ListItem label="Resend (USA)">
                  E-postformidling (kontaktskjema og nyhetsbrev). Kun brukt til å levere e-post; innhold lagres ikke permanent hos Resend.
                </ListItem>
              </ul>
              <p>
                Der din arbeidsgiver eller organisasjon er kunde hos oss, kan opplysninger deles internt
                i tråd med avtalen og tilgangsstyring i produktet.
              </p>
            </LegalSection>

            <LegalSection id="tredjeland" title="7. Overføring til andre land">
              <p>
                Dine opplysninger behandles primært innen EU/EØS. Dersom vi bruker leverandører utenfor
                EU/EØS, sikrer vi overføring i samsvar med GDPR, for eksempel gjennom EU-kommisjonens
                standardkontraktsklausuler eller andre godkjente mekanismer.
              </p>
            </LegalSection>

            <LegalSection id="rettigheter" title="8. Dine rettigheter">
              <p>Du har følgende rettigheter etter personvernregelverket, med de begrensningene loven setter:</p>
              <ul className="mt-2 space-y-2">
                <ListItem label="Innsyn">få informasjon om hvilke opplysninger vi behandler om deg.</ListItem>
                <ListItem label="Retting">få rettet uriktige eller ufullstendige opplysninger.</ListItem>
                <ListItem label="Sletting">be om sletting når vilkårene i GDPR er oppfylt.</ListItem>
                <ListItem label="Begrensning">i visse tilfeller kreve begrenset behandling.</ListItem>
                <ListItem label="Dataportabilitet">
                  der behandlingen er automatisert og basert på samtykke eller avtale, kan du i visse tilfeller motta opplysningene i et strukturert, maskinlesbart format.
                </ListItem>
                <ListItem label="Innsigelse">
                  mot behandling som er basert på berettiget interesse, med mindre vi har tungtveiende berettigede grunner.
                </ListItem>
                <ListItem label="Trekke samtykke">når behandlingen er basert på samtykke.</ListItem>
              </ul>
              <p>
                For å utøve rettighetene, ta kontakt via{" "}
                <Link href={LANDING_CONTACT_PAGE_PATH} className={accentLink}>
                  kontaktskjemaet
                </Link>
                . Vi besvarer henvendelser uten ugrunnlagt opphold og senest innen én måned.
              </p>
            </LegalSection>

            <LegalSection id="cookies" title="9. Informasjonskapsler og lignende teknologi">
              <p>Vi bruker følgende teknologier:</p>
              <ul className="mt-2 space-y-2">
                <ListItem label="Påloggingscookies (nødvendig)">
                  Clerk setter sesjons-cookies for å holde deg innlogget i dashboardet. Disse er strengt nødvendige og kan ikke deaktiveres.
                </ListItem>
                <ListItem label="Brukerpreferanser (nødvendig)">
                  En cookie lagrer UI-innstillinger (f.eks. sidemenyens tilstand) for påloggede brukere.
                </ListItem>
                <ListItem label="Feilsporing (Sentry)">
                  Sentry registrerer tekniske feil og ytelsesdata for å feilsøke problemer. Ingen sesjonsopptak er aktivert. Data lagres i EU (Germany).
                </ListItem>
                <ListItem label="Widget — localStorage">
                  Chat-widgeten lagrer en anonym sesjons-ID i nettleserens localStorage for å bevare samtalehistorikk mellom sideinnlastinger. Ingen cookies settes av embed-skriptet.
                </ListItem>
              </ul>
              <p>
                Du kan endre innstillinger i nettleseren for å blokkere eller slette cookies og localStorage; merk at deler av tjenesten da kan slutte å fungere som forventet.
              </p>
            </LegalSection>

            <LegalSection id="sikkerhet" title="10. Sikkerhet">
              <p>
                Vi iverksetter tekniske og organisatoriske tiltak som er rimelige etter risiko og art av
                opplysningene, herunder tilgangskontroll, kryptering i transitt der det er hensiktsmessig,
                og prinsippet om dataminimering. Ingen løsninger er fullstendig uten risiko; vi arbeider
                løpende med å opprettholde et forsvarlig sikkerhetsnivå.
              </p>
            </LegalSection>

            <LegalSection id="endringer" title="11. Endringer i erklæringen">
              <p>
                Vi kan oppdatere denne personvernerklæringen ved endringer i praksis, teknologi eller
                lovkrav. Den gjeldende versjonen publiseres alltid på denne siden med oppdatert dato. Ved
                vesentlige endringer kan vi varsle via e-post eller i produktet der det er relevant.
              </p>
            </LegalSection>

            <LegalSection id="kontakt-klage" title="12. Kontakt og klage">
              <p>
                Har du spørsmål om hvordan vi behandler personopplysninger, ta kontakt via{" "}
                <Link href={LANDING_CONTACT_PAGE_PATH} className={accentLink}>
                  kontaktskjemaet
                </Link>
                .
              </p>
              <p>
                Du har rett til å klage til tilsynsmyndigheten. I Norge er det{" "}
                <a
                  href="https://www.datatilsynet.no"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={accentLink}
                >
                  Datatilsynet
                </a>
                .
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
      <h2 className="text-[18px] font-semibold leading-[1.25] tracking-[-0.4px] text-[#f7f8f8]">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-[1.65] text-[#d0d6e0]">{children}</div>
    </section>
  );
}

function ListItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[14px] leading-[1.6] text-[#d0d6e0]">
      <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#5e6ad2]" />
      <span>
        <span className="font-medium text-[#d0d6e0]">{label}:</span> {children}
      </span>
    </li>
  );
}
