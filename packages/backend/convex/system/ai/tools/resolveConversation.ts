import { jsonSchema } from "ai";
import { createTool } from "@convex-dev/agent";
import { internal } from "../../../_generated/api";
import { supportAgent } from "../agents/supportAgent";

type ResolveArgs = {
  summary?: string;
};

export const resolveConversation = createTool({
  description:
    "Mark the conversation as resolved when the user's issue is fully addressed",
  args: jsonSchema<ResolveArgs>({
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "Kort oppsummering av løsningen (valgfritt)",
      },
    },
    additionalProperties: false,
  }),
  handler: async (ctx, _args) => {
    if (!ctx.threadId) {
      return "Missing thread ID";
    }

    await ctx.runMutation(internal.system.conversations.resolve, {
      threadId: ctx.threadId,
    });

    const avslutningTilKunde =
      "Takk for at du skrev til oss — bare ta kontakt igjen om du lurer på noe mer. Ha en fin dag!";

    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: avslutningTilKunde,
      },
    });

    return avslutningTilKunde;
  },
});
