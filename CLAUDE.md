# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Project Overview

Agenci is a Norwegian-language (Bokmål) AI customer support platform. Organizations create an AI agent, feed it knowledge (website crawl, file uploads), and embed a chat widget on their site. Visitors chat with the agent; staff follow and take over conversations from a dashboard inbox.

The repo is mid-migration from Convex (`packages/backend`, legacy) to a Hono server (`apps/server`). New work goes in `apps/server` + `apps/dashboard`, not Convex or the old Next dashboard.

---

# Commands

Bun workspaces + Turborepo. Package manager is `bun` (never npm/yarn/pnpm).

```bash
bun install
bun run infra:up              # docker: postgres (host port 5434), inngest (8288), minio (9000/9001)

bun run dev:server            # apps/server  → http://localhost:3003 (bun --hot)
bun run dev:dashboard         # apps/dashboard → :3004 (Vite)
bun run dev:widget            # apps/widget  → :3001 (Vite)
bun run dev:web               # apps/web     → :3000 (Next.js, marketing)

bun run verify                # typecheck web, widget, dashboard, server — run before finishing a change
bun --filter server check-types      # single app (server uses `tsc -b`)
bun --filter dashboard check-types   # or: cd apps/<app> && bunx tsc --noEmit -p .

bun --filter dashboard check  # Biome (dashboard, widget); apps/web + packages/ui use ESLint
bun --filter dashboard generate-routes   # TanStack Router route tree
bun --filter @agenci/db db:generate      # Prisma client
```

There is no test suite. Verification = `bun run verify` plus exercising the flow against the running server (oRPC over HTTP at `/rpc/*`).

Widget test URL: `http://localhost:3001/?organizationId=<org-id>`. Inngest dev UI: `http://localhost:8288`.

---

# Architecture

## Apps and packages

| Path | What |
|------|------|
| `apps/server` | Hono API: Better Auth (`/api/auth/*`), oRPC (`/rpc/*`), Inngest (`/api/inngest`), WebSocket (`/ws`), Mastra agents |
| `apps/dashboard` | Staff dashboard — React 19, Vite, TanStack Router + Query, oRPC client |
| `apps/widget` | Customer chat widget — React, Vite |
| `apps/embed` | Script loader that injects the widget on customer sites |
| `apps/web` | Next.js marketing site; `app/(dashboard)` is the old dashboard still on Convex (being replaced) |
| `packages/db` | Prisma (`@agenci/db`), multi-file schema in `prisma/schema/*.prisma` |
| `packages/auth` | Better Auth config (`@agenci/auth`), incl. trusted origins |
| `packages/env` | Typed env (`@agenci/env/server`) |
| `packages/ui` | Shared shadcn/ui (`@workspace/ui/components/...`) |
| `packages/mastra` | `@agenci/mastra` library; the live customer agent is in `apps/server/src/mastra` |
| `packages/backend` | Legacy Convex — do not extend |

## Server layout (`apps/server/src`)

- `routers/router.ts` — root oRPC router split into `public` (widget, anonymous contact session via `X-Contact-Session-Id` header) and `private` (`privateProcedure`: Better Auth session + active organization; context has `userId`, `organizationId`, `role`).
- `modules/<domain>/` — `router.ts` + `schema.ts` (zod) + `service.ts` per domain: agents, documents, knowledge, ingest, widget, chat, conversations.
- `inngest/functions/` — background jobs (e.g. `process-agent-onboarding.ts`: crawl → chunk → embed a website).
- `mastra/` — `customer-service-agent.ts`, tools (`knowledge-search-tool.ts`, `conversation-tools.ts`), system prompt in `constants.ts`, pgvector store in `vector.ts`/`store.ts`. Agents are registered per DB agent (`register-customer-agent.ts`) and re-hydrated on boot.
- `index.ts` — wires Hono, CORS (trusted origins), WS tickets (`/api/ws/ticket`, cookie or contact-session), and the dev site-preview proxy.

## Data flow

1. Staff signs up (Better Auth + organization) in the dashboard and creates an agent with a URL and/or files.
2. Inngest job / document upload task ingests content into pgvector (the `embeddings` table is owned by `@mastra/pg` and is `@@ignore`d in Prisma). Chunks are tagged with `agentId` metadata; search filters by `agentId`.
3. Agent status becomes ready (`modules/agents/status.ts`) and the Mastra agent is registered.
4. Widget loads settings via `public` routes, creates a contact session, and sends messages (`public/chat/send`). The server runs the Mastra agent; memory thread = conversation id, resourceId = `${organizationId}:contact:${contactSessionId}`.
5. The agent answers via `searchTool` (RAG) and can escalate. When a conversation is `escalated` the AI stays silent and the team replies from the dashboard inbox. Messages carry an `author` (visitor / agent / team).
6. The `conversations` table is the inbox index (status, message count, last message); message bodies live in Mastra threads.

---

# Rules

## Database
- Never run `prisma db push` or `migrate dev` against the shared DB (the old `docs/LOCAL_TESTING.md` still mentions `db:push`; ignore it). Schema changes = hand-written SQL in `packages/db/prisma/manual-migrations/`, then update the `.prisma` files and `db:generate`.
- Ask before changing database schemas, auth logic, or billing logic.

## AI agent
- System prompts and all agent-facing text are Norwegian.
- Reuse the existing search/conversation tools; keep the tool key `searchTool` (the prompt refers to it).
- Preserve escalation behavior: no AI replies while a human has the conversation.

## Code
- UI text in Norwegian (Bokmål) unless told otherwise.
- Follow the module pattern (`router` / `schema` / `service`) and existing oRPC + TanStack Query patterns in `apps/dashboard/src/features/<feature>/{queries,ui}`.
- No new dependencies unless necessary; no large refactors without approval.
- Dashboard redesigns are visual only: keep flow, structure and content.

## Token economy
The repo is large. Start from the file the user names, read only direct imports/neighbors, and avoid repo-wide scans or recursive exploration unless explicitly asked. Don't read `packages/backend` (Convex) unless the task is about it.
