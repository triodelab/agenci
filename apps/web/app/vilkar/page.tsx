import type { Metadata } from "next";
import Link from "next/link";
import { LANDING_CONTACT_PAGE_PATH } from "@/modules/landing/constants";
import l from "@/modules/legal/legal.module.css";
import { Clause, COMPANY, LegalPage, Terms } from "@/modules/legal/legal-page";

export const metadata: Metadata = {
	title: "Vilkår for bruk",
	description:
		"Vilkårene for Agenci — konto, planer og betaling, oppsigelse, data og personvern, bruk av AI, ansvar og øvrige bestemmelser.",
	alternates: { canonical: "/vilkar" },
	robots: { index: true, follow: true },
};

const TOC = [
	{ id: "avtalen", label: "Avtalen" },
	{ id: "definisjoner", label: "Definisjoner" },
	{ id: "tjenesten", label: "Tjenesten" },
	{ id: "konto", label: "Konto og tilgang" },
	{ id: "planer", label: "Planer og bruksgrenser" },
	{ id: "betaling", label: "Priser og betaling" },
	{ id: "oppsigelse", label: "Oppsigelse" },
	{ id: "kundedata", label: "Kundens innhold" },
	{ id: "personvern", label: "Personvern og databehandling" },
	{ id: "bruk", label: "Akseptabel bruk" },
	{ id: "ki", label: "Kunstig intelligens" },
	{ id: "tredjeparter", label: "Integrasjoner og tredjeparter" },
	{ id: "rettigheter", label: "Immaterielle rettigheter" },
	{ id: "konfidensialitet", label: "Konfidensialitet" },
	{ id: "drift", label: "Drift og support" },
	{ id: "ansvar", label: "Ansvar" },
	{ id: "force-majeure", label: "Force majeure" },
	{ id: "opphor", label: "Opphør og data" },
	{ id: "endringer", label: "Endringer i vilkårene" },
	{ id: "lov", label: "Lovvalg og tvister" },
	{ id: "ovrig", label: "Øvrige bestemmelser" },
	{ id: "kontakt", label: "Kontakt" },
];

