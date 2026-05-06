# Agenci — Komplett kunnskapsbase

> Dette dokumentet er kunnskapsbasen til Agenci sin egen RAG-AI. Det er skrevet for å være en uttømmende kilde slik at AI-en kan svare på spørsmål om produktet, selskapet, priser, integrasjoner, personvern, teknologi, support og bruk. Innholdet er på norsk (bokmål), men kan brukes til å besvare spørsmål på andre språk.

---

## 1. Kort om Agenci

**Agenci** er en norsk SaaS-plattform som gir bedrifter en AI-drevet kundeservicechat på sin egen nettside. Kjernen er en chat-widget som svarer kundene **24/7** med bedriftens **egne ord** — basert på FAQ, produktinformasjon, retningslinjer og andre kilder bedriften har lastet opp. Når AI-en ikke kan svare, eller kunden ber om et menneske, kan teamet ta over samtalen direkte i et samlet dashboard.

**Tagline / hovedløfte:** "Aldri mer tapte kunder."
**Subtekst:** "AI-chat for nettsiden din — svarer med dine egne ord, hele døgnet."
**Domene:** `agenci.no` (markedsføring + dashboard på `app.agenci.no`).

### 1.1 Hva Agenci løser

Bedrifter svarer typisk på de samme spørsmålene hver dag — åpningstider, priser, leveringstid, returpolicy, produktdetaljer. Dette tar tid fra teamet og fører til **tapte kunder utenfor arbeidstid**. Agenci tar disse repeterende spørsmålene mens mennesker svarer på det som krever vurdering.

### 1.2 Kjerneprinsipp: ingen hallusinasjoner

Agenci-assistenten **finner ikke opp svar**. Den svarer kun ut fra det som er lastet opp i kunnskapsbasen. Hvis svaret ikke finnes, sier den fra og tilbyr å koble kunden til et menneske. Dette er hardkodet i system-prompten («Finn opp ingenting. Uten searchTool vet du ikke svaret.»).

### 1.3 Posisjonering

Agenci er ikke en tradisjonell rule-based chatbot med forhåndsdefinerte trær. Det er en **RAG-basert AI** (Retrieval-Augmented Generation) som leser kundens egne dokumenter og svarer fritt — men avgrenset til det innholdet.

---

## 2. Selskap og juridisk identitet

- **Selskap:** Hassan Triodelab DA
- **Org.nr:** 835 796 892
- **Adresse:** Gildevangen 16 B, 0585 Oslo, Norge
- **E-post (generell):** post@triodelab.no
- **Personvernkontakt:** post@triodelab.no (merk henvendelsen «Personvern»)
- **Tilsynsmyndighet (Norge):** Datatilsynet (`datatilsynet.no`)
- **Lovvalg / verneting:** Norsk rett, Oslo tingrett

Hassan Triodelab DA er behandlingsansvarlig for personopplysninger som behandles i forbindelse med markedsføring, kundekontakt og leveranse av Agenci, med mindre annet følger av databehandleravtale med kundens organisasjon.

---

## 3. Pakker og priser

Alle priser er ekskl. **25 % MVA**. Ingen bindingstid. Bytt plan når som helst. Årlig fakturering gir **20 % rabatt** sammenlignet med månedlig.

| Plan | Månedlig | Årlig (per mnd) | Samtaler/mnd | AI-agenter | Teammedlemmer | «Powered by Agenci» |
|------|----------|-----------------|--------------|------------|---------------|---------------------|
| **Gratis** | 0 kr | 0 kr | 50 | 1 | 1 | Vises |
| **Starter** | 499 kr | 399 kr | 500 | 1 | 2 | Vises |
| **Pro** *(populær)* | 1 499 kr | 1 199 kr | 2 000 | 3 | 5 | Skjult |
| **Business** | 3 999 kr | 3 199 kr | 10 000 | 10 | Ubegrenset | Skjult |
| **Enterprise** | På forespørsel | — | Volumpriser | Skreddersydd | Ubegrenset | Skjult |

### 3.1 Hva inngår per plan

**Gratis (kom i gang uten kortinfo)**
- 1 AI-agent
- Chat-widget på nettsiden
- 1 teammedlem
- Grunnleggende analyser

**Starter (for bedrifter som vil spare tid på henvendelser)**
- 1 AI-agent
- Chat-widget på nettsiden
- 2 teammedlemmer
- Grunnleggende analyser

**Pro (full AI-kraft for voksende team)**
- 3 AI-agenter
- Chat-widget
- 5 teammedlemmer
- Full analyse og rapporter
- «Powered by Agenci» fjernet
- Prioritert e-poststøtte

**Business (høyt volum, flere kanaler)**
- 10 AI-agenter
- Alle integrasjoner
- Ubegrenset teammedlemmer
- Full analyse + CSV-eksport
- «Powered by Agenci» fjernet
- Dedikert support

**Enterprise**
- Skreddersydd onboarding
- SLA
- Egne integrasjoner
- Volumpriser

### 3.2 Prøveperiode

- **14 dager Pro gratis** — ingen kortinfo, ingen binding. Hvis du ikke ser verdien, koster det ingenting.
- Prøveperioden vises som en banner i dashboardet (`trial-banner`) og som «Prøv Pro gratis»-kort i sidemeny.

### 3.3 Betaling og fakturering

- Betaling skjer via **Clerk Billing** (Stripe under panseret).
- Faktura vises på `/billing` i dashboardet — der ligger også `OrganizationProfile` og `PricingTable`.
- For bedrifter uten Clerk Billing aktivert: settes `NEXT_PUBLIC_HIDE_CLERK_BILLING_UI=true` slik at ikke-utviklere får en plassholder i stedet.
- **Faktiske abonnement** ligger i Convex-tabellen `subscriptions` (`status: "active"|"trialing"|"canceled"|"free"`). Status oppdateres via Clerk webhook (`subscription.updated`).

### 3.4 Hva krever aktivt abonnement?

Følgende fungerer bare når `subscriptions.status === "active"` (eller `"trialing"`):

- Widget-AI-svar (uten abonnement lagres bare brukermeldinger, ikke AI-svar)
- Knowledge base / opplasting av filer og nettsider
- Operatør-«Enhance»-funksjon (AI-forbedring av meldinger)

