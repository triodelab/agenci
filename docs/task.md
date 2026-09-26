# Convex → Self-Hosted Hono Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Convex (and its hosted auth) with a self-hosted Node.js/Hono API (`apps/server`), PostgreSQL + Prisma (`@agenci/db`), and Better Auth (`@agenci/auth`, organizations + teams), while migrating **all** existing Convex data. **Staff UI moves from `apps/web` `(dashboard)` routes to `apps/dashboard` (React + TanStack Router).** Keep `apps/widget` and `apps/embed` working; `apps/web` retains marketing/public pages until those are cut over separately.

**Architecture:** Strangler migration. Keep production Convex live until each domain is cut over. New stack is scaffolded (`apps/server`, `@agenci/auth`, `@agenci/db`, `@agenci/env`, Docker Postgres with pgvector). **React dashboard** and widget talk to Hono over HTTP (oRPC). Realtime uses **WebSocket**. Background jobs move from Convex workflows/schedulers to Inngest. RAG moves from `@convex-dev/rag` to pgvector. File storage uses **AWS S3**. Embed stays a thin IIFE that iframes the widget.

**Tech Stack:** Hono, Better Auth (+ organization + teams), Prisma 7 + PostgreSQL (pgvector), oRPC, WebSocket, Inngest, **Mastra** (`@agenci/mastra` library), OpenAI, Firecrawl, Stripe, AWS S3, AWS Secrets Manager, **React + TanStack Router (`apps/dashboard`)**, Next.js 15 (`web` marketing / `widget`), Vite embed.

---

## Locked Decisions

| #   | Decision              | Choice                                  |
| --- | --------------------- | --------------------------------------- |
| 1   | Message storage       | **Postgres** (`Message` table)          |
| 2   | File / object storage | **AWS S3**                              |
| 3   | Realtime              | **WebSocket** (persistent open channel) |
| 4   | Better Auth teams     | **Keep enabled**                        |
| 5   | Data migration        | **Full Convex → Postgres** (all orgs)   |
| 6   | Staff dashboard UI    | **`apps/dashboard` (React)** — migrate features from `apps/web/app/(dashboard)` |

---

## Global Constraints

1. Do not change production billing/auth without explicit approval.
2. UI copy stays Norwegian (Bokmål) unless asked otherwise.
3. No new dependencies unless required for a cutover task (prefer existing: Inngest, Firecrawl, Stripe, AWS SM, OpenAI).
4. Keep embed contract stable: `data-organization-id`, `data-agent-id`, `postMessage` (`close` / `resize` / `bubble-config`).
5. Preserve public vs private API split: dashboard = Better Auth session; widget = contact-session token (unguessable ID + expiry).
6. Same Postgres for auth + domain data.
7. Hono port **3003**; React dashboard **3004**; web marketing **3000**; widget **3001**; embed **3002**.
8. Incremental cutover: each phase leaves a working product path.
9. TypeScript strict — no `any` in new server/API code.
10. `@agenci/backend` stays until Phase 9 for rollback.
11. **New staff features land in `apps/dashboard` (React), not `apps/web/(dashboard)`.** Port modules from web one area at a time (agents → conversations → files → settings → billing).

---

## Target Topology

```
Customer site
  <script …/widget.iife.js data-organization-id data-agent-id>
        │
        ▼
   apps/embed ──iframe──► apps/widget (:3001)
                              │ HTTP/RPC + WebSocket + contact-session
                              ▼
                         apps/server (:3003)  Hono
                              │  ├ /api/auth/*     (Better Auth)
                              │  ├ /rpc/*          (oRPC private + public)
                              │  ├ /ws             (WebSocket realtime)
                              │  └ /api/inngest    (background jobs)
                              ▼
         PostgreSQL (pgvector) + S3 + Inngest + OpenAI + Firecrawl + Stripe + AWS SM

Org staff (primary UI)
        │
        ▼
   apps/dashboard (:3004)  React + TanStack Router
   Better Auth client (cookies via Vite proxy) + oRPC + WebSocket → apps/server

Marketing / legacy Next dashboard (temporary)
        │
        ▼
   apps/web (:3000)  — marketing + (dashboard) until React dashboard parity; then strip (dashboard)
```

---

## Already Started

| Piece                     | Path                         | Status                                                                  |
| ------------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| Fastify auth proxy        | `apps/server/src/index.ts`   | Auth catch-all only; port **3000** conflicts with web — fix in Task 0.1 |
| Better Auth + org + teams | `packages/auth/src/index.ts` | Scaffold; permissions still demo `project:*`                            |
| Prisma client             | `packages/db/src/index.ts`   | Works                                                                   |
| Prisma schema             | `packages/db/prisma/schema/` | **Stub** `User` only — not Better Auth tables                           |
| Env validation            | `packages/env/src/server.ts` | `DATABASE_URL`, `BETTER_AUTH_*`, `CORS_ORIGIN`, `PORT`                  |
| Docker                    | `docker-compose.yml`         | pgvector Postgres, Redis, **self-hosted Inngest**, Neo4j, Qdrant |

