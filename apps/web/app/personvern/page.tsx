import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/cookie-settings-button";
import { LANDING_CONTACT_PAGE_PATH } from "@/modules/landing/constants";
import l from "@/modules/legal/legal.module.css";
import { Clause, COMPANY, LegalPage, Terms } from "@/modules/legal/legal-page";

export const metadata: Metadata = {
	title: "Personvernerklæring",
	description:
		"Hvordan Agenci samler inn, bruker og beskytter personopplysninger — for kunder, brukere og besøkende som chatter med en Agenci-assistent. I tråd med GDPR.",
	alternates: { canonical: "/personvern" },
	robots: { index: true, follow: true },
};

const TOC = [
	{ id: "innledning", label: "Innledning" },
	{ id: "roller", label: "Hvem er ansvarlig" },
	{ id: "opplysninger", label: "Hvilke opplysninger vi behandler" },
	{ id: "formal", label: "Formål og rettslig grunnlag" },
	{ id: "ki", label: "Kunstig intelligens" },
	{ id: "lagring", label: "Lagring og sletting" },
	{ id: "underleverandorer", label: "Underleverandører" },
	{ id: "tredjeland", label: "Overføring utenfor EØS" },
	{ id: "rettigheter", label: "Dine rettigheter" },
	{ id: "cookies", label: "Informasjonskapsler" },
	{ id: "sikkerhet", label: "Sikkerhet" },
	{ id: "barn", label: "Barn" },
	{ id: "endringer", label: "Endringer" },
	{ id: "kontakt", label: "Kontakt og klage" },
];

const mail = (
	<a href={`mailto:${COMPANY.email}`} className={l.link}>
		{COMPANY.email}
	</a>
);