For utviklere/team-brukere finnes bypass-mekanismer:
- `CONVEX_DEV_BYPASS_SUBSCRIPTION=true` (kun dev/staging)
- `CONVEX_DEV_ORGANIZATION_IDS` (komma-separert org-ID-liste)
- `CONVEX_DEV_TEAM_EMAILS` (komma-separert e-postliste — disse brukerne får tilgang via JWT-claim)
- `NEXT_PUBLIC_DEV_BYPASS_PREMIUM` (kun UI-gate i Next.js, ikke Convex)
- `NEXT_PUBLIC_TEAM_DEVELOPER_EMAILS` (UI-side speiling av team-listen)

---

## 4. Produkt — hovedfunksjoner

### 4.1 Chat-widget på nettsiden

- **Embed-skript** plasseres i `<body>` på kundens nettside. Tre linjer kode (eller én script-tag).
- Widgeten åpnes som en flytende boble nederst på siden (bottom-right eller bottom-left).
- Kjøres i en **iframe** mot widget-appen (egen Next.js-app i `apps/widget`).
- All kommunikasjon mellom embed og iframe skjer via `postMessage` (typer: `close`, `resize`, `bubble-config`).
- Konfigurerbar med `data-organization-id` og `data-position`.
- Eksponert som global `window.AgenciWidget` (med `init`, `show`, `hide`, `destroy`). Eldre alias: `window.EchoWidget` (deprecated).

#### Skjermer i widgeten
- `loading` — viser mens widgeten initialiseres
- `error` — vises ved tekniske feil
- `auth` — kunden oppgir navn + e-post, og samtykker til personvern
- `selection` — kunden velger mellom chat / voice / inbox
- `chat` — selve samtalen med AI/menneske
- `inbox` — historikk over tidligere samtaler i samme nettleser
- `voice` — Vapi-basert telefoni/talesamtale (premium)
- `contact` — kontaktskjema-fallback

### 4.2 AI-agent (Support Agent)

- Bygget på **OpenAI `gpt-4o-mini`** (chat) og **`text-embedding-3-small`** (embeddings, 1536 dim).
- Bruker **Convex Agent**-rammeverket (`@convex-dev/agent`).
- Tre verktøy: `searchTool`, `escalateConversationTool`, `resolveConversationTool`.
- Svarer på **norsk (bokmål)**, kort og menneskelig (maks 2–3 setninger per svar).
- Bruker gjerne én emoji på slutten der det passer naturlig.
- **Aldri** markdown-formatering, lister, fet skrift eller overskrifter i widget-svar.

#### System-prompt (forenklet)
> Du er en varm, menneskelig og hjelpsom kundeserviceassistent. Svar alltid på norsk (bokmål). Spørsmål om produkter, priser, tjenester eller bedriften → kall searchTool umiddelbart. Hilsener → svar naturlig uten søk. Finn opp ingenting. Uten søkeresultater vet du ikke svaret. Frustrert kunde eller ber om menneske → eskalér. Sak løst og kunden er fornøyd → resolve.

#### Søk og tolkning (`searchTool`)
1. AI-en kaller `searchTool` med en spørring.
2. Tool slår opp i RAG-namespace (`{orgId}` eller `{orgId}:{agentId}` for per-agent KB).
3. Henter top 5 treff fra vector store.
4. Henter operatør-godkjente eksempler fra `answerTrainingExamples` (maks 12).
5. En egen `gpt-4o-mini`-forespørsel («search interpreter») destillerer svaret til 2–3 korte setninger på norsk.
6. Hvis ingenting funnet → forslag om eskalering: «Hmm, jeg finner ikke noe om det her. Vil du at jeg kobler deg med noen?»

#### Eskalering (`escalateConversationTool`)
- Setter samtalen til `status: "escalated"`.
- Sender en standardbeskjed til kunden: «Jeg har satt over samtalen til et menneske på teamet vårt.»
- Operatør kan ta over fra dashboardet.

#### Resolve (`resolveConversationTool`)
- Setter samtalen til `status: "resolved"` når kunden er fornøyd.
- Sender en varm avslutning: «Takk for at du skrev til oss — bare ta kontakt igjen om du lurer på noe mer. Ha en fin dag!»

### 4.3 Flere agenter (multi-agent)

- Hver organisasjon kan ha **opptil 5 agenter** (intern grense, `MAX_AGENTS = 5` i `private/agents.ts`). Forretningsplanene har lavere effektive grenser (1, 1, 3, 10).
- Hver agent har: `name`, `slug`, `description`, `isActive`, `isBuiltIn`, `modelLabel`.
- Hver agent får sin egen **kunnskapsbase-namespace** (`{orgId}:{agentId}`), slik at flere produkter/avdelinger kan ha separate KBs.
- Widgeten kobles til én aktiv agent via `widgetSettings.agentId`. Faller tilbake til første aktive agent hvis ingen er valgt.

### 4.4 Kunnskapsbase (RAG)

- Bruker `@convex-dev/rag` med OpenAI embeddings.
- Støtter:
  - **Filer:** PDF, bilder (JPEG, PNG, WebP, GIF), tekst (txt, md, html).
  - **Nettsider:** lim inn URL → systemet henter HTML, konverterer til ren tekst og indekserer.
- Tekstuttrekk:
  - **Bilder:** `gpt-4o-mini` transkriberer / beskriver.
  - **PDF:** `gpt-4o` ekstraherer tekst.
  - **HTML/markdown:** `gpt-4o` konverterer til markdown.
  - **Plain text:** brukes direkte uten AI.
- Innholdet hashes (`contentHash`) for å unngå duplikater.
- Kategorier kan settes per fil/URL.
- Storage: Convex `_storage` (filinnhold), referert via `metadata.storageId`.
- Maks HTML-størrelse ved henting fra nettside: 2 000 000 tegn.
- Min plain-text fra nettside: 40 tegn (ellers feil — sannsynligvis JS-app).

### 4.5 Samtaleinnboks (operatørvisning)

- `/conversations` — liste over alle samtaler i organisasjonen.
- `/agents/{agentId}/conversations` — filtrert per agent.
- Filterstatuser: `inbox` (åpne + eskalerte), `unresolved`, `escalated`, `resolved`, `all`.
- Statuser: `unresolved` (åpen), `escalated` (krever menneske), `resolved` (lukket).
- Operatør kan:
  - Lese historikk
  - Skrive direkte til kunden (lagres som `assistant`-melding med operatørens navn)
  - **«Enhance»**-knapp: AI-forbedrer operatørens utkast (rette grammatikk, formalisere, bevare innhold)
  - Endre status manuelt
  - Lagre svaret som **«treningseksempel»** — fanges opp av søkeverktøyet i fremtidige samtaler (`answerTrainingExamples`-tabellen)