---

## File Map (Target)

| Path                                         | Responsibility                                      |
| -------------------------------------------- | --------------------------------------------------- |
| `apps/server/src/index.ts`                   | Hono bootstrap, CORS, plugin registration           |
| `apps/server/src/plugins/auth.ts`            | Better Auth handler mount                           |
| `apps/server/src/plugins/orpc.ts`            | oRPC HTTP handler                                   |
| `apps/server/src/plugins/websocket.ts`       | WebSocket gateway                                   |
| `apps/server/src/lib/session.ts`             | Resolve Better Auth session from request            |
| `apps/server/src/lib/contact-session.ts`     | Validate widget contact sessions                    |
| `apps/server/src/lib/s3.ts`                  | S3 upload/download helpers                          |
| `apps/server/src/routers/private/*`          | Org-scoped dashboard APIs (ex-`api.private.*`)      |
| `apps/server/src/routers/public/*`           | Widget/public APIs (ex-`api.public.*`)              |
| `apps/server/src/routers/webhooks/*`         | Stripe                                              |
| `apps/server/src/inngest/*`                  | Background job functions                            |
| `apps/server/src/ai/*`                       | Mastra adapter + RAG helpers                        |
| `packages/mastra/`                           | Mastra agents/workflows (e-commerce + healthcare)   |
| `packages/auth/`                             | Better Auth config, org AC roles, teams             |
| `packages/db/prisma/schema/auth.prisma`      | Better Auth models                                  |
| `packages/db/prisma/schema/domain.prisma`    | Agents, conversations, messages, KB, bookings, etc. |
| `packages/db/scripts/migrate-from-convex.ts` | Full data migration                                 |
| `apps/dashboard/`                             | **Primary staff UI (React)** — replaces `apps/web/app/(dashboard)` |
| `apps/dashboard/src/lib/auth-client.ts`       | Better Auth React client                                      |
| `apps/web/app/(dashboard)/`                   | Legacy Next dashboard — migrate away, then delete             |
| `apps/server/src/routers/`                    | oRPC `appRouter` (clients import `server/router`)             |
| `apps/server/src/lib/ws-protocol.ts`          | WS protocol (clients import `server/ws`)                      |
| `apps/web/components/providers.tsx`          | Better Auth + oRPC + WS clients                     |
| `apps/web/middleware.ts`                     | Better Auth session / org gate                      |
| `apps/widget/components/providers.tsx`       | oRPC + WebSocket                                    |
| `packages/backend/`                          | Freeze feature work; remove only in Phase 9         |

---

## Domain Inventory (What Must Move)

### Auth & tenancy

| Convex / legacy auth today          | Target                                           |
| ----------------------------------- | ------------------------------------------------ |
| Legacy hosted users + orgs          | Better Auth `user` + `organization` + **teams**  |
| JWT template `convex` + `orgId`     | Session cookie + active organization             |
| `getOrgIdOrNull(ctx)`               | `requireOrgSession(request)`                     |
| `api.public.organizations.validate` | Public org lookup by id/slug in Postgres         |
| `users` table (`auth_subject`)      | Better Auth user; mapping table during migration |

### Core product tables (`packages/backend/convex/schema.ts`)

`subscriptions`, `widgetSettings`, `plugins`, `conversations`, `contactSessions`, `agents`, `websiteSources`, `websiteRuns`, `websitePages`, `answerTrainingExamples`, `agentBranding`, `bookingServices`, `bookingAvailability`, `bookings`, plus **`Message`** (explicit Postgres table; content today partly in Convex Agent component), plus S3 object metadata / `DocumentChunk` for RAG.

### Private API modules → Fastify routers

`dashboard`, `agents`, `files`, `widgetSettings`, `conversations`, `messages`, `contactSessions`, `bookings`, `subscription`, `secrets`, `plugins`, `onboarding`, `config`, `themeColor`, `answerTraining`, `vapi`.

### Public API modules → Fastify routers

`organizations`, `contactSessions`, `widgetSettings`, `conversations`, `messages`, `bookings`, `secrets` (Vapi for widget).

### System / AI / jobs

`system/ai/*`, `system/onboarding`, `system/websites`, `system/bookings`, `system/secrets`, Stripe HTTP webhooks → Fastify + Inngest.

