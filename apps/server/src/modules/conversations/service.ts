/**
 * The `conversations` table is the one index every screen reads (inbox,
 * overview, agent list). Messages themselves live in the Mastra memory thread
 * with the same id; these helpers keep the row in step with every message.
 */
import prisma from "@agenci/db";
import { ORPCError } from "@orpc/server";
import { memoryStore } from "@/mastra/store";

const PREVIEW_LENGTH = 500;
const preview = (text: string) => text.trim().slice(0, PREVIEW_LENGTH);

/**
 * A visitor's message arrives. Creates the conversation on the first message,
 * refuses threads that belong to someone else, and reopens a resolved
 * conversation (standard helpdesk behaviour).
 */
export async function recordVisitorMessage(input: {
  threadId: string;
  organizationId: string;
  agentId: string;
  contactSessionId: string;
  text: string;
}) {
  const agent = await prisma.agent.findFirst({
    where: { id: input.agentId, organizationId: input.organizationId },
    select: { id: true },
  });
  if (!agent) {
    throw new ORPCError("NOT_FOUND", { message: "Agenten ble ikke funnet" });
  }

  const existing = await prisma.conversation.findUnique({
    where: { id: input.threadId },
    select: { organizationId: true, contactSessionId: true, status: true },
  });
  if (
    existing &&
    (existing.organizationId !== input.organizationId ||
      existing.contactSessionId !== input.contactSessionId)
  ) {
    throw new ORPCError("FORBIDDEN", { message: "Samtalen tilhører ikke deg" });
  }

  const now = new Date();
  const text = preview(input.text);
  if (!existing) {
    await prisma.conversation.create({
      data: {
        id: input.threadId,
        organizationId: input.organizationId,
        agentId: input.agentId,
        contactSessionId: input.contactSessionId,
        firstMessage: text,
        lastMessage: text,
        lastMessageRole: "user",
        messageCount: 1,
        lastMessageAt: now,
      },
    });
    return;
  }
  await prisma.conversation.update({
    where: { id: input.threadId },
    data: {
      lastMessage: text,
      lastMessageRole: "user",
      messageCount: { increment: 1 },
      lastMessageAt: now,
      ...(existing.status === "resolved" ? { status: "unresolved" } : {}),
    },
  });
}

/** The agent replied. */
export async function recordAgentReply(threadId: string, text: string) {
  await prisma.conversation.update({
    where: { id: threadId },
    data: {
      lastMessage: preview(text),
      lastMessageRole: "assistant",
      messageCount: { increment: 1 },
      lastMessageAt: new Date(),
    },
  });
}

/** Removes the Mastra threads (messages + memory) behind these conversations. */
export async function deleteConversationThreads(threadIds: string[]) {
  if (threadIds.length === 0) return;
  const storage = await memoryStore.getStore("memory");
  if (!storage) return;
  for (const threadId of threadIds) {
    await storage.deleteThread({ threadId }).catch(() => undefined);
  }
}