export default function VilkarPage() {
	return (
		<LegalPage
			eyebrow="Juridisk"
			title="Vilkår for bruk"
			lead="Disse vilkårene gjelder når din virksomhet bruker Agenci — nettstedet, dashboardet, chat-widgeten og tilhørende tjenester."
			updated="2026-09-26"
			version="3.0"
			toc={TOC}
			related={{ href: "/personvern", label: "Les personvernerklæringen" }}
			summary={[
				"Agenci er en tjeneste for virksomheter. Ingen bindingstid — dere kan si opp når som helst.",
				"Dere eier innholdet og samtalene deres. Vi bruker dem bare til å levere tjenesten.",
				"AI kan ta feil. Dere bestemmer hva assistenten vet, og følger med på svarene.",
				"Ved oppsigelse kan dere få ut dataene deres før de slettes.",
			]}
		>
			<Clause id="avtalen" n={1} title="Avtalen">
				<p>
					Vilkårene er en bindende avtale mellom virksomheten som oppretter
					konto («Kunden», «dere») og {COMPANY.name}, org.nr. {COMPANY.orgNr}{" "}
					(«Agenci», «vi»). Den som godtar vilkårene på vegne av en virksomhet,
					bekrefter å ha fullmakt til det.
				</p>
				<p>
					Ved å opprette konto eller bruke tjenesten godtar dere vilkårene.
					Tjenesten er beregnet for næringsdrivende; forbrukerkjøpsloven og
					angrerettloven gjelder derfor ikke. Behandling av personopplysninger
					er beskrevet i{" "}
					<Link href="/personvern" className={l.link}>
						personvernerklæringen
					</Link>
					.
				</p>
			</Clause>

			<Clause id="definisjoner" n={2} title="Definisjoner">
				<Terms
					items={[
						{
							label: "Tjenesten",
							text: "Agenci-plattformen: nettsted, dashboard, AI-assistenter, chat-widget og tilhørende funksjoner.",
						},
						{
							label: "Assistent",
							text: "En AI-agent Kunden setter opp i tjenesten, med egen kunnskap og innstillinger.",
						},
						{
							label: "Kundedata",
							text: "Alt Kunden legger inn eller som oppstår ved bruk: kunnskap, filer, innstillinger og samtaler.",
						},
						{
							label: "Brukere",
							text: "Personer Kunden gir tilgang til dashboardet.",
						},
						{
							label: "Besøkende",
							text: "Personer som chatter med Kundens assistent på Kundens nettsted.",
						},
					]}
				/>
			</Clause>

			<Clause id="tjenesten" n={3} title="Tjenesten">
				<p>
					Agenci lar Kunden sette opp AI-assistenter som svarer Besøkende ut fra
					Kundens egen kunnskap, følge samtalene og ta over når et menneske
					trengs. Innholdet i hver plan fremgår av{" "}
					<Link href="/priser" className={l.link}>
						prissiden
					</Link>
					.
				</p>
				<p>
					Vi utvikler tjenesten løpende og kan endre eller fjerne funksjoner. Vi
					fjerner ikke vesentlig funksjonalitet i en betalt plan uten saklig
					grunn og rimelig varsel.
				</p>
			</Clause>

			<Clause id="konto" n={4} title="Konto og tilgang">
				<p>
					Kunden sørger for at registrerte opplysninger er riktige, holder
					innlogginger og nøkler hemmelige, og gir Brukere bare den tilgangen de
					trenger. Aktivitet på kontoen regnes som Kundens. Mistanke om
					uautorisert tilgang skal varsles oss straks.
				</p>
			</Clause>

			<Clause id="planer" n={5} title="Planer og bruksgrenser">
				<p>
					Hver plan har grenser for blant annet antall samtaler per måned,
					assistenter og Brukere. Når en grense nås, kan tjenesten begrenses til
					neste periode eller til Kunden oppgraderer. Gratisplanen tilbys uten
					vederlag og kan endres eller avvikles med rimelig varsel.
				</p>
				<p>
					Vi kan begrense bruk som belaster tjenesten uforholdsmessig eller
					åpenbart går utover planens formål.
				</p>
			</Clause>

			<Clause id="betaling" n={6} title="Priser og betaling">
				<p>
					Priser fremgår av prissiden og oppgis eksklusive merverdiavgift.
					Abonnementet betales forskuddsvis per måned eller år via Stripe og
					fornyes automatisk til det sies opp. Prisendringer for eksisterende
					kunder varsles minst 30 dager før de trer i kraft.
				</p>
				<p>
					Ved manglende betaling kan vi, etter påminnelse, begrense eller stanse
					tjenesten til utestående beløp er betalt.
				</p>
			</Clause>

			<Clause id="oppsigelse" n={7} title="Oppsigelse">
				<p>
					Det er ingen bindingstid. Kunden kan si opp abonnementet når som helst
					i dashboardet eller ved å kontakte oss. Oppsigelsen får virkning ved
					utløpet av perioden som er betalt, og tjenesten kan brukes ut
					perioden. Innbetalt vederlag for påbegynt periode refunderes ikke, med
					mindre annet følger av avtale eller ufravikelig lov.
				</p>
			</Clause>

			<Clause id="kundedata" n={8} title="Kundens innhold">
				<p>
					Kunden eier Kundedata. Kunden gir oss rett til å lagre, behandle og
					vise Kundedata i den grad det trengs for å levere, sikre og forbedre
					tjenesten. Vi bruker ikke Kundedata til å trene AI-modeller.
				</p>
				<p>
					Kunden står inne for at Kundedata ikke krenker andres rettigheter
					eller bryter lov, og har ansvaret for at assistentens kunnskap er
					riktig og oppdatert.
				</p>
			</Clause>

			<Clause id="personvern" n={9} title="Personvern og databehandling">
				<p>
					For personopplysninger om Besøkende er Kunden behandlingsansvarlig og
					Agenci databehandler. Databehandleravtalen er en del av disse
					vilkårene og kan fås på forespørsel. Kunden sørger for å informere
					Besøkende om behandlingen, for eksempel i sin egen
					personvernerklæring, og for at det finnes et gyldig rettslig grunnlag.
				</p>
			</Clause>

			<Clause id="bruk" n={10} title="Akseptabel bruk">
				<p>Tjenesten skal ikke brukes til å:</p>
				<Terms
					items={[
						{
							label: "Ulovlig innhold",
							text: "Spre ulovlig, krenkende, diskriminerende eller villedende innhold.",
						},
						{
							label: "Misbruk",
							text: "Sende spam, svindle, eller samle inn opplysninger uten grunnlag.",
						},
						{
							label: "Sikkerhet",
							text: "Omgå sikkerhetstiltak, teste sårbarheter uten avtale eller få tilgang til andres data.",
						},
						{
							label: "Belastning",
							text: "Overbelaste tjenesten eller bruke automatisering som forstyrrer driften.",
						},
						{
							label: "Etterligning",
							text: "Utgi seg for å være en annen person eller virksomhet.",
						},
						{
							label: "Kopiering",
							text: "Dekompilere, kopiere eller videreselge tjenesten, utover det ufravikelig lov tillater.",
						},
					]}
				/>
			</Clause>

			<Clause id="ki" n={11} title="Kunstig intelligens">
				<p>
					Svar fra AI kan være unøyaktige eller ufullstendige. Assistenten skal
					ikke brukes som eneste grunnlag for medisinske, juridiske, økonomiske
					eller andre beslutninger med vesentlig betydning for Besøkende. Kunden
					er ansvarlig for å kontrollere svarene, gi tydelige instrukser og la
					et menneske ta over der det er nødvendig.
				</p>
				<p>
					Kunden skal gjøre det tydelig for Besøkende at de snakker med en
					AI-assistent.
				</p>
			</Clause>

			<Clause id="tredjeparter" n={12} title="Integrasjoner og tredjeparter">
				<p>
					Tjenesten bruker og kan kobles til tredjepartstjenester, som
					betalingsløsninger og språkmodeller. Bruk av slike tjenester reguleres
					også av deres vilkår. Vi er ikke ansvarlige for tredjeparters
					tilgjengelighet eller innhold, men velger leverandører med omhu.
				</p>
			</Clause>

			<Clause id="rettigheter" n={13} title="Immaterielle rettigheter">
				<p>
					Agenci, programvaren, designet og varemerkene tilhører oss eller våre
					lisensgivere. Kunden får en ikke-eksklusiv, ikke-overførbar rett til å
					bruke tjenesten i avtaleperioden. Tilbakemeldinger og forslag kan vi
					bruke fritt til å forbedre tjenesten.
				</p>
			</Clause>

			<Clause id="konfidensialitet" n={14} title="Konfidensialitet">
				<p>
					Partene skal behandle hverandres fortrolige opplysninger konfidensielt
					og bare bruke dem for å oppfylle avtalen. Plikten gjelder også etter
					at avtalen er avsluttet, men ikke opplysninger som er allment kjent
					eller må gis ut etter lov.
				</p>
			</Clause>

			<Clause id="drift" n={15} title="Drift og support">
				<p>
					Vi arbeider for høy oppetid, men kan ikke garantere at tjenesten
					alltid er tilgjengelig eller feilfri. Planlagt vedlikehold varsles når
					det er mulig. Support gis på e-post; omfang og responstid avhenger av
					planen.
				</p>
			</Clause>

			<Clause id="ansvar" n={16} title="Ansvar">
				<p>
					Vårt samlede ansvar er begrenset til det Kunden har betalt for
					tjenesten de siste tolv månedene før kravet oppsto. Vi er ikke
					ansvarlige for indirekte tap, som tapt fortjeneste, tapte data eller
					tap av goodwill. Begrensningene gjelder ikke ved grov uaktsomhet eller
					forsett.
				</p>
				<p>
					Kunden holder oss skadesløs for krav fra tredjeparter som skyldes
					Kundedata eller Kundens bruk i strid med vilkårene.
				</p>
			</Clause>

			<Clause id="force-majeure" n={17} title="Force majeure">
				<p>
					Ingen av partene er ansvarlige for forsinkelse eller mangler som
					skyldes forhold utenfor deres kontroll, som naturhendelser, krig,
					omfattende strømbrudd, alvorlige angrep på infrastruktur eller svikt
					hos underleverandører som ikke kunne forutses.
				</p>
			</Clause>

			<Clause id="opphor" n={18} title="Opphør og data">
				<p>
					Vi kan stanse eller avslutte tilgangen ved vesentlig brudd på
					vilkårene, manglende betaling etter påminnelse, eller når det er
					nødvendig for sikkerheten.
				</p>
				<p>
					Før kontoen avsluttes, kan Kunden be om å få utlevert Kundedata i et
					vanlig format. Deretter slettes Kundedata innen rimelig tid, med
					unntak av det vi må oppbevare etter lov. Bestemmelser som etter sin
					art skal gjelde videre — som ansvar, konfidensialitet og lovvalg —
					gjelder også etter opphør.
				</p>
			</Clause>

			<Clause id="endringer" n={19} title="Endringer i vilkårene">
				<p>
					Vi kan endre vilkårene. Vesentlige endringer varsles på e-post eller i
					dashboardet minst 30 dager før de trer i kraft. Fortsatt bruk etter
					dette regnes som aksept. Godtar ikke Kunden endringene, kan
					abonnementet sies opp før de trer i kraft.
				</p>
			</Clause>

			<Clause id="lov" n={20} title="Lovvalg og tvister">
				<p>
					Avtalen reguleres av norsk rett. Tvister skal først søkes løst ved
					forhandlinger. Lykkes ikke det, avgjøres tvisten av de alminnelige
					domstolene med Oslo tingrett som avtalt verneting.
				</p>
			</Clause>

			<Clause id="ovrig" n={21} title="Øvrige bestemmelser">
				<p>
					Vilkårene, prissiden og eventuell særskilt avtale utgjør hele avtalen.
					Ved motstrid går en særskilt avtale foran vilkårene. Er en bestemmelse
					ugyldig, gjelder resten fullt ut. Kunden kan ikke overdra avtalen uten
					vårt samtykke. Vi kan overdra den i forbindelse med omorganisering
					eller salg av virksomheten. Varsler sendes til e-postadressen som er
					registrert på kontoen.
				</p>
			</Clause>

			<Clause id="kontakt" n={22} title="Kontakt">
				<p>
					Spørsmål om vilkårene sendes til{" "}
					<a href={`mailto:${COMPANY.email}`} className={l.link}>
						{COMPANY.email}
					</a>{" "}
					eller via{" "}
					<Link href={LANDING_CONTACT_PAGE_PATH} className={l.link}>
						kontaktskjemaet
					</Link>
					.
				</p>
				<p>Leverandør: {COMPANY.legalLine}.</p>
			</Clause>
		</LegalPage>
	);
}