### 4.6 Operatør-«Enhance» (AI-forbedring)

- Kjører `gpt-4o-mini` med `OPERATOR_MESSAGE_ENHANCEMENT_PROMPT`.
- Forbedrer grammatikk, klarhet og struktur — bevarer intent, fakta og navn/priser.
- Output på norsk hvis input er norsk eller blandet.
- Krever aktivt abonnement.

### 4.7 Widget-tilpasning (Customization)

- Egen side `/customization` (eller `/agents/{agentId}/customization`).
- Seksjoner:
  - **Agent:** velg hvilken agent widgeten skal bruke
  - **Meldinger:** velkomstmelding + 3 standardforslag (suggestion chips)
  - **Vapi (voice):** assistant-ID + telefonnummer
  - **Utseende:** posisjon, størrelse, farger, border-radius, knappestørrelse
- Lagres i `widgetSettings`-tabellen.

#### Utseende-felter
- `position`: center / bottom-right / bottom-left / custom
- `customX`, `customY` — finjustering når custom
- `width` (280–560), `height` (360–800)
- `borderRadius` (0–32)
- `headerColor`, `headerTextColor`
- `bubbleUserColor`, `bubbleUserTextColor`
- `bubbleAssistantColor`, `bubbleAssistantTextColor`
- `backgroundColor`
- `inputBorderColor`, `inputBackgroundColor`, `inputTextColor`, `inputPlaceholderColor`
- `bubbleButtonColor`, `bubbleButtonIconColor`
- `bubbleButtonSize` (40–80)

### 4.8 Egendefinert system-prompt

- Per organisasjon kan operatøren skrive en egen `systemPrompt` som overstyrer standard support-prompt.
- Lagres i `widgetSettings.systemPrompt`.

### 4.9 Voice (Vapi-integrasjon, premium)

- Egen plugin-arkitektur. Plugin-tabellen (`plugins`) holder kobling til Vapi via secret-navn (i AWS Secrets Manager).
- Operatøren kobler Vapi i `/plugins/vapi` — limer inn Public + Private API-key.
- Funksjoner:
  - Vis Vapi-assistenter (`getAssistants`)
  - Vis telefonnumre (`getPhoneNumbers`)
- Widgeten får en «voice»-skjerm når Vapi er konfigurert i `widgetSettings.vapiSettings.assistantId`.
- Krever AWS-credentials (Secrets Manager) på Convex-deploymenten.
- Vapi-bruk er ikke disclosed i personvernerklæringen som standard — kun relevant når kunden aktiverer voice.

### 4.10 Dashboard og innsikt

- `/dashboard` — overordnet org-oversikt (KPI-kort, siste samtaler, kunnskapspanel)
- `/agents` — liste over alle agenter med åpne-samtale-tall
- `/agents/{agentId}` — detaljert agent-oversikt: åpne, eskalerte, løste samtaler + status på oppsett (kunnskap, widget, integrasjon)
- KPI-er: åpne samtaler (unresolved + escalated), eskalerte, løste, totalt
- Knowledge-statistikk: antall kilder, sist indeksert, ca. KB indeksert
- «Setup checklist»: kunnskapskilder, widget konfigurert, integrasjon satt opp

### 4.11 Innstillinger

- `/settings` — kontoinnstillinger
- `/billing` — Clerk OrganizationProfile + PricingTable

### 4.12 «Slett konto»-flyt

- Endepunkt: `POST /api/account/delete`
- Krever Clerk-autentisering.
- Bruker `clerkClient.users.deleteUser(userId)` — Clerk webhook (`user.deleted`) trigger sletting av tilknyttede data i Convex.
- Returnerer feilmelding med kontakt til `post@triodelab.no` ved feil.

---

## 5. Hvordan man kommer i gang (onboarding)

### 5.1 Tre praktiske steg
1. **Installer widget** — én embed-kode på nettsiden. Live på minutter.
2. **Koble kunnskap** — lim inn FAQ, produkttekster, retningslinjer. AI-en svarer kun innenfor det dere setter.
3. **Styr og forbedre** — følg samtaler live, ta over når det trengs, optimaliser ut fra faktisk bruk.

### 5.2 Embed-kode (HTML, React, Next.js, JavaScript)

```html
<script
  src="https://agenci-embed.vercel.app/widget.iife.js"
  data-organization-id="org_xxxxxxxx"
></script>
```

URL-en til `widget.iife.js` kan overstyres med `NEXT_PUBLIC_WIDGET_EMBED_SCRIPT_URL`.

`data-organization-id` finnes på `/integrations` i dashboardet (samme som Clerk Organization ID, format `org_…`).

### 5.3 Settetid

> Under 10 minutter for det grunnleggende.

Lim inn én linje kode, last opp FAQ, og du er i gang. Ingen utvikler nødvendig. Finjustering av utseende og tone gjøres etterpå i dashboardet.

---

## 6. Integrasjoner

### 6.1 Tilgjengelig nå
- **Nettside-widget** — embed-kode for HTML, React, Next.js, ren JavaScript.

### 6.2 Snart / under utvikling
- HubSpot (CRM)
- Shopify (e-handel)
- Stripe (betaling)
- Gmail (e-post)
- Webhooks (API & automatisering)
- Slack (intern chat)
- Zapier (automatisering)
- Zendesk (support)
- Microsoft Teams (meldinger)

Per i dag er kun nettside-widget «live». Resten markeres som «Snart» i UI-et.

---

## 7. Teknisk arkitektur

### 7.1 Monorepo-struktur (pnpm + Turborepo)

```
agenci/
├── apps/
│   ├── web/      — Hoved-Next.js-app (markedsføring + dashboard)
│   ├── widget/   — Egen Next.js-app for chat-widgeten (kjører i iframe)
│   └── embed/    — Vite/IIFE script som injecter iframen i kundens side
├── packages/
│   ├── backend/      — Convex (database, auth, AI, RAG, agent, crons, http)
│   ├── ui/           — shadcn/ui-komponenter delt mellom web og widget
│   ├── math/         — felles matematikk-helpers
│   ├── eslint-config/
│   └── typescript-config/
```

### 7.2 Tech-stack