### Frontend touch surface

- **web:** ~30 modules using Convex hooks
- **widget:** loading, auth, selection, chat, inbox, booking
- **embed:** URL + postMessage only (minimal change)

---

## Phase 0 — Foundations & Port/Env Hygiene

**Goal:** Local stack runs without colliding with `web:3000`; Prisma ready for Better Auth (+ teams).

### Task 0.1 — Align Docker, env, and server port

**Files:**

- Modify: `apps/server/src/index.ts`
- Modify: `apps/server/.env` / `.env.example`
- Modify: `docker-compose.yml` (DB name `agenci`, not `fastify-template`)
- Modify: `packages/env/src/server.ts` if new vars needed

- [X ] **Step 1:** Set Fastify listen port from `env.PORT` (default `3003`).
- [X ] **Step 2:** Fix `docker-compose.yml` `DATABASE_URL` DB name to `agenci`; ensure Postgres service matches.
- [ X] **Step 3:** Document local URLs: web `3000`, widget `3001`, embed `3002`, server `3003`, Postgres `5432`.
- [X ] **Step 4:** Verify: `bun --filter server dev` + `curl http://localhost:3003/` → `OK`.

**Done when:** Server starts on 3003; Postgres healthy; no port clash with web.

---

### Task 0.2 — Replace stub Prisma auth schema with Better Auth schema

**Files:**

- Modify: `packages/db/prisma/schema/auth.prisma`
- Modify: `packages/auth/src/index.ts` (keep `prismaAdapter`, teams enabled)
- Run: `bun --filter @agenci/db db:generate` + migrate

- [X ] **Step 1:** Generate Better Auth Prisma schema for **email/password + organization + teams**.
- [ X] **Step 2:** Remove the stub `User { password }` model that does not match Better Auth.
- [X ] **Step 3:** `prisma migrate dev --name better_auth_init`.
- [ X] **Step 4:** Smoke test sign-up + session via curl / Better Auth client.

**Done when:** Better Auth can create a user + session (+ org/team tables exist) against Postgres.

---

## Phase 1 — Auth Cutover (Web Dashboard Identity)

**Goal:** Staff sign in with Better Auth; org + teams membership works.

### Task 1.1 — Harden `@agenci/auth` for Agenci orgs + teams

**Files:**

- Modify: `packages/auth/src/index.ts`
- Modify: `packages/auth/src/permissions.ts`

- [x] **Step 1:** Define AC statements matching product needs (agents, KB, conversations, billing, members).
- [x] **Step 2:** Map roles `owner` / `admin` / `member` to those statements (replace demo `project:*`).
- [x] **Step 3:** Keep **teams** enabled; configure `trustedOrigins` for web + widget (+ preview URLs).
- [x] **Step 4:** Cookie policy: prod `secure` + appropriate `sameSite`; local HTTP override so localhost works.

**Done when:** Org create/invite/list + team create works via Better Auth APIs.

---

### Task 1.2 — Wire web app to Better Auth

**Files:**

- Modify: `apps/web/components/providers.tsx`
- Modify: `apps/web/middleware.ts`
- Modify: `apps/web/modules/auth/**`
- Modify: `apps/web/package.json`
- Env: `NEXT_PUBLIC_SERVER_URL` (e.g. `http://localhost:3003`)

- [x] **Step 1:** Add Better Auth client pointing at `${SERVER_URL}/api/auth`.
- [x] **Step 2:** Replace the legacy auth provider / org switcher with Better Auth organization (+ team) UI or thin Norwegian custom UI.
- [x] **Step 3:** Middleware: protect dashboard routes using Better Auth session cookie.
- [x] **Step 4:** Remove the legacy user sync into Convex; use server-side session user.
- [x] **Step 5:** Remove the legacy auth packages once shell works.

**Done when:** User can sign up, sign in, create org, open dashboard shell on Better Auth only.

---

### Task 1.3 — Session helper on Fastify

**Files:**

- Create: `apps/server/src/lib/session.ts`
- Modify: `apps/server/src/index.ts`

- [x] **Step 1:** `getSession(request)` via `auth.api.getSession({ headers })`.
- [x] **Step 2:** `requireSession` / `requireOrg` guards (401/403) returning `{ userId, organizationId, role }`.
- [x] **Step 3:** Integration test: authenticated vs anonymous request.

**Done when:** Any private route can call `requireOrg(request)` successfully.

---

### Task 1.4 — Solid dashboard auth + organizations (`apps/dashboard`)

**Goal:** Staff identity and org lifecycle live on Solid (`:3004`), not Next `(dashboard)`.

