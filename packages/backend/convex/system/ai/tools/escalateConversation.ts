import { jsonSchema } from "ai";
import { createTool } from "@convex-dev/agent";
import { internal } from "../../../_generated/api";
import { supportAgent } from "../agents/supportAgent";

type EscalateArgs = {
  reason?: string;
};

export const escalateConversation = createTool({
  description: "Escalate a conversation to a human operator",
  args: jsonSchema<EscalateArgs>({
    type: "object",
    properties: {
      reason: {
        type: "string",
        description: "Kort årsak til eskalering (valgfritt)",
      },
    },
    additionalProperties: false,
  }),
  handler: async (ctx, _args) => {
    if (!ctx.threadId) {
      return "Missing thread ID";
    }

    await ctx.runMutation(internal.system.conversations.escalate, {
      threadId: ctx.threadId,
    });

    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: "Conversation escalated to a human operator.",
      },
    });

    return "Conversation escalated to a human operator";
  },
});
