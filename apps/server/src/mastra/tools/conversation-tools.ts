import prisma from "@agenci/db";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Conversation status tools for the support agent. The thread id comes from
 * the chat turn (Mastra passes it in the tool context), and the update is
 * scoped to this agent, so the model can only change its own conversation.
 *
 * The widget and the dashboard inbox both read `conversations.status`:
 * - `escalated`: a person from the team takes over; the agent stops replying
 *   (see `modules/widget/router.ts`) until the team hands it back.
 * - `resolved`: done; a new visitor message reopens it.
 */
async function setStatus(
  agentId: string,
  threadId: string | undefined,
  status: "escalated" | "resolved",
) {
  if (!threadId) return false;
  const { count } = await prisma.conversation.updateMany({
    where: { id: threadId, agentId },
    data: { status },
  });
  return count > 0;
}

export function createEscalateConversationTool(agentId: string) {
  return createTool({
    id: "escalate-conversation",
    description:
      "Send samtalen videre til et menneske i teamet. Bruk når kunden ber om et menneske, er tydelig frustrert, eller saken krever noe du ikke kan gjøre (f.eks. refusjon, klage, personlige opplysninger).",
    inputSchema: z.object({
      reason: z
        .string()
        .min(1)
        .describe("Kort grunn på norsk, f.eks. «Kunden vil snakke med et menneske»."),
    }),
    outputSchema: z.object({ ok: z.boolean(), instruction: z.string() }),
    execute: async (_input, ctx) => {
      const ok = await setStatus(agentId, ctx?.agent?.threadId, "escalated");
      return {
        ok,
        instruction: ok
          ? "Si til kunden at du har sendt saken videre til teamet, og at noen svarer her i chatten så snart de kan."
          : "Samtalen kunne ikke eskaleres. Be kunden ta kontakt direkte via bedriftens kontaktinfo.",
      };
    },
  });
}

export function createResolveConversationTool(agentId: string) {
  return createTool({
    id: "resolve-conversation",
    description:
      "Merk samtalen som løst. Bruk bare når kunden har fått svar og selv sier seg fornøyd (f.eks. «takk, det var alt»).",
    inputSchema: z.object({}),
    outputSchema: z.object({ ok: z.boolean() }),
    execute: async (_input, ctx) => ({
      ok: await setStatus(agentId, ctx?.agent?.threadId, "resolved"),
    }),
  });
}
