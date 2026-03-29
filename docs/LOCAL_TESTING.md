# Lokal testing – hva som må på plass

Dashboardet føles «lite å gjøre» når **data eller tilkoblinger mangler**. Dette er det du trenger for at flyten skal fungere.

## 1. Convex

- `packages/backend`: `npx convex dev` (eller `pnpm dev:backend` fra rot).
- **Samme deployment** som `NEXT_PUBLIC_CONVEX_URL` i `apps/web` og `apps/widget`.
- **Miljøvariabler på deploymenten** (Dashboard → Environment variables eller `npx convex env set`): se [`packages/backend/.env.example`](../packages/backend/.env.example) for full liste.
- Widget bruker `public/organizations.validate` → trenger **`CLERK_SECRET_KEY` på Convex** for å slå opp organisasjoner.

### 1a. OpenAI (obligatorisk for AI)

Sett på Convex:

```bash
cd packages/backend
npx convex env set OPENAI_API_KEY "sk-...."
```

Uten denne feiler **RAG** (embeddings + søk), **support agent** (widget), **tekstuttrekk fra filer** (PDF/bilde m.m.) og **Enhance** i operatørvisningen.

### 1b. Clerk-webhook (anbefalt for abonnement + brukersync)

- I Clerk: opprett webhook som peker til **`https://<ditt-deployment>.convex.site/clerk-webhook`** (erstatt med URL fra Convex Dashboard).
- Hendelser som brukes i kode: bl.a. `user.created` / `user.updated` / `user.deleted`, **`subscription.updated`**.
- Sett **`CLERK_WEBHOOK_SECRET`** på Convex (signeringshemmelighet fra Clerk).

Uten gyldig webhook-secret feiler verifisering i `convex/http.ts`; uten `subscription.updated` får du ikke automatisk **`subscriptions`-rad** med `active`.

### 1c. Aktiv subscription (obligatorisk for agent, filer, Enhance)

`NEXT_PUBLIC_DEV_BYPASS_PREMIUM` i **web** styrer bare ProPlanGate i Next.js — **Convex sjekker ikke den**.

**Utviklere uten global bypass:** sett `NEXT_PUBLIC_TEAM_DEVELOPER_EMAILS` (web) og `CONVEX_DEV_TEAM_EMAILS` (Convex) til samme kommaseparerte liste — da får disse brukerne Pro i UI og backend-tilgang som ved aktivt abonnement, mens øvrige kunder følger vanlig abonnement.

For org-en din må det finnes en rad i **`subscriptions`** med `organizationId` = Clerk `org_…` og **`status: "active"`**, **med mindre** du bruker dev-bypass eller team-e-post over. Ellers:

- widgeten lagrer bare brukermeldinger (ingen agent-kall),
- knowledge base-upload sier «Missing subscription»,
- Enhance sier «Missing subscription».

**Utvikling uten Clerk Billing:** legg inn raden manuelt i **Convex Dashboard → Data → `subscriptions`**, eller simuler webhook.

JWT / `orgId`: se [packages/backend/docs/CONVEX_CLERK_JWT.md](../packages/backend/docs/CONVEX_CLERK_JWT.md).

## 2. Clerk

- JWT-mal **`convex`** med `orgId` (eller tilsvarende) slik at private queries får organisasjon.
- Innlogget bruker med **valgt organisasjon** for dashboard.
- **Billing (Beta):** For `/billing` med `PricingTable` og organisasjonsfaktura må **Clerk Billing** være aktivert i [Clerk Dashboard → Billing](https://dashboard.clerk.com/last-active?path=billing/settings) for appen (Development eller Production). Følg veiviseren (Stripe, planer). Dette er ikke en ekstra nøkkel i `.env` — det er produktinnstillinger i Clerk. Uten aktivert billing viser appen en forklaring i stedet for å krasje.

## 3. Web (`apps/web`)

- `.env` med `NEXT_PUBLIC_CONVEX_URL`, Clerk-nøkler, ev. `NEXT_PUBLIC_DEV_BYPASS_PREMIUM` for utvikling (kun UI-gate, ikke Convex-logikk).
- **Billing / faktura:** på `/billing` vises `OrganizationProfile` og `PricingTable` som standard. Valgfritt: `NEXT_PUBLIC_HIDE_CLERK_BILLING_UI=true` viser plassholder for brukere som ikke står i `NEXT_PUBLIC_TEAM_DEVELOPER_EMAILS` (f.eks. miljø uten Clerk Billing). `NEXT_PUBLIC_DEV_BYPASS_PREMIUM` styrer kun ProPlanGate, ikke billing-siden.

## 4. Widget (`apps/widget`)

- `.env.local` med **samme** `NEXT_PUBLIC_CONVEX_URL` som web.
- Start: `pnpm dev:widget` → [http://localhost:3001/?organizationId=org_…](http://localhost:3001/?organizationId=org_…)

Mer detalj: [apps/widget/README.md](../apps/widget/README.md).

## 5. Hva som faktisk er «koblet»

| Område | Krever typisk |
|--------|----------------|
| Conversations | Org i JWT, data i Convex |
| Knowledge (filer) | **`OPENAI_API_KEY`**, aktiv **`subscriptions`**, org i JWT |
| Widget AI-svar | **`OPENAI_API_KEY`**, aktiv **`subscriptions`**, gyldig org + session |
| Operatør «Enhance» | **`OPENAI_API_KEY`**, aktiv **`subscriptions`** |
| Widget customization | `widgetSettings` etter lagring |
| Integrations | `organization.id` fra Clerk (vises på siden) |
| Voice / Vapi | Plugin + **AWS** (Secrets Manager) konfigurert på Convex |

Uten f.eks. **subscription**, **OpenAI-nøkkel** eller **widget-innstillinger** vil noen handlinger gi tom tilstand eller feilmelding – det er forventet til dere fyller data.

## 6. Embed `<script>` på nettsider

Integrations-snippets bruker `NEXT_PUBLIC_WIDGET_EMBED_SCRIPT_URL` (valgfri) eller en standard-URL. Den **lokale** widget-appen testes best med **full URL** (`localhost:3001` + `organizationId`), ikke bare script-taggen, med mindre dere bygger og hoster en egen `widget.js`.

## 7. Sjekkliste (kort)

| Variabel / oppsett | Hvor | Formål |
|--------------------|------|--------|
| `OPENAI_API_KEY` | Convex env | RAG, agent, filuttrekk, Enhance |
| `CLERK_JWT_ISSUER_DOMAIN` | Convex env | Auth |
| `CLERK_SECRET_KEY` | Convex env | Widget org-validering, Clerk API |
| `CLERK_WEBHOOK_SECRET` | Convex env | `/clerk-webhook` |
| `subscriptions` = active | Convex Data / webhook | Agent, KB-upload, Enhance |
| `NEXT_PUBLIC_CONVEX_URL` | Web + widget | Alle klienter |
| AWS credentials | Convex env | Kun Vapi-plugin |
