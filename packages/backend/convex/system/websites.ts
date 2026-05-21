import { ConvexError, v } from "convex/values";
import type { EntryId } from "@convex-dev/rag";
import type { WorkflowId } from "@convex-dev/workflow";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
} from "../_generated/server";
import {
  type WebsiteMode,
  WEBSITE_BATCH_SIZE,
  clampWebsiteMaxPages,
  clampWebsiteSyncIntervalMinutes,
  extractSameHostLinks,
  fetchWebpageHtml,
  normalizeWebpageUrl,
} from "../lib/webpageCrawler";
import { upsertWebpageEntry } from "../lib/knowledgeIngestion";
import { workflow } from "../lib/workflow";
import rag from "./ai/rag";

const websiteModeValidator = v.union(v.literal("single"), v.literal("crawl"));

const MAX_RUN_RETRIES = 3;
const DUE_SOURCE_BATCH_SIZE = 10;
const MAX_WORKFLOW_BATCHES = 25;

type WebsiteSourceDoc = Doc<"websiteSources">;
type WebsiteRunDoc = Doc<"websiteRuns">;
type WebsiteRunState = {
  run: WebsiteRunDoc;
  source: WebsiteSourceDoc | null;
} | null;

const internalApi = internal as any;

export const processRunWorkflow = workflow.define({
  args: {
    runId: v.id("websiteRuns"),
  },
  handler: async (step, args): Promise<void> => {
    for (
      let batchIndex = 0;
      batchIndex < MAX_WORKFLOW_BATCHES;
      batchIndex += 1
    ) {
      const result = (await step.runAction(
        internalApi.system.websites.processRun,
        { runId: args.runId, reschedule: false },
        {
          name: `process website batch ${batchIndex + 1}`,
          retry: true,
          ...(batchIndex === 0 ? {} : { runAfter: 1_000 }),
        },
      )) as {
        status: "missing" | "queued" | "running" | "ready" | "error" | "paused";
      };

      if (result.status !== "running" && result.status !== "queued") {
        return;
      }
    }

    throw new Error(
      "Website run still has queued pages after the workflow batch cap.",
    );
  },
});

export const enqueue = internalMutation({
  args: {
    organizationId: v.string(),
    agentId: v.optional(v.id("agents")),
    url: v.string(),
    category: v.optional(v.string()),
    mode: v.optional(websiteModeValidator),
    maxPages: v.optional(v.number()),
    syncIntervalMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const normalizedUrl = normalizeWebpageUrl(args.url);
    const mode = args.mode ?? "crawl";
    const maxPages = clampWebsiteMaxPages(args.maxPages, mode);
    const syncIntervalMinutes = clampWebsiteSyncIntervalMinutes(
      args.syncIntervalMinutes,
    );
    const now = Date.now();
    const host = new URL(normalizedUrl).hostname.toLowerCase();

    const existing = await ctx.db
      .query("websiteSources")
      .withIndex("by_organization_agent_root_url", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("agentId", args.agentId)
          .eq("rootUrl", normalizedUrl),
      )
      .unique();

    if (existing?.activeRunId) {
      const activeRun = await ctx.db.get(existing.activeRunId);
      if (
        activeRun &&
        (activeRun.status === "queued" || activeRun.status === "running")
      ) {
        if (!activeRun.workflowId) {
          await startWorkflowForRun(ctx, activeRun._id);
        }
        return {
          sourceId: existing._id,
          runId: activeRun._id,
          status: activeRun.status,
          url: normalizedUrl,
          alreadyQueued: true,
        };
      }
    }

    let sourceId: Id<"websiteSources">;
    if (existing) {
      sourceId = existing._id;
      await ctx.db.patch(existing._id, {
        category: args.category,
        host,
        maxPages,
        mode,
        nextRunAt: now + syncIntervalMinutes * 60_000,
        rootUrl: normalizedUrl,
        syncIntervalMinutes,
        updatedAt: now,
      });

      if (existing.activeRunId) {
        const activeRun = await ctx.db.get(existing.activeRunId);
        if (activeRun?.status === "paused") {
          const resumedRunId = await resumeExistingRun(
            ctx,
            existing._id,
            activeRun,
            now,
          );
          return {
            sourceId: existing._id,
            runId: resumedRunId,
            status: "queued" as const,
            url: normalizedUrl,
            alreadyQueued: false,
          };
        }
      }
    } else {
      sourceId = await ctx.db.insert("websiteSources", {
        organizationId: args.organizationId,
        agentId: args.agentId,
        rootUrl: normalizedUrl,
        host,
        category: args.category,
        mode,
        status: "queued",
        maxPages,
        syncIntervalMinutes,
        nextRunAt: now + syncIntervalMinutes * 60_000,
        createdAt: now,
        updatedAt: now,
      });
    }

    const source = await ctx.db.get(sourceId);
    if (!source) {
      throw new ConvexError("Website source not found after upsert");
    }

    const runId = await createRunForSource(ctx, source, now);
    return {
      sourceId,
      runId,
      status: "queued" as const,
      url: normalizedUrl,
      alreadyQueued: false,
    };
  },
});

