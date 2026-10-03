import type { Metadata } from "next";
import Link from "next/link";
import l from "@/modules/legal/legal.module.css";
import { Clause, COMPANY, LegalPage, Terms } from "@/modules/legal/legal-page";

export const metadata: Metadata = {
	title: "Databehandleravtale",
	description:
		"Databehandleravtalen mellom Agenci og kundene våre, etter GDPR artikkel 28: hva vi behandler på deres vegne, sikkerhet, underleverandører og sletting.",
	alternates: { canonical: "/databehandleravtale" },
	robots: { index: true, follow: true },
};

const TOC = [
	{ id: "parter", label: "Parter og bakgrunn" },
	{ id: "behandlingen", label: "Behandlingen" },
	{ id: "instruks", label: "Instruks" },
	{ id: "taushet", label: "Taushetsplikt" },
	{ id: "sikkerhet", label: "Sikkerhet" },
	{ id: "underleverandorer", label: "Underleverandører" },
	{ id: "tredjeland", label: "Overføring utenfor EØS" },
	{ id: "bistand", label: "Bistand til kunden" },
	{ id: "avvik", label: "Avvik og brudd" },
	{ id: "revisjon", label: "Innsyn og revisjon" },
	{ id: "sletting", label: "Sletting ved opphør" },
	{ id: "varighet", label: "Varighet og lovvalg" },
	{ id: "vedlegg-1", label: "Vedlegg 1: Behandlingen" },
	{ id: "vedlegg-2", label: "Vedlegg 2: Underleverandører" },
	{ id: "vedlegg-3", label: "Vedlegg 3: Sikkerhetstiltak" },
];

const mail = (
	<a href={`mailto:${COMPANY.email}`} className={l.link}>
		{COMPANY.email}
	</a>
);