| Lag | Tjeneste/Bibliotek |
|-----|--------------------|
| Frontend (web + widget) | Next.js 15 (App Router), React 19, TypeScript |
| UI | shadcn/ui, Tailwind CSS 4, lucide-react, Motion (Framer) |
| Skjema | react-hook-form + Zod |
| State | Jotai (atomer i widget), Convex React queries |
| Backend (DB + serverless) | Convex (`@convex-dev/agent`, `@convex-dev/rag`) |
| Auth | Clerk (org-basert, JWT-mal `convex` med `orgId`) |
| Billing | Clerk Billing (Stripe) |
| AI / LLM | OpenAI (`gpt-4o-mini`, `gpt-4o`, `text-embedding-3-small`) via `@ai-sdk/openai` + `ai` SDK |
| Voice | Vapi (`@vapi-ai/server-sdk`) |
| Secrets | AWS Secrets Manager (kun Vapi-credentials) |
| E-post | Resend (kontakt + nyhetsbrev) |
| Feiltracking | Sentry (EU-region, Tyskland — Session Replay deaktivert) |
| Hosting | Vercel (web + embed) + Convex (backend) |

### 7.3 Convex-skjema (database)

Hovedtabeller (`packages/backend/convex/schema.ts`):

- **`subscriptions`** — `organizationId`, `status`, `trialEndsAt`. Index: `by_organization_id`.
- **`widgetSettings`** — per org. Felter: `widgetTitle`, `agentId`, `systemPrompt`, `greetMessage`, `defaultSuggestions` (3), `vapiSettings`, `appearance`.
- **`plugins`** — `organizationId`, `service: "vapi"`, `secretName`. Indexes: `by_organization_id`, `by_organization_id_and_service`.
- **`conversations`** — `agentId`, `threadId`, `organizationId`, `contactSessionId`, `status` (`unresolved`/`escalated`/`resolved`). Indexes: by org, by contact session, by thread, by status+org, by agent, by agent+status.
- **`contactSessions`** — `name`, `email`, `organizationId`, `expiresAt`, `metadata` (userAgent, language, timezone, referrer, currentUrl + valgfri detaljerte felt). Indexes: by org, by expires_at.
- **`users`** — `name`, `email`, `clerk_id`. Index: `by_clerk_id`.
- **`agents`** — `organizationId`, `name`, `description`, `slug`, `isBuiltIn`, `modelLabel`, `isActive`, `createdAt`, `updatedAt`. Indexes: by org, by org+slug.
- **`answerTrainingExamples`** — operatørgodkjente svar fra Playground (Chatbase-lignende). Felter: `organizationId`, `conversationId`, `userMessage`, `assistantMessage`, `expectedResponse`, `createdAt`. Index: by_organization_id.

I tillegg bruker `@convex-dev/rag` og `@convex-dev/agent` egne system-tabeller (entries, namespaces, threads, messages).

### 7.4 Backend-funksjoner (Convex)

- **`private/`** — krever org-autentisering (operatørvisning). Eksempler: `agents`, `conversations`, `messages`, `files`, `widgetSettings`, `dashboard`, `plugins`, `vapi`, `secrets`, `subscription`, `answerTraining`, `config`, `contactSessions`.
- **`public/`** — endepunkter widgeten bruker (uten operatør-auth, men validerer kontaktsesjon eller org). Eksempler: `conversations`, `messages`, `contactSessions`, `organizations`, `widgetSettings`, `secrets`.
- **`system/`** — interne (ikke direkte eksponert). Inkluderer AI-rammeverket, RAG, agent-tools, `subscriptions`-lookup, `plugins` lookup, `contactSessions.purgeExpired`-cron.
- **`http.ts`** — Clerk webhook-endepunkt (`/clerk-webhook`), verifiseres med `CLERK_WEBHOOK_SECRET`.
- **`crons.ts`** — daglig cron `02:00 UTC` som anonymiserer utløpte `contactSessions` (GDPR).

### 7.5 Sesjons- og samtalemodell

- **Kontaktsesjon** = besøkende identifisert ved navn + e-post i widget-auth-skjermen. Lagres i `contactSessions` med `expiresAt = now + 24t`.
- **Samtale** = `conversations`-rad knyttet til en `contactSessionId` og en `threadId` (Convex Agent thread).
- Samtalen lever videre selv om sesjon utløper, men widgeten kan ikke laste meldingene uten gyldig sesjon.
- localStorage-nøkler i widget: `echo_contact_session` (sesjons-ID) og `echo_conversation` (siste aktive samtale per org).

### 7.6 Embed-flyt

1. `embed.ts` lastes via script-tag på kundens nettside.
2. Leser `data-organization-id` og `data-position` fra script-taggen.
3. Lager flytende boble + skjult container (iframe).
4. Iframen peker til widget-appen (`apps/widget`) med `?organizationId=org_…`.
5. PostMessage-er styrer størrelse, knappefarger og åpne/lukke.

### 7.7 Auth-flyt (Clerk)

- Bruker logger inn via Clerk på `/sign-in`.
- Hvis bruker ikke har valgt organisasjon → omdirigeres til `/org-selection`.
- JWT-mal `convex` må inkludere `orgId`-claim (og helst `email`, `name`).
- Convex bruker `CLERK_JWT_ISSUER_DOMAIN` for verifisering.
- Clerk webhook (`/clerk-webhook` på Convex) lytter på: `user.created`, `user.updated`, `user.deleted`, `subscription.updated`.
- Webhook bruker `CLERK_WEBHOOK_SECRET` (Svix-signatur).

### 7.8 Multi-tenancy

- Alle data segmenteres per `organizationId` (Clerk org).
- Convex-funksjoner bruker `getOrgIdOrNull(ctx)` som leser `orgId` fra JWT.
- RAG-namespaces bygges med `{orgId}` eller `{orgId}:{agentId}`.

### 7.9 Rate limiting

- API-rutene `/api/contact` og `/api/newsletter` bruker `checkApiRateLimit` (in-memory, basert på client-IP).
  - Kontakt: 20 req / 15 min per IP
  - Nyhetsbrev: 12 req / 60 min per IP
- Returnerer `429` med `Retry-After`-header ved overskridelse.

### 7.10 Honeypot / spamvern

- Kontaktskjema har et skjult `company`-felt (honeypot). Hvis det er fylt ut, returneres `200 OK` uten å sende e-post.

### 7.11 E-postformidling (Resend)

- Krever miljøvariabler:
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
  - `NOTIFY_TO_EMAIL`
