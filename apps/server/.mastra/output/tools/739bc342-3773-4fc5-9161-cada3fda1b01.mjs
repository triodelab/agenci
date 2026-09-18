import { createGraphRAGTool } from '@mastra/rag';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';

const GRAPH_RAG_VECTOR_STORE = "pgVector";
const GRAPH_RAG_INDEX = "embeddings";
const GRAPH_RAG_DIMENSION = 1536;
const GRAPH_RAG_EMBEDDING_MODEL = "openai/text-embedding-3-small";

function createGraphQueryTool(agentId) {
  return createGraphRAGTool({
    vectorStoreName: GRAPH_RAG_VECTOR_STORE,
    indexName: GRAPH_RAG_INDEX,
    model: new ModelRouterEmbeddingModel(GRAPH_RAG_EMBEDDING_MODEL),
    enableFilter: Boolean(agentId),
    graphOptions: {
      dimension: GRAPH_RAG_DIMENSION,
      threshold: 0.7
    },
    ...agentId ? {
      description: `S\xF8k i kunnskapsbasen med GraphRAG. Bruk alltid filter {"agentId":"${agentId}"}.`
    } : {}
  });
}
const graphQueryTool = createGraphQueryTool();

export { createGraphQueryTool, graphQueryTool };
