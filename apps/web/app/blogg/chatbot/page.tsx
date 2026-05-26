import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import Link from "next/link";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { MarketingSubpageCta } from "@/modules/landing/ui/components/marketing-subpage-cta";

export const metadata: Metadata = {
  title: "Chatbot: Forbedre Kundeservice, Reduser Kostnader og Frigjør Tid",
  description:
    "Lær hvordan en AI-chatbot kan forbedre kundeservicen, redusere kostnader og frigjøre tid 24/7. Alt om chatbot-teknologi for norske bedrifter — av Agenci.",
  keywords: [
    "chatbot",
    "AI chatbot",
    "chatbot nettside",
    "chatbot norsk",
    "chatbot bedrift",
    "chatbot kundeservice",
    "KI chatassistent",
    "automatisk kundeservice",
  ],
  alternates: { canonical: "/blogg/chatbot" },
  openGraph: {
    title: "Chatbot: Forbedre Kundeservice, Reduser Kostnader og Frigjør Tid",
    description:
      "En AI-chatbot svarer kunder 24/7, reduserer kostnader og frigjør tid for teamet ditt. Les alt om chatbot-teknologi for norske bedrifter.",
    type: "article",
    publishedTime: "2026-05-26T00:00:00.000Z",
    authors: ["Agenci"],
    locale: "nb_NO",
  },
  robots: { index: true, follow: true },
};

const jsonLdArticle = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Chatbot: Forbedre Kundeservice, Reduser Kostnader og Frigjør Tid",
  description:
    "Lær hvordan en AI-chatbot kan forbedre kundeservicen, redusere kostnader og frigjøre tid 24/7 for norske bedrifter.",
  author: { "@type": "Organization", name: "Agenci", url: "https://agenci.no" },
  publisher: {
    "@type": "Organization",
    name: "Agenci",
    url: "https://agenci.no",
    logo: { "@type": "ImageObject", url: "https://agenci.no/AgenciLogo.png" },
  },
  datePublished: "2026-05-26",
  dateModified: "2026-05-26",
  url: "https://agenci.no/blogg/chatbot",
  inLanguage: "nb",
  keywords: "chatbot, AI chatbot, chatbot norsk, chatbot bedrift, chatbot kundeservice",
};

const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Hva er en chatbot, og hvordan fungerer den?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En chatbot er et dataprogram som simulerer samtaler med mennesker via tekst. Den bruker AI og naturlig språkbehandling (NLP) for å forstå brukerens spørsmål og generere relevante svar. Agenci sin chatbot bruker din bedrifts egne data for å gi presise og kontekstuelle svar.",
      },
    },
    {
      "@type": "Question",
      name: "Hva er hovedfordelene med å implementere en chatbot?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "De største fordelene inkluderer 24/7 tilgjengelighet for kunder, raskere responstider, reduserte driftskostnader ved å automatisere rutineoppgaver, og innsamling av verdifull data om kundehenvendelser.",
      },
    },
    {
      "@type": "Question",
      name: "Er Agenci sin chatbot GDPR-kompatibel?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja, Agenci er 100 % GDPR-kompatibel. All data som behandles av chatboten forblir kundens eiendom.",
      },
    },
    {
      "@type": "Question",
      name: "Hvor lang tid tar det å sette opp en chatbot fra Agenci?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oppsettet er svært raskt. Chatboten kan gå live på under 5 minutter ved å lime inn én enkelt linje med kode på nettsiden din. Ingen IT-kompetanse nødvendig.",
      },
    },
    {
      "@type": "Question",
      name: "Kan Agenci sin chatbot overføre samtaler til et menneske?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja. Agenci tilbyr funksjoner for sanntidsovervåking og sømløs overføring til et menneskelig teammedlem dersom chatboten møter en kompleks henvendelse.",
      },
    },
    {
      "@type": "Question",
      name: "Hva skiller Agenci sin chatbot fra andre løsninger?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Agenci sin chatbot bruker eksklusivt din bedrifts egen kunnskapsbase (FAQ, prisliste, retningslinjer) for å generere svar. Dette sikrer faktiske, kontekstbevisste svar uten hallusinasjoner eller generiske robotreplikker.",
      },
    },
    {
      "@type": "Question",
      name: "Hvilke prisplaner tilbyr Agenci?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Agenci tilbyr en gratis plan med opptil 50 samtaler per måned. Betalte planer inkluderer Starter, Pro, Business og Enterprise med varierende antall samtaler og funksjoner. Ingen bindingstid.",
      },
    },
  ],
};

