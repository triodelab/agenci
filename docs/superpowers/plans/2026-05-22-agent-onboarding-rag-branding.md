# Agent Onboarding: RAG Ingestion & Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the `supportAgentOnboarding` workflow so it scrapes a URL with Firecrawl, ingests the markdown into the Convex RAG knowledge base, and saves branding colors as the agent's default `widgetSettings.appearance`.

**Architecture:** Three sequential workflow steps — scrape (Firecrawl), markdown RAG ingestion (`rag.add` with agent namespace), branding save (upsert `agentBranding` table + patch `widgetSettings.appearance`). The scrape action returns a flat, serializable branding object to avoid Convex serialization issues with the raw `BrandingProfile` type (which has `[key: string]: unknown` fields).

**Tech Stack:** Convex (`internalAction`, `internalMutation`), `@convex-dev/rag`, `@mendable/firecrawl-js` v4.24.2, `@convex-dev/workflow`

---

## File Map

| File | Change |
|------|--------|
| `packages/backend/convex/schema.ts` | Add `agentBranding` table |
| `packages/backend/convex/lib/firecrawl.ts` | Fix `scrapeWebsiteUrlFn` bug; add `ingestMarkdownFn` |
| `packages/backend/convex/system/onboarding.ts` | New file: `saveBrandingMutation` |
| `packages/backend/convex/lib/workflow.ts` | Add `orgId` arg; wire up all 3 steps |

Generated files (`convex/_generated/api.d.ts`, etc.) update automatically when `convex dev` runs — do not edit them manually.

---

## Task 1: Add `agentBranding` table to schema

**Files:**
- Modify: `packages/backend/convex/schema.ts`

### Background
Convex schema is in `schema.ts`. Add a new table using `defineTable`. Indexes are declared inline. `convex dev` auto-regenerates `_generated/dataModel.d.ts` on save. The `agentBranding` table stores per-agent branding extracted from their website URL. We use a flat shape (no nested objects) to keep Convex validators straightforward.

- [ ] **Step 1: Add `agentBranding` table definition to `schema.ts`**

Open `packages/backend/convex/schema.ts`. At the end of the `defineSchema({...})` object (after the last table), add:

```ts
  agentBranding: defineTable({
    organizationId: v.string(),
    agentId: v.id("agents"),
    sourceUrl: v.string(),
    logoUrl: v.optional(v.string()),
    colorScheme: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    textPrimaryColor: v.optional(v.string()),
    extractedAt: v.number(),
  })
    .index("by_agent_id", ["agentId"])
    .index("by_organization_id", ["organizationId"]),
```

- [ ] **Step 2: Typecheck**

```bash
pnpm exec tsc --noEmit -p packages/backend/tsconfig.json
```