export default function DatabehandleravtalePage() {
	return (
		<LegalPage
			eyebrow="Juridisk"
			title="Databehandleravtale"
			lead="Denne avtalen gjelder når Agenci behandler personopplysninger på vegne av kundene våre, først og fremst samtalene besøkende har med en Agenci-assistent på kundens nettside."
			updated="2026-10-03"
			version="1.0"
			toc={TOC}
			related={{ href: "/vilkar", label: "Les vilkårene" }}
			summary={[
				"Kunden er behandlingsansvarlig for opplysningene om sine besøkende. Agenci er databehandler.",
				"Vi behandler opplysningene bare for å levere tjenesten, og bare etter kundens instruks.",
				"Data lagres i Norge. Bare innholdet som trengs for å lage et svar, sendes til en leverandør av språkmodeller i USA.",
				"Samtaler slettes automatisk 12 måneder etter siste melding, og alt slettes når avtalen opphører.",
			]}
		>
			<Clause id="parter" n={1} title="Parter og bakgrunn">
				<p>
					Avtalen er inngått mellom kunden som bruker Agenci («Kunden»,
					behandlingsansvarlig) og <strong>{COMPANY.legalLine}</strong>{" "}
					(«Agenci», databehandler).
				</p>
				<p>
					Avtalen er en del av{" "}
					<Link href="/vilkar" className={l.link}>
						vilkårene for Agenci
					</Link>{" "}
					og gjelder fra Kunden tar tjenesten i bruk. Den oppfyller kravene i
					personvernforordningen (GDPR) artikkel 28. Ved motstrid mellom
					avtalen og vilkårene, går denne avtalen foran for behandling av
					personopplysninger.
				</p>
			</Clause>

			<Clause id="behandlingen" n={2} title="Behandlingen">
				<p>
					Agenci behandler personopplysninger på vegne av Kunden for å levere
					tjenesten: en AI-assistent som svarer besøkende på Kundens nettside,
					lagring av samtalene, og et dashbord der Kunden følger opp
					samtalene. Hvilke opplysninger, hvem de gjelder, formål og
					lagringstid står i{" "}
					<a href="#vedlegg-1" className={l.link}>
						vedlegg 1
					</a>
					.
				</p>
			</Clause>

			<Clause id="instruks" n={3} title="Instruks">
				<p>
					Agenci behandler opplysningene bare etter dokumentert instruks fra
					Kunden. Avtalen, vilkårene og innstillingene Kunden gjør i
					dashboardet utgjør instruksen. Agenci bruker ikke opplysningene til
					egne formål, selger dem ikke og bruker dem ikke til å trene
					AI-modeller.
				</p>
				<p>
					Mener Agenci at en instruks er i strid med personvernregelverket,
					varsler vi Kunden om det.
				</p>
			</Clause>

			<Clause id="taushet" n={4} title="Taushetsplikt">
				<p>
					Alle hos Agenci som har tilgang til personopplysningene, har
					taushetsplikt. Tilgang gis bare til et fåtall navngitte personer, og
					bare når det trengs for drift, sikkerhet eller support som Kunden ber
					om.
				</p>
			</Clause>

			<Clause id="sikkerhet" n={5} title="Sikkerhet">
				<p>
					Agenci gjennomfører tekniske og organisatoriske tiltak for å sikre et
					sikkerhetsnivå som passer risikoen, i tråd med GDPR artikkel 32.
					Tiltakene står i{" "}
					<a href="#vedlegg-3" className={l.link}>
						vedlegg 3
					</a>{" "}
					og oppdateres når tjenesten endres.
				</p>
			</Clause>

			<Clause id="underleverandorer" n={6} title="Underleverandører">
				<p>
					Kunden gir med denne avtalen en generell forhåndsgodkjenning til at
					Agenci bruker underleverandører (underdatabehandlere) for å levere
					tjenesten. Kategoriene står i{" "}
					<a href="#vedlegg-2" className={l.link}>
						vedlegg 2
					</a>
					. En fullstendig liste med navn sendes på forespørsel til {mail}.
				</p>
				<p>
					Agenci varsler Kunden på e-post minst 30 dager før en ny
					underleverandør tas i bruk eller en eksisterende byttes ut. Kunden
					kan innen fristen protestere av saklige grunner. Finner partene ingen
					løsning, kan Kunden si opp avtalen før endringen trer i kraft.
				</p>
				<p>
					Agenci pålegger underleverandørene de samme pliktene om personvern
					som i denne avtalen, og er ansvarlig overfor Kunden for at de
					oppfyller dem.
				</p>
			</Clause>

			<Clause id="tredjeland" n={7} title="Overføring utenfor EØS">
				<p>
					Tjenesten og lagrede data driftes i Norge. For å lage svarene sendes
					innholdet i samtalen til en leverandør av språkmodeller i USA, og
					enkelte andre underleverandører er etablert utenfor EØS. Overføring
					skjer bare med gyldig grunnlag etter GDPR kapittel V, som EU–US Data
					Privacy Framework eller EU-kommisjonens standardkontraktsklausuler,
					med nødvendige tilleggstiltak.
				</p>
			</Clause>

			<Clause id="bistand" n={8} title="Bistand til kunden">
				<p>Agenci hjelper Kunden med å oppfylle sine plikter, blant annet å:</p>
				<Terms
					items={[
						{
							label: "Besøkendes rettigheter",
							text: "Svare på krav om innsyn, retting, sletting, begrensning og dataportabilitet. Kunden kan selv finne og eksportere samtaler i dashboardet. Sletting av enkeltsamtaler gjør Agenci på Kundens forespørsel, uten ugrunnet opphold. Får Agenci et krav direkte fra en besøkende, sender vi det videre til Kunden.",
						},
						{
							label: "Konsekvensvurdering",
							text: "Gi informasjon Kunden trenger for en vurdering av personvernkonsekvenser og eventuell forhåndsdrøfting med Datatilsynet.",
						},
						{
							label: "Dokumentasjon",
							text: "Gi informasjon som viser at pliktene i denne avtalen er oppfylt.",
						},
					]}
				/>
			</Clause>

			<Clause id="avvik" n={9} title="Avvik og brudd">
				<p>
					Agenci varsler Kunden uten ugrunnet opphold, og senest innen 48 timer
					etter at vi ble kjent med det, ved brudd på personopplysningssikkerheten
					som gjelder Kundens opplysninger. Varselet beskriver hva som har
					skjedd, hvilke opplysninger og hvor mange som kan være berørt, mulige
					konsekvenser og hvilke tiltak vi har satt i verk. Kunden er ansvarlig
					for eventuell melding til Datatilsynet og de berørte.
				</p>
			</Clause>

			<Clause id="revisjon" n={10} title="Innsyn og revisjon">
				<p>
					Kunden kan be om dokumentasjon på at avtalen følges. Er det nødvendig,
					kan Kunden, eller en uavhengig revisor Kunden velger og som har
					taushetsplikt, gjennomføre revisjon etter avtale og med rimelig
					varsel. Hver part dekker egne kostnader.
				</p>
			</Clause>

			<Clause id="sletting" n={11} title="Sletting ved opphør">
				<p>
					Når kundeforholdet opphører, sletter Agenci Kundens personopplysninger
					senest innen 30 dager, med mindre lov krever lagring. Før det kan
					Kunden eksportere samtalene fra dashboardet.
				</p>
			</Clause>

			<Clause id="varighet" n={12} title="Varighet og lovvalg">
				<p>
					Avtalen gjelder så lenge Agenci behandler personopplysninger på vegne
					av Kunden. Endringer i avtalen varsles minst 30 dager i forveien, med
					dato og versjonsnummer øverst på denne siden. Avtalen reguleres av
					norsk rett, og tvister hører under Oslo tingrett.
				</p>
				<p>
					Ønsker Kunden en signert kopi av avtalen, sender vi den på forespørsel
					til {mail}.
				</p>
			</Clause>

			<Clause id="vedlegg-1" n={13} title="Vedlegg 1: Behandlingen">
				<Terms
					items={[
						{
							label: "Hvem det gjelder",
							text: "Besøkende som chatter med assistenten på Kundens nettside, og personer som nevnes i innhold Kunden legger inn.",
						},
						{
							label: "Opplysninger",
							text: "Meldinger i chatten, navn og e-post hvis den besøkende oppgir det, og tekniske opplysninger som språk, tidssone, nettleser og hvilken side samtalen startet fra. Eventuelle personopplysninger i innhold Kunden selv legger inn (nettside og dokumenter).",
						},
						{
							label: "Særlige kategorier",
							text: "Tjenesten er ikke laget for helseopplysninger eller andre særlige kategorier. Assistenten ber besøkende om ikke å oppgi slike. Kunden skal ikke bruke tjenesten til å samle inn dem.",
						},
						{
							label: "Formål",
							text: "Svare besøkende på vegne av Kunden, la Kunden følge opp og overta samtaler, og sikre stabil og trygg drift.",
						},
						{
							label: "Lagringstid",
							text: "Samtaler slettes automatisk 12 måneder etter siste melding, eller tidligere når Kunden ber om det. En anonym besøksøkt utløper etter 24 timer. Alt slettes ved opphør, se punkt 11.",
						},
						{ label: "Behandlingssted", text: "Norge, med unntak som beskrevet i punkt 7." },
					]}
				/>
			</Clause>

			<Clause id="vedlegg-2" n={14} title="Vedlegg 2: Underleverandører">
				<Terms
					items={[
						{
							label: "Drift og lagring",
							text: "Servere, database og fillagring. Norge.",
						},
						{
							label: "Språkmodeller",
							text: "Lager svarene og gjør kunnskapen søkbar. Får innholdet i samtalen og utdrag av Kundens kunnskap. USA.",
						},
						{
							label: "Innhenting fra nettsider",
							text: "Henter innhold fra Kundens nettside når en assistent opprettes eller oppdateres. USA.",
						},
						{
							label: "Lesing av dokumenter",
							text: "Leser dokumenter Kunden laster opp. USA.",
						},
						{
							label: "Nettverk og sikkerhet",
							text: "Beskyttelse mot angrep og rask levering av chatten. Ser teknisk trafikk. Globalt nettverk.",
						},
						{
							label: "E-post",
							text: "Sender e-post fra tjenesten, som invitasjoner og lenker for nytt passord.",
						},
					]}
				/>
				<p>Fullstendig liste med navn sendes på forespørsel til {mail}.</p>
			</Clause>

			<Clause id="vedlegg-3" n={15} title="Vedlegg 3: Sikkerhetstiltak">
				<Terms
					items={[
						{
							label: "Kryptering",
							text: "All trafikk går over HTTPS med HSTS. Passord lagres som hash, og hemmeligheter for to-trinns innlogging lagres kryptert.",
						},
						{
							label: "Adskilte data",
							text: "Hver kundes data er knyttet til kundens organisasjon og sjekkes på serveren for hver forespørsel, så én kunde aldri får se en annens.",
						},
						{
							label: "Tilgangsstyring",
							text: "Roller per organisasjon. Ansatte hos Agenci med tilgang til kundedata må bruke to-trinns innlogging, og all slik tilgang logges.",
						},
						{
							label: "Vern mot misbruk",
							text: "Begrensning av innloggingsforsøk og av meldinger i chatten, kontroll av all input, og grenser for filopplasting.",
						},
						{
							label: "Drift",
							text: "Databasen er ikke tilgjengelig fra internett, serveren kan bare nås med nøkkel, og avhengigheter oppdateres for kjente sårbarheter.",
						},
						{
							label: "Sletting",
							text: "Automatisk sletting av samtaler etter lagringstiden, og sletting av alle data ved opphør.",
						},
					]}
				/>
			</Clause>
		</LegalPage>
	);
}
