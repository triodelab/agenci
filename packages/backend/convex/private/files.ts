import { ConvexError, v } from "convex/values";
import {
  contentHashFromArrayBuffer,
  Entry,
  EntryId,
  guessMimeTypeFromContents,
  guessMimeTypeFromExtension,
  vEntryId,
} from "@convex-dev/rag";
import { action, mutation, query, QueryCtx } from "../_generated/server";
import { getOrgIdOrNull, getUserEmailOrNull } from "../lib/auth";
import { hasActiveSubscriptionAccess } from "../lib/subscriptionAccess";
import { extractTextContent } from "../lib/extractTextContent";
import { agentNamespace, type EntryMetadata } from "../lib/knowledgeIngestion";
import rag from "../system/ai/rag";
import { Id } from "../_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import { internal } from "../_generated/api";

const internalApi = internal as any;

function guessMimeType(filename: string, bytes: ArrayBuffer): string {
  return (
    guessMimeTypeFromExtension(filename) ||
    guessMimeTypeFromContents(bytes) ||
    "application/octet-stream"
  );
}

export const deleteFile = mutation({
  args: { entryId: vEntryId },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      throw new ConvexError("No organization in session. Select an organization in Clerk.");
    }

    const entry = await rag.getEntry(ctx, { entryId: args.entryId });
    if (!entry) {
      throw new ConvexError("Entry not found");
    }
    if (entry.metadata?.uploadedBy !== orgId) {
      throw new ConvexError("Invalid Organization ID");
    }

    const meta = entry.metadata as EntryMetadata | undefined;
    if (meta?.storageId) {
      await ctx.storage.delete(meta.storageId as Id<"_storage">);
    }

    if (meta?.websiteSourceId && meta.sourceUrl) {
      const websitePage = await ctx.db
        .query("websitePages")
        .withIndex("by_website_source_id_and_source_url", (q) =>
          q.eq("websiteSourceId", meta.websiteSourceId as Id<"websiteSources">).eq("sourceUrl", meta.sourceUrl!),
        )
        .unique();

      if (websitePage) {
        await ctx.db.delete(websitePage._id);
      }
    }

    await rag.deleteAsync(ctx, { entryId: args.entryId });
  },
});

export const addFile = action({
  args: {
    filename: v.string(),
    mimeType: v.string(),
    bytes: v.bytes(),
    category: v.optional(v.string()),
    agentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      throw new ConvexError("No organization in session. Select an organization in Clerk.");
    }

    const subscription = await ctx.runQuery(
      internal.system.subscriptions.getByOrganizationId,
      { organizationId: orgId },
    );
    const userEmail = await getUserEmailOrNull(ctx);
    if (!hasActiveSubscriptionAccess(orgId, subscription, { userEmail })) {
      throw new ConvexError("Du trenger et aktivt abonnement for å laste opp filer. Gå til Fakturering for å velge en plan.");
    }

    const { bytes, filename, category } = args;
    const mimeType = args.mimeType || guessMimeType(filename, bytes);
    const blob = new Blob([bytes], { type: mimeType });
    const storageId = await ctx.storage.store(blob);

    let text: string;
    try {
      text = await extractTextContent(ctx, { storageId, filename, bytes, mimeType });
    } catch (e) {
      await ctx.storage.delete(storageId);
      const msg = e instanceof Error ? e.message : String(e);
      throw new ConvexError(`Kunne ikke lese filinnhold: ${msg}`);
    }

    const namespace = agentNamespace(orgId, args.agentId);

    let entryId: string;
    let created: boolean;
    try {
      ({ entryId, created } = await rag.add(ctx, {
        namespace,
        text,
        key: filename,
        title: filename,
        metadata: {
          storageId,
          uploadedBy: orgId,
          filename,
          category: category ?? null,
          agentId: args.agentId ?? null,
        } as EntryMetadata,
        contentHash: await contentHashFromArrayBuffer(bytes),
      }));
    } catch (e) {
      await ctx.storage.delete(storageId);
      const msg = e instanceof Error ? e.message : String(e);
      const isKeyMissing = msg.toLowerCase().includes("api key") || msg.toLowerCase().includes("openai");
      throw new ConvexError(
        isKeyMissing
          ? "Mangler OpenAI API-nøkkel på Convex-deploymenten. Sett OPENAI_API_KEY i Convex-dashboardet."
          : `Kunne ikke prosessere filen (embedding feilet): ${msg}`,
      );
    }

    if (!created) {
      await ctx.storage.delete(storageId);
    }

    return { url: await ctx.storage.getUrl(storageId), entryId };
  },
});

export const addWebpage = action({
  args: {
    url: v.string(),
    category: v.optional(v.string()),
    agentId: v.optional(v.id("agents")),
    mode: v.optional(v.union(v.literal("single"), v.literal("crawl"))),
    maxPages: v.optional(v.number()),
    syncIntervalMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      throw new ConvexError("No organization in session. Select an organization in Clerk.");
    }

    const subscription = await ctx.runQuery(
      internal.system.subscriptions.getByOrganizationId,
      { organizationId: orgId },
    );
    const userEmail = await getUserEmailOrNull(ctx);
    if (!hasActiveSubscriptionAccess(orgId, subscription, { userEmail })) {
      throw new ConvexError("Du trenger et aktivt abonnement for å legge til nettsider. Gå til Fakturering for å velge en plan.");
    }

    const queued = await ctx.runMutation(internalApi.system.websites.enqueue, {
      organizationId: orgId,
      agentId: args.agentId,
      url: args.url,
      category: args.category,
      mode: args.mode,
      maxPages: args.maxPages,
      syncIntervalMinutes: args.syncIntervalMinutes,
    });

    return {
      sourceId: queued.sourceId,
      runId: queued.runId,
      status: queued.status,
      url: queued.url,
      title: queued.url,
      alreadyQueued: queued.alreadyQueued,
    };
  },
});