Expected: no errors (schema change alone doesn't break types; `convex dev` must be running to regenerate `_generated/` — if you're not in dev mode, skip this until Task 5's final check).

- [ ] **Step 3: Commit**

```bash
git add packages/backend/convex/schema.ts
git commit -m "feat: add agentBranding table to schema"
```

---

## Task 2: Fix `scrapeWebsiteUrlFn` and shape its return

**Files:**
- Modify: `packages/backend/convex/lib/firecrawl.ts`

### Background
The current `scrapeWebsiteUrlFn` has two bugs:
1. It calls `getOrgIdOrNull(ctx)` — `internalAction` runs server-side with no Clerk JWT, so this always returns null and throws.
2. It returns the raw `BrandingProfile` object which contains `fonts: Array<{ [key: string]: unknown }>` — Convex can't serialize `unknown`-typed fields through workflow steps.

Fix: remove the auth check (orgId is not needed for scraping), and return a flat, serializable branding shape extracted from `BrandingProfile`.

The Firecrawl `BrandingProfile` type (from `@mendable/firecrawl-js`):
```ts
interface BrandingProfile {
  colorScheme?: "light" | "dark";
  logo?: string | null;
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    textPrimary?: string;
    // ...other color fields
  };
  fonts?: Array<{ family: string; [key: string]: unknown }>; // NOT serializable
}
```

- [ ] **Step 1: Rewrite `packages/backend/convex/lib/firecrawl.ts`**

Replace the entire file with:

```ts
import { ConvexError, v } from "convex/values";
import Firecrawl from "@mendable/firecrawl-js";
import { internalAction } from "../_generated/server";

export const firecrawlClient = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

export type ScrapedBranding = {
  logoUrl: string | null;
  colorScheme: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  backgroundColor: string | null;
  textPrimaryColor: string | null;
};

export const scrapeWebsiteUrlFn = internalAction({
  args: {
    url: v.string(),
  },
  handler: async (_ctx, args) => {
    const doc = await firecrawlClient.scrape(args.url, {
      formats: ["markdown", "branding"],
    });

    const b = doc.branding;
    const branding: ScrapedBranding = b
      ? {
          logoUrl: typeof b.logo === "string" ? b.logo : null,
          colorScheme: b.colorScheme ?? null,
          primaryColor: b.colors?.primary ?? null,
          secondaryColor: b.colors?.secondary ?? null,
          backgroundColor: b.colors?.background ?? null,
          textPrimaryColor: b.colors?.textPrimary ?? null,
        }
      : {
          logoUrl: null,
          colorScheme: null,
          primaryColor: null,
          secondaryColor: null,
          backgroundColor: null,
          textPrimaryColor: null,
        };

    return {
      markdown: doc.markdown ?? null,
      branding,
    };
  },
});
```

Note: `ingestMarkdownFn` will be added to this same file in Task 3.

- [ ] **Step 2: Typecheck**

```bash
pnpm exec tsc --noEmit -p packages/backend/tsconfig.json
```

Expected: no errors. If `_generated/` is stale (not in dev mode), errors from generated files are expected — focus on errors in `lib/firecrawl.ts` only.

- [ ] **Step 3: Commit**

```bash
git add packages/backend/convex/lib/firecrawl.ts
git commit -m "fix: remove broken auth check from scrapeWebsiteUrlFn, shape branding output"
```

---

## Task 3: Add `ingestMarkdownFn` to `lib/firecrawl.ts`

**Files:**
- Modify: `packages/backend/convex/lib/firecrawl.ts`

### Background
The existing RAG ingestion pipeline in `knowledgeIngestion.ts` is designed for HTML input — it converts HTML to plaintext before storing. Since Firecrawl gives us clean markdown, we call `rag.add` directly, bypassing that pipeline.

Key details:
- Import `rag` from `../system/ai/rag` (the configured `RAG` instance with `text-embedding-3-small`).
- Import `agentNamespace` from `./knowledgeIngestion` (builds `"${orgId}:${agentId}"` namespace string).
- Import `contentHashFromArrayBuffer` from `@convex-dev/rag` for deduplication.
- `rag.add` is idempotent via `contentHash` — re-scraping the same content is a no-op.
- Minimum content check mirrors `knowledgeIngestion.ts` (40 chars) with a Norwegian error message.

- [ ] **Step 1: Add `ingestMarkdownFn` to `packages/backend/convex/lib/firecrawl.ts`**

Append the following export to the end of the file (after `scrapeWebsiteUrlFn`):

```ts
import { contentHashFromArrayBuffer } from "@convex-dev/rag";
import type { Id } from "../_generated/dataModel";
import { agentNamespace } from "./knowledgeIngestion";
import rag from "../system/ai/rag";

const MIN_MARKDOWN_CHARS = 40;

export const ingestMarkdownFn = internalAction({
  args: {
    orgId: v.string(),
    agentId: v.id("agents"),
    url: v.string(),
    markdown: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.markdown.length < MIN_MARKDOWN_CHARS) {
      throw new ConvexError(
        "For lite tekst hentet fra siden. Prøv en annen URL eller last opp innholdet som fil.",
      );
    }

    const publicUrl = new URL(args.url);
    const title = `${publicUrl.hostname}${publicUrl.pathname}`;
    const textBytes = new TextEncoder().encode(args.markdown);

    const { entryId, created } = await rag.add(ctx, {
      namespace: agentNamespace(args.orgId, args.agentId as Id<"agents">),
      text: args.markdown,
      key: args.url,
      title,
      metadata: {
        uploadedBy: args.orgId,
        filename: title,
        category: null,
        sourceType: "webpage",
        sourceUrl: args.url,
        agentId: args.agentId,
      },
      contentHash: await contentHashFromArrayBuffer(textBytes.buffer),
    });

    if (!created) {
      console.debug("Markdown entry uendret, hopper over duplikat");
    }

    return { entryId, created };
  },
});
```

Also move the imports you just added (`contentHashFromArrayBuffer`, `Id`, `agentNamespace`, `rag`) to the top of the file alongside the existing imports. The final import block at the top of `lib/firecrawl.ts` should look like:

```ts
import { contentHashFromArrayBuffer } from "@convex-dev/rag";
import { ConvexError, v } from "convex/values";
import Firecrawl from "@mendable/firecrawl-js";
import { internalAction } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { agentNamespace } from "./knowledgeIngestion";
import rag from "../system/ai/rag";
```

- [ ] **Step 2: Typecheck**

```bash
pnpm exec tsc --noEmit -p packages/backend/tsconfig.json
```

Expected: no errors in `lib/firecrawl.ts`. The `agentNamespace` import from `knowledgeIngestion` accepts `(orgId: string, agentId?: Id<"agents"> | null) => string` — verify the cast on `args.agentId` compiles cleanly.

- [ ] **Step 3: Commit**

```bash
git add packages/backend/convex/lib/firecrawl.ts
git commit -m "feat: add ingestMarkdownFn for RAG ingestion of Firecrawl markdown"
```

---

## Task 4: Create `system/onboarding.ts` with `saveBrandingMutation`

**Files:**
- Create: `packages/backend/convex/system/onboarding.ts`

### Background
`saveBrandingMutation` is an `internalMutation` (DB read/write, no external calls). It does two things:
1. Upserts the `agentBranding` table — patch if a row already exists for this `agentId`, insert otherwise. This is how "update only when user provides a new URL" is implemented: the workflow is only triggered when a URL is given, so every call is intentional.
2. Patches `widgetSettings.appearance` for the agent. If no widget settings row exists yet for the agent, insert one with defaults. Only non-null branding values are applied.

Color mapping from `ScrapedBranding` → `widgetSettings.appearance`:
- `primaryColor` → `headerColor`, `bubbleUserColor`, `bubbleButtonColor`
- `backgroundColor` → `backgroundColor`, `bubbleAssistantColor`
- `textPrimaryColor` → `headerTextColor`, `bubbleUserTextColor`, `inputTextColor`

- [ ] **Step 1: Create `packages/backend/convex/system/onboarding.ts`**

```ts
import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

const brandingArgs = v.object({
  logoUrl: v.union(v.string(), v.null()),
  colorScheme: v.union(v.string(), v.null()),
  primaryColor: v.union(v.string(), v.null()),
  secondaryColor: v.union(v.string(), v.null()),
  backgroundColor: v.union(v.string(), v.null()),
  textPrimaryColor: v.union(v.string(), v.null()),
});

export const saveBrandingMutation = internalMutation({
  args: {
    orgId: v.string(),
    agentId: v.id("agents"),
    url: v.string(),
    branding: brandingArgs,
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { branding, agentId, orgId, url } = args;

    // Upsert agentBranding table
    const existing = await ctx.db
      .query("agentBranding")
      .withIndex("by_agent_id", (q) => q.eq("agentId", agentId))
      .first();

    const brandingDoc = {
      organizationId: orgId,
      agentId,
      sourceUrl: url,
      extractedAt: now,
      ...(branding.logoUrl !== null ? { logoUrl: branding.logoUrl } : {}),
      ...(branding.colorScheme !== null ? { colorScheme: branding.colorScheme } : {}),
      ...(branding.primaryColor !== null ? { primaryColor: branding.primaryColor } : {}),
      ...(branding.secondaryColor !== null ? { secondaryColor: branding.secondaryColor } : {}),
      ...(branding.backgroundColor !== null ? { backgroundColor: branding.backgroundColor } : {}),
      ...(branding.textPrimaryColor !== null ? { textPrimaryColor: branding.textPrimaryColor } : {}),
    };

    if (existing) {
      await ctx.db.patch(existing._id, brandingDoc);
    } else {
      await ctx.db.insert("agentBranding", brandingDoc);
    }

    // Build appearance patch — only include fields where branding has a value
    const appearance: Record<string, string> = {};
    if (branding.primaryColor) {
      appearance.headerColor = branding.primaryColor;
      appearance.bubbleUserColor = branding.primaryColor;
      appearance.bubbleButtonColor = branding.primaryColor;
    }
    if (branding.backgroundColor) {
      appearance.backgroundColor = branding.backgroundColor;
      appearance.bubbleAssistantColor = branding.backgroundColor;
    }
    if (branding.textPrimaryColor) {
      appearance.headerTextColor = branding.textPrimaryColor;
      appearance.bubbleUserTextColor = branding.textPrimaryColor;
      appearance.inputTextColor = branding.textPrimaryColor;
    }

    // Only touch widgetSettings if we have at least one color to apply
    if (Object.keys(appearance).length === 0) return;

    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_agent_id", (q) => q.eq("agentId", agentId))
      .first();

    if (widgetSettings) {
      await ctx.db.patch(widgetSettings._id, {
        appearance: { ...(widgetSettings.appearance ?? {}), ...appearance },
      });
    } else {
      await ctx.db.insert("widgetSettings", {
        organizationId: orgId,
        agentId,
        greetMessage: "Hei! Hvordan kan jeg hjelpe deg i dag?",
        defaultSuggestions: {},
        vapiSettings: {},
        appearance,
      });
    }
  },
});
```

- [ ] **Step 2: Typecheck**

```bash
pnpm exec tsc --noEmit -p packages/backend/tsconfig.json
```

Expected: no errors. If `_generated/dataModel.d.ts` doesn't yet include `agentBranding` (because `convex dev` hasn't run), you may see an error on the `"agentBranding"` string — that's expected and resolves once `convex dev` regenerates types.

