import { ORPCError } from "@orpc/server";
import { createPrismaClient } from "@agenci/db";
import { privateProcedure } from "@/routers/procedures";
import { registerCustomerServiceAgent } from "@/mastra/register-customer-agent";
import {
  SendChatMessageResponseSchema,
  SendChatMessageSchema,
} from "./schema";

const prisma = createPrismaClient();

export const chatRouter = {
  /**
   * Chat with a tenant agent. Retrieval happens inside the agent's
   * `searchTool`, which is locked to this agent's ingested chunks.
   */
  send: privateProcedure
    .input(SendChatMessageSchema)
    .output(SendChatMessageResponseSchema)
    .handler(async ({ input, context }) => {
      const row = await prisma.agent.findFirst({
        where: { id: input.agentId, organizationId: context.organizationId },
        select: { id: true, name: true, description: true, status: true },
      });

      if (!row) {
        throw new ORPCError("NOT_FOUND", { message: "Agenten ble ikke funnet" });
      }

      if (row.status !== "COMPLETED") {
        throw new ORPCError("CONFLICT", {
          message: "Kunnskapsbasen er ikke ferdig indeksert ennå",
        });
      }

      const agent = registerCustomerServiceAgent(row);
      // Observational Memory runs in thread scope and requires a stable id.
      const threadId = input.threadId ?? crypto.randomUUID();

      const result = await agent.generate(input.message, {
        memory: {
          resource: `${context.organizationId}:${context.userId}`,
          thread: threadId,
        },
      });

      return { threadId, message: result.text };
    }),
};
