# Clerk → Convex: `orgId` i JWT

Private queries bruker `getOrgIdOrNull()` som leser `orgId` / `org_id` fra JWT (malen **`convex`**).

## `CLERK_JWT_ISSUER_DOMAIN` (på deployment — obligatorisk for push)

`auth.config.ts` bruker `process.env.CLERK_JWT_ISSUER_DOMAIN`. Verdien må ligge **på Convex-deploymenten** (sky), ellers feiler push med:

`Environment variable CLERK_JWT_ISSUER_DOMAIN is used in auth config file but its value was not set`

**Kun `packages/backend/.env.local` er ikke nok** for denne sjekken — Convex evaluerer auth-config mot variablene som er registrert på deploymenten.

**Slik setter du den (velg én):**

```bash
cd packages/backend
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://<din-instans>.clerk.accounts.dev"
```

Eller: **Convex Dashboard → Settings → Environment variables** (lenken i feilmeldingen).

Verdien er **Issuer** fra Clerk (JWT-mal `convex` eller Clerk API / Domains), typisk `https://<instans>.clerk.accounts.dev`.

Når push har feilet lenge, ligger **gammel** backend i skyen — da kan du fortsatt se feil som `Missing organization` fra en gammel `users:add` til du har kjørt en vellykket `npx convex dev` etter at variabelen er satt.

## `CLERK_SECRET_KEY` på Convex (widget / server actions)

Actions som `public/organizations.validate` kaller Clerk API med **`@clerk/backend`**. Da må **`CLERK_SECRET_KEY`** ligge på **samme Convex-deployment** — det holder ikke å ha den bare i `apps/web/.env`.

```bash
cd packages/backend
npx convex env set CLERK_SECRET_KEY "sk_test_...."
```

Verdien er **Secret keys** fra [Clerk Dashboard](https://dashboard.clerk.com) → API Keys (samme som `CLERK_SECRET_KEY` i web-appen).

Uten dette får du feil som *Missing Clerk Secret Key* når widgeten verifiserer organisasjonen.

1. [Clerk Dashboard](https://dashboard.clerk.com) → **JWT Templates** → **convex**
2. Legg til (behold øvrige felter Convex allerede krever):

```json
"orgId": "{{org.id}}"
```

3. Lagre og **logg ut og inn** slik at nytt token brukes.

4. Push Convex-kode: `npx convex dev` lokalt eller `npx convex deploy` til ditt miljø.

Uten dette feltet er `orgId` tom i Convex selv om du har valgt organisasjon i Clerk.

## Feilen `Organization not found` i nettleseren

1. **Deploy Convex** – Endringer i `packages/backend/convex/` blir ikke brukt av appen før de er pushet til samme deployment som `NEXT_PUBLIC_CONVEX_URL` peker på:

   ```bash
   cd packages/backend && npx convex dev
   ```

   (Hold den kjørende mens du utvikler, eller bruk `npx convex deploy` for produksjon.)

2. **Sjekk JWT** – Etter du har lagt inn `orgId` / `org_id` i malen `convex`, logg ut og inn i appen.

3. Hvis feilen **fortsatt** sier nøyaktig `Organization not found` fra `getMany`, kjører **sky-Convex fortsatt gammel kode** (før «tom liste»-fiks). Da er det nesten alltid punkt 1.