**Source to replace later:** `apps/web/app/(dashboard)/**` + `apps/web/modules/auth/**` / onboarding org flows.

**Files:**
- `apps/dashboard/src/lib/auth-client.ts`
- `apps/dashboard/src/routes/sign-in.tsx`, `sign-up.tsx`, `onboarding.tsx`
- `apps/dashboard/src/routes/app/**` (authed shell)
- `apps/dashboard/src/routes/accept-invitation.$invitationId.tsx`
- `packages/auth/src/index.ts` — `sendInvitationEmail` (dev log + invite URL)

- [x] **Step 1:** Sign-up / sign-in (email+password) with Norwegian UI; session via Vite `/api/auth` proxy.
- [x] **Step 2:** Route guards — anonymous → `/sign-in`; signed-in without org → `/onboarding`.
- [x] **Step 3:** Create organization + setActive; list/switch orgs in app shell.
- [x] **Step 4:** Invite member by email/role; show accept link in UI (email provider optional in dev).
- [x] **Step 5:** Accept invitation route; cancel pending invites for admins/owners.

**Done when:** User can register, create org, invite a teammate, accept invite, and land in `/app` without the Next dashboard.

---

## Phase 1.5 — Port Next `(dashboard)` features → Solid

Migrate feature areas from `apps/web/app/(dashboard)` + `apps/web/modules/*` into `apps/dashboard` **after** oRPC private APIs exist (Phase 2/5). Suggested order:

| Order | Web source (approx.) | Solid target |
|------:|----------------------|--------------|
| 1 | Auth / onboarding / org settings | Task 1.4 |
| 2 | Agents home + agent overview | `/app/agents` |
| 3 | Conversations inbox | `/app/conversations` |
| 4 | Files / knowledge | `/app/files` |
| 5 | Customization / widget settings | `/app/customization` |
| 6 | Bookings | `/app/bookings` |
| 7 | Integrations / Vapi plugins | `/app/integrations` |
| 8 | Billing / plan / profile / security | `/app/settings/*` |

- [ ] After each area: remove or redirect the matching `apps/web/app/(dashboard)/…` route.
- [ ] Final: delete `apps/web/app/(dashboard)` layout and unused modules; keep marketing routes on `apps/web`.

---

## Phase 2 — API Layer Skeleton (oRPC) + WebSocket

**Goal:** Stable RPC surface mirroring `api.private` / `api.public`, plus WS gateway for live updates.

### Task 2.1 — Mount oRPC on Fastify

**Files:**

- Create: `apps/server/src/routers/` (`appRouter` + context)
- Create: `apps/server/src/plugins/orpc.ts`
- Create: `apps/server/src/lib/ws-protocol.ts` (WS types; also used by clients via `server/ws`)
- Modify: `apps/server/src/index.ts`

- [x] **Step 1:** Define root router `{ private: {}, public: {} }`.
- [x] **Step 2:** Expose HTTP handler at `/rpc` (or `/api/rpc`).
- [x] **Step 3:** CORS credentials for web/widget origins.
- [x] **Step 4:** Smoke procedure `public.health` → `{ ok: true }`.

**Done when:** Web can call `public.health` via oRPC client.

---

### Task 2.2 — Frontend API clients

**Files:**

- Create: `apps/web/lib/api.ts`
- Create: `apps/widget/lib/api.ts`
- Create: `apps/dashboard/src/lib/api.ts` _(Solid primary staff UI)_

- [x] **Step 1:** Typed oRPC clients from shared contract (`server/router`).
- [x] **Step 2:** Widget client sends `X-Contact-Session-Id` (or cookie) on public calls.
- [x] **Step 3:** Web / dashboard clients rely on Better Auth cookies (same-origin `/rpc` proxy).

**Done when:** Both apps can hit `public.health`.

---

### Task 2.3 — WebSocket gateway skeleton

**Files:**

- Create: `apps/server/src/plugins/websocket.ts`
- Create: `apps/server/src/lib/ws-tickets.ts`
- Create: `apps/web/lib/ws.ts`
- Create: `apps/widget/lib/ws.ts`
- Create: `apps/dashboard/src/lib/ws.ts`
- Shared protocol: `apps/server/src/lib/ws-protocol.ts` (`server/ws`)

- [x] **Step 1:** Mount WS at `/ws` (Fastify WebSocket plugin).
- [x] **Step 2:** On connect: authenticate via Better Auth session **or** contact-session token (ticket or cookie).
- [x] **Step 3:** Subscribe protocol for channels: `conversation:{id}`, `org:{id}:inbox`.
- [x] **Step 4:** Heartbeat + reconnect; document client event shapes (`message.created`, `conversation.updated`, etc.).
- [x] **Step 5:** Smoke: client connects, subscribes, receives ping/pong.

