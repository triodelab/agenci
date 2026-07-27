import { createTool } from "@convex-dev/agent";
import { jsonSchema } from "ai";
import { internal } from "../../../_generated/api";
import rag from "../rag";

type SearchArgs = {
  query: string;
};

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
  handler: async (ctx, args) => {
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

    const orgId = conversation.organizationId;
    const agentId = conversation.agentId;

    // Search agent-specific namespace first, then fall back to org-level namespace
    const agentNamespace = agentId ? `${orgId}:${agentId}` : null;
    const orgNamespace = orgId;

    let searchResult = agentNamespace
      ? await rag.search(ctx, { namespace: agentNamespace, query, limit: 5 })
      : null;

    // If agent-specific search returned nothing, try org-level namespace
    if (!searchResult?.text || searchResult.text.trim().length === 0) {
      searchResult = await rag.search(ctx, { namespace: orgNamespace, query, limit: 5 });
    }

    const trainingBlock: string = await ctx.runQuery(
      internal.private.answerTraining.listRecentForAgent,
      { organizationId: orgId },
    );

    const sources = searchResult.entries
      .map((e: { title?: string | null }) => e.title || null)
      .filter((t: string | null): t is string => t !== null)
      .join(", ");

    const trainingSection = trainingBlock
      ? `\n\nOperatør-godkjente eksempler:\n${trainingBlock}`
      : "";

    if (!searchResult.text || searchResult.text.trim().length === 0) {
      return "Ingen relevante resultater funnet i kunnskapsbasen.";
    }

    return `Kilder: ${sources || "kunnskapsbasen"}\n\n${searchResult.text}${trainingSection}`;
  },
});
