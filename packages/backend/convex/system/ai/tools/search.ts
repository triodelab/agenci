import { createTool } from "@convex-dev/agent";
import { jsonSchema } from "ai";
import { internal } from "../../../_generated/api";
import rag from "../rag";

type SearchArgs = {
  query: string;
};

type RagSearchResult = Awaited<ReturnType<typeof rag.search>>;

export const search = createTool({
  description:
    "Search the knowledge base for relevant information to help answer user questions",
  args: jsonSchema<SearchArgs>({
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query to find relevant information",
      },
    },
    required: ["query"],
    additionalProperties: false,
  }),
  handler: async (ctx, args): Promise<string> => {
    const { query } = args as SearchArgs;
    if (!ctx.threadId) {
      return "No results found.";
    }

    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      { threadId: ctx.threadId },
    );

    if (!conversation) {
      return "No results found.";
    }

    const orgId: string = conversation.organizationId;
    const agentId: string | undefined = conversation.agentId;
    const agentNs: string | null = agentId ? `${orgId}:${agentId}` : null;

    // Search agent-specific namespace first, then fall back to org-level
    let searchResult: RagSearchResult | null = agentNs
      ? await rag.search(ctx, { namespace: agentNs, query, limit: 5 })
      : null;

    if (!searchResult?.text || searchResult.text.trim().length === 0) {
      searchResult = await rag.search(ctx, { namespace: orgId, query, limit: 5 });
    }

    const trainingBlock: string = await ctx.runQuery(
      internal.private.answerTraining.listRecentForAgent,
      { organizationId: orgId },
    );

    const sources: string = (searchResult?.entries ?? [])
      .map((e: { title?: string | null }) => e.title || null)
      .filter((t: string | null): t is string => t !== null)
      .join(", ");

    const trainingSection = trainingBlock
      ? `\n\nOperatør-godkjente eksempler:\n${trainingBlock}`
      : "";

    if (!searchResult?.text || searchResult.text.trim().length === 0) {
      return "Ingen relevante resultater funnet i kunnskapsbasen.";
    }

    return `Kilder: ${sources || "kunnskapsbasen"}\n\n${searchResult.text}${trainingSection}`;
  },
});
