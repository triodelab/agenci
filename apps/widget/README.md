# Agenci widget (forhåndsvisning)

Dette er en **egen Next.js-app** som viser chat-widgeten. Den bruker **samme Convex-backend** som `apps/web` (sett `NEXT_PUBLIC_CONVEX_URL`).

## 1. Miljø

Opprett **`apps/widget/.env.local`** (kopier fra `.env.example`) og sett:

- **`NEXT_PUBLIC_CONVEX_URL`** – **nøyaktig samme** URL som `NEXT_PUBLIC_CONVEX_URL` i `apps/web/.env` (og som `CONVEX_URL` i `packages/backend/.env.local`).

Feilen `Couldn't parse deployment name your-deployment` betyr at URL-en fortsatt er en **plassholder** – bytt til den ekte `https://….convex.cloud`-adressen og **restart** widget (`Ctrl+C`, deretter `pnpm dev:widget`).

Convex-actions som `public/organizations.validate` trenger **`CLERK_SECRET_KEY` satt på Convex-deploymenten** (ikke bare lokalt), ellers feiler organisasjonssjekken.

## 2. Start widget lokalt

Fra monorepo-roten:

```bash
pnpm dev:widget
```

Eller:

```bash
cd apps/widget && pnpm dev
```

Standardport: **3001**.

## 3. Åpne widget i nettleseren

Du må sende med **Clerk organization ID** (samme som under **Integrations** i dashboardet):

```
http://localhost:3001/?organizationId=org_xxxxxxxx
```

Finn `org_…` i Clerk (Organization → Details) eller kopier fra feltet **Organization ID** på `/integrations` i appen når du er logget inn med valgt org.

## 4. Hva du trenger kjørende samtidig

| Tjeneste | Kommando | Merknad |
|----------|----------|--------|
| Convex backend | `pnpm dev:backend` (eller `cd packages/backend && npx convex dev`) | Må være koblet til samme deployment som URL-en over |
| Widget | `pnpm dev:widget` | Denne appen |
| Web (valgfritt) | `pnpm dev:web` | For dashboard, innstillinger, knowledge, osv. |

## 5. Innebyggingskode (`<script>`)

Snippets under **Integrations** peker på en **deployet** `widget.js` (se `NEXT_PUBLIC_WIDGET_EMBED_SCRIPT_URL` i web). For **lokal** testing bruker du URL-en over (`localhost:3001` + `organizationId`), ikke nødvendigvis script-taggen.

Når dere bygger egen produksjons-widget, oppdater embed-URL og deploy widget-appen.
