import { createTool } from "@mastra/core/tools";
import { ModelRouterEmbeddingModel } from "@mastra/core/llm";
import { embed } from "ai";
import { z } from "zod";
import { pgVector } from "../vector";
import { GRAPH_RAG_EMBEDDING_MODEL, GRAPH_RAG_INDEX } from "../rag-config";

const embedder = new ModelRouterEmbeddingModel(GRAPH_RAG_EMBEDDING_MODEL);

const DEFAULT_TOP_K = 5;
/** Below this cosine score the chunk is noise rather than an answer. */
const MIN_SCORE = 0.4;

export type KnowledgeSearchResult = {
  text: string;
  section: string | null;
  sourceUrl: string | null;
  score: number;
};

function toResult(match: {
  score?: number;
  metadata?: Record<string, unknown> | null;
}): KnowledgeSearchResult | null {
  const metadata = match.metadata ?? {};
  const text = typeof metadata.text === "string" ? metadata.text.trim() : "";
  if (!text) {
    return null;
  }
  return {
    text,
    section: typeof metadata.section === "string" ? metadata.section : null,
    sourceUrl: typeof metadata.sourceUrl === "string" ? metadata.sourceUrl : null,
    score: match.score ?? 0,
  };
}

/**
 * Semantic search over the chunks ingested for one agent.
 *
 * The `agentId` filter is applied server-side instead of via `enableFilter`, so
 * the model can never widen the search to another tenant's knowledge base.
 */
export function createKnowledgeSearchTool(agentId: string) {
  return createTool({
    id: "search-knowledge-base",
    description:
      "Søk i bedriftens kunnskapsbase (nettsider og opplastede dokumenter). Bruk dette før du svarer på spørsmål om bedriften, tjenestene, priser eller rutiner.",
    inputSchema: z.object({
      query: z
        .string()
        .min(1)
        .describe("Kundens spørsmål, formulert som en søkestreng på norsk."),
      topK: z
        .number()
        .int()
        .min(1)
        .max(10)
        .optional()
        .describe(`Antall tekstbiter å hente. Standard ${DEFAULT_TOP_K}.`),
    }),
    outputSchema: z.object({
      found: z.boolean(),
      results: z.array(
        z.object({
          text: z.string(),
          section: z.string().nullable(),
          sourceUrl: z.string().nullable(),
          score: z.number(),
        }),
      ),
    }),
    execute: async ({ query, topK }) => {
      const { embedding } = await embed({ model: embedder, value: query });

      const matches = await pgVector.query({
        indexName: GRAPH_RAG_INDEX,
        queryVector: embedding,
        topK: topK ?? DEFAULT_TOP_K,
        filter: { agentId },
      });

      const results = matches
        .map(toResult)
        .filter(
          (result): result is KnowledgeSearchResult =>
            result !== null && result.score >= MIN_SCORE,
        );

      return { found: results.length > 0, results };
    },
  });
}
