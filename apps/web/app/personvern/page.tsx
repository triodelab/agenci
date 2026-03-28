import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { MarketingSubpageCta } from "@/modules/landing/ui/components/marketing-subpage-cta";
import { LANDING_CONTACT_PAGE_PATH } from "@/modules/landing/constants";

const accentLink =
  "font-medium text-foreground underline decoration-[#2DD4BF]/45 underline-offset-2 hover:text-[#0f766e] hover:decoration-[#2DD4BF]";

const updated = new Date("2026-03-27");

/** Erstatt via miljøvariabel når selskapsdata er klare */
const COMPANY_LEGAL_LINE =
  process.env.NEXT_PUBLIC_COMPANY_LEGAL_LINE ??
  "Agenci — [sett inn fullt selskapsnavn, organisasjonsnummer og forretningsadresse]";

export const metadata: Metadata = {
  title: "Personvernerklæring",
  description:
    "Hvordan Agenci samler inn, bruker og beskytter personopplysninger i tråd med GDPR og personopplysningsloven.",
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
      <article className="border-b border-border/40 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-16 lg:py-20">
          <header className="border-b border-border/50 pb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Juridisk
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-[2rem] md:leading-tight">
              Personvernerklæring
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Gjelder bruk av nettside og tjenester levert av Agenci.
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
                  <span className="font-medium text-foreground">Versjon:</span> 1.0
                </dd>
              </div>
            </dl>
          </header>

          <nav
            aria-label="Innhold i personvernerklæringen"
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
            <LegalSection id="innledning" title="1. Innledning">
              <p>
                Denne personvernerklæringen forklarer hvordan vi behandler personopplysninger når du
                besøker våre nettsider, oppretter konto, bruker Agenci-plattformen (herunder
                dashboard, widget og relaterte funksjoner), eller kontakter oss. Vi følger
                personopplysningsloven og EUs personvernforordning (GDPR).
              </p>
              <p className="mt-4">
                Ved å bruke tjenesten aksepterer du denne erklæringen i den utstrekning den gjelder for
                ditt forhold til oss. Avtalevilkår og databehandleravtaler (DPA) med bedriftskunder kan
                gi ytterligere detaljer der det er relevant.
              </p>
            </LegalSection>

            <LegalSection id="behandlingsansvarlig" title="2. Behandlingsansvarlig">
              <p>
                <strong className="font-medium text-foreground">{COMPANY_LEGAL_LINE}</strong> er
                behandlingsansvarlig for personopplysninger som behandles i forbindelse med vår
                markedsføring, kundekontakt og leveranse av tjenesten, med mindre annet følger av avtale
                med din arbeidsgiver eller organisasjon.
              </p>
              <p className="mt-4">
                For henvendelser om personvern kan du bruke{" "}
                <Link href={LANDING_CONTACT_PAGE_PATH} className={accentLink}>
                  kontaktskjemaet
                </Link>
                . Merk e-posten med «Personvern».
              </p>
            </LegalSection>

            <LegalSection id="opplysninger" title="3. Hvilke opplysninger vi behandler">
              <p>Vi kan behandle følgende kategorier av opplysninger, avhengig av hvordan du bruker oss:</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-[#2DD4BF]">
                <li>
                  <strong className="font-medium text-foreground">Konto og identitet:</strong> f.eks.
                  navn, e-postadresse, telefonnummer og innloggingsidentifikatorer (f.eks. via
                  innloggingsleverandør).
                </li>
                <li>
                  <strong className="font-medium text-foreground">Drift og sikkerhet:</strong> f.eks.
                  IP-adresse, enhets- og nettleserinformasjon, tidspunkt for henvendelser, logger som er
                  nødvendige for feilsøking, misbruksforebygging og informasjonssikkerhet.
                </li>
                <li>
                  <strong className="font-medium text-foreground">Innhold i tjenesten:</strong> tekst,
                  filer og annet materiale du eller din organisasjon velger å laste inn i plattformen
                  (f.eks. til kunnskapsgrunnlag for AI), samt samtale- og henvendelsesdata som genereres
                  i tråd med produktets funksjon.
                </li>
                <li>
                  <strong className="font-medium text-foreground">Kundeservice:</strong> opplysninger du
                  gir når du kontakter oss (f.eks. i skjema, e-post eller chat).
                </li>
                <li>
                  <strong className="font-medium text-foreground">Markedsføring:</strong> hvis du
                  melder deg på nyhetsbrev eller samtykker til tilsvarende — typisk e-postadresse og
                  preferanser.
                </li>
              </ul>
            </LegalSection>

            <LegalSection id="formal-grunnlag" title="4. Formål og rettslig grunnlag">
              <p>Vi behandler personopplysninger for blant annet følgende formål:</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-[#2DD4BF]">
                <li>
                  <strong className="font-medium text-foreground">Levere og forbedre tjenesten</strong>{" "}
                  — utføre avtale med deg eller din organisasjon (GDPR art. 6 nr. 1 bokstav b).
                </li>
                <li>
                  <strong className="font-medium text-foreground">Kundeservice og kommunikasjon</strong>{" "}
                  — svare på henvendelser og administrere kundeforhold (avtale og berettiget interesse,
                  jf. art. 6 nr. 1 bokstav b og f).
                </li>
                <li>
                  <strong className="font-medium text-foreground">Sikkerhet og misbruksforebygging</strong>{" "}
                  — berettiget interesse i å sikre stabile og trygge tjenester (art. 6 nr. 1 bokstav f).
                </li>
                <li>
                  <strong className="font-medium text-foreground">Regnskaps- og rettslige krav</strong>{" "}
                  — oppfylle lovpålagte plikter (art. 6 nr. 1 bokstav c).
                </li>
                <li>
                  <strong className="font-medium text-foreground">Nyhetsbrev og markedsføring</strong>{" "}
                  — der det kreves, innhentes samtykke særskilt (art. 6 nr. 1 bokstav a); du kan når som
                  helst trekke samtykket tilbake.
                </li>
              </ul>
            </LegalSection>

            <LegalSection id="lagring" title="5. Lagring og sletting">
              <p>
                Vi lagrer personopplysninger så lenge det er nødvendig for formålene over, og så lenge vi
                har et gyldig behandlingsgrunnlag. Opplysninger knyttet til kundeforhold oppbevares
                typisk i avtaleperioden og en periode etter opphør, der det er påkrevd for dokumentasjon,
                rettskrav eller bokføringsregler. Logger og sikkerhetsdata kan ha kortere eller lengre
                oppbevaring avhengig av teknisk behov og lovkrav.
              </p>
              <p className="mt-4">
                Når formålet faller bort og vi ikke lenger har grunnlag for lagring, slettes eller
                anonymiseres opplysningene.
              </p>
            </LegalSection>

            <LegalSection id="deling" title="6. Deling og underleverandører">
              <p>
                Vi deler ikke personopplysninger med tredjeparter for deres egne markedsføringsformål.
                Vi kan bruke databehandlere (underleverandører) som bistår med drift av tjenesten, for
                eksempel sky-/hostingleverandør, autentisering, e-post, analyse og kundestøtteverktøy.
                Slike leverandører behandler opplysninger etter våre instruksjoner og på grunnlag av
                databehandleravtale der det er påkrevd.
              </p>
              <p className="mt-4">
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
              <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-[#2DD4BF]">
                <li>
                  <strong className="font-medium text-foreground">Innsyn</strong> — få informasjon om
                  hvilke opplysninger vi behandler om deg.
                </li>
                <li>
                  <strong className="font-medium text-foreground">Retting</strong> — få rettet uriktige
                  eller ufullstendige opplysninger.
                </li>
                <li>
                  <strong className="font-medium text-foreground">Sletting</strong> — be om sletting når
                  vilkårene i GDPR er oppfylt.
                </li>
                <li>
                  <strong className="font-medium text-foreground">Begrensning</strong> — i visse
                  tilfeller kreve begrenset behandling.
                </li>
                <li>
                  <strong className="font-medium text-foreground">Dataportabilitet</strong> — der
                  behandlingen er automatisert og basert på samtykke eller avtale, kan du i visse
                  tilfeller motta opplysningene i et strukturert, maskinlesbart format.
                </li>
                <li>
                  <strong className="font-medium text-foreground">Innsigelse</strong> — mot behandling
                  som er basert på berettiget interesse, med mindre vi har tungtveiende berettigede
                  grunner.
                </li>
                <li>
                  <strong className="font-medium text-foreground">Trekke samtykke</strong> — når
                  behandlingen er basert på samtykke.
                </li>
              </ul>
              <p className="mt-4">
                For å utøve rettighetene, ta kontakt via{" "}
                <Link href={LANDING_CONTACT_PAGE_PATH} className={accentLink}>
                  kontaktskjemaet
                </Link>
                .                 Vi besvarer henvendelser uten ugrunnlagt opphold og senest innen én måned, med mindre
                særskilte forhold tilsier forlengelse etter regelverket.
              </p>
            </LegalSection>

            <LegalSection id="cookies" title="9. Informasjonskapsler (cookies)">
              <p>
                Vi bruker informasjonskapsler og lignende teknologi der det er nødvendig for at nettsiden
                og tjenesten skal fungere (f.eks. innlogging, sikkerhet og preferanser). Vi kan også
                bruke analyse- eller funksjonelle cookies for å forstå bruk og forbedre opplevelsen, i
                tråd med samtykkeinnstillinger der det kreves.
              </p>
              <p className="mt-4">
                Du kan endre innstillinger i nettleseren for å blokkere eller slette cookies; merk at
                deler av tjenesten da kan slutte å fungere som forventet.
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
              <p className="mt-4">
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

          <p className="mt-14 rounded-xl border border-[#2DD4BF]/25 bg-[#2DD4BF]/[0.07] px-4 py-3 text-sm leading-relaxed text-muted-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]">
            <strong className="font-medium text-foreground">Merk:</strong> Erklæringen er ment som et
            utgangspunkt for typisk SaaS-bruk. Juridisk bør fullt selskapsnavn, organisasjonsnummer,
            konkrete databehandlere og eventuelle bransjekrav avklares med juridisk rådgiver før den
            benyttes som eneste grunnlag i kundeavtaler.
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
