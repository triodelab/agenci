import { contentHashFromArrayBuffer } from "@convex-dev/rag";
import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { ActionCtx } from "../_generated/server";
import { extractHtmlTitle, htmlToPlainText } from "./htmlToPlainText";
import rag from "../system/ai/rag";

const MIN_WEB_TEXT_CHARS = 40;

export type EntryMetadata = {
  storageId?: Id<"_storage">;
  uploadedBy: string;
  filename: string;
  category: string | null;
  sourceType?: "file" | "webpage";
  sourceUrl?: string;
  agentId?: string | null;
  websiteSourceId?: string;
};

export function agentNamespace(
  orgId: string,
  agentId?: Id<"agents"> | null,
): string {
  return agentId ? `${orgId}:${agentId}` : orgId;
}

export async function upsertWebpageEntry(
  ctx: ActionCtx,
  args: {
    organizationId: string;
    agentId?: Id<"agents">;
    websiteSourceId?: Id<"websiteSources">;
    url: string;
    html: string;
    category?: string;
  },
) {
  const plain = htmlToPlainText(args.html);
  if (plain.length < MIN_WEB_TEXT_CHARS) {
    throw new ConvexError(
      "For lite tekst hentet fra siden (kanskje JavaScript-app eller blokkert innhold). Prøv en annen URL eller last opp som fil.",
    );
  }

  const titleFromPage = extractHtmlTitle(args.html);
  const publicUrl = new URL(args.url);
  const displayName =
    titleFromPage ?? `${publicUrl.hostname}${publicUrl.pathname}`;
  const textBytes = new TextEncoder().encode(plain);

  const metadata: EntryMetadata = {
    uploadedBy: args.organizationId,
    filename: displayName,
    category: args.category ?? null,
    sourceType: "webpage",
    sourceUrl: args.url,
    agentId: args.agentId ?? null,
  };
  if (args.websiteSourceId) {
    metadata.websiteSourceId = args.websiteSourceId;
  }

  let entryId: string;
  let created: boolean;
  try {
    ({ entryId, created } = await rag.add(ctx, {
      namespace: agentNamespace(args.organizationId, args.agentId),
      text: plain,
      key: args.url,
      title: displayName,
      metadata,
      contentHash: await contentHashFromArrayBuffer(textBytes.buffer),
    }));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isKeyMissing =
      msg.toLowerCase().includes("api key") ||
      msg.toLowerCase().includes("openai");
    throw new ConvexError(
      isKeyMissing
        ? "Mangler OpenAI API-nøkkel på Convex-deploymenten. Sett OPENAI_API_KEY i Convex-dashboardet."
        : `Kunne ikke indeksere nettsiden (embedding feilet): ${msg}`,
    );
  }

  if (!created) {
    console.debug("webpage entry unchanged, skipping duplicate");
  }

  return { entryId, url: args.url, title: displayName, created };
}