- Sender:
  - Kontaktskjema-meldinger til teamet
  - Nyhetsbrev-påmeldinger (manuell oppfølging — ingen automatisert flyt enda)

---

## 8. Sider og nettstedsstruktur

### 8.1 Markedsføring (`agenci.no`)

| URL | Beskrivelse |
|-----|-------------|
| `/` | Forside (hero, produkt, integrasjoner, priser, FAQ, kontakt, CTA) |
| `/?from=marketing` | Forside selv om bruker er innlogget (ellers redirect til `/dashboard`) |
| `/produkt` | Produktside med 6 hovedpunkter |
| `/integrasjoner` | Integrasjonsoversikt |
| `/hvordan-det-virker` | Slik fungerer det — flyt, skjermbilder, praktiske steg |
| `/kontakt` | Kontaktskjema |
| `/personvern` | Personvernerklæring (GDPR) |
| `/vilkar` | Vilkår for bruk |
| `/sign-in`, `/sign-up` | Clerk-autentisering |
| `/org-selection` | Velg organisasjon |
| `/sitemap.xml`, `/robots.txt` | SEO |

### 8.2 Dashboard (`app.agenci.no`)

| URL | Beskrivelse |
|-----|-------------|
| `/dashboard` | Org-oversikt: KPI-kort, siste samtaler, kunnskap |
| `/agents` | Liste over agenter |
| `/agents/{agentId}` | Agent-detalj |
| `/agents/{agentId}/conversations` | Samtaler for én agent |
| `/agents/{agentId}/conversations/{id}` | Detaljvisning av samtale |
| `/agents/{agentId}/files` | Kunnskapsbase per agent |
| `/agents/{agentId}/customization` | Widget-tilpasning per agent |
| `/agents/{agentId}/integrations` | Embed-kode per agent |
| `/agents/{agentId}/plugins/vapi` | Vapi voice setup |
| `/agents/{agentId}/billing` | Faktura |
| `/conversations` | Org-bred samtaleliste |
| `/conversations/{id}` | Samtaledetalj |
| `/files` | Org-bred kunnskap |
| `/customization` | Widget-tilpasning (org-bred) |
| `/integrations` | Embed-kode + org-ID |
| `/plugins/vapi` | Vapi (org-bred) |
| `/billing` | Plan og faktura |
| `/settings` | Kontoinnstillinger |

### 8.3 API-ruter

| URL | Metode | Beskrivelse |
|-----|--------|-------------|
| `/api/contact` | POST | Kontaktskjema → Resend |
| `/api/newsletter` | POST | Nyhetsbrev-påmelding → Resend |
| `/api/account/delete` | POST | Sletter Clerk-bruker (krever auth) |
| `/api/sentry-example-api` | GET | Sentry test-endepunkt |

### 8.4 Widget-app (`apps/widget`)

- Standalone Next.js-app, port `3001` lokalt.
- URL: `http(s)://<host>/?organizationId=org_…`
- Egen layout — ingen markedsføringschrome.

---

## 9. Personvern, GDPR og sikkerhet

### 9.1 Behandlingsansvarlig
Hassan Triodelab DA. Personvernkontakt: `post@triodelab.no` (merk «Personvern»).

### 9.2 Hva slags data behandles

- **Konto/identitet:** navn, e-post, telefonnummer, innloggingsidentifikatorer (Clerk).
- **Drift/sikkerhet:** IP, enhets-/nettleserinfo, tidspunkter, logger.
- **Innhold i tjenesten:** tekst, filer, samtaler operatøren laster inn eller som genereres.
- **Kundeservice:** opplysninger ved henvendelse (kontaktskjema).
- **Markedsføring:** e-postadresse for nyhetsbrev (samtykke).
- **Widget-besøkende:** navn + e-post + minimal metadata (userAgent, language, timezone, referrer, currentUrl).

### 9.3 Retensjon og sletting

| Data | Lagringstid |
|------|-------------|
| Widget-besøkende (`contactSessions`) | Anonymiseres etter **24 timer** via daglig cron `02:00 UTC` (navn → "Slettet", e-post → "slettet@agenci.local", metadata fjernes) |
| Brukerkontoer | Slettes ved Clerk webhook `user.deleted` |
| Samtalehistorikk | Holdes i avtaleperioden — slettes på forespørsel |
| Kontaktskjema | Lagres ikke i DB — videresendes via Resend |
| Nyhetsbrev | Behandles til samtykke trekkes (ingen automatisert unsubscribe — manuell prosess) |

### 9.4 Underleverandører (databehandlere)

| Leverandør | Land/Region | Formål |
|-----------|-------------|--------|
| **Convex** | EU (Irland, AWS eu-west-1) | Primær database |
| **Clerk** | USA | Autentisering/kontoadministrasjon (SCC) |
| **OpenAI** | USA | AI-svar, embeddings, tekstuttrekk (SCC; ingen training-data via API) |
| **Sentry** | EU (Tyskland) | Feilsporing (Session Replay deaktivert) |
| **Resend** | USA | E-postformidling (kontakt + nyhetsbrev) |
| **Vapi** | USA | Voice (kun aktivert per kunde) |
| **AWS Secrets Manager** | EU (typisk eu-west-1) | Plugin-credentials |
| **Vercel** | EU/global | Hosting |

### 9.5 Tredjelandsoverføring

Skjer via **EU-kommisjonens standardkontraktsklausuler (SCC)** for leverandører i USA. Clerk er US-hostet — SCC-aksept anbefales formelt i Clerk dashboard.

### 9.6 Brukerrettigheter (GDPR)

- Innsyn (Art. 15)
- Retting (Art. 16)
- Sletting (Art. 17) — for widget-besøkende: `deleteMySession`-mutation som anonymiserer umiddelbart
- Begrensning (Art. 18)
- Dataportabilitet (Art. 20)
- Innsigelse (Art. 21)
- Trekke samtykke (Art. 7)

Henvendelser besvares innen **én måned**. Klage kan rettes til Datatilsynet.

### 9.7 Cookies og localStorage

- **Clerk session cookie** (nødvendig)
- **UI-preferanse-cookie** (sidebar-state, nødvendig)
- **Sentry** — feilsporing (ingen sesjonsopptak)
- **Widget localStorage** — anonym sesjons-ID (`echo_contact_session`) og siste samtale per org (`echo_conversation`). Ingen cookies fra embed-skriptet.