**Done when:** Web and widget can open a persistent WS connection with authz on subscribe.

---

## Phase 3 — Domain Schema + Full Convex Data Migration

**Goal:** Port all Convex tables to Postgres; migrate every org’s data; files land in S3.

### Task 3.1 — Prisma domain models

**Files:**

- Create: `packages/db/prisma/schema/domain.prisma`
- Migrate (include `CREATE EXTENSION vector`)

Port tables (Convex `Id<"…">` → UUID/`cuid`; `organizationId` → Better Auth organization id):

- [ ] `Agent`, `WidgetSettings`, `ContactSession`, `Conversation`
- [ ] **`Message`** (`conversationId`, `role`, `content`, `createdAt`, optional `toolCalls` JSON)
- [ ] `Subscription`, `Plugin`, `AgentBranding`
- [ ] `WebsiteSource`, `WebsiteRun`, `WebsitePage`
- [ ] `AnswerTrainingExample`
- [ ] `BookingService`, `BookingAvailability`, `Booking`
- [ ] `StoredObject` (S3 bucket/key/contentType/size/org/agent refs)
- [ ] `DocumentChunk` (pgvector embedding + namespace `${organizationId}:${agentId}`)
- [ ] Indexes mirroring Convex (`by_organization_id`, status composites, etc.)

**Done when:** `prisma migrate dev` applies cleanly; Studio shows all tables.

---

### Task 3.2 — Legacy identity → Better Auth mapping

**Files:**

- Create: mapping table / script under `packages/db/scripts/`
- Create: `packages/db/scripts/migrate-identities.ts`

- [ ] **Step 1:** Export legacy users/orgs/memberships (or derive from Convex `organizationId` + `users.auth_subject`).
- [ ] **Step 2:** Create Better Auth users/orgs/members/teams; write legacy user/org id → new id map.
- [ ] **Step 3:** Verify every production org has a Better Auth org id.

**Done when:** Identity map is complete and verified on staging.

---

### Task 3.3 — Full Convex → Postgres + S3 migration

**Files:**

- Create: `packages/db/scripts/migrate-from-convex.ts`
- Create: runbook notes in this file or `docs/MIGRATION_RUNBOOK.md` _(only if needed during execution)_

- [ ] **Step 1:** Export all Convex tables (scripted collect / dashboard export).
- [ ] **Step 2:** Remap all FKs through identity map from Task 3.2.
- [ ] **Step 3:** Import agents, settings, contact sessions, conversations, **messages** (from Agent threads → `Message` rows), bookings, websites, training examples, subscriptions, plugins.
- [ ] **Step 4:** Upload existing file blobs to **AWS S3**; write `StoredObject` rows with keys.
- [ ] **Step 5:** Re-embed or migrate RAG chunks into `DocumentChunk` (pgvector).
- [ ] **Step 6:** Dry-run on staging; checksum row counts per table per org; spot-check conversations.
- [ ] **Step 7:** Production runbook + rollback plan signed off.

**Done when:** Staging has parity for **all** orgs; prod migration runbook is ready.

---

## Phase 4 — Widget Public API Cutover

**Goal:** Widget runs entirely on Fastify public routers + WebSocket; embed unchanged.

### Task 4.1 — Contact sessions + org validate

**Files:**

- Create: `apps/server/src/routers/public/organizations.ts`
- Create: `apps/server/src/routers/public/contactSessions.ts`
- Create: `apps/server/src/lib/contact-session.ts`
- Modify: widget loading + auth screens

Parity with `api.public.organizations.validate` and `api.public.contactSessions.*`:

- [ ] **Step 1:** Implement create (24h TTL), validate, updateIdentity, deleteMySession.
- [ ] **Step 2:** Store metadata JSON (UA, timezone, etc.) as today.
- [ ] **Step 3:** Widget: replace Convex hooks with oRPC; keep or document localStorage key scheme.
- [ ] **Step 4:** Manual test: load widget with `organizationId`, create session, refresh, still valid.

**Done when:** Widget loading + auth screens work without Convex.

---

### Task 4.2 — Widget settings + conversations + messages + WS

**Files:**

- Create: `apps/server/src/routers/public/widgetSettings.ts`
- Create: `apps/server/src/routers/public/conversations.ts`
- Create: `apps/server/src/routers/public/messages.ts`
- Modify: widget chat/inbox/selection screens + WS client

