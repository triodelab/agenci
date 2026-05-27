# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

Agenci is a Norwegian-language AI customer support platform. Organizations embed a chat widget on their website; the widget connects to an AI support agent backed by a RAG knowledge base. The product includes a dashboard for managing agents, knowledge sources (web crawling + file uploads), conversations, and billing.

## Monorepo Structure

pnpm + Turborepo workspace with:
- `apps/web` — Next.js 15 dashboard (port 3000), authenticated via Clerk
- `apps/widget` — Next.js 15 embeddable chat widget (port 3001), uses anonymous contact sessions
- `apps/embed` — Vite-built JS snippet that injects the widget iframe into third-party sites (port 3002)
- `packages/backend` — Convex backend (all server logic, DB, AI)
- `packages/ui` — shared shadcn/ui component library
- `packages/math` — shared utilities

## Development Commands

```bash
# Start everything
pnpm dev

# Start individual services
pnpm dev:web        # Next.js dashboard only
pnpm dev:widget     # Widget app only
pnpm dev:backend    # Convex backend only (runs `convex dev`)

# First-time Convex setup
pnpm dev:setup      # convex dev --configure --until-success

# Type check all apps
pnpm exec tsc --noEmit -p apps/web
pnpm exec tsc --noEmit -p apps/widget

# Lint
pnpm lint

# Format
pnpm format

# Test backend AI connectivity
pnpm -F @agenci/backend test:openai-mini
pnpm -F @agenci/backend test:openai-mini:convex

# Full verification (typecheck + backend ping)
pnpm verify
```

## Backend Architecture (`packages/backend/convex/`)

The Convex backend is organized into:
- `schema.ts` — all table definitions
- `convex.config.ts` — registers three Convex components: `@convex-dev/agent`, `@convex-dev/rag`, `@convex-dev/workflow`
- `http.ts` — HTTP routes for Clerk webhook (user sync) and Stripe webhook (billing)
- `crons.ts` — scheduled jobs: hourly website sync scheduler, daily session purge
- `system/` — internal mutations/queries/actions (not exposed to clients directly)
- `private/` — Convex functions callable only from authenticated dashboard users
- `public/` — Convex functions callable from the widget (unauthenticated contact sessions)
- `lib/` — shared utilities: `auth.ts`, `secrets.ts` (AWS Secrets Manager), `workflow.ts`, `knowledgeIngestion.ts`, `firecrawl.ts`, `webpageCrawler.ts`

### Auth pattern
`getOrgIdOrNull(ctx)` in `lib/auth.ts` reads `orgId` from the Clerk JWT custom claims. All dashboard functions gate on this. The widget uses anonymous contact sessions (no Clerk auth).

### RAG / Knowledge Base
- `@convex-dev/rag` component with OpenAI `text-embedding-3-small` (1536 dims)
- Namespace pattern: `${orgId}:${agentId}` for agent-specific knowledge, or just `orgId` for org-wide
- Entry ingestion via `lib/knowledgeIngestion.ts` → `upsertWebpageEntry()` handles HTML→plaintext, dedup via content hash
- Website crawling uses `@convex-dev/workflow` to orchestrate multi-step Firecrawl scraping via `system/websites.ts`

### AI Agent
- `system/ai/agents/supportAgent.ts` — `@convex-dev/agent` wrapping `gpt-4o-mini`
- System prompt is Norwegian; agent searches knowledge base via `searchTool`, can escalate or resolve conversations
- Playground exposed via `playground.ts` using `@convex-dev/agent-playground`

### Secrets
API keys (OpenAI, Firecrawl, Vapi, etc.) are stored in AWS Secrets Manager via `lib/secrets.ts`. Convex env vars hold AWS credentials.

### Subscriptions & Billing
Stripe webhooks update the `subscriptions` table. Plans: `starter`, `pro`, `business`. `lib/subscriptionAccess.ts` gates features.

## Key Dependencies

- `@convex-dev/workpool` must be a **direct dependency** at `^0.3.0+` — both `@convex-dev/workflow@0.4.2` and `@convex-dev/rag@0.3.3` require it as a peer dep
- Convex catalog version is defined in `pnpm-workspace.yaml` and must stay in sync across all packages
- `zod` v4 (catalog) — note API differences from v3 if referencing docs

## Norwegian Language Note

UI text, AI prompts, error messages, and comments throughout the codebase are in Norwegian (bokmål). Keep this consistent when modifying existing strings.