- [ ] **Step 3: Commit**

```bash
git add packages/backend/convex/system/onboarding.ts
git commit -m "feat: add saveBrandingMutation for agentBranding upsert and widget appearance defaults"
```

---

## Task 5: Update `supportAgentOnboarding` workflow

**Files:**
- Modify: `packages/backend/convex/lib/workflow.ts`

### Background
The workflow handler is the orchestration layer. It calls the three steps in order:
1. `scrapeWebsiteUrlFn` — returns `{ markdown, branding }`
2. `ingestMarkdownFn` — RAG ingestion (only if markdown is non-null)
3. `saveBrandingMutation` — stores branding + applies to widget settings

`step.runAction` is used for actions (external calls, embeddings); `step.runMutation` is used for DB-only operations. Both are retried by the workflow engine on failure.

The `internal` import in a workflow file must be cast via `internal as any` to avoid circular type issues — this is an established pattern already used in this file.

- [ ] **Step 1: Replace `supportAgentOnboarding` in `packages/backend/convex/lib/workflow.ts`**

The current content is:
```ts
import { WorkflowManager } from "@convex-dev/workflow";
import { components, internal } from "../_generated/api";
import { v } from "convex/values";

export const workflow = new WorkflowManager((components as any).workflow, {
  workpoolOptions: {
    maxParallelism: 10,
    defaultRetryBehavior: {
      maxAttempts: 3,
      initialBackoffMs: 60_000,
      base: 2,
    },
  },
});

export const supportAgentOnboarding = workflow.define({
  args: {
    agentId: v.id("agents"),
    url: v.string(),
  },
  handler: async (step, args) => {
    const { agentId, url } = args;

    const scrapeWebsite = await step.runAction(
      internal.lib.firecrawl.scrapeWebsiteUrlFn,
      { url },
    );
  },
});
```

