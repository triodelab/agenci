import { createGraphRAGTool } from "@mastra/rag";
import { ModelRouterEmbeddingModel } from "@mastra/core/llm";
import {
  GRAPH_RAG_DIMENSION,
  GRAPH_RAG_EMBEDDING_MODEL,
  GRAPH_RAG_INDEX,
  GRAPH_RAG_VECTOR_STORE,
} from "../rag-config";

export function createGraphQueryTool(
  agentId?: string,
): ReturnType<typeof createGraphRAGTool> {
  return createGraphRAGTool({
    vectorStoreName: GRAPH_RAG_VECTOR_STORE,
    indexName: GRAPH_RAG_INDEX,
    model: new ModelRouterEmbeddingModel(GRAPH_RAG_EMBEDDING_MODEL),
    enableFilter: Boolean(agentId),
    graphOptions: {
      dimension: GRAPH_RAG_DIMENSION,
      threshold: 0.7,
    },
    ...(agentId
      ? {
          description: `Søk i kunnskapsbasen med GraphRAG. Bruk alltid filter {"agentId":"${agentId}"}.`,
        }
      : {}),
  });
}

export const graphQueryTool: ReturnType<typeof createGraphRAGTool> =
  createGraphQueryTool();