- [ ] **Step 1:** `getByOrganizationId` (+ agent scoping).
- [ ] **Step 2:** `resumeOrCreate` / `create` / `getOne` / `getMany` conversations.
- [ ] **Step 3:** `getMany` messages; `create` user message → persist `Message` → **broadcast on WebSocket** → enqueue AI job.
- [ ] **Step 4:** Widget chat uses WS for live `message.created` / `conversation.updated` (no Convex reactivity).
- [ ] **Step 5:** Interim AI: Norwegian placeholder reply until Phase 6.

**Done when:** Visitor can open chat, send a message, see a live reply over WebSocket without Convex.

---

### Task 4.3 — Public bookings + Vapi secrets

**Files:**

- Create: `apps/server/src/routers/public/bookings.ts`
- Create: `apps/server/src/routers/public/secrets.ts`
- Modify: widget booking + voice screens

- [ ] Port slot listing + booking create.
- [ ] Port Vapi secret fetch for widget (AWS Secrets Manager patterns from `system/secrets`).

**Done when:** Booking flow + voice config fetch work on Fastify.

---

## Phase 5 — Dashboard Private API Cutover

**Goal:** Web dashboard reads/writes Postgres via `private.*`; Convex unused for product data.

### Task 5.1 — Agents, widget settings, dashboard overview

**Files:**

- `apps/server/src/routers/private/{agents,widgetSettings,dashboard,config,themeColor}.ts`
- Web modules: dashboard, customization

- [ ] CRUD agents (slug uniqueness per org).
- [ ] Widget settings upsert + appearance.
- [ ] Overview metrics (counts by conversation status).

**Done when:** Agents home + customization work on Fastify.

---

### Task 5.2 — Conversations inbox (staff) + WS

**Files:**

- `apps/server/src/routers/private/{conversations,messages,contactSessions,answerTraining}.ts`
- Web conversation views + review sheet + WS client

- [ ] List/filter by status + agent.
- [ ] Message timeline + staff reply (persist `Message`, broadcast WS).
- [ ] Escalate / resolve status transitions (WS `conversation.updated`).
- [ ] Answer-training examples CRUD.
- [ ] Dashboard subscribes to `org:{id}:inbox` and `conversation:{id}`.

**Done when:** Inbox parity with current dashboard UX over WebSocket.

---

### Task 5.3 — Knowledge base: files (S3) + websites

**Files:**

- `apps/server/src/routers/private/files.ts`
- `apps/server/src/lib/s3.ts`
- Website source CRUD routers
- Env: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`

- [ ] Upload document → **S3** + `StoredObject` row + enqueue ingest job.
- [ ] Website source create/list/delete; show run status.
- [ ] Move Firecrawl calls from Convex actions to Inngest functions on server.
- [ ] Presigned upload/download URLs as needed.

**Done when:** Operator can add URL/file to S3-backed storage and see job status in Postgres.

---

### Task 5.4 — Bookings admin, plugins, secrets, onboarding

**Files:**

- Private routers: `bookings`, `plugins`, `secrets`, `onboarding`, `vapi`
- Web modules: bookings, plugins, onboarding

- [ ] Port booking services/availability admin.
- [ ] Port Vapi plugin secret save (AWS SM).
- [ ] Port onboarding workflow triggers to Inngest (scrape → embed → branding).

**Done when:** Onboarding + bookings settings + Vapi settings work without Convex.

---

### Task 5.5 — Billing / Stripe

**Files:**

- `apps/server/src/routers/private/subscription.ts`
- `apps/server/src/routers/webhooks/stripe.ts`
- Web billing views

> **Requires explicit approval before production cutover.**

- [ ] Customer portal / checkout session creation on Fastify.
- [ ] Webhook signature verify → update `Subscription` row.
- [ ] Trial banner + pro plan gates read from Postgres.

**Done when:** Stripe test-mode webhook updates subscription status end-to-end.

---

## Phase 6 — AI Agent (Mastra), RAG, Background Jobs

**Goal:** Replace `@convex-dev/agent`, `@convex-dev/rag`, `@convex-dev/workflow` with **Mastra** (library) + Inngest + pgvector.

**Deployment (locked):** Mastra lives in `@agenci/mastra` and is invoked **programmatically** from Fastify/Inngest. Do **not** expose Mastra HTTP / Studio on the public widget origin. Split to a separate process later only for scale or healthcare PHI isolation.

```
Widget/Dashboard → Fastify (auth, oRPC, WS, Prisma)
                      ↓
                 Inngest message.respond
                      ↓
                 @agenci/mastra (agents + workflows)
