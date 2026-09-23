import { embedMany } from "ai";
import { ModelRouterEmbeddingModel } from "@mastra/core/llm";
import { env } from "@agenci/env/server";
import { mastra } from "@/mastra";
import {
  GRAPH_RAG_DIMENSION,
  GRAPH_RAG_EMBEDDING_MODEL,
  GRAPH_RAG_INDEX,
  GRAPH_RAG_VECTOR_STORE,
} from "@/mastra/rag-config";
import type { MarkdownChunk } from "./chunk";

export function knowledgeNamespace(organizationId: string, agentId: string) {
  return `${organizationId}:${agentId}`;
}

const EMBED_BATCH = 64;

const embedder = new ModelRouterEmbeddingModel(GRAPH_RAG_EMBEDDING_MODEL);

export type EmbedChunksInput = {
  chunks: MarkdownChunk[];
  documentId: string;
  organizationId: string;
  agentId: string;
  storageKey: string;
  sourceUrl?: string;
  sourceType?: "webpage" | "document";
};

export type EmbedChunksResult = {
  chunkCount: number;
  namespace: string;
  indexName: string;
};

async function getGraphVectorStore() {
  const vectorStore = mastra.getVector(GRAPH_RAG_VECTOR_STORE);
  if (!vectorStore) {
    throw new Error(`Mastra vector store "${GRAPH_RAG_VECTOR_STORE}" er ikke registrert`);
  }
  return vectorStore;
}

export class InvalidOpenAIKeyError extends Error {
  constructor() {
    super(
      "Ugyldig OPENAI_API_KEY — OpenAI avviste nøkkelen (401). Sett en gyldig nøkkel i apps/server/.env og start serveren på nytt.",
    );
    this.name = "InvalidOpenAIKeyError";
  }
}

export function isInvalidOpenAIKeyError(error: unknown): boolean {
  if (error instanceof InvalidOpenAIKeyError) {
    return true;
  }
  if (!error || typeof error !== "object") {
    return false;
  }
  const err = error as {
    statusCode?: number;
    data?: { error?: { code?: string } };
  };
  return err.statusCode === 401 || err.data?.error?.code === "invalid_api_key";
}

async function ensureIndex() {
  const vectorStore = await getGraphVectorStore();
  await vectorStore.createIndex({
    indexName: GRAPH_RAG_INDEX,
    dimension: GRAPH_RAG_DIMENSION,
  });
  return vectorStore;
}

/**
 * Embed chunks and upsert into Mastra GraphRAG (`pgVector` / `embeddings`).
 * @see https://mastra.ai/reference/rag/graph-rag-guide
 */
export async function embedAndStoreChunks({
  chunks,
  documentId,
  organizationId,
  agentId,
  storageKey,
  sourceUrl,
  sourceType = "document",
}: EmbedChunksInput): Promise<EmbedChunksResult> {
  if (chunks.length === 0) {
    throw new Error("Ingen chunks å embedde");
  }

  if (!env.OPENAI_API_KEY) {
    throw new InvalidOpenAIKeyError();
  }

  const namespace = knowledgeNamespace(organizationId, agentId);
  const vectorStore = await ensureIndex();

  try {
    await vectorStore.deleteVectors({
      indexName: GRAPH_RAG_INDEX,
      filter: { documentId },
    });
  } catch {
    // Index can be empty on first ingest.
  }

  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    const batch = chunks.slice(i, i + EMBED_BATCH);
    try {
      const { embeddings } = await embedMany({
        model: embedder,
        values: batch.map((chunk) => chunk.text),
      });

      if (embeddings.length !== batch.length) {
        throw new Error(
          `Embedding-antall (${embeddings.length}) matcher ikke chunk-antall (${batch.length})`,
        );
      }

      await vectorStore.upsert({
        indexName: GRAPH_RAG_INDEX,
        vectors: embeddings,
        ids: batch.map((_, offset) => `${documentId}:${i + offset}`),
        metadata: batch.map((chunk, offset) => ({
          text: chunk.text,
          namespace,
          agentId,
          organizationId,
          documentId,
          chunkIndex: i + offset,
          section: chunk.section,
          sourceUrl: sourceUrl ?? null,
          sourceType,
          storageKey,
        })),
      });
    } catch (error) {
      if (isInvalidOpenAIKeyError(error)) {
        throw new InvalidOpenAIKeyError();
      }
      throw error;
    }
  }

  return {
    chunkCount: chunks.length,
    namespace,
    indexName: GRAPH_RAG_INDEX,
  };
}