export default function PersonvernPage() {
	return (
		<LegalPage
			eyebrow="Juridisk"
			title="Personvernerklæring"
			lead="Slik behandler vi personopplysninger når du bruker Agenci — enten du er kunde, bruker av dashboardet eller besøkende som chatter med en Agenci-assistent på en nettside."
			updated="2026-09-26"
			version="2.0"
			toc={TOC}
			related={{ href: "/vilkar", label: "Les vilkårene" }}
			summary={[
				"Vi selger aldri personopplysninger, og deler dem ikke for andres markedsføring.",
				"Når du chatter med en bedrift via Agenci, er det bedriften som bestemmer over samtalen — vi behandler den på deres vegne.",
				"Samtaler brukes til å gi svar, ikke til å trene AI-modeller.",
				"Du kan be om innsyn, retting og sletting når som helst.",
			]}
		>
			<Clause id="innledning" n={1} title="Innledning">
				<p>
					Denne erklæringen forklarer hvilke personopplysninger vi behandler,
					hvorfor, og hvilke rettigheter du har. Den gjelder nettstedet
					agenci.no, Agenci-dashboardet, chat-widgeten som bedrifter legger på
					sine nettsider, og kontakt med oss. Vi følger personopplysningsloven
					og EUs personvernforordning (GDPR).
				</p>
			</Clause>

			<Clause id="roller" n={2} title="Hvem er ansvarlig">
				<p>
					<strong>{COMPANY.legalLine}</strong> («Agenci», «vi») er
					behandlingsansvarlig for opplysninger om kunder, brukere av
					dashboardet, besøkende på agenci.no og alle som kontakter oss.
				</p>
				<p>
					Når du chatter med en bedrift gjennom en Agenci-assistent på
					bedriftens nettside, er{" "}
					<strong>bedriften behandlingsansvarlig</strong> for samtalen. Vi er da{" "}
					<strong>databehandler</strong> og behandler opplysningene kun etter
					bedriftens instruks, i tråd med databehandleravtalen vi har med dem.
					Spørsmål om slike samtaler bør rettes til bedriften — kontakter du
					oss, videreformidler vi henvendelsen.
				</p>
			</Clause>

			<Clause id="opplysninger" n={3} title="Hvilke opplysninger vi behandler">
				<Terms
					items={[
						{
							label: "Konto og brukere",
							text: "Navn, e-postadresse, organisasjon, rolle og innloggingsinformasjon for dem som bruker dashboardet.",
						},
						{
							label: "Samtaler i widgeten",
							text: "Meldinger besøkende skriver og svarene assistenten gir, samt navn og e-post dersom den besøkende selv oppgir det. I tillegg tekniske opplysninger som språk, tidssone, nettleser og hvilken side samtalen startet fra.",
						},
						{
							label: "Kundens kunnskap",
							text: "Innhold bedriften legger inn: tekst fra egen nettside, opplastede dokumenter og innstillinger. Slikt innhold kan inneholde personopplysninger dersom bedriften har lagt dem der.",
						},
						{
							label: "Betaling",
							text: "Faktura- og abonnementsopplysninger. Kortinformasjon behandles av Stripe — vi lagrer aldri kortnummer.",
						},
						{
							label: "Henvendelser",
							text: "Det du skriver i kontaktskjema, e-post eller påmelding til nyhetsbrev.",
						},
						{
							label: "Drift og sikkerhet",
							text: "IP-adresse, tidspunkter, feillogger og tekniske data som trengs for å drive tjenesten sikkert og rette feil.",
						},
					]}
				/>
			</Clause>

			<Clause id="formal" n={4} title="Formål og rettslig grunnlag">
				<Terms
					items={[
						{
							label: "Levere tjenesten",
							text: "Opprette konto, drive assistenten, lagre samtaler og kunnskap — avtale (GDPR art. 6 nr. 1 b).",
						},
						{
							label: "Support og kundeforhold",
							text: "Svare på henvendelser og følge opp kunder — avtale og berettiget interesse (art. 6 nr. 1 b og f).",
						},
						{
							label: "Sikkerhet og feilretting",
							text: "Forhindre misbruk, sikre stabil drift og rette feil — berettiget interesse (art. 6 nr. 1 f).",
						},
						{
							label: "Regnskap og lovkrav",
							text: "Fakturering og bokføring — rettslig forpliktelse (art. 6 nr. 1 c).",
						},
						{
							label: "Statistikk og markedsføring",
							text: "Ytelsesmåling og nyhetsbrev kun med samtykke (art. 6 nr. 1 a). Samtykket kan trekkes tilbake når som helst.",
						},
					]}
				/>
			</Clause>

			<Clause id="ki" n={5} title="Kunstig intelligens">
				<p>
					Assistenten bruker språkmodeller fra OpenAI via deres API for å forstå
					spørsmål og skrive svar ut fra bedriftens kunnskap. Samtaleinnholdet
					sendes til modellen for å lage svaret. Etter OpenAIs vilkår for
					API-bruk brukes ikke disse dataene til å trene modellene deres.
				</p>
				<p>
					Assistenten tar ikke automatiserte avgjørelser som har rettslig
					virkning for deg eller på lignende måte påvirker deg betydelig (GDPR
					art. 22). Du kan alltid be om å få snakke med et menneske der
					bedriften tilbyr det.
				</p>
			</Clause>

			<Clause id="lagring" n={6} title="Lagring og sletting">
				<p>Vi lagrer ikke opplysninger lenger enn nødvendig for formålet:</p>
				<Terms
					items={[
						{
							label: "Besøksøkter",
							text: "En anonym besøksøkt i widgeten utløper etter 24 timer. Den besøkende kan selv slette økten og samtalene sine fra widgeten.",
						},
						{
							label: "Samtaler",
							text: "Lagres så lenge bedriften har konto hos oss, slik at de kan følges opp. De slettes når bedriften sletter samtalen, assistenten eller kontoen.",
						},
						{
							label: "Kunnskap og filer",
							text: "Lagres til bedriften fjerner kilden, assistenten eller kontoen.",
						},
						{
							label: "Konto",
							text: "Slettes når kontoen avsluttes, med unntak av det vi må oppbevare etter lov.",
						},
						{
							label: "Regnskap",
							text: "Faktura- og betalingsopplysninger oppbevares i fem år etter bokføringsloven.",
						},
						{
							label: "Henvendelser",
							text: "Kontaktskjemaet lagres ikke i databasen vår, men sendes til vår e-post. Nyhetsbrevadresser beholdes til du melder deg av.",
						},
					]}
				/>
			</Clause>

			<Clause id="underleverandorer" n={7} title="Underleverandører">
				<p>
					Vi bruker nøye utvalgte leverandører for å drive tjenesten. De
					behandler opplysninger kun på våre vegne og etter databehandleravtale:
				</p>
				<Terms
					items={[
						{
							label: "OpenAI",
							text: "Språkmodeller som skriver svar og gjør kunnskapen søkbar.",
						},
						{
							label: "Firecrawl",
							text: "Henter innhold og profil fra bedriftens nettside når en assistent opprettes.",
						},
						{
							label: "LlamaIndex",
							text: "Leser og strukturerer opplastede dokumenter.",
						},
						{
							label: "Inngest",
							text: "Kjører bakgrunnsjobber, som innlesing av kunnskap.",
						},
						{ label: "Stripe", text: "Betaling og abonnement." },
						{
							label: "Sentry",
							text: "Feilsporing, med lagring i EU. Ytelsesmåling kun med samtykke.",
						},
						{
							label: "Resend",
							text: "Sender e-post fra kontaktskjema og nyhetsbrev.",
						},
						{
							label: "Cookiebot",
							text: "Håndterer samtykke til informasjonskapsler.",
						},
						{
							label: "Skyleverandør",
							text: "Drift av database og fillagring for tjenesten.",
						},
					]}
				/>
				<p>
					Oppdatert oversikt over underleverandører får du ved å kontakte oss.
				</p>
			</Clause>

			<Clause id="tredjeland" n={8} title="Overføring utenfor EØS">
				<p>
					Noen leverandører er etablert i USA. Overføring skjer bare med gyldig
					overføringsgrunnlag etter GDPR, som EU–US Data Privacy Framework eller
					EU-kommisjonens standardkontraktsklausuler, med nødvendige
					tilleggstiltak.
				</p>
			</Clause>

			<Clause id="rettigheter" n={9} title="Dine rettigheter">
				<Terms
					items={[
						{
							label: "Innsyn",
							text: "Få vite hvilke opplysninger vi har om deg, og få en kopi.",
						},
						{
							label: "Retting",
							text: "Få rettet feil eller ufullstendige opplysninger.",
						},
						{
							label: "Sletting",
							text: "Få opplysninger slettet når vilkårene i GDPR er oppfylt.",
						},
						{
							label: "Begrensning",
							text: "Kreve at behandlingen begrenses i visse tilfeller.",
						},
						{
							label: "Dataportabilitet",
							text: "Få opplysninger du har gitt oss i et maskinlesbart format.",
						},
						{
							label: "Protest",
							text: "Protestere mot behandling som bygger på berettiget interesse.",
						},
						{
							label: "Trekke samtykke",
							text: "Når som helst, uten at det påvirker behandlingen før du trakk det.",
						},
					]}
				/>
				<p>
					Send en e-post til {mail} eller bruk{" "}
					<Link href={LANDING_CONTACT_PAGE_PATH} className={l.link}>
						kontaktskjemaet
					</Link>{" "}
					og merk henvendelsen «Personvern». Vi svarer innen én måned. Gjelder
					det en samtale med en bedrift, hjelper vi bedriften med å svare deg.
				</p>
			</Clause>

			<Clause id="cookies" n={10} title="Informasjonskapsler">
				<p>
					Vi bruker Cookiebot til å be om og lagre samtykket ditt. Bare det som
					er strengt nødvendig, settes uten samtykke.
				</p>
				<Terms
					items={[
						{
							label: "Nødvendige",
							text: "Innlogging i dashboardet, sikkerhet og lagring av samtykkevalget ditt.",
						},
						{
							label: "Statistikk",
							text: "Ytelsesmåling i Sentry, kun hvis du samtykker.",
						},
						{
							label: "Chat-widgeten",
							text: "Lagrer en anonym økt-ID i nettleserens lokale lagring, slik at samtalen ikke forsvinner når du bytter side. Widgeten setter ingen informasjonskapsler.",
						},
					]}
				/>
				<p>
					Du kan endre eller trekke samtykket når som helst:{" "}
					<CookieSettingsButton />
				</p>
			</Clause>

			<Clause id="sikkerhet" n={11} title="Sikkerhet">
				<p>
					Vi beskytter opplysningene med tekniske og organisatoriske tiltak:
					kryptert overføring, tilgangsstyring per organisasjon, adskilte data
					mellom kunder, begrenset tilgang for ansatte og løpende overvåking.
					Ved et sikkerhetsbrudd som kan ramme deg, varsler vi Datatilsynet
					innen 72 timer der loven krever det — og deg og berørte kunder uten
					ugrunnet opphold.
				</p>
			</Clause>

			<Clause id="barn" n={12} title="Barn">
				<p>
					Agenci er laget for virksomheter og retter seg ikke mot barn under 16
					år. Oppdager vi at vi har opplysninger om et barn uten gyldig
					grunnlag, sletter vi dem.
				</p>
			</Clause>

			<Clause id="endringer" n={13} title="Endringer">
				<p>
					Vi oppdaterer erklæringen når tjenesten eller regelverket endres.
					Gjeldende versjon ligger alltid her, med dato og versjonsnummer
					øverst. Vesentlige endringer varsler vi på e-post eller i dashboardet.
				</p>
			</Clause>

			<Clause id="kontakt" n={14} title="Kontakt og klage">
				<p>
					Spørsmål om personvern: {mail}. Mener du at vi behandler opplysninger
					i strid med regelverket, kan du klage til{" "}
					<a
						href="https://www.datatilsynet.no"
						target="_blank"
						rel="noopener noreferrer"
						className={l.link}
					>
						Datatilsynet
					</a>
					. Vi setter pris på om du tar kontakt med oss først, så vi kan rydde
					opp.
				</p>
				<p>Behandlingsansvarlig: {COMPANY.legalLine}.</p>
			</Clause>
		</LegalPage>
	);
}
