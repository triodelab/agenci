# Lokal testing – hva som må på plass

Dashboardet føles «lite å gjøre» når **data eller tilkoblinger mangler**. Dette er det du trenger for at flyten skal fungere.

## 1. Convex

- `packages/backend`: `npx convex dev` (eller `pnpm dev:backend` fra rot).
- **Samme deployment** som `NEXT_PUBLIC_CONVEX_URL` i `apps/web` og `apps/widget`.
- **`CLERK_JWT_ISSUER_DOMAIN`** og **`CLERK_SECRET_KEY`** på Convex-deploymenten der det trengs (se `packages/backend/docs/CONVEX_CLERK_JWT.md`).
- Widget bruker `public/organizations.validate` → trenger **Clerk secret på Convex** for å slå opp organisasjoner.

## 2. Clerk

- JWT-mal **`convex`** med `orgId` (eller tilsvarende) slik at private queries får organisasjon.
- Innlogget bruker med **valgt organisasjon** for dashboard.

## 3. Web (`apps/web`)

- `.env` med `NEXT_PUBLIC_CONVEX_URL`, Clerk-nøkler, ev. `NEXT_PUBLIC_DEV_BYPASS_PREMIUM` for utvikling.

## 4. Widget (`apps/widget`)

- `.env.local` med **samme** `NEXT_PUBLIC_CONVEX_URL` som web.
- Start: `pnpm dev:widget` → [http://localhost:3001/?organizationId=org_…](http://localhost:3001/?organizationId=org_…)

Mer detalj: [apps/widget/README.md](../apps/widget/README.md).

## 5. Hva som faktisk er «koblet»

| Område | Krever typisk |
|--------|----------------|
| Conversations | Org i JWT, data i Convex |
| Knowledge (filer) | Aktiv subscription i Convex (sjekk `subscriptions`), org i JWT |
| Widget customization | `widgetSettings` etter lagring |
| Integrations | `organization.id` fra Clerk (vises på siden) |
| Voice / Vapi | Plugin + secrets konfigurert |

Uten f.eks. **subscription** eller **widget-innstillinger** vil noen handlinger gi tom tilstand eller feilmelding – det er forventet til dere fyller data.

## 6. Embed `<script>` på nettsider

Integrations-snippets bruker `NEXT_PUBLIC_WIDGET_EMBED_SCRIPT_URL` (valgfri) eller en standard-URL. Den **lokale** widget-appen testes best med **full URL** (`localhost:3001` + `organizationId`), ikke bare script-taggen, med mindre dere bygger og hoster en egen `widget.js`.