Replace the `supportAgentOnboarding` definition with:

```ts
const internalApi = internal as any;

export const supportAgentOnboarding = workflow.define({
  args: {
    agentId: v.id("agents"),
    orgId: v.string(),
    url: v.string(),
  },
  handler: async (step, args) => {
    const { agentId, orgId, url } = args;

    // Step 1: Scrape the URL
    const scrapeResult = (await step.runAction(
      internalApi.lib.firecrawl.scrapeWebsiteUrlFn,
      { url },
      { name: "scrape website", retry: true },
    )) as { markdown: string | null; branding: { logoUrl: string | null; colorScheme: string | null; primaryColor: string | null; secondaryColor: string | null; backgroundColor: string | null; textPrimaryColor: string | null } };

    // Step 2: Ingest markdown into RAG (skip if no content returned)
    if (scrapeResult.markdown) {
      await step.runAction(
        internalApi.lib.firecrawl.ingestMarkdownFn,
        { orgId, agentId, url, markdown: scrapeResult.markdown },
        { name: "ingest markdown", retry: true },
      );
    }

    // Step 3: Save branding and apply to widget appearance
    await step.runMutation(
      internalApi.system.onboarding.saveBrandingMutation,
      { orgId, agentId, url, branding: scrapeResult.branding },
      { name: "save branding" },
    );
  },
});
```

The full file should now be:

