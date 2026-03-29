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
import { extractHtmlTitle, htmlToPlainText } from "../lib/htmlToPlainText";
import { assertPublicHttpUrl } from "../lib/publicHttpUrl";
import { extractTextContent } from "../lib/extractTextContent";
import rag from "../system/ai/rag";
import { Id } from "../_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import { internal } from "../_generated/api";

function guessMimeType(filename: string, bytes: ArrayBuffer): string {
  return (
    guessMimeTypeFromExtension(filename) ||
    guessMimeTypeFromContents(bytes) ||
    "application/octet-stream"
  );
};

export const deleteFile = mutation({
  args: {
    entryId: vEntryId,
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);

    if (!orgId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message:
          "No organization in session. Select an organization in Clerk (JWT template must include orgId).",
      });
    }

    const namespace = await rag.getNamespace(ctx, {
      namespace: orgId,
    });

    if (!namespace) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid namespace",
      });
    }

    const entry = await rag.getEntry(ctx, {
      entryId: args.entryId,
    });

    if (!entry) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Entry not found",
      });
    }

    if (entry.metadata?.uploadedBy !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid Organization ID",
      });
    }

    const meta = entry.metadata as EntryMetadata | undefined;
    if (meta?.storageId) {
      await ctx.storage.delete(meta.storageId as Id<"_storage">);
    }

    await rag.deleteAsync(ctx, {
      entryId: args.entryId
    });
  },
});

export const addFile = action({
  args: {
    filename: v.string(),
    mimeType: v.string(),
    bytes: v.bytes(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);

    if (!orgId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message:
          "No organization in session. Select an organization in Clerk (JWT template must include orgId).",
      });
    }

    const subscription = await ctx.runQuery(
      internal.system.subscriptions.getByOrganizationId,
      {
        organizationId: orgId,
      },
    );

    const userEmail = await getUserEmailOrNull(ctx);

    if (!hasActiveSubscriptionAccess(orgId, subscription, { userEmail })) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Missing subscription"
      });
    }

    const { bytes, filename, category } = args;

    const mimeType = args.mimeType || guessMimeType(filename, bytes);
    const blob = new Blob([bytes], { type: mimeType });

    const storageId = await ctx.storage.store(blob);

    const text = await extractTextContent(ctx, {
      storageId,
      filename,
      bytes,
      mimeType,
    });

    const { entryId, created } = await rag.add(ctx, {
      // SUPER IMPORTANT: What search space to add this to. You cannot search across namespaces,
      // If not added, it will be considered global (we do not want this)
      namespace: orgId,
      text,
      key: filename,
      title: filename,
      metadata: {
        storageId, // Important for file deletion
        uploadedBy: orgId, // Important for deletion
        filename,
        category: category ?? null,
      } as EntryMetadata,
      contentHash: await contentHashFromArrayBuffer(bytes) // To avoid re-inserting if the file content hasn't changed
    });

    if (!created) {
      console.debug("entry already exists, skipping upload metadata");
      await ctx.storage.delete(storageId);
    }

    return {
      url: await ctx.storage.getUrl(storageId),
      entryId,
    };
  },
});

const MAX_WEB_HTML_CHARS = 2_000_000;
const MIN_WEB_TEXT_CHARS = 40;