const toc = [
  { id: "hva-er-chatbot", label: "Hva er en chatbot?" },
  { id: "mer-enn-assistent", label: "Mer enn en digital assistent" },
  { id: "hvordan-fungerer", label: "Hvordan fungerer en chatbot?" },
  { id: "typer-teknologier", label: "Typer chatbot-teknologier" },
  { id: "fordeler", label: "Fordeler for din bedrift" },
  { id: "velge-riktig", label: "Velge riktig chatbot" },
  { id: "fremtiden", label: "Fremtiden for chatbot" },
  { id: "faq", label: "Ofte stilte spørsmål" },
];

export default function ChatbotBloggPage() {
  return (
    <MarketingPageLayout>
      <Script
        id="json-ld-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <Script
        id="json-ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <div className="bg-[#1C1C1C]">

        {/* ── HERO ── */}
        <header className="border-b border-[#2a2a2a]">
          <div className="mx-auto max-w-[900px] px-6 py-16 md:py-20 xl:px-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.5px] text-[#6b7280]">
              <Link href="/blogg" className="transition-colors hover:text-[#9ca3af]">Blogg</Link>
              <span className="mx-2 opacity-40">·</span>
              Kundeservice &amp; AI
            </p>
            <h1 className="mt-4 text-[36px] font-semibold leading-[1.15] tracking-[-1px] text-[#f2f3f5] md:text-[44px]">
              Chatbot: forbedre kundeservice,<br className="hidden md:block" /> reduser kostnader og frigjør tid
            </h1>
            <p className="mt-5 max-w-[620px] text-[17px] leading-[1.6] text-[#9ca3af]">
              I dagens digitale landskap forventer kunder raske og nøyaktige svar uansett tid på døgnet.
              Her er alt du trenger å vite om chatbot-teknologi — og hvordan det kan transformere
              kundeservicen din.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#4b5563]">
              <span>Av <span className="text-[#6b7280]">Agenci</span></span>
              <span>26. mai 2026</span>
              <span>8 min lesetid</span>
            </div>
          </div>

          {/* Hero-illustration */}
          <div className="mx-auto max-w-[900px] px-6 xl:px-8">
            <div className="overflow-hidden rounded-t-[16px] border border-b-0 border-[#2a2a2a] bg-[#161616]">
              <div className="flex items-center gap-2 border-b border-[#2a2a2a] px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-[12px] text-[#4b5563]">Agenci — AI-chatassistent</span>
              </div>
              <div className="grid gap-4 p-6 md:p-8">
                <ChatBubble from="user">Hei! Hva er åpningstidene deres?</ChatBubble>
                <ChatBubble from="bot">
                  Hei! Vi har åpent mandag–fredag 08–16. Har du andre spørsmål er jeg her 24/7. 😊
                </ChatBubble>
                <ChatBubble from="user">Kan jeg booke en time?</ChatBubble>
                <ChatBubble from="bot">
                  Absolutt! Velg en dato og tid som passer deg, så setter jeg det opp med en gang.
                </ChatBubble>
              </div>
            </div>
          </div>
        </header>

        {/* ── BODY ── */}
        <div className="mx-auto max-w-[900px] px-6 py-14 xl:px-8">
          <div className="flex gap-12 lg:gap-16">

            {/* Sticky ToC — desktop */}
            <aside className="hidden w-[200px] shrink-0 lg:block">
              <div className="sticky top-24 space-y-1">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.5px] text-[#4b5563]">
                  Innhold
                </p>
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block py-1 text-[13px] leading-snug text-[#6b7280] transition-colors hover:text-[#9ca3af]"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="mt-8 rounded-[10px] border border-[#2a2a2a] bg-[#161616] p-4">
                  <p className="text-[12px] font-medium text-[#9ca3af]">Prøv gratis</p>
                  <p className="mt-1 text-[11px] leading-snug text-[#4b5563]">
                    50 samtaler/mnd. Ingen bindingstid.
                  </p>
                  <Link
                    href="/kontakt"
                    className="mt-3 block rounded-[8px] bg-white px-3 py-2 text-center text-[12px] font-semibold text-[#1C1C1C] transition-opacity hover:opacity-90"
                  >
                    Kom i gang →
                  </Link>
                </div>
              </div>
            </aside>

            {/* Article */}
            <article className="min-w-0 flex-1 space-y-12">

              {/* Intro ToC — mobil */}
              <nav className="rounded-[12px] border border-[#2a2a2a] bg-[#161616] p-5 lg:hidden">
                <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#4b5563]">
                  Innhold
                </p>
                <ol className="mt-3 space-y-1.5">
                  {toc.map((item, i) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="text-[13px] text-[#9ca3af] transition-colors hover:text-[#f2f3f5]"
                      >
                        {i + 1}. {item.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              {/* Section 1 */}
              <Section id="hva-er-chatbot" title="Hva er en chatbot?">
                <p>
                  En chatbot er et dataprogram designet for å simulere samtale med mennesker, enten via
                  tekst eller tale. Disse digitale assistentene har utviklet seg enormt de siste årene —
                  fra enkle regelbaserte systemer til avanserte AI-drevne løsninger som kan forstå
                  kontekst, lære og gi svært relevante svar.
                </p>
                <p>
                  Hos Agenci utvikler vi AI-drevne chatbotopplevelser spesialtilpasset for norske
                  bedrifter. Målet er å forbedre kundeopplevelsen ved å tilby øyeblikkelig hjelp,
                  redusere ventetider og frigjøre menneskelige ressurser.
                </p>
              </Section>

              {/* Section 2 */}
              <Section id="mer-enn-assistent" title="Mer enn bare en digital assistent">
                <p>
                  Mange ser på en chatbot som en enkel «spørsmål og svar»-maskin, men i virkeligheten
                  er potensialet mye større. En moderne chatbot er en strategisk investering som kan:
                </p>
                <ul className="mt-3 space-y-2">
                  <BulletItem label="Forbedre tilgjengelighet">
                    Gi kundene svar 24/7, uavhengig av åpningstider.
                  </BulletItem>
                  <BulletItem label="Redusere driftskostnader">
                    Automatisere rutinemessige henvendelser og frigjøre tid for ansatte.
                  </BulletItem>
                  <BulletItem label="Øke kundetilfredsheten">
                    Tilby rask og konsistent service med presise svar.
                  </BulletItem>
                  <BulletItem label="Samle verdifull innsikt">
                    Analysere kundehenvendelser for å identifisere trender og forbedringsområder.
                  </BulletItem>
                </ul>
                <Callout>
                  Spesielt for norske virksomheter kan en chatbot være avgjørende i et
                  konkurransepreget marked hvor kundelojalitet ofte avhenger av servicekvalitet.
                </Callout>
              </Section>

              {/* Section 3 */}
              <Section id="hvordan-fungerer" title="Hvordan fungerer en chatbot?">
                <p>
                  Kjernen i en moderne chatbot er kunstig intelligens (AI) og maskinlæring (ML). I
                  motsetning til eldre systemer som var avhengige av forhåndsdefinerte skript, kan
                  dagens AI-chatbotløsninger forstå naturlig språk gjennom Natural Language Processing
                  (NLP) — og tolke intensjonen bak spørsmålet, selv om formuleringen varierer.
                </p>
                <p>
                  Agenci sin løsning skiller seg ut ved at den bruker din egen kunnskapsbase — dine
                  FAQ, prislister og retningslinjer — til å formulere svar. Dette sikrer faktiske og
                  kontekstbevisste svar uten de såkalte «hallusinasjonene» man ser hos generiske
                  AI-systemer.
                </p>
                <Callout>
                  Vi garanterer 100 % bruk av dine egne data, noe som forhindrer feilinformasjon og
                  sikrer høy kvalitet i kundedialogen.
                </Callout>
              </Section>

              {/* Section 4 */}
              <Section id="typer-teknologier" title="Ulike typer chatbot-teknologier">
                <p>
                  Selv om den underliggende teknologien er AI, finnes det ulike tilnærminger til
                  hvordan en chatbot drives:
                </p>
                <div className="mt-4 space-y-4">
                  <TechCard title="Regelbaserte chatbotter">
                    Følger et forhåndsbestemt sett med regler og svaralternativer. Effektiv for enkle
                    og repeterende oppgaver, men mangler evnen til å forstå nyanserte spørsmål.
                  </TechCard>
                  <TechCard title="AI-drevne chatbotter (NLP/NLU)">
                    Utnytter naturlig språkbehandling og forståelse til å tolke brukerspråk, kontekst
                    og intensjon. Dette tillater mer flytende og menneskelignende samtaler.
                  </TechCard>
                  <TechCard title="Generative AI-chatbotter" highlight>
                    Genererer unike svar basert på en kunnskapsbase i stedet for forhåndsdefinerte
                    alternativer. <strong className="font-medium text-[#9ca3af]">Dette er teknologien Agenci bygger på.</strong>
                  </TechCard>
                </div>
              </Section>

              {/* Section 5 */}
              <Section id="fordeler" title="Fordeler med en intelligent chatbot for din bedrift">
                <p>
                  Implementering av en chatbot kan gi en rekke målbare fordeler. Vi har sett hvordan
                  kundene våre har transformert sin kundeservice og fått mer tid til komplekse
                  oppgaver.
                </p>

                <h3 className="mt-8 text-[17px] font-semibold tracking-[-0.3px] text-[#f2f3f5]">
                  Økt effektivitet og tidsbesparelser
                </h3>
                <p className="mt-3">
                  En chatbot kan håndtere et stort volum av henvendelser samtidig, uten ventetid.
                  Spørsmål som «Hva er åpningstidene?» eller «Hvor finner jeg fakturaen min?» besvares
                  umiddelbart — og dine ansatte kan fokusere på saker som faktisk krever menneskelig
                  innsikt.
                </p>

                <h3 className="mt-8 text-[17px] font-semibold tracking-[-0.3px] text-[#f2f3f5]">
                  Forbedret kundetilfredshet
                </h3>
                <p className="mt-3">
                  Når kunder får umiddelbar hjelp, forbedres opplevelsen betydelig. En chatbot
                  tilgjengelig 24/7 sørger for at ingen spørsmål forblir ubesvart — og reduserer
                  risikoen for at kunden velger en konkurrent. Agenci tilbyr også sømløs overføring
                  til et menneske dersom chatboten støter på en kompleks henvendelse.
                </p>

                <h3 className="mt-8 text-[17px] font-semibold tracking-[-0.3px] text-[#f2f3f5]">
                  Kostnadsreduksjon
                </h3>
                <p className="mt-3">
                  Ved å automatisere deler av kundeservicen kan bedrifter redusere behovet for
                  ressurser på repetitivt arbeid. En chatbot er en investering som raskt betaler seg
                  tilbake.
                </p>

                <div className="mt-8 overflow-hidden rounded-[12px] border border-[#2a2a2a]">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-[#2a2a2a] bg-[#161616]">
                        <Th>Fordel</Th>
                        <Th>Beskrivelse</Th>
                        <Th>Agenci-løsning</Th>
                      </tr>
                    </thead>
                    <tbody>
                      <Tr>
                        <Td accent>24/7 tilgjengelighet</Td>
                        <Td>Svarer kunder døgnet rundt</Td>
                        <Td>Automatisert chatbot</Td>
                      </Tr>
                      <Tr>
                        <Td accent>Raskere svar</Td>
                        <Td>Øyeblikkelig informasjon</Td>
                        <Td>AI-drevet respons</Td>
                      </Tr>
                      <Tr>
                        <Td accent>Bedre kundeopplevelse</Td>
                        <Td>Fornøyde kunder</Td>
                        <Td>Personlige svar</Td>
                      </Tr>
                      <Tr>
                        <Td accent>Reduserte kostnader</Td>
                        <Td>Effektiv ressursbruk</Td>
                        <Td>Automatisering</Td>
                      </Tr>
                      <Tr last>
                        <Td accent>Innsiktsfull data</Td>
                        <Td>Forbedringspotensial</Td>
                        <Td>Omfattende analyse</Td>
                      </Tr>
                    </tbody>
                  </table>
                </div>
              </Section>

              {/* Section 6 */}
              <Section id="velge-riktig" title="Velge riktig chatbot: hva du bør se etter">
                <p>
                  Når du skal implementere en chatbot, er det viktig å velge en løsning som passer
                  bedriftens unike behov. Her er fem kritiske faktorer å vurdere:
                </p>
                <div className="mt-6 space-y-4">
                  <NumberedPoint n={1} title="Enkel implementering">
                    Agenci kan gå live på under 5 minutter ved å lime inn én linje med kode på
                    nettstedet ditt. Ingen IT-ekspertise nødvendig.
                  </NumberedPoint>
                  <NumberedPoint n={2} title="Nøyaktighet og relevans">
                    Vår løsning bruker din bedrifts egne data og kunnskapsbase. Dette eliminerer
                    risikoen for hallusinasjoner og sikrer at chatboten snakker med din bedrifts
                    stemme.
                  </NumberedPoint>
                  <NumberedPoint n={3} title="Fleksibilitet og skalerbarhet">
                    Velg en chatbot som kan vokse med bedriften din. Agenci er skalerbar og tilpasses
                    dine behov — enten du er en liten bedrift eller en stor organisasjon.
                  </NumberedPoint>
                  <NumberedPoint n={4} title="Datapersonvern og GDPR-overholdelse">
                    I Norge og EU er strenge GDPR-regler avgjørende. Agenci er 100 % GDPR-kompatibel,
                    og all data forblir kundens eiendom.
                  </NumberedPoint>
                  <NumberedPoint n={5} title="Rapportering og analyse">
                    Agenci gir deg omfattende innsikt i kundehenvendelser slik at du kan forstå hva
                    kundene spør om og optimalisere informasjonen din.
                  </NumberedPoint>
                </div>

                <div className="mt-8 overflow-hidden rounded-[12px] border border-[#2a2a2a]">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-[#2a2a2a] bg-[#161616]">
                        <Th>Funksjon</Th>
                        <Th>Agenci</Th>
                      </tr>
                    </thead>
                    <tbody>
                      <Tr><Td>Oppsettstid</Td><Td accent>Under 5 minutter</Td></Tr>
                      <Tr><Td>Tilgjengelighet</Td><Td accent>24/7</Td></Tr>
                      <Tr><Td>Datakilde</Td><Td accent>Kun kundens egne data</Td></Tr>
                      <Tr><Td>GDPR-kompatibel</Td><Td accent>Ja</Td></Tr>
                      <Tr><Td>Overlevering til menneske</Td><Td accent>Ja</Td></Tr>
                      <Tr><Td>Analyseverktøy</Td><Td accent>Ja</Td></Tr>
                      <Tr last><Td>Bindingstid</Td><Td accent>Ingen</Td></Tr>
                    </tbody>
                  </table>
                </div>
              </Section>

              {/* Section 7 */}
              <Section id="fremtiden" title="Fremtiden for chatbot-teknologi og kundeservice">
                <p>
                  Utviklingen innen AI og maskinlæring er rask, og chatbotløsninger blir stadig mer
                  sofistikerte. Vi ser en fremtid der chatboten vil spille en enda mer sentral rolle —
                  ikke bare svare på spørsmål, men proaktivt tilby løsninger, veilede kunder gjennom
                  komplekse prosesser og gi en personlig opplevelse som tidligere var forbeholdt
                  ansatt-kunde-interaksjoner.
                </p>
                <p>
                  Agenci jobber kontinuerlig med å utvide integrasjonene sine — og vi vil snart tilby
                  koblinger til populære plattformer som HubSpot, Shopify, Gmail, Webhooks og Slack.
                  En chatbot i dag er en investering i fremtidssikring av din digitale tilstedeværelse.
                </p>
              </Section>

              {/* FAQ */}
              <section id="faq" className="scroll-mt-24">
                <h2 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.5px] text-[#f2f3f5]">
                  Ofte stilte spørsmål om chatbot
                </h2>
                <div className="mt-6 space-y-3">
                  {jsonLdFaq.mainEntity.map((q) => (
                    <FaqItem key={q.name} question={q.name} answer={q.acceptedAnswer.text} />
                  ))}
                </div>
              </section>

            </article>
          </div>
        </div>

        <MarketingSubpageCta />
      </div>
    </MarketingPageLayout>
  );
}

/* ── Sub-components ── */

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.5px] text-[#f2f3f5]">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-[1.7] text-[#9ca3af]">{children}</div>
    </section>
  );
}

function BulletItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[14px] leading-[1.6] text-[#9ca3af]">
      <span aria-hidden className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#374151]" />
      <span>
        <span className="font-medium text-[#c4c9d4]">{label}: </span>
        {children}
      </span>
    </li>
  );
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-2 rounded-r-[8px] border-l-2 border-[#374151] pl-4 text-[14px] leading-[1.6] text-[#6b7280] italic">
      {children}
    </blockquote>
  );
}

function TechCard({ title, children, highlight }: { title: string; children: ReactNode; highlight?: boolean }) {
  return (
    <div className={`rounded-[10px] border p-4 ${highlight ? "border-[#374151] bg-[#1a1f2e]" : "border-[#2a2a2a] bg-[#161616]"}`}>
      <p className={`text-[13px] font-semibold ${highlight ? "text-[#818cf8]" : "text-[#9ca3af]"}`}>{title}</p>
      <p className="mt-1.5 text-[13px] leading-[1.6] text-[#6b7280]">{children}</p>
    </div>
  );
}

function NumberedPoint({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1f2937] text-[12px] font-semibold text-[#6b7280]">
        {n}
      </span>
      <div>
        <p className="text-[14px] font-semibold text-[#c4c9d4]">{title}</p>
        <p className="mt-1 text-[13px] leading-[1.6] text-[#6b7280]">{children}</p>
      </div>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.3px] text-[#4b5563]">
      {children}
    </th>
  );
}

function Tr({ children, last }: { children: ReactNode; last?: boolean }) {
  return (
    <tr className={`${last ? "" : "border-b border-[#1f1f1f]"}`}>
      {children}
    </tr>
  );
}

function Td({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return (
    <td className={`px-4 py-3 ${accent ? "font-medium text-[#9ca3af]" : "text-[#4b5563]"}`}>
      {children}
    </td>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-[10px] border border-[#2a2a2a] bg-[#161616] p-5">
      <p className="text-[14px] font-semibold leading-snug text-[#f2f3f5]">{question}</p>
      <p className="mt-2 text-[13px] leading-[1.65] text-[#9ca3af]">{answer}</p>
    </div>
  );
}

function ChatBubble({ from, children }: { from: "user" | "bot"; children: ReactNode }) {
  if (from === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-[14px] rounded-tr-[4px] bg-[#2d3748] px-4 py-2.5 text-[13px] leading-snug text-[#e2e8f0]">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1e2533]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#818cf8]">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/>
        </svg>
      </div>
      <div className="max-w-[75%] rounded-[14px] rounded-tl-[4px] bg-[#1a1f2e] px-4 py-2.5 text-[13px] leading-snug text-[#9ca3af]">
        {children}
      </div>
    </div>
  );
}