export const getRunState = internalQuery({
  args: {
    runId: v.id("websiteRuns"),
  },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) {
      return null;
    }

    const source = await ctx.db.get(run.websiteSourceId);
    return { run, source };
  },
});

export const getSourceById = internalQuery({
  args: {
    sourceId: v.id("websiteSources"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sourceId);
  },
});

export const listSourcePages = internalQuery({
  args: {
    sourceId: v.id("websiteSources"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("websitePages")
      .withIndex("by_website_source_id", (q) =>
        q.eq("websiteSourceId", args.sourceId),
      )
      .collect();
  },
});

export const upsertSourcePage = internalMutation({
  args: {
    sourceId: v.id("websiteSources"),
    organizationId: v.string(),
    agentId: v.optional(v.id("agents")),
    runId: v.id("websiteRuns"),
    sourceUrl: v.string(),
    entryId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("websitePages")
      .withIndex("by_website_source_id_and_source_url", (q) =>
        q.eq("websiteSourceId", args.sourceId).eq("sourceUrl", args.sourceUrl),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        entryId: args.entryId,
        lastRunId: args.runId,
        lastSeenAt: now,
        updatedAt: now,
      });
      return { pageId: existing._id, created: false };
    }

    const pageId = await ctx.db.insert("websitePages", {
      websiteSourceId: args.sourceId,
      organizationId: args.organizationId,
      agentId: args.agentId,
      sourceUrl: args.sourceUrl,
      entryId: args.entryId,
      lastRunId: args.runId,
      lastSeenAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return { pageId, created: true };
  },
});

export const deleteSourcePages = internalMutation({
  args: {
    sourceId: v.id("websiteSources"),
    keepRunId: v.optional(v.id("websiteRuns")),
  },
  handler: async (ctx, args) => {
    const pages = await ctx.db
      .query("websitePages")
      .withIndex("by_website_source_id", (q) =>
        q.eq("websiteSourceId", args.sourceId),
      )
      .collect();

    let deletedPages = 0;
    for (const page of pages) {
      if (args.keepRunId && page.lastRunId === args.keepRunId) {
        continue;
      }

      try {
        await rag.deleteAsync(ctx, { entryId: page.entryId as EntryId });
      } catch (error) {
        console.warn("Failed to delete website page entry", {
          pageId: page._id,
          error,
        });
      }

      await ctx.db.delete(page._id);
      deletedPages += 1;
    }

    return { deletedPages };
  },
});

export const pauseSource = internalMutation({
  args: {
    sourceId: v.id("websiteSources"),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source) {
      throw new ConvexError("Website source not found");
    }

    const now = Date.now();
    let activeRunId = source.activeRunId;
    if (source.activeRunId) {
      const activeRun = await ctx.db.get(source.activeRunId);
      if (
        activeRun &&
        (activeRun.status === "queued" || activeRun.status === "running")
      ) {
        if (activeRun.workflowId) {
          await cancelWorkflow(ctx, activeRun.workflowId);
        }
        await ctx.db.patch(activeRun._id, {
          status: "paused",
          updatedAt: now,
        });
      } else if (
        !activeRun ||
        activeRun.status === "ready" ||
        activeRun.status === "error"
      ) {
        activeRunId = undefined;
      }
    }

    await ctx.db.patch(source._id, {
      status: "paused",
      activeRunId,
      updatedAt: now,
    });

    return { status: "paused" as const, activeRunId };
  },
});