```ts
import { WorkflowManager } from "@convex-dev/workflow";
import { components, internal } from "../_generated/api";
import { v } from "convex/values";

export const workflow = new WorkflowManager((components as any).workflow, {
  workpoolOptions: {
    maxParallelism: 10,
    defaultRetryBehavior: {
      maxAttempts: 3,
      initialBackoffMs: 60_000,
      base: 2,
    },
  },
});

const internalApi = internal as any;

export const supportAgentOnboarding = workflow.define({
  args: {
    agentId: v.id("agents"),
    orgId: v.string(),
    url: v.string(),
  },
  handler: async (step, args) => {
    const { agentId, orgId, url } = args;

    // Step 1: Scrape the URL
    const scrapeResult = (await step.runAction(
      internalApi.lib.firecrawl.scrapeWebsiteUrlFn,
      { url },
      { name: "scrape website", retry: true },
    )) as { markdown: string | null; branding: { logoUrl: string | null; colorScheme: string | null; primaryColor: string | null; secondaryColor: string | null; backgroundColor: string | null; textPrimaryColor: string | null } };

    // Step 2: Ingest markdown into RAG (skip if no content returned)
    if (scrapeResult.markdown) {
      await step.runAction(
        internalApi.lib.firecrawl.ingestMarkdownFn,
        { orgId, agentId, url, markdown: scrapeResult.markdown },
        { name: "ingest markdown", retry: true },
      );
    }

    // Step 3: Save branding and apply to widget appearance
    await step.runMutation(
      internalApi.system.onboarding.saveBrandingMutation,
      { orgId, agentId, url, branding: scrapeResult.branding },
      { name: "save branding" },
    );
  },
});
```

- [ ] **Step 2: Run `convex dev` and verify no deployment errors**

```bash
pnpm dev:backend
```

Watch the output for errors. Expected: Convex deploys successfully, regenerates `_generated/api.d.ts` to include `lib.firecrawl.ingestMarkdownFn` and `system.onboarding.saveBrandingMutation`. The `agentBranding` table appears in the Convex dashboard under Data.

If you see a schema push prompt, accept it.

- [ ] **Step 3: Full typecheck**

```bash
pnpm exec tsc --noEmit -p packages/backend/tsconfig.json
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/backend/convex/lib/workflow.ts packages/backend/convex/_generated/api.d.ts
git commit -m "feat: complete supportAgentOnboarding workflow with RAG ingestion and branding"
```

---

## Task 6: Smoke Test

**Files:** none modified

### Background
Manually trigger the workflow to verify the end-to-end flow. You need:
- A Convex deployment running (`pnpm dev:backend`)
- An existing `agents` row (use one from the dashboard)
- A public URL to scrape

- [ ] **Step 1: Trigger the workflow via Convex dashboard**

In the Convex dashboard → Functions → `lib/workflow:supportAgentOnboarding`, click "Run function" with args:

```json
{
  "agentId": "<an existing agents._id>",
  "orgId": "<your org's organizationId>",
  "url": "https://example.com"
}
```

(Use a real public URL for a better branding result. `https://example.com` will give minimal branding.)

- [ ] **Step 2: Verify RAG entry created**

In the Convex dashboard → Data → check the `_storage` or use the RAG component's internal tables (via Components tab) to confirm an entry exists with the namespace `${orgId}:${agentId}`.

- [ ] **Step 3: Verify `agentBranding` row created**

In the Convex dashboard → Data → `agentBranding` table. Confirm:
- `agentId` matches the one you used
- `sourceUrl` matches the URL
- Any color fields are populated (depends on the site)

- [ ] **Step 4: Verify `widgetSettings.appearance` updated**

In the Convex dashboard → Data → `widgetSettings`. Find the row for your `agentId` and confirm `appearance` has been set with color values (if the site returned branding colors).

- [ ] **Step 5: Verify no workflow errors**

In the Convex dashboard → Functions → Logs, confirm no errors from the three workflow steps.

---

## Self-Review Checklist

- [x] `agentBranding` schema defined (Task 1) ✓
- [x] `scrapeWebsiteUrlFn` bug fixed — no `getOrgIdOrNull` (Task 2) ✓
- [x] Branding serialization safe — flat shape, no `[key: string]: unknown` (Task 2) ✓
- [x] `ingestMarkdownFn` ingests markdown via `rag.add` with correct namespace (Task 3) ✓
- [x] `saveBrandingMutation` upserts `agentBranding` + patches `widgetSettings.appearance` (Task 4) ✓
- [x] Color mapping applied: primary → header/bubble/button, background → bg/assistant, textPrimary → text fields (Task 4) ✓
- [x] Workflow wires all 3 steps with `orgId` arg (Task 5) ✓
- [x] Markdown null-check in workflow — skips RAG if Firecrawl returned no content (Task 5) ✓
- [x] `step.runMutation` used for DB-only step, `step.runAction` for embedding/external steps ✓
- [x] All type names consistent across tasks (`ScrapedBranding`, `brandingArgs`, `saveBrandingMutation`) ✓
