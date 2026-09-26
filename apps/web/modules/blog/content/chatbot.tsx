import {
	Bullets,
	Callout,
	Cards,
	DataTable,
	H3,
	Section,
	Steps,
} from "../ui/prose";

export default function ChatbotArticle() {
	return (
		<>
			<Section id="hva-er-chatbot" title="Hva er en chatbot?">
				<p>
					En chatbot er et dataprogram designet for å simulere samtale med
					mennesker, enten via tekst eller tale. Disse digitale assistentene har
					utviklet seg enormt de siste årene — fra enkle regelbaserte systemer
					til avanserte AI-drevne løsninger som kan forstå kontekst, lære og gi
					svært relevante svar.
				</p>
				<p>
					Hos Agenci utvikler vi AI-drevne chatbotopplevelser spesialtilpasset
					for norske bedrifter. Målet er å forbedre kundeopplevelsen ved å tilby
					øyeblikkelig hjelp, redusere ventetider og frigjøre menneskelige
					ressurser.
				</p>
			</Section>

			<Section id="mer-enn-assistent" title="Mer enn bare en digital assistent">
				<p>
					Mange ser på en chatbot som en enkel «spørsmål og svar»-maskin, men i
					virkeligheten er potensialet mye større. En moderne chatbot er en
					strategisk investering som kan:
				</p>
				<Bullets
					items={[
						{
							label: "Forbedre tilgjengelighet",
							text: "Gi kundene svar 24/7, uavhengig av åpningstider.",
						},
						{
							label: "Redusere driftskostnader",
							text: "Automatisere rutinemessige henvendelser og frigjøre tid for ansatte.",
						},
						{
							label: "Øke kundetilfredsheten",
							text: "Tilby rask og konsistent service med presise svar.",
						},
						{
							label: "Samle verdifull innsikt",
							text: "Analysere kundehenvendelser for å identifisere trender og forbedringsområder.",
						},
					]}
				/>
				<Callout>
					Spesielt for norske virksomheter kan en chatbot være avgjørende i et
					konkurransepreget marked hvor kundelojalitet ofte avhenger av
					servicekvalitet.
				</Callout>
			</Section>

			<Section id="hvordan-fungerer" title="Hvordan fungerer en chatbot?">
				<p>
					Kjernen i en moderne chatbot er kunstig intelligens (AI) og
					maskinlæring (ML). I motsetning til eldre systemer som var avhengige
					av forhåndsdefinerte skript, kan dagens AI-chatbotløsninger forstå
					naturlig språk gjennom Natural Language Processing (NLP) — og tolke
					intensjonen bak spørsmålet, selv om formuleringen varierer.
				</p>
				<p>
					Agenci sin løsning skiller seg ut ved at den bruker din egen
					kunnskapsbase — dine FAQ, prislister og retningslinjer — til å
					formulere svar. Dette sikrer faktiske og kontekstbevisste svar uten de
					såkalte «hallusinasjonene» man ser hos generiske AI-systemer.
				</p>
				<Callout>
					Vi garanterer 100 % bruk av dine egne data, noe som forhindrer
					feilinformasjon og sikrer høy kvalitet i kundedialogen.
				</Callout>
			</Section>

			<Section id="typer-teknologier" title="Ulike typer chatbot-teknologier">
				<p>
					Selv om den underliggende teknologien er AI, finnes det ulike
					tilnærminger til hvordan en chatbot drives:
				</p>
				<Cards
					items={[
						{
							title: "Regelbaserte chatbotter",
							text: "Følger et forhåndsbestemt sett med regler og svaralternativer. Effektiv for enkle og repeterende oppgaver, men mangler evnen til å forstå nyanserte spørsmål.",
						},
						{
							title: "AI-drevne chatbotter (NLP/NLU)",
							text: "Utnytter naturlig språkbehandling og forståelse til å tolke brukerspråk, kontekst og intensjon. Dette tillater mer flytende og menneskelignende samtaler.",
						},
						{
							title: "Generative AI-chatbotter",
							text: (
								<>
									Genererer unike svar basert på en kunnskapsbase i stedet for
									forhåndsdefinerte alternativer.{" "}
									<strong>Dette er teknologien Agenci bygger på.</strong>
								</>
							),
							highlight: true,
						},
					]}
				/>
			</Section>

			<Section
				id="fordeler"
				title="Fordeler med en intelligent chatbot for din bedrift"
			>
				<p>
					Implementering av en chatbot kan gi en rekke målbare fordeler. Vi har
					sett hvordan kundene våre har transformert sin kundeservice og fått
					mer tid til komplekse oppgaver.
				</p>
				<H3>Økt effektivitet og tidsbesparelser</H3>
				<p>
					En chatbot kan håndtere et stort volum av henvendelser samtidig, uten
					ventetid. Spørsmål som «Hva er åpningstidene?» eller «Hvor finner jeg
					fakturaen min?» besvares umiddelbart — og dine ansatte kan fokusere på
					saker som faktisk krever menneskelig innsikt.
				</p>
				<H3>Forbedret kundetilfredshet</H3>
				<p>
					Når kunder får umiddelbar hjelp, forbedres opplevelsen betydelig. En
					chatbot tilgjengelig 24/7 sørger for at ingen spørsmål forblir
					ubesvart — og reduserer risikoen for at kunden velger en konkurrent.
					Agenci tilbyr også sømløs overføring til et menneske dersom chatboten
					støter på en kompleks henvendelse.
				</p>
				<H3>Kostnadsreduksjon</H3>
				<p>
					Ved å automatisere deler av kundeservicen kan bedrifter redusere
					behovet for ressurser på repetitivt arbeid. En chatbot er en
					investering som raskt betaler seg tilbake.
				</p>
				<DataTable
					caption="Fordeler med en chatbot og hvordan Agenci løser dem"
					head={["Fordel", "Beskrivelse", "Agenci-løsning"]}
					rows={[
						[
							"24/7 tilgjengelighet",
							"Svarer kunder døgnet rundt",
							"Automatisert chatbot",
						],
						["Raskere svar", "Øyeblikkelig informasjon", "AI-drevet respons"],
						["Bedre kundeopplevelse", "Fornøyde kunder", "Personlige svar"],
						["Reduserte kostnader", "Effektiv ressursbruk", "Automatisering"],
						["Innsiktsfull data", "Forbedringspotensial", "Omfattende analyse"],
					]}
				/>
			</Section>

			<Section
				id="velge-riktig"
				title="Velge riktig chatbot: hva du bør se etter"
			>
				<p>
					Når du skal implementere en chatbot, er det viktig å velge en løsning
					som passer bedriftens unike behov. Her er fem kritiske faktorer å
					vurdere:
				</p>
				<Steps
					items={[
						{
							title: "Enkel implementering",
							text: "Agenci kan gå live på under 5 minutter ved å lime inn én linje med kode på nettstedet ditt. Ingen IT-ekspertise nødvendig.",
						},
						{
							title: "Nøyaktighet og relevans",
							text: "Vår løsning bruker din bedrifts egne data og kunnskapsbase. Dette eliminerer risikoen for hallusinasjoner og sikrer at chatboten snakker med din bedrifts stemme.",
						},
						{
							title: "Fleksibilitet og skalerbarhet",
							text: "Velg en chatbot som kan vokse med bedriften din. Agenci er skalerbar og tilpasses dine behov — enten du er en liten bedrift eller en stor organisasjon.",
						},
						{
							title: "Datapersonvern og GDPR-overholdelse",
							text: "I Norge og EU er strenge GDPR-regler avgjørende. Agenci er 100 % GDPR-kompatibel, og all data forblir kundens eiendom.",
						},
						{
							title: "Rapportering og analyse",
							text: "Agenci gir deg omfattende innsikt i kundehenvendelser slik at du kan forstå hva kundene spør om og optimalisere informasjonen din.",
						},
					]}
				/>
				<DataTable
					caption="Agenci i korte trekk"
					head={["Funksjon", "Agenci"]}
					rows={[
						["Oppsettstid", "Under 5 minutter"],
						["Tilgjengelighet", "24/7"],
						["Datakilde", "Kun kundens egne data"],
						["GDPR-kompatibel", "Ja"],
						["Overlevering til menneske", "Ja"],
						["Analyseverktøy", "Ja"],
						["Bindingstid", "Ingen"],
					]}
				/>
			</Section>

			<Section
				id="fremtiden"
				title="Fremtiden for chatbot-teknologi og kundeservice"
			>
				<p>
					Utviklingen innen AI og maskinlæring er rask, og chatbotløsninger blir
					stadig mer sofistikerte. Vi ser en fremtid der chatboten vil spille en
					enda mer sentral rolle — ikke bare svare på spørsmål, men proaktivt
					tilby løsninger, veilede kunder gjennom komplekse prosesser og gi en
					personlig opplevelse som tidligere var forbeholdt
					ansatt-kunde-interaksjoner.
				</p>
				<p>
					Agenci jobber kontinuerlig med å utvide integrasjonene sine — og vi
					vil snart tilby koblinger til populære plattformer som HubSpot,
					Shopify, Gmail, Webhooks og Slack. En chatbot i dag er en investering
					i fremtidssikring av din digitale tilstedeværelse.
				</p>
			</Section>
		</>
	);
}