export const resumeSource = internalMutation({
  args: {
    sourceId: v.id("websiteSources"),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source) {
      throw new ConvexError("Website source not found");
    }

    const now = Date.now();
    if (source.activeRunId) {
      const activeRun = await ctx.db.get(source.activeRunId);
      if (activeRun?.status === "paused") {
        const runId = await resumeExistingRun(ctx, source._id, activeRun, now);
        return { status: "queued" as const, runId, resumedExistingRun: true };
      }
    }

    const runId = await createRunForSource(ctx, source, now);
    return { status: "queued" as const, runId, resumedExistingRun: false };
  },
});

export const markRunRunning = internalMutation({
  args: {
    runId: v.id("websiteRuns"),
  },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) {
      return { status: "missing" as const };
    }

    const source = await ctx.db.get(run.websiteSourceId);
    if (!source || source.status === "paused" || run.status === "paused") {
      return { status: "paused" as const };
    }

    const now = Date.now();

    if (run.status !== "running") {
      await ctx.db.patch(run._id, {
        status: "running",
        updatedAt: now,
      });
    }

    if (source && source.status !== "running") {
      await ctx.db.patch(source._id, {
        status: "running",
        updatedAt: now,
      });
    }

    return { status: "running" as const };
  },
});

export const applyRunBatch = internalMutation({
  args: {
    runId: v.id("websiteRuns"),
    pendingUrls: v.array(v.string()),
    visitedUrls: v.array(v.string()),
    failedUrls: v.array(v.string()),
    discoveredCount: v.number(),
    processedCount: v.number(),
    succeededCount: v.number(),
    failedCount: v.number(),
    shouldContinue: v.boolean(),
    reschedule: v.optional(v.boolean()),
    lastError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) {
      return { status: "missing" as const };
    }

    const source = await ctx.db.get(run.websiteSourceId);
    if (!source) {
      throw new ConvexError("Website source not found");
    }

    const now = Date.now();
    const isPaused = source.status === "paused" || run.status === "paused";
    if (isPaused) {
      if (args.shouldContinue) {
        await ctx.db.patch(run._id, {
          status: "paused",
          pendingUrls: args.pendingUrls,
          visitedUrls: args.visitedUrls,
          failedUrls: args.failedUrls,
          discoveredCount: args.discoveredCount,
          processedCount: args.processedCount,
          succeededCount: args.succeededCount,
          failedCount: args.failedCount,
          updatedAt: now,
          lastError: args.lastError,
        });

        await ctx.db.patch(source._id, {
          status: "paused",
          updatedAt: now,
          activeRunId: run._id,
          lastError: args.lastError,
          lastIndexedCount: args.succeededCount,
        });

        return { status: "paused" as const };
      }

      const completedRunStatus = args.succeededCount > 0 ? "ready" : "error";
      await ctx.db.patch(run._id, {
        status: completedRunStatus,
        pendingUrls: args.pendingUrls,
        visitedUrls: args.visitedUrls,
        failedUrls: args.failedUrls,
        discoveredCount: args.discoveredCount,
        processedCount: args.processedCount,
        succeededCount: args.succeededCount,
        failedCount: args.failedCount,
        updatedAt: now,
        completedAt: now,
        lastError: args.lastError,
      });

      await ctx.db.patch(source._id, {
        status: "paused",
        updatedAt: now,
        activeRunId: undefined,
        lastCompletedAt: now,
        lastError: args.lastError,
        lastIndexedCount: args.succeededCount,
        nextRunAt: now + source.syncIntervalMinutes * 60_000,
      });

      return { status: "paused" as const };
    }

    const runStatus = args.shouldContinue
      ? "running"
      : args.succeededCount > 0
        ? "ready"
        : "error";

    await ctx.db.patch(run._id, {
      status: runStatus,
      pendingUrls: args.pendingUrls,
      visitedUrls: args.visitedUrls,
      failedUrls: args.failedUrls,
      discoveredCount: args.discoveredCount,
      processedCount: args.processedCount,
      succeededCount: args.succeededCount,
      failedCount: args.failedCount,
      updatedAt: now,
      completedAt: args.shouldContinue ? undefined : now,
      lastError: args.lastError,
    });

    await ctx.db.patch(source._id, {
      status: runStatus,
      updatedAt: now,
      activeRunId: args.shouldContinue ? run._id : undefined,
      lastCompletedAt: args.shouldContinue ? source.lastCompletedAt : now,
      lastError: args.lastError,
      lastIndexedCount: args.succeededCount,
      nextRunAt: now + source.syncIntervalMinutes * 60_000,
    });

    return { status: runStatus };
  },
});