### 9.8 Sikkerhetstiltak

- TLS i transitt
- Tilgangskontroll per organisasjon (Clerk)
- Dataminimering (widget-metadata redusert; platform/vendor/screenResolution/viewportSize/cookieEnabled/languages er fjernet)
- Sentry Session Replay **deaktivert** (var tidligere aktiv på 10 % av sesjoner + 100 % på feil — slått av 2026-05-04)
- Privacy-link på widget-auth-skjerm peker til `/personvern`

### 9.9 GDPR-status (per 2026-05-04)

**Implementert:**
- Selskapsidentifikasjon på legal-pages (`COMPANY_LEGAL_LINE`)
- Underleverandører navngitt
- Retensjonsskjema dokumentert
- Daglig cron som anonymiserer utløpte sesjoner
- Redusert widget-metadata
- Privacy-lenke på auth-skjerm

**Gjenstår å implementere:**
- «Slett konto» som synlig flyt i dashboard for operatører
- Dataeksport / portabilitet (Article 20) for sluttbrukere
- Cookie consent banner (kun nødvendig hvis analytics/session replay legges til)
- DPA-mal for bedriftskunder som deployer widgeten
- Automatisert nyhetsbrev-unsubscribe
- Formell SCC-aksept i Clerk dashboard
- Vapi voice-disclosure i personvernerklæringen
- Retensjonspolicy for `answerTrainingExamples`

---

## 10. Vilkår for bruk (kort sammendrag)

- Avtale mellom kunden og Hassan Triodelab DA («Agenci»).
- Norsk rett, Oslo tingrett som verneting.
- Versjon 2.0, sist oppdatert 2026-03-27.
- Kunden eier sitt innhold; Agenci har lisens til å behandle det for å levere tjenesten.
- AI-svar er maskingenererte — kunden er ansvarlig for å sjekke kvaliteten på innholdet de laster opp.
- Ansvarsbegrensning: standard SaaS-vilkår.
- Ingen bindingstid; oppsigelse når som helst.
- Suspensjon ved misbruk eller manglende betaling.
- Endringer varsles på siden og kan kreves akseptert ved fortsatt bruk.

Komplett tekst på `/vilkar`.

---

## 11. Tone, språk og stil

### 11.1 Språk i produktet
- **Hovedspråk:** Norsk (bokmål) i widget, dashboard og marketing.
- AI-svar fra Agenci-assistenten er **alltid på norsk (bokmål)** uavhengig av kundespørsmålets språk, med mindre operatøren konfigurerer egen prompt.
- «Enhance» bevarer originalspråk hvis det åpenbart ikke er norsk.

### 11.2 Tone
- Varm, menneskelig, hjelpsom.
- Korte og presise svar (maks 2–3 setninger).
- Du-form. Unngå fagsjargong.
- Én emoji der det passer (avslutning, takkesvar, gode nyheter). Aldri overdriv.

### 11.3 Visuell merkevare

- **Mørkt tema** med dyp svart bakgrunn (`#010102`, `#0f1011`).
- **Aksent (Linear-inspirert):** `#5e6ad2` (lilla/blå) — brukt i kickere, prikker, badges, primær CTA.
- **Sekundær aksent (markedsføring):** `#2DD4BF` (mint/teal) — brukt på lyse markedssider.
- **Tekstfarger:**
  - Hvit primær: `#f7f8f8`
  - Lys grå (lead): `#d0d6e0`
  - Mute: `#8a8f98`, `#62666d`
  - Border: `#23252a`, `#1a1b1e`
- **Font:** systemets `font-sans` med antialiased rendering, `text-rendering: optimizeLegibility`.
- **Knapper:** rounded-[8px] (Linear-style, ikke runde piller på primær CTA).
- **Karusell** i hero: 3 dashboard-skjermbilder roterer hvert 2,4 sek (med `prefers-reduced-motion`-respekt).

---

## 12. Markedsføringsbudskap

### 12.1 Hovedheadline (forside)
> «Aldri mer tapte kunder.»

### 12.2 Subheadline
> «AI-chat for nettsiden din — svarer med dine egne ord, hele døgnet.»

### 12.3 Lead-tekst
> «Du svarer sannsynligvis de samme spørsmålene hver eneste dag. Åpningstider, priser, leveringstid, returpolicy. Agenci gjør det for deg — på nettsiden, hele døgnet — med svarene du selv har skrevet.»

### 12.4 Tre nøkkelverdier (workflow-seksjon)
1. **Svar på sekunder, ikke timer.** Besøkende spør — assistenten svarer umiddelbart. Pris, leveringstid, returpolicy, åpningstider. Ingen ventetid, ingen tapte kunder.
2. **Dine svar, ikke generelle fraser.** Last opp det du allerede har — FAQ, produktbeskrivelser, retningslinjer. Assistenten svarer bare ut fra dette. Ingen hallusinasjoner.
3. **Et menneske når det trengs.** Se alle samtaler live i dashboardet. Ta over når som helst. Kunden slipper å forklare alt på nytt — historikken er der.

### 12.5 Pricing-headline
> «Start gratis. Betal når dere vokser.»

### 12.6 Final CTA
> «Prøv det gratis — se selv om det funker for deg.» Ingen kortinfo, ingen binding. 14 dager Pro-prøve.

---

## 13. FAQ (offisielle svar fra forsiden)

**Er dette ikke bare en vanlig chatbot?**
Nei. Vanlige chatboter gir forhåndsdefinerte svar på forhåndsdefinerte spørsmål — og mislykkes med alt annet. Agenci leser innholdet ditt og svarer fritt ut fra det. Stiller kunden et spørsmål du ikke har dekket, sier den fra og tilbyr å koble til deg.

**Hvor lang tid tar det å sette opp?**
Under 10 minutter for det grunnleggende. Lim inn én linje kode, last opp FAQ-en din, og du er i gang. Ingen utvikler nødvendig. Finjuster utseende og tone etterpå i dashboardet.

**Hva skjer hvis assistenten svarer feil?**
Du ser alle samtaler i dashboardet og kan rette opp underveis. Hvis assistenten er usikker, sier den fra til kunden i stedet for å gjette. Du kan legge inn instrukser for hva den aldri skal svare på.

**Hva med GDPR og personvern?**
Kundedata lagres i henhold til GDPR. Du eier dataene. Vi lagrer ikke samtaler til treningsformål uten avtale. Du kan slette alt til enhver tid.

