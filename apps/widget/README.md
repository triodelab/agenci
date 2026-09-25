# Agenci widget

Egen **Vite + React-app** (ingen Next.js) som viser chat-widgeten. Den snakker med
`apps/server` (Hono, oRPC) — anonyme besøkende identifiseres med en contact session
(`x-contact-session-id`), ikke innlogging.

## 1. Miljø

Valgfritt i `apps/widget/.env`:

- **`NEXT_PUBLIC_SERVER_URL`** — adressen til `apps/server`. Standard: `http://localhost:3003`.

## 2. Start lokalt

Fra monorepo-roten (serveren må kjøre, se rot-`package.json`):

```bash
bun run dev:widget
```

Standardport: **3001**.

## 3. Åpne widget i nettleseren

Send med organisasjons-ID-en (vises under **Organisasjon** i dashboardet):

```
http://localhost:3001/?organizationId=DIN_ORGANISASJONS_ID
```

Valgfritt: `&agentId=…` for en bestemt agent (ellers brukes organisasjonens første
ferdig indekserte agent), og `&playground=1` for forhåndsvisningen i dashboardet.

## 4. Status

Chat, besøkende-sesjon og widget-innstillinger går mot `apps/server`. Booking, innboks
og valg-skjermen er ikke portert ennå (booking flyttes til MCP).