export const handleRunFailure = internalMutation({
  args: {
    runId: v.id("websiteRuns"),
    error: v.string(),
    retryable: v.boolean(),
  },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) {
      return { status: "missing" as const, retried: false };
    }

    const source = await ctx.db.get(run.websiteSourceId);
    const now = Date.now();
    if (source?.status === "paused" || run.status === "paused") {
      await ctx.db.patch(run._id, {
        status: "paused",
        updatedAt: now,
        lastError: args.error,
      });

      if (source) {
        await ctx.db.patch(source._id, {
          status: "paused",
          updatedAt: now,
          activeRunId: run._id,
          lastError: args.error,
        });
      }

      return { status: "paused" as const, retried: false };
    }

    const nextAttempt = run.attempt + 1;

    if (args.retryable && nextAttempt < MAX_RUN_RETRIES) {
      await ctx.db.patch(run._id, {
        status: "queued",
        attempt: nextAttempt,
        updatedAt: now,
        lastError: args.error,
      });

      if (source) {
        await ctx.db.patch(source._id, {
          status: "queued",
          updatedAt: now,
          lastError: args.error,
          activeRunId: run._id,
          nextRunAt: now + source.syncIntervalMinutes * 60_000,
        });
      }

      return { status: "queued" as const, retried: true };
    }

    await ctx.db.patch(run._id, {
      status: "error",
      updatedAt: now,
      completedAt: now,
      lastError: args.error,
    });

    if (source) {
      await ctx.db.patch(source._id, {
        status: "error",
        updatedAt: now,
        activeRunId: undefined,
        lastCompletedAt: now,
        lastError: args.error,
        nextRunAt: now + source.syncIntervalMinutes * 60_000,
      });
    }

    return { status: "error" as const, retried: false };
  },
});

export const finalizeDeleteSource = internalMutation({
  args: {
    sourceId: v.id("websiteSources"),
  },
  handler: async (ctx, args) => {
    const runs = await ctx.db
      .query("websiteRuns")
      .withIndex("by_website_source_id", (q) =>
        q.eq("websiteSourceId", args.sourceId),
      )
      .collect();

    for (const run of runs) {
      if (run.workflowId) {
        await cancelWorkflow(ctx, run.workflowId);
      }
      await ctx.db.delete(run._id);
    }

    const source = await ctx.db.get(args.sourceId);
    if (source) {
      await ctx.db.delete(args.sourceId);
    }

    return { deletedRuns: runs.length };
  },
});

