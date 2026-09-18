import { NonRetriableError, type InngestFunction } from "inngest";
import prisma from "@agenci/db";
import {
  isInvalidLlamaKeyError,
  parseDocumentToMarkdown,
} from "@/lib/llama";
import { fileExists, readFileBytes, uploadMarkdown } from "@/lib/s3-client";
import { chunkMarkdown, embedAndStoreChunks } from "@/modules/ingest/service";
import { isInvalidOpenAIKeyError } from "@/modules/ingest/embedding";
import { inngest, uploadDocumentEvent } from "@/inngest/client";

async function markFailed(documentId: string | null | undefined) {
  if (!documentId) {
    return;
  }
  await prisma.document.update({
    where: { id: documentId },
    data: { status: "FAILED" },
  });
}

function documentIdFromFailureEvent(event: unknown) {
  if (!event || typeof event !== "object") {
    return null;
  }
  const data = "data" in event ? event.data : null;
  if (!data || typeof data !== "object") {
    return null;
  }

  if (
    "documentId" in data &&
    typeof data.documentId === "string" &&
    data.documentId.length > 0
  ) {
    return data.documentId;
  }

  const original =
    "event" in data && data.event && typeof data.event === "object"
      ? data.event
      : null;
  const originalData =
    original && "data" in original && original.data && typeof original.data === "object"
      ? original.data
      : null;
  if (
    originalData &&
    "documentId" in originalData &&
    typeof originalData.documentId === "string" &&
    originalData.documentId.length > 0
  ) {
    return originalData.documentId;
  }

  return null;
}

export const uploadDocumentTask: InngestFunction.Any = inngest.createFunction(
  {
    id: "upload-document-task",
    triggers: [uploadDocumentEvent],
    retries: 3,
    onFailure: async ({ event }: { event: unknown }) => {
      await markFailed(documentIdFromFailureEvent(event));
    },
  },
  async ({ event, step, logger }) => {
    const { documentId, s3Key, agentId, organizationId, fileName } = event.data;

    await step.run("mark-processing", async () => {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "PROCESSING" },
      });
    });

    await step.run("get-document", async () => {
      if (!(await fileExists(s3Key))) {
        await markFailed(documentId);
        throw new NonRetriableError("Dokumentet ble ikke funnet i S3");
      }
      return s3Key;
    });

    const parsedDocument = await step.run("parse-document", async () => {
      try {
        const bytes = await readFileBytes(s3Key);
        return await parseDocumentToMarkdown({
          bytes,
          fileName,
        });
      } catch (error) {
        if (isInvalidLlamaKeyError(error)) {
          await markFailed(documentId);
          throw new NonRetriableError(
            error instanceof Error
              ? error.message
              : "Ugyldig LLAMA_API_KEY eller feil Llama Cloud-region",
          );
        }
        throw error;
      }
    });

    const markdown = parsedDocument.markdown?.trim();
    if (!markdown) {
      await step.run("mark-failed-empty-parse", async () => {
        await markFailed(documentId);
      });
      throw new NonRetriableError("LlamaParse returnerte ingen markdown");
    }

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
        await markFailed(documentId);
      });
      throw new NonRetriableError(
        "Ingen tekst-chunks etter oppsplitting av markdown",
      );
    }

    const ingest = await step.run("embed-chunks", async () => {
      try {
        return await embedAndStoreChunks({
          chunks,
          documentId,
          organizationId,
          agentId,
          storageKey: markdownKey,
          sourceType: "document",
        });
      } catch (error) {
        if (isInvalidOpenAIKeyError(error)) {
          await markFailed(documentId);
          throw new NonRetriableError(
            error instanceof Error ? error.message : "Ugyldig OPENAI_API_KEY",
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
    });

    logger.info("document ingest complete", {
      documentId,
      agentId,
      chunkCount: ingest.chunkCount,
    });

    return {
      ok: true as const,
      documentId,
      markdownKey,
      chunkCount: ingest.chunkCount,
    };
  },
);