export const deleteWebsiteSource = action({
  args: {
    sourceId: v.id("websiteSources"),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      throw new ConvexError("No organization in session. Select an organization in Clerk.");
    }

    const source = await ctx.runQuery(internalApi.system.websites.getSourceById, {
      sourceId: args.sourceId,
    });
    if (!source || source.organizationId !== orgId) {
      throw new ConvexError("Nettsidekilden ble ikke funnet.");
    }

    const deletedRuns = await ctx.runMutation(internalApi.system.websites.finalizeDeleteSource, {
      sourceId: source._id,
    });
    const deletedPages = await ctx.runMutation(internalApi.system.websites.deleteSourcePages, {
      sourceId: source._id,
    });

    return {
      deletedPages: deletedPages.deletedPages,
      deletedRuns: deletedRuns.deletedRuns,
    };
  },
});

export const pauseWebsiteSource = action({
  args: {
    sourceId: v.id("websiteSources"),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      throw new ConvexError("No organization in session. Select an organization in Clerk.");
    }

    const source = await ctx.runQuery(internalApi.system.websites.getSourceById, {
      sourceId: args.sourceId,
    });
    if (!source || source.organizationId !== orgId) {
      throw new ConvexError("Nettsidekilden ble ikke funnet.");
    }

    return await ctx.runMutation(internalApi.system.websites.pauseSource, {
      sourceId: source._id,
    });
  },
});

export const resumeWebsiteSource = action({
  args: {
    sourceId: v.id("websiteSources"),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      throw new ConvexError("No organization in session. Select an organization in Clerk.");
    }

    const source = await ctx.runQuery(internalApi.system.websites.getSourceById, {
      sourceId: args.sourceId,
    });
    if (!source || source.organizationId !== orgId) {
      throw new ConvexError("Nettsidekilden ble ikke funnet.");
    }

    return await ctx.runMutation(internalApi.system.websites.resumeSource, {
      sourceId: source._id,
    });
  },
});

export const list = query({
  args: {
    category: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
    agentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) return { page: [], isDone: true, continueCursor: "" };

    const namespace = agentNamespace(orgId, args.agentId);
    const ns = await rag.getNamespace(ctx, { namespace });
    if (!ns) return { page: [], isDone: true, continueCursor: "" };

    const results = await rag.list(ctx, {
      namespaceId: ns.namespaceId,
      paginationOpts: args.paginationOpts,
    });

    const files = await Promise.all(
      results.page.map((entry) => convertEntryToPublicFile(ctx, entry)),
    );

    const filteredFiles = args.category
      ? files.filter((file) => file.category === args.category)
      : files;

    return {
      page: filteredFiles,
      isDone: results.isDone,
      continueCursor: results.continueCursor,
    };
  },
});

export const listWebsiteSources = query({
  args: {
    agentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      return [];
    }

    const sources = await ctx.db
      .query("websiteSources")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .collect();

    return sources
      .filter((source) => source.agentId === args.agentId)
      .sort((left, right) => right.updatedAt - left.updatedAt)
      .map((source) => ({
        id: source._id,
        rootUrl: source.rootUrl,
        host: source.host,
        status: source.status,
        mode: source.mode,
        maxPages: source.maxPages,
        category: source.category,
        lastError: source.lastError,
        lastRunAt: source.lastRunAt,
        lastCompletedAt: source.lastCompletedAt,
        lastIndexedCount: source.lastIndexedCount,
      }));
  },
});

export type PublicFile = {
  id: EntryId;
  name: string;
  type: string;
  size: string;
  status: "ready" | "processing" | "error";
  url: string | null;
  category?: string;
  sourceUrl?: string;
};

export type PublicWebsiteSource = {
  id: Id<"websiteSources">;
  rootUrl: string;
  host: string;
  status: "queued" | "running" | "ready" | "error" | "paused";
  mode: "single" | "crawl";
  maxPages: number;
  category?: string;
  lastError?: string;
  lastRunAt?: number;
  lastCompletedAt?: number;
  lastIndexedCount?: number;
};

async function convertEntryToPublicFile(ctx: QueryCtx, entry: Entry): Promise<PublicFile> {
  const metadata = entry.metadata as EntryMetadata | undefined;
  const storageId = metadata?.storageId;

  let fileSize = "unknown";
  if (metadata?.sourceType === "webpage") {
    fileSize = "Nettside";
  } else if (storageId) {
    try {
      const storageMetadata = await ctx.db.system.get(storageId);
      if (storageMetadata) fileSize = formatFileSize(storageMetadata.size);
    } catch (error) {
      console.error("Failed to get storage metadata: ", error);
    }
  }

  const isWeb = metadata?.sourceType === "webpage";
  const filename = isWeb && metadata?.filename ? metadata.filename : entry.key || "Unknown";
  const extension = isWeb ? "web" : filename.split(".").pop()?.toLowerCase() || "txt";

  let status: "ready" | "processing" | "error" = "error";
  if (entry.status === "ready") status = "ready";
  else if (entry.status === "pending") status = "processing";

  const url = storageId
    ? await ctx.storage.getUrl(storageId)
    : isWeb && metadata?.sourceUrl
      ? metadata.sourceUrl
      : null;

  return {
    id: entry.entryId,
    name: filename,
    type: extension,
    size: fileSize,
    status,
    url,
    category: metadata?.category || undefined,
    sourceUrl: isWeb ? metadata?.sourceUrl : undefined,
  };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