export const scheduleDueRuns = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const queuedRuns = await ctx.db
      .query("websiteRuns")
      .withIndex("by_status", (q) => q.eq("status", "queued"))
      .take(DUE_SOURCE_BATCH_SIZE);
    const readySources = await ctx.db
      .query("websiteSources")
      .withIndex("by_status_and_next_run_at", (q) =>
        q.eq("status", "ready").lte("nextRunAt", now),
      )
      .take(DUE_SOURCE_BATCH_SIZE);

    const remainingSlots = Math.max(
      DUE_SOURCE_BATCH_SIZE - readySources.length,
      0,
    );
    const errorSources = remainingSlots
      ? await ctx.db
          .query("websiteSources")
          .withIndex("by_status_and_next_run_at", (q) =>
            q.eq("status", "error").lte("nextRunAt", now),
          )
          .take(remainingSlots)
      : [];

    let scheduled = 0;
    const runIds: Array<Id<"websiteRuns">> = [];
    const queuedRunIds: Array<Id<"websiteRuns">> = [];

    for (const run of queuedRuns) {
      if (!run.workflowId) {
        await startWorkflowForRun(ctx, run._id);
      }
      queuedRunIds.push(run._id);
    }

    for (const source of [...readySources, ...errorSources]) {
      if (source.activeRunId) {
        const activeRun = await ctx.db.get(source.activeRunId);
        if (
          activeRun &&
          (activeRun.status === "queued" || activeRun.status === "running")
        ) {
          continue;
        }
      }

      const runId = await createRunForSource(ctx, source, now);
      runIds.push(runId);
      scheduled += 1;
    }

    return {
      scheduled,
      runIds,
      queuedRunIds,
    };
  },
});