**Hva skjer når en kunde trenger å snakke med et menneske?**
Du ser samtalen live i dashboardet og kan ta over når som helst. Kunden slipper å forklare alt på nytt — all historikk er der.

**Hva koster det etter prøveperioden?**
Pro-planen koster 1 499 kr per måned (eller 1 199 kr/mnd ved årlig fakturering). Starter koster 499 kr/mnd. Ingen bindingstid — si opp når som helst. Gratis-planen forblir gratis (50 samtaler/mnd).

> *Merk:* På forsiden refereres «Pro-planen for 499 kr» fra en tidligere prismodell. Aktuell prising vises i tabellen i seksjon 3.

---

## 14. Vanlige spørsmål (utvidet — for AI-bruk)

### Generelt

**Hva er Agenci?**
En norsk AI-chat-plattform for nettsider. Gir kundeservicechat 24/7 basert på bedriftens egne dokumenter og FAQ.

**Hvem er Agenci for?**
Små og mellomstore bedrifter, e-handel, tjenesteytere — alle som svarer på de samme spørsmålene daglig. Også for større team som vil bruke flere agenter (Pro/Business).

**Snakker AI-en norsk?**
Ja. Standard er bokmål. Operatøren kan overstyre via egen system-prompt.

**Hvor er data lagret?**
Primært i EU (Convex i Irland). AI-prosessering skjer hos OpenAI (USA, SCC). Sentry-feilsporing i EU (Tyskland).

### Bruk

**Hvor mange agenter kan jeg ha?**
Maksimalt 5 (intern grense). Plan-grensene er 1 (Gratis/Starter), 3 (Pro), 10 (Business). Business-kunder må kontakte support for å øke utover 5.

**Kan jeg ha forskjellige agenter for forskjellige tema?**
Ja. Hver agent har egen kunnskapsbase og kan kobles til ulike widget-instanser eller systemer.

**Kan jeg legge inn nettsider, ikke bare filer?**
Ja. Lim inn URL — Agenci henter HTML, ekstraherer ren tekst og indekserer. Maks 2 MB HTML per side.

**Hva slags filer støttes?**
PDF (`gpt-4o`-uttrekk), bilder JPEG/PNG/WebP/GIF (`gpt-4o-mini`), tekstformater (txt, md, html). Tekstfiler over `text/plain` konverteres via `gpt-4o`.

**Kan AI-en lære av samtaler?**
Indirekte. Operatøren kan markere et godt svar som «treningseksempel» (lagres i `answerTrainingExamples`). Søkeverktøyet henter de 12 nyeste eksemplene og gir dem til modellen som referanse.

**Kan jeg ta over en samtale fra AI?**
Ja. I dashboardet kan du skrive direkte til kunden — meldingen vises som om den kommer fra «teamet». «Enhance»-knappen kan polere meldingen før sending.

**Kan kunden be om et menneske?**
Ja. AI-en oppdager frustrasjon eller eksplisitte forespørsler og kaller `escalateConversation`-tool. Status settes til `escalated`.

**Hva skjer hvis AI ikke finner svar?**
Den svarer: «Hmm, jeg finner ikke noe om det her. Vil du at jeg kobler deg med noen?» — og tilbyr eskalering.

### Pris og betaling

**Trenger jeg kortinfo for å starte?**
Nei. Gratis-planen krever ingen kortinfo. Pro 14-dagers prøve er også uten kortinfo.

**Hvor mye sparer jeg ved årlig?**
20 % rabatt sammenlignet med månedlig.

**Hva betyr «50 samtaler/mnd»?**
Antall fullstendige samtaler (ikke meldinger) widgeten kan ha med kunder per måned. Ved overskridelse må man oppgradere.

**Er det MVA?**
Ja, alle priser er ekskl. 25 % MVA.

### Teknisk

**Hvordan setter jeg opp widgeten?**
1) Logg inn → `/integrations`. 2) Kopier embed-koden (HTML/React/Next.js/JS). 3) Lim inn i `<body>` (eller `layout.tsx` for Next.js).

**Hvor finner jeg organisasjons-ID?**
På `/integrations`-siden. Det er Clerk Org-ID i format `org_…`.

**Hva er forskjellen på `apps/web` og `apps/widget`?**
Web er hoved-Next.js-appen (markedsføring + dashboard). Widget er en egen Next.js-app som kjører **inni en iframe** på kundens nettside via embed-skriptet.

**Bruker dere min data til å trene AI?**
Nei. OpenAI API beholder ikke data for trening når brukt via API. Vi lagrer ikke samtaler for trening uten egen avtale.

**Hva er Convex?**
En reactive backend-as-a-service med database, queries, mutations og actions. Vi bruker den fordi den gir realtime sync, sterk typesikkerhet og innebygd støtte for AI-agenter og RAG via Convex-komponentene.

**Hva er forskjellen på public og private Convex-funksjoner?**
- `public/` brukes av widgeten (autentisert via kontaktsesjon eller org-ID).
- `private/` brukes av dashboardet og krever Clerk-auth med org.

### Personvern

**Hvor lenge lagres data om en widget-besøkende?**
24 timer. Etter ekspirasjon anonymiserer en daglig cron navn, e-post og metadata.

**Hva om jeg vil slette kontoen min?**
`POST /api/account/delete` — sletter Clerk-bruker og trigger Convex-sletting via webhook. UI-flyt mangler per nå (på roadmap).

**Bruker dere cookies?**
- Clerk session-cookie (nødvendig)
- UI-preferanse-cookie (nødvendig)
- Ingen analytics- eller marketingcookies som standard
- Embed-skriptet setter ingen cookies — bruker localStorage

---

## 15. Driftshandover (operatør cheatsheet)

### 15.1 Konfigurere widget på kundens nettside
1. Logg inn på `app.agenci.no`
2. Velg organisasjon (Clerk)
3. Gå til `/integrations` → kopier embed-snippet
4. Lim inn på kundens nettside (rett før `</body>`)
5. Test: bobla skal dukke opp nede til høyre

### 15.2 Last opp kunnskap
1. `/files` (eller `/agents/{id}/files` for per-agent-KB)
2. Last opp PDF/bilder/tekst eller lim inn nettsider
3. Vent på indeksering (status: `processing` → `ready`)

### 15.3 Tilpass utseende
1. `/customization`
2. Velg agent
3. Sett velkomstmelding + 3 forslag
4. Juster farger, posisjon, størrelse
5. Lagre — endringer trer i kraft umiddelbart i nye widget-økter

