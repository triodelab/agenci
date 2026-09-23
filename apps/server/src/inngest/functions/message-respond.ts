/**
 * Stub — persist Message + Mastra reply in a later phase.
 */
import type { InngestFunction } from "inngest";
import { inngest, messageRespondEvent } from "../client";

export const messageRespond: InngestFunction.Any = inngest.createFunction(
  {
    id: "message-respond",
    triggers: [messageRespondEvent],
    idempotency: "event.data.messageId",
  },
  async ({ event, logger }) => {
    logger.info("message.respond received", {
      messageId: event.data.messageId,
      conversationId: event.data.conversationId,
    });
    return { ok: true as const, messageId: event.data.messageId };
  },
);
