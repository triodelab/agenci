import { openai } from "@ai-sdk/openai";
import { createTool } from "@convex-dev/agent";
import { generateText, jsonSchema } from "ai";
import { internal } from "../../../_generated/api";
import rag from "../rag";
import { SEARCH_INTERPRETER_PROMPT } from "../constants";

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
      return "Missing thread ID";
    }

    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      { threadId: ctx.threadId },
    );

    if (!conversation) {
      return "Conversation not found";
    }

    const orgId = conversation.organizationId;

    // Use per-agent namespace when conversation is linked to an agent
    const namespace = conversation.agentId
      ? `${orgId}:${conversation.agentId}`
      : orgId;

    const searchResult = await rag.search(ctx, {
      namespace,
      query,
      limit: 5,
    });

    const trainingBlock: string = await ctx.runQuery(
      internal.private.answerTraining.listRecentForAgent,
      {
        organizationId: orgId,
      },
    );

    const contextText = `Found results in ${searchResult.entries
      .map((e: { title?: string | null }) => e.title || null)
      .filter((t: string | null): t is string => t !== null)
      .join(", ")}. Here is the context:\n\n${searchResult.text}`;

    const trainingSection = trainingBlock
      ? `\n\nOperatør-godkjente eksempler (bruk tone og formulering når det passer spørsmålet; ved motstrid med søkeresultatene gjelder søkeresultatene for fakta):\n\n${trainingBlock}\n`
      : "";

    const response = await generateText({
      messages: [
        {
          role: "system",
          content: SEARCH_INTERPRETER_PROMPT,
        },
        {
          role: "user",
          content: `User asked: "${query}"${trainingSection}\n\nSearch results: ${contextText}`,
        },
      ],
      model: openai.chat("gpt-4o-mini"),
    });

    return response.text;
  },
});