### 15.4 Følg samtaler
1. `/conversations`
2. Filtrer: `inbox` (åpne), `escalated`, `resolved`
3. Klikk inn → les → svar med «Enhance» hvis ønsket
4. Marker som `resolved` når ferdig

### 15.5 Lagre godt svar som treningseksempel
1. Åpne samtale
2. Velg melding
3. «Lagre som treningseksempel»
4. Skriv inn det «forventede svaret»
5. Lagres i `answerTrainingExamples` og hentes av søkeverktøyet i fremtiden

---

## 16. Miljøvariabler (for utvikling/deploy)

### `apps/web/.env`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_COMPANY_LEGAL_LINE` (overstyrer hardkodet fallback)
- `NEXT_PUBLIC_DEV_BYPASS_PREMIUM` (UI-gate, ikke Convex)
- `NEXT_PUBLIC_TEAM_DEVELOPER_EMAILS`
- `NEXT_PUBLIC_HIDE_CLERK_BILLING_UI`
- `NEXT_PUBLIC_WIDGET_EMBED_SCRIPT_URL` (egen widget-deploy)
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NOTIFY_TO_EMAIL`
- `SENTRY_AUTH_TOKEN`

### `apps/widget/.env.local`
- `NEXT_PUBLIC_CONVEX_URL` (samme som web)

### Convex environment (`packages/backend`)
- `OPENAI_API_KEY` — obligatorisk for RAG, agent, Enhance, filuttrekk
- `CLERK_JWT_ISSUER_DOMAIN` — verifisering av JWT
- `CLERK_SECRET_KEY` — widget validerer org via Clerk
- `CLERK_WEBHOOK_SECRET` — Svix-signatur for Clerk webhook
- `CONVEX_DEV_BYPASS_SUBSCRIPTION`, `CONVEX_DEV_ORGANIZATION_IDS`, `CONVEX_DEV_TEAM_EMAILS`
- AWS credentials (for Vapi-secrets-manager)

---

## 17. Hva Agenci IKKE er / vanlige misforståelser

- **Ikke en regelbasert chatbot.** Det er en LLM-basert RAG-agent.
- **Ikke en generisk ChatGPT-wrapper.** Svarer kun ut fra kundens egne data via vector-søk.
- **Ikke et CRM.** Lagrer ikke kundeprofiler — kun aktive kontaktsesjoner og samtaler.
- **Ikke for å erstatte kundeservice.** Designet for å avlaste på rutinespørsmål; eskalere til menneske ved behov.
- **Ingen treningsdata-lekkasje.** Samtaler brukes ikke til å trene OpenAI-modeller.
- **Ingen analytics som standard** (ingen Google Analytics, ingen Hotjar, ingen Mixpanel).

---

## 18. Roadmap og kjente begrensninger (per 2026-05-06)

### Pilotstatus
- Live, men i pilotfase. Ingen ekte kunder per nå.

### Kjente begrensninger
- Bare nettside-widget er live. CRM/e-post/Slack-integrasjoner er «snart».
- Kontaktskjema-data lagres ikke (kun e-post-relé).
- Nyhetsbrev har ingen automatisert unsubscribe.
- «Slett konto»-flyt mangler i dashboardet (eksisterer kun som API).
- Ingen dataeksport for sluttbrukere (GDPR Art. 20 — på roadmap).
- Ingen cookie consent banner (komponent finnes; vises ikke fordi ingen tracking-cookies brukes).
- DPA-mal for B2B-kunder mangler.
- Vapi voice-disclosure mangler i personvernerklæringen (kun relevant ved aktivering).
- `answerTrainingExamples` har ingen retensjonspolicy.
- Sentry SCC-aksept i Clerk dashboard ikke bekreftet formelt.

### På roadmap
- Egen «Slett konto»-knapp i dashboard
- Dataeksport for operatør og sluttbruker (Art. 20)
- Cookie consent banner aktivering
- HubSpot, Shopify, Stripe, Gmail, Slack, Zapier, Zendesk, Teams-integrasjoner
- DPA-mal
- Automatisert unsubscribe for nyhetsbrev
- Operatør «Playground» / answer training UI

---

## 19. Hjelp og kontakt

- **Generell support:** post@triodelab.no
- **Personvern:** post@triodelab.no (merk «Personvern»)
- **Kontaktskjema:** `agenci.no/kontakt`
- **Demo-booking:** via kontaktskjema (linket i hero og final CTA)
- **Klage til tilsyn:** Datatilsynet (`datatilsynet.no`)

---

## 20. Ordliste

| Begrep | Forklaring |
|--------|------------|
| **Agent** | En navngitt AI-assistent med egen kunnskapsbase. Maks 5 per org. |
| **Conversation** | En tråd mellom kunde og AI/operatør. Har status (unresolved/escalated/resolved). |
| **Contact session** | Identifisert besøkende (navn + e-post). Utløper etter 24t. |
| **Embed** | Ett-linjes script-tag som viser widgeten på kundens nettside. |
| **Enhance** | AI-funksjon som forbedrer operatørens utkast før sending. |
| **Escalation** | Når AI gir samtalen videre til et menneske. |
| **Knowledge base / KB** | Filer/nettsider operatør har lastet opp. RAG-indekseres. |
| **Namespace (RAG)** | Isolert vektor-indeks per `{orgId}` eller `{orgId}:{agentId}`. |
| **Organization** | Clerk-organisasjon. Kunder = orgs. Brukere = medlemmer. |
| **Plugin** | Tredjeparts-integrasjon (per nå: Vapi). Lagret som secret-referanse. |
| **RAG** | Retrieval-Augmented Generation — vector-søk + LLM-svar. |
| **Resolve** | Markere en samtale som lukket. |
| **Subscription** | Org-abonnement. Status: `active`/`trialing`/`canceled`/`free`. |
| **Thread** | Convex Agent-tråd som holder meldingshistorikk. |
| **Vapi** | Voice AI-plattform (telefoni). Premium-plugin. |
| **Webhook** | Clerk → Convex på `/clerk-webhook`. Synker users + subscriptions. |
| **Widget** | Chat-widgeten som vises på kundens nettside (egen Next.js-app i iframe). |

---

*Sist oppdatert: 2026-05-06. Dokumentet skal vedlikeholdes løpende. Endringer i pris, integrasjoner, retensjon eller leverandører skal speiles her.*
