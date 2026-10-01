import { NonRetriableError, type InngestFunction } from "inngest";
import prisma from "@agenci/db";
import {
  mapWebsite,
  type ScrapedPage,
  scrapePages,
  scrapeWebsiteForAgentOnboarding,
} from "@/lib/firecrawl";
import { upsertAgentWidgetBrand } from "@/modules/agents/branding";
import { syncAgentStatus } from "@/modules/agents/status";
import {
  chunkMarkdown,
  embedAndStoreChunks,
  type MarkdownChunk,
} from "@/modules/ingest/service";
import { isInvalidOpenAIKeyError } from "@/modules/ingest/embedding";
import { agentOnboardingEvent, inngest } from "../client";

/**
 * Website ingest — used both when an agent is created and when a page is
 * added later (`agents.addWebpage`):
 *
 *   Firecrawl scrape (markdown + branding) → for a site root, also every page
 *   of the site (map + batch scrape, incl. product data) → chunk → embed → pgvector
 *   (metadata `organizationId` + `agentId`) → agent status from its sources
 *   (see `syncAgentStatus`), which registers the Mastra agent once ready.
 */
async function markFailed(documentId: string, agentId: string) {
  await prisma.document.update({
    where: { id: documentId },
    data: { status: "FAILED" },
  });
  await syncAgentStatus(agentId);
}

/** A site root (no path) is read whole; a specific page only itself. */
function isSiteRoot(url: string) {
  try {
    return new URL(url).pathname.replace(/\/+$/, "") === "";
  } catch {
    return false;
  }
}

/** One extra chunk per product: what product cards and product search use. */
function productChunk(page: ScrapedPage): MarkdownChunk | null {
  const p = page.product;
  if (!p) return null;
  const lines = [
    `Produkt: ${p.title}`,
    p.category ? `Kategori: ${p.category}` : null,
    p.price ? `Pris: ${p.price}` : null,
    p.inStock === null ? null : `Lager: ${p.inStock ? "På lager" : "Utsolgt"}`,
    p.description ? `Beskrivelse: ${p.description}` : null,
    `Lenke: ${p.url}`,
  ].filter(Boolean);
  return {
    text: lines.join("\n"),
    section: p.title,
    sourceUrl: p.url,
    meta: {
      kind: "product",
      productTitle: p.title,
      productPrice: p.price,
      productImage: p.image,
      productUrl: p.url,
      productInStock: p.inStock,
    },
  };
}

// Keeps the step payloads well under Inngest limits on very large pages.
const MAX_PAGE_CHARS = 30_000;

function eventData(event: unknown): { documentId?: string; agentId?: string } {
  const data = (event as { data?: { event?: { data?: unknown } } } | null)?.data
    ?.event?.data;
  return (data && typeof data === "object" ? data : {}) as {
    documentId?: string;
    agentId?: string;
  };
}

export const processAgentOnboarding: InngestFunction.Any = inngest.createFunction(
  {
    id: "process-agent-onboarding",
    triggers: [agentOnboardingEvent],
    retries: 3,
    // Retries used up (e.g. Firecrawl down): don't leave the source "Lærer" forever.
    onFailure: async ({ event }: { event: unknown }) => {
      const { documentId, agentId } = eventData(event);
      if (documentId && agentId) {
        await markFailed(documentId, agentId).catch(() => undefined);
      }
    },
  },
  async ({ event, step, logger }) => {
    const { url, agentId, organizationId, documentId } = event.data;

    await step.run("mark-processing", async () => {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "PROCESSING" },
      });
    });

    const scraped = await step.run("scrape-website", async () => {
      return scrapeWebsiteForAgentOnboarding(url);
    });

    const markdown = scraped.markdown;
    if (!markdown) {
      await step.run("mark-failed", async () => {
        await markFailed(documentId, agentId);
      });
      throw new NonRetriableError("Firecrawl returned no markdown");
    }

    // Logo and colours come from the agent's first website; pages added later
    // don't overwrite them (or what the customer picked in customization).
    await step.run("upsert-branding", async () => {
      const existing = await prisma.agentWidgetBrand.findUnique({
        where: { agentId },
        select: { id: true },
      });
      if (existing) return { skipped: true };
      await upsertAgentWidgetBrand({
        agentId,
        organizationId,
        sourceUrl: url,
        branding: scraped.branding,
      });
      return { skipped: false };
    });

    await step.run("persist-document", async () => {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: "INDEXING",
          markdownContent: markdown,
        },
      });
    });

    // Whole website: every other page of the site, with product data.
    const pages = (await step.run("scrape-site-pages", async () => {
      if (!isSiteRoot(url)) return [] as ScrapedPage[];
      const urls = (await mapWebsite(url)).slice(1);
      const scrapedPages = await scrapePages(urls);
      return scrapedPages.map((pg) => ({ ...pg, markdown: pg.markdown.slice(0, MAX_PAGE_CHARS) }));
    })) as ScrapedPage[];

    if (pages.length > 0) {
      await step.run("persist-site-markdown", async () => {
        await prisma.document.update({
          where: { id: documentId },
          data: {
            markdownContent: [markdown, ...pages.map((pg) => `# Side: ${pg.url}\n\n${pg.markdown}`)].join("\n\n---\n\n"),
          },
        });
      });
    }

    const chunks = await step.run("chunk-markdown", async () => {
      const all: MarkdownChunk[] = (await chunkMarkdown(markdown)).map((c) => ({ ...c, sourceUrl: url }));
      for (const pg of pages) {
        for (const c of await chunkMarkdown(pg.markdown)) all.push({ ...c, sourceUrl: pg.url });
        const product = productChunk(pg);
        if (product) all.push(product);
      }
      return all;
    });

    if (chunks.length === 0) {
      await step.run("mark-failed-empty-chunks", async () => {
        await markFailed(documentId, agentId);
      });
      throw new NonRetriableError("Ingen tekst-chunks etter oppsplitting av markdown");
    }

    const ingest = await step.run("embed-chunks", async () => {
      try {
        return await embedAndStoreChunks({
          chunks,
          documentId,
          organizationId,
          agentId,
          storageKey: documentId,
          sourceUrl: url,
          sourceType: "webpage",
        });
      } catch (error) {
        if (isInvalidOpenAIKeyError(error)) {
          await markFailed(documentId, agentId);
          throw new NonRetriableError(
            error instanceof Error
              ? error.message
              : "Ugyldig OPENAI_API_KEY",
          );
        }
        throw error;
      }
    });

    // Marks the source done, sets the agent COMPLETED and registers it with Mastra.
    await step.run("mark-completed", async () => {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "COMPLETED" },
      });
      return { agentStatus: await syncAgentStatus(agentId) };
    });

    logger.info("agent onboarding complete", {
      agentId,
      documentId,
      chunkCount: ingest.chunkCount,
      pageCount: pages.length + 1,
      productCount: pages.filter((pg) => pg.product).length,
    });
    return {
      ok: true as const,
      agentId,
      documentId,
      chunkCount: ingest.chunkCount,
    };
  },
);