export const addWebpage = action({
  args: {
    url: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);

    if (!orgId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message:
          "No organization in session. Select an organization in Clerk (JWT template must include orgId).",
      });
    }

    const subscription = await ctx.runQuery(
      internal.system.subscriptions.getByOrganizationId,
      {
        organizationId: orgId,
      },
    );

    const userEmail = await getUserEmailOrNull(ctx);

    if (!hasActiveSubscriptionAccess(orgId, subscription, { userEmail })) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Missing subscription",
      });
    }

    const publicUrl = assertPublicHttpUrl(args.url);
    const normalizedUrl = publicUrl.toString();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25_000);

    let response: Response;
    try {
      response = await fetch(normalizedUrl, {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5",
          "User-Agent": "AgenciKnowledgeBot/1.0",
        },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: `Kunne ikke hente siden: ${msg}`,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: `HTTP ${response.status} fra serveren`,
      });
    }

    const contentType = (response.headers.get("content-type") ?? "").toLowerCase();
    let html = await response.text();
    const looksHtml =
      contentType.includes("text/html") ||
      contentType.includes("application/xhtml") ||
      contentType.includes("text/plain") ||
      /^\s*</.test(html.slice(0, 800));
    if (!looksHtml) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message:
          "URL-en ser ikke ut som en vanlig nettside (HTML). Prøv en annen adresse eller last opp som fil.",
      });
    }

    if (html.length > MAX_WEB_HTML_CHARS) {
      html = html.slice(0, MAX_WEB_HTML_CHARS);
    }

    const plain = htmlToPlainText(html);
    if (plain.length < MIN_WEB_TEXT_CHARS) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message:
          "For lite tekst hentet fra siden (kanskje JavaScript-app eller blokkert innhold). Prøv en annen URL eller last opp som fil.",
      });
    }

    const titleFromPage = extractHtmlTitle(html);
    const displayName =
      titleFromPage ?? `${publicUrl.hostname}${publicUrl.pathname}`;

    const textBytes = new TextEncoder().encode(plain);

    const { entryId, created } = await rag.add(ctx, {
      namespace: orgId,
      text: plain,
      key: normalizedUrl,
      title: displayName,
      metadata: {
        uploadedBy: orgId,
        filename: displayName,
        category: args.category ?? null,
        sourceType: "webpage",
        sourceUrl: normalizedUrl,
      } as EntryMetadata,
      contentHash: await contentHashFromArrayBuffer(textBytes.buffer),
    });

    if (!created) {
      console.debug("webpage entry unchanged, skipping duplicate");
    }

    return { entryId, url: normalizedUrl, title: displayName };
  },
});

export const list = query({
  args: {
    category: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);

    if (!orgId) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const namespace = await rag.getNamespace(ctx, {
      namespace: orgId,
    });

    if (!namespace) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const results = await rag.list(ctx, {
      namespaceId: namespace.namespaceId,
      paginationOpts: args.paginationOpts,
    });

    const files = await Promise.all(
      results.page.map((entry) => convertEntryToPublicFile(ctx, entry))
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

export type PublicFile = {
  id: EntryId,
  name: string;
  type: string;
  size: string;
  status: "ready" | "processing" | "error";
  url: string | null;
  category?: string;
  /** Ekstern lenke når kilden er importert nettside */
  sourceUrl?: string;
};

type EntryMetadata = {
  storageId?: Id<"_storage">;
  uploadedBy: string;
  filename: string;
  category: string | null;
  sourceType?: "file" | "webpage";
  sourceUrl?: string;
};

async function convertEntryToPublicFile(
  ctx: QueryCtx,
  entry: Entry,
): Promise<PublicFile> {
  const metadata = entry.metadata as EntryMetadata | undefined;
  const storageId = metadata?.storageId;

  let fileSize = "unknown";

  if (metadata?.sourceType === "webpage") {
    fileSize = "Nettside";
  } else if (storageId) {
    try {
      const storageMetadata = await ctx.db.system.get(storageId);
      if (storageMetadata) {
        fileSize = formatFileSize(storageMetadata.size);
      }
    } catch (error) {
      console.error("Failed to get storage metadata: ", error);
    }
  }

  const isWeb = metadata?.sourceType === "webpage";
  const filename =
    isWeb && metadata?.filename
      ? metadata.filename
      : entry.key || "Unknown";
  const extension = isWeb
    ? "web"
    : filename.split(".").pop()?.toLowerCase() || "txt";

  let status: "ready" | "processing" | "error" = "error";
  if (entry.status === "ready") {
    status = "ready"
  } else if (entry.status === "pending") {
    status = "processing"
  }

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
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
};