export const processRun = internalAction({
  args: {
    runId: v.id("websiteRuns"),
    reschedule: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    try {
      const state = (await ctx.runQuery(
        internalApi.system.websites.getRunState,
        { runId: args.runId },
      )) as WebsiteRunState;
      if (!state) {
        return { status: "missing" as const };
      }

      if (!state.source) {
        await ctx.runMutation(internalApi.system.websites.handleRunFailure, {
          runId: args.runId,
          error: "Website source not found",
          retryable: false,
        });
        return { status: "error" as const };
      }

      if (
        state.run.status === "ready" ||
        state.run.status === "error" ||
        state.run.status === "paused"
      ) {
        return { status: state.run.status };
      }

      if (state.source.status === "paused") {
        return { status: "paused" as const };
      }

      await ctx.runMutation(internalApi.system.websites.markRunRunning, {
        runId: args.runId,
      });

      const visited = new Set(state.run.visitedUrls);
      const failedUrls = [...state.run.failedUrls];
      const pendingUrls = state.run.pendingUrls.filter(
        (url) => !visited.has(url),
      );
      const batch = pendingUrls.splice(0, WEBSITE_BATCH_SIZE);

      let discoveredCount = Math.max(
        state.run.discoveredCount,
        visited.size + pendingUrls.length + batch.length,
      );
      let processedCount = state.run.processedCount;
      let succeededCount = state.run.succeededCount;
      let failedCount = state.run.failedCount;
      let lastError = state.run.lastError;

      for (const queuedUrl of batch) {
        if (visited.size >= state.run.maxPages) {
          break;
        }

        if (visited.has(queuedUrl)) {
          continue;
        }

        try {
          const { normalizedUrl, html } = await fetchWebpageHtml(queuedUrl);

          const indexedPage = await upsertWebpageEntry(ctx, {
            organizationId: state.source.organizationId,
            agentId: state.source.agentId ?? undefined,
            websiteSourceId: state.source._id,
            url: normalizedUrl,
            html,
            category: state.source.category,
          });

          await ctx.runMutation(internalApi.system.websites.upsertSourcePage, {
            sourceId: state.source._id,
            organizationId: state.source.organizationId,
            agentId: state.source.agentId ?? undefined,
            runId: state.run._id,
            sourceUrl: normalizedUrl,
            entryId: indexedPage.entryId,
          });

          visited.add(queuedUrl);
          visited.add(normalizedUrl);
          processedCount += 1;
          succeededCount += 1;
          lastError = undefined;

          if (
            state.source.mode === "crawl" &&
            visited.size < state.run.maxPages
          ) {
            for (const discoveredUrl of extractSameHostLinks(
              state.source.rootUrl,
              normalizedUrl,
              html,
            )) {
              if (
                visited.has(discoveredUrl) ||
                pendingUrls.includes(discoveredUrl)
              ) {
                continue;
              }

              if (visited.size + pendingUrls.length >= state.run.maxPages) {
                break;
              }

              pendingUrls.push(discoveredUrl);
              discoveredCount += 1;
            }
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          visited.add(queuedUrl);
          failedUrls.push(queuedUrl);
          processedCount += 1;
          failedCount += 1;
          lastError = message;
        }
      }

      const remainingCapacity = Math.max(state.run.maxPages - visited.size, 0);
      const crawlFinishedWithoutCap = pendingUrls.length === 0;
      const nextPendingUrls =
        remainingCapacity > 0 ? pendingUrls.slice(0, remainingCapacity) : [];
      const shouldContinue = nextPendingUrls.length > 0;

      if (!shouldContinue && crawlFinishedWithoutCap && failedCount === 0) {
        await ctx.runMutation(internalApi.system.websites.deleteSourcePages, {
          sourceId: state.source._id,
          keepRunId: state.run._id,
        });
      }

      await ctx.runMutation(internalApi.system.websites.applyRunBatch, {
        runId: args.runId,
        pendingUrls: nextPendingUrls,
        visitedUrls: [...visited],
        failedUrls,
        discoveredCount: Math.max(
          discoveredCount,
          visited.size + nextPendingUrls.length,
        ),
        processedCount,
        succeededCount,
        failedCount,
        shouldContinue,
        reschedule: args.reschedule,
        lastError,
      });

      return {
        status: shouldContinue
          ? "running"
          : succeededCount > 0
            ? "ready"
            : "error",
        processedCount,
        succeededCount,
        failedCount,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await ctx.runMutation(internalApi.system.websites.handleRunFailure, {
        runId: args.runId,
        error: message,
        retryable: true,
      });
      if (args.reschedule === false) {
        throw error;
      }
      return { status: "queued" as const, error: message };
    }
  },
});

async function createRunForSource(
  ctx: MutationCtx,
  source: WebsiteSourceDoc,
  now: number,
): Promise<Id<"websiteRuns">> {
  const runId = await ctx.db.insert("websiteRuns", {
    websiteSourceId: source._id,
    organizationId: source.organizationId,
    agentId: source.agentId,
    status: "queued",
    mode: source.mode,
    maxPages: source.maxPages,
    attempt: 0,
    pendingUrls: [source.rootUrl],
    visitedUrls: [],
    failedUrls: [],
    discoveredCount: 1,
    processedCount: 0,
    succeededCount: 0,
    failedCount: 0,
    startedAt: now,
    updatedAt: now,
  });

  await ctx.db.patch(source._id, {
    status: "queued",
    activeRunId: runId,
    lastRunAt: now,
    lastRunId: runId,
    lastError: undefined,
    nextRunAt: now + source.syncIntervalMinutes * 60_000,
    updatedAt: now,
  });

  await startWorkflowForRun(ctx, runId);
  return runId;
}

async function resumeExistingRun(
  ctx: MutationCtx,
  sourceId: Id<"websiteSources">,
  run: WebsiteRunDoc,
  now: number,
) {
  const source = await ctx.db.get(sourceId);
  if (!source) {
    throw new ConvexError("Website source not found");
  }

  await ctx.db.patch(run._id, {
    status: "queued",
    updatedAt: now,
    lastError: undefined,
    maxPages: source.maxPages,
    mode: source.mode,
    completedAt: undefined,
  });

  await ctx.db.patch(source._id, {
    status: "queued",
    updatedAt: now,
    activeRunId: run._id,
    lastError: undefined,
    nextRunAt: now + source.syncIntervalMinutes * 60_000,
  });

  await startWorkflowForRun(ctx, run._id);
  return run._id;
}

async function startWorkflowForRun(
  ctx: MutationCtx,
  runId: Id<"websiteRuns">,
): Promise<WorkflowId> {
  const workflowId = await workflow.start(
    ctx,
    internalApi.system.websites.processRunWorkflow,
    { runId },
    { startAsync: true },
  );
  await ctx.db.patch(runId, { workflowId });
  return workflowId;
}

async function cancelWorkflow(
  ctx: MutationCtx,
  workflowId: string,
): Promise<void> {
  try {
    await workflow.cancel(ctx, workflowId as WorkflowId);
  } catch (error) {
    console.warn("Failed to cancel website workflow", { workflowId, error });
  }
}
