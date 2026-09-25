# Lokal testing – hva som må på plass

Stacken: **Hono-server** (`apps/server`, Better Auth + oRPC + Inngest + Mastra), **Postgres/pgvector** via Prisma (`@agenci/db`), **MinIO** for filer, og frontendene `apps/web` (markedsføring), `apps/dashboard` (ansatte) og `apps/widget` (kundechat).

## 1. Avhengigheter

```bash
bun install
```

## 2. Miljøvariabler

| Fil | Viktigst |
|-----|----------|
| `apps/server/.env` | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CORS_ORIGIN` / `DASHBOARD_ORIGIN` / `WIDGET_ORIGIN`, `OPENAI_API_KEY`, `MINIO_*` |
| `apps/web/.env.local` | `NEXT_PUBLIC_SERVER_URL=http://localhost:3003` |
| `apps/widget/.env` | Valgfritt `NEXT_PUBLIC_SERVER_URL` (standard `http://localhost:3003`) |

Kopier fra `.env.example` i hver app. Origin-verdiene kan ha eller mangle avsluttende `/` — de normaliseres.

## 3. Infrastruktur (Docker)

```bash
bun run infra:up
```

Starter Postgres (**port 5434** på verten), Inngest dev-server (8288) og MinIO (API 9000, konsoll 9001, bruker/passord fra `MINIO_ACCESS_KEY`/`MINIO_SECRET_KEY`). MinIO bruker `bitnamilegacy/minio`-imaget — det offisielle `minio/minio` krever betalt konto på Docker Hub.

## 4. Database

```bash
bun --filter @agenci/db db:generate
bun --filter @agenci/db db:push
```

Tabellen `embeddings` eies av Mastra (`@mastra/pg`) og er deklarert som `@@ignore` i Prisma-skjemaet, slik at `db push` ikke prøver å slette den.

## 5. Start appene

| App | Kommando | Port |
|-----|----------|------|
| Server | `bun --filter server dev` | 3003 |
| Dashboard | `bun run dev:dashboard` | 3004 |
| Widget | `bun run dev:widget` | 3001 |
| Web (markedsføring) | `bun run dev:web` | 3000 |

## 6. Flyt å teste

1. Registrer deg i dashboardet (`http://localhost:3004`) og opprett en organisasjon.
2. Opprett en agent med en nettside-URL — Inngest crawler og indekserer i bakgrunnen (følg med på `http://localhost:8288`).
3. Når agenten har status `COMPLETED`, åpne widgeten: `http://localhost:3001/?organizationId=<org-id>` — org-ID-en vises under Organisasjon i dashboardet.
4. Send en melding — svaret kommer fra Mastra-agenten via `apps/server`.

## 7. Kjent status

- Det gamle dashboardet i `apps/web/app/(dashboard)` leser fortsatt data fra den gamle Convex-backenden (`packages/backend`) og fungerer ikke uten den. Det erstattes av `apps/dashboard` (se `docs/task.md`).
- Widgetens booking, innboks og valg-skjerm er ikke portert til serveren ennå (booking flyttes til MCP).
