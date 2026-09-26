import { privateProcedure } from "@/routers/procedures";
import { sendChatMessage } from "./send-chat-message";
import {
  SendChatMessageResponseSchema,
  SendChatMessageSchema,
} from "./schema";

export const chatRouter = {
  /**
   * Chat with a tenant agent (staff test-chat). Retrieval happens inside the
   * agent's `searchTool`, which is locked to this agent's ingested chunks.
   */
  send: privateProcedure
    .input(SendChatMessageSchema)
    .output(SendChatMessageResponseSchema)
    .handler(async ({ input, context }) =>
      sendChatMessage({
        organizationId: context.organizationId,
        agentId: input.agentId,
        message: input.message,
        threadId: input.threadId,
        // Observational Memory runs in thread scope and requires a stable id.
        memoryResourceId: `${context.organizationId}:${context.userId}`,
      }),
    ),
};