```

### Task 6.1 — Inngest on `apps/server`

**Files:**

- Create: `apps/server/src/inngest/client.ts`
- Create: `apps/server/src/inngest/functions/message-respond.ts`
- Mount: `/api/inngest` via `apps/server/src/plugins/inngest.ts`
- Local: `INNGEST_DEV=1` on `bun --filter server dev`

- [x] **Step 1:** Inngest client + `message/respond` event + serve endpoint.
- [x] **Step 2:** `message.respond` calls `generateSupportReply` from `@agenci/mastra` (stub: log reply; persist/WS later).
- [ ] Functions still TODO: `website.crawl`, `kb.ingest`, `onboarding.run`, `booking.email`.
- [ ] Idempotency keys per conversation/message (messageId on respond — done).
- [ ] After assistant message persist → WebSocket broadcast.

**Done when:** Sending a widget message enqueues `message.respond` and persists assistant `Message`.

---

### Task 6.2 — Mastra customer-facing support agents

**Files:**

- Package: `packages/mastra` (`@agenci/mastra`)
- Agents: `ecommerceSupportAgent`, `healthcareSupportAgent` (+ `smokeAgent`)
- Tools: `searchKnowledgeBase` (stub → pgvector), `escalateToHuman`, `resolveConversation`, `checkHealthcareRedFlags`
- Workflow: `healthcareSupportWorkflow` (triage → answer/escalate + disclaimer)
- Server adapter: `apps/server/src/ai/mastra.ts`
- Prisma: `Agent.vertical` (`GENERAL` | `ECOMMERCE` | `HEALTHCARE`)

- [x] **Step 1:** Scaffold `@agenci/mastra` as library (not a separate production HTTP service).
- [x] **Step 2:** E-commerce + healthcare Norwegian prompts + shared tools.
- [x] **Step 3:** Healthcare workflow with red-flag triage + disclaimer.
- [x] **Step 4:** `AgentVertical` on Prisma `Agent` model.
- [ ] Wire tool outcomes to conversation status / bookings when Message schema lands.
- [ ] Namespace KB by `${organizationId}:${agentId}` in real search (stub returns namespace today).

**Done when:** Real GPT replies with RAG behavior comparable to Convex agent (needs 6.3 + Message persist).

---

### Task 6.3 — pgvector RAG (+ S3 sources)

**Files:**

- Prisma: `DocumentChunk`
- Create: `apps/server/src/ai/rag.ts` (implement `searchKnowledgeBase` execute)

- [ ] Enable `pgvector` extension migration (if not in 3.1).
- [ ] Embed on ingest (OpenAI embeddings) from S3 objects + crawled pages.
- [ ] Similarity search scoped by org/agent namespace.
- [ ] Deduplicate by source URL / content hash (preserve current dedupe intent).
- [ ] Replace Mastra `searchKnowledgeBase` stub with real search.

**Done when:** Search tool returns relevant chunks for a crawled test site.

---

## Phase 7 — Realtime, Webhooks, Ops Hardening

### Task 7.1 — WebSocket production hardening

- [ ] Authz: only contact-session owner or org member can subscribe to a channel.
- [ ] Heartbeats + client reconnect with backoff.
- [ ] Multi-instance plan: start single-node; add Redis pub/sub when scaling out.
- [ ] Load-test widget + dashboard under reconnect.

**Done when:** Widget + dashboard stay correct across reconnects.

---

### Task 7.2 — HTTP webhooks

- [ ] Stripe on Fastify (Task 5.5).
- [x] Remove the legacy auth webhook (`packages/backend/convex/http.ts`).
- [ ] Booking cancel-by-token public page on web → Fastify public procedure.

**Done when:** No runtime dependency on Convex `http.ts`.

---

### Task 7.3 — Observability

- [ ] Structured Fastify logs.
- [ ] Sentry on server (web already has `@sentry/nextjs`).
- [ ] Health: `/` liveness + `/ready` (DB ping; optional S3 head).

**Done when:** Health checks green in Docker Compose.

---

## Phase 8 — De-Convex Frontends

### Task 8.1 — Remove Convex from widget

- [ ] Delete `ConvexProvider`; remove `@agenci/backend` / `convex` deps when unused.
- [ ] Env: `NEXT_PUBLIC_SERVER_URL` + WS URL only (drop `NEXT_PUBLIC_CONVEX_URL`).

**Done when:** Widget builds and runs with zero Convex imports.

---

### Task 8.2 — Remove Convex from web

- [x] Remove the legacy auth provider, middleware and packages.
- [ ] Remove `NEXT_PUBLIC_CONVEX_URL` (legacy auth env vars already removed).
- [ ] Update Integrations docs only if server/widget URLs changed (embed script behavior unchanged).

**Done when:** Web builds and runs with Better Auth + oRPC + WS only.

---

### Task 8.3 — Embed verification

- [ ] Confirm `VITE_WIDGET_URL` still correct.
- [ ] postMessage protocol unchanged (`close` / `resize` / `bubble-config`).
- [ ] Production snippet in `apps/web/modules/integrations/constants.ts` still valid.

**Done when:** Embed demo E2E works on the new stack.

---

## Phase 9 — Decommission `@agenci/backend`

**Only after** production traffic is on Fastify for ≥1 stable release **and** full data migration is verified.

- [ ] Stop `convex dev` / deploy; archive `packages/backend`.
- [ ] Remove root scripts `dev:backend`, verify scripts that call Convex.
- [ ] Remove Convex catalog dependency if unused.
- [x] Archive Convex auth docs.
- [ ] Final env scrub: `CONVEX_*` from all apps and secret stores.

**Done when:** Repo has no Convex runtime dependency.

---

## Suggested Implementation Order

| Order | Phase | Deliverable                                                  |
| ----: | ----- | ------------------------------------------------------------ |
|     1 | 0     | Server port 3003 + Better Auth Prisma schema (+ teams)       |
|     2 | 1     | Better Auth on Fastify + web transitional shell              |
|     3 | 1.4   | **Solid dashboard auth + org create/invite** (`:3004`)       |
|     4 | 2     | oRPC skeleton + WebSocket gateway                            |
|     5 | 3     | Domain Prisma models + **full** Convex→Postgres/S3 migration |
|     6 | 4     | Widget on Fastify (public API + WS)                          |
|     7 | 5     | Dashboard private APIs (+ S3 uploads + Stripe w/ approval)   |
|     8 | 1.5   | Port `web/(dashboard)` features → Solid as APIs land         |
|     9 | 6     | **Mastra** (`@agenci/mastra`) + Inngest + pgvector RAG       |
|    10 | 7     | WS/webhooks/ops hardening                                    |
|    11 | 8     | Remove Convex; strip Next `(dashboard)`                      |
|    12 | 9     | Archive `@agenci/backend`                                    |

---

## Testing Strategy

| Layer             | What                                                                              |
| ----------------- | --------------------------------------------------------------------------------- |
| **Auth**          | Sign-up, sign-in, org create, team create, role-gated private route 403           |
| **Migration**     | Row counts + spot-check conversations/messages/files per org; S3 object existence |
| **Widget E2E**    | Embed demo → session → chat message → assistant row over **WebSocket**            |
| **Dashboard E2E** | Create agent → customize → see conversation over **WebSocket**                    |
| **S3**            | Upload → object in bucket → `StoredObject` row → ingest job                       |
| **KB**            | Crawl URL → chunk rows → search returns hit                                       |
| **Bookings**      | Public book + admin list + cancel token                                           |
| **Billing**       | Stripe test webhook → plan gate unlocks                                           |
| **Regression**    | Embed postMessage resize/close/bubble-config                                      |

Local commands (adjust as scripts are added):

```bash
docker compose up -d postgres
bun --filter @agenci/db db:migrate
bun --filter server dev          # :3003
bun --filter web dev             # :3000
bun --filter widget dev          # :3001
bun --filter embed dev:embed     # :3002
```

---

## Risks & Mitigations

| Risk                               | Mitigation                                                         |
| ---------------------------------- | ------------------------------------------------------------------ |
| Loss of Convex reactivity          | WebSocket channels + reconnect; short poll fallback only if needed |
| Better Auth cookies on localhost   | Dev-specific cookie attributes; HTTPS preview                      |
| Message history in Agent component | Explicit `Message` table + thread export in Task 3.3               |
| Org ID remap legacy → Better Auth  | Mapping table (Task 3.2) before domain import                      |
| S3 credentials / bucket policy     | Dedicated bucket; least-privilege IAM; env in `@agenci/env`        |
| RAG quality regression             | Golden-question eval set before cutover                            |
| Stripe/webhook dual-running        | Single webhook endpoint cutover window                             |
| Port 3000 clash                    | Server uses 3003 (Task 0.1)                                        |
| Full migration complexity          | Staging dry-run + checksums before prod                            |
| Multi-node WS                      | Single-node first; Redis pub/sub when scaling                      |

---

## Out of Scope (Unless Requested)

- Rewriting embed architecture (keep IIFE + iframe).
- Redesigning dashboard UI.
- Multi-region deploy.
- Changing Norwegian product copy.
- Unrelated packages beyond wiring (`packages/math`, etc.).

---

## Execution Handoff

Plan saved to `docs/task.md`.

**Start at Phase 0 (Task 0.1)** unless otherwise directed.

**Two execution options:**

1. **Subagent-Driven (recommended)** — Fresh subagent per task, review between tasks.
2. **Inline Execution** — Execute tasks in this session with checkpoints.
