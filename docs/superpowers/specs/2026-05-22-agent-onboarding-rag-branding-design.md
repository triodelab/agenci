# Agent Onboarding: RAG Ingestion & Branding Design

**Date:** 2026-05-22  
**Branch:** feature/rag-firecrawl  
**Scope:** Complete the `supportAgentOnboarding` workflow — scrape a URL with Firecrawl, ingest the markdown into the RAG knowledge base, extract branding and store it as the agent's default widget appearance.

---

## Context

When a user creates an agent and provides a website URL, the `supportAgentOnboarding` workflow fires as a background job. It must:

1. Scrape the URL via Firecrawl to get markdown content and brand data.
2. Ingest the markdown into the Convex RAG component under the agent's namespace.
3. Persist raw branding in a new `agentBranding` table.
4. Apply the branding colors as the agent's default `widgetSettings.appearance` — overwriting any prior defaults, but only when a URL is explicitly provided.

---

## Known Bug to Fix

`scrapeWebsiteUrlFn` calls `getOrgIdOrNull(ctx)` inside an `internalAction`. Internal actions run server-side with no Clerk JWT, so this always returns null and throws. The fix: remove that call entirely — `orgId` is not needed at scrape time and will be passed as args to downstream steps.

---

## Architecture

### Workflow: `supportAgentOnboarding`

Location: `lib/workflow.ts`

Updated args:
```ts
args: {
  agentId: v.id("agents"),
  orgId: v.string(),   // added — known at call site (authenticated mutation)
  url: v.string(),
}
```

Three sequential steps:

```
Step 1: scrapeWebsiteUrlFn({ url })
  → { markdown, branding }

Step 2: ingestMarkdownFn({ orgId, agentId, url, markdown })
  → { entryId }

Step 3: saveBrandingMutation({ orgId, agentId, url, branding })
  → void
```

Steps are sequential — branding save depends on scrape output; markdown ingestion also depends on scrape output. Steps 2 and 3 are independent of each other but both depend on step 1, so they could run in parallel. For simplicity and debuggability, run them sequentially (step 2 then step 3).

---

## Schema Changes

### New table: `agentBranding`

Added to `schema.ts`:

```ts
agentBranding: defineTable({
  organizationId: v.string(),
  agentId: v.id("agents"),
  sourceUrl: v.string(),
  primaryColor: v.optional(v.string()),
  secondaryColor: v.optional(v.string()),
  backgroundColor: v.optional(v.string()),
  textColor: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  faviconUrl: v.optional(v.string()),
  companyName: v.optional(v.string()),
  extractedAt: v.number(),
})
  .index("by_agent_id", ["agentId"])
  .index("by_organization_id", ["organizationId"])
```

No changes to existing tables. Widget appearance defaults come from this table, applied to `widgetSettings.appearance` on write.

---

## Components

### 1. `lib/firecrawl.ts` — scrape action (fix + new action)

**Fix `scrapeWebsiteUrlFn`:**
- Remove `getOrgIdOrNull(ctx)` and the auth guard entirely.
- Return `{ markdown, branding }` only (drop `changeTracking` — out of scope).

**New `ingestMarkdownFn` (internalAction):**
- Args: `{ orgId: string, agentId: Id<"agents">, url: string, markdown: string }`
- Calls `rag.add` directly (bypasses the HTML→plaintext pipeline in `knowledgeIngestion.ts`).
- Namespace: `agentNamespace(orgId, agentId)` from `lib/knowledgeIngestion.ts`.
- Key: `url` (for dedup on re-run).
- ContentHash: computed from UTF-8 bytes of markdown via `contentHashFromArrayBuffer`.
- Title: derived from URL hostname+path (no HTML title available).
- Metadata: `{ uploadedBy: orgId, filename: title, category: null, sourceType: "webpage", sourceUrl: url, agentId }`.

### 2. `system/onboarding.ts` — branding mutation (new file)

**`saveBrandingMutation` (internalMutation):**
- Args: `{ orgId, agentId, url, branding }` — where `branding` is the raw Firecrawl branding object (all fields optional strings).
- Upserts `agentBranding` by `agentId` (patch if exists, insert otherwise).
- Maps branding → `widgetSettings.appearance` and patches (or inserts) the agent's widget settings row.

**Color mapping:**

| Firecrawl field    | widgetSettings.appearance field(s)                          |
|--------------------|-------------------------------------------------------------|
| `primaryColor`     | `headerColor`, `bubbleUserColor`, `bubbleButtonColor`       |
| `backgroundColor`  | `backgroundColor`, `bubbleAssistantColor`                   |
| `textColor`        | `headerTextColor`, `bubbleUserTextColor`, `inputTextColor`  |

Fields are only set when the Firecrawl value is non-null/non-empty. Unmapped branding fields (`logoUrl`, `faviconUrl`, `companyName`) are stored in `agentBranding` for future use (e.g., widget logo display).

### 3. `lib/workflow.ts` — workflow update

- Add `orgId: v.string()` to `supportAgentOnboarding` args.
- Destructure and pass `orgId` to step 2 and step 3.
- Step 1 returns `{ markdown, branding }`.
- Step 2: `step.runAction(internal.lib.firecrawl.ingestMarkdownFn, { orgId, agentId, url, markdown })`.
- Step 3: `step.runMutation(internal.system.onboarding.saveBrandingMutation, { orgId, agentId, url, branding })`.

---

## Data Flow

```
[Authenticated mutation] 
  → workflow.start(supportAgentOnboarding, { agentId, orgId, url })
      → step 1: Firecrawl scrape(url) → { markdown, branding }
      → step 2: rag.add(markdown) under namespace `${orgId}:${agentId}`
      → step 3: DB upsert agentBranding + patch widgetSettings.appearance
```

---

## Error Handling

- If Firecrawl scrape fails: workflow retries per `defaultRetryBehavior` (3 attempts, 60s backoff).
- If markdown is empty/too short: `ingestMarkdownFn` throws a `ConvexError` with a Norwegian message consistent with `knowledgeIngestion.ts`.
- If branding is null/empty: `saveBrandingMutation` skips the `agentBranding` insert and `widgetSettings` patch — no error.
- Steps 2 and 3 are idempotent: `rag.add` uses `contentHash` for dedup; `agentBranding` upsert patches by `agentId`.

---

## Out of Scope

- `changeTracking` from Firecrawl — not used in this phase.
- Multi-page crawling during onboarding — the workflow scrapes only the root URL as a single page.
- Triggering the workflow from `private/agents.ts` — that call-site wiring is handled separately.
- UI changes.
