import { NonRetriableError, type InngestFunction } from "inngest";
import prisma from "@agenci/db";
import { scrapeWebsiteForAgentOnboarding } from "@/lib/firecrawl";
import { uploadMarkdown } from "@/lib/s3-client";
import { upsertAgentWidgetBrand } from "@/modules/agents/branding";
import { chunkMarkdown, embedAndStoreChunks } from "@/modules/ingest/service";
import { isInvalidOpenAIKeyError } from "@/modules/ingest/embedding";
import { registerCustomerServiceAgentById } from "@/mastra/register-customer-agent";
import { agentOnboardingEvent, inngest } from "../client";

async function markFailed(documentId: string, agentId: string) {
  await prisma.document.update({
    where: { id: documentId },
    data: { status: "FAILED" },
  });
  await prisma.agent.update({
    where: { id: agentId },
    data: { status: "FAILED" },
  });
}

export const processAgentOnboarding: InngestFunction.Any = inngest.createFunction(
  {
    id: "process-agent-onboarding",
    triggers: [agentOnboardingEvent],
    retries: 3,
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

    await step.run("upsert-branding", async () => {
      await upsertAgentWidgetBrand({
        agentId,
        organizationId,
        sourceUrl: url,
        branding: scraped.branding,
      });
    });

    const markdownKey = await step.run("upload-markdown", async () => {
      const key = `${organizationId}/${agentId}/${documentId}.md`;
      return uploadMarkdown(key, markdown);
    });

    await step.run("persist-document", async () => {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: "INDEXING",
          markdownContent: markdown,
          markdownKey,
        },
      });
    });

    const chunks = await step.run("chunk-markdown", async () => {
      return chunkMarkdown(markdown);
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
          storageKey: markdownKey,
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

    await step.run("mark-completed", async () => {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "COMPLETED" },
      });
      await prisma.agent.update({
        where: { id: agentId },
        data: { status: "COMPLETED" },
      });
    });

    await step.run("register-mastra-agent", async () => {
      await registerCustomerServiceAgentById(agentId);
      return { agentId };
    });

    logger.info("agent onboarding complete", {
      agentId,
      documentId,
      chunkCount: ingest.chunkCount,
    });
    return {
      ok: true as const,
      agentId,
      documentId,
      markdownKey,
      chunkCount: ingest.chunkCount,
    };
  },
);
