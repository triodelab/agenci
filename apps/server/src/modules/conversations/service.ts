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
    return "unresolved" as const;
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
  // The status after this message: "escalated" means the team has it.
  return existing.status === "resolved" ? ("unresolved" as const) : existing.status;
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

// ─── Thread messages (Mastra memory) ────────────────────────────────────────

export type ThreadMessage = {
  id: string;
  role: "user" | "assistant";
  /** Who wrote it: the visitor, the AI agent, or a person from the team. */
  author: "visitor" | "agent" | "team";
  authorName: string | null;
  text: string;
  createdAt: string;
};

async function memoryStorage() {
  const storage = await memoryStore.getStore("memory");
  if (!storage) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Samtalelageret er ikke tilgjengelig",
    });
  }
  return storage;
}

type StoredMessage = Awaited<
  ReturnType<Awaited<ReturnType<typeof memoryStorage>>["listMessages"]>
>["messages"][number];

function textOf(message: StoredMessage): string {
  const content = message.content as unknown as {
    parts?: { type?: string; text?: string }[];
    content?: string;
  };
  const fromParts = (content?.parts ?? [])
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text as string)
    .join("\n")
    .trim();
  return (
    fromParts ||
    (typeof content?.content === "string" ? content.content.trim() : "")
  );
}

/** Visible messages of a conversation, oldest first (tool calls left out). */
export async function listThreadMessages(threadId: string): Promise<ThreadMessage[]> {
  const storage = await memoryStorage();
  const { messages } = await storage.listMessages({ threadId, perPage: false });
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      const meta = (m.content as { metadata?: Record<string, unknown> })
        ?.metadata;
      const team = meta?.author === "team";
      return {
        id: m.id,
        role: m.role as "user" | "assistant",
        author: (m.role === "user" ? "visitor" : team ? "team" : "agent") as
          | "visitor"
          | "agent"
          | "team",
        authorName:
          team && typeof meta?.authorName === "string" ? meta.authorName : null,
        text: textOf(m),
        createdAt: new Date(m.createdAt).toISOString(),
      };
    })
    .filter((m) => m.text.length > 0)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/**
 * Writes a message straight into the Mastra thread (no model call): a
 * visitor message while the team has the conversation, or a reply from the
 * team. The agent sees them as normal history when it takes over again.
 */
export async function appendThreadMessage(input: {
  threadId: string;
  resourceId: string;
  role: "user" | "assistant";
  text: string;
  metadata?: Record<string, unknown>;
}) {
  const storage = await memoryStorage();
  const now = new Date();
  const thread = await storage.getThreadById({ threadId: input.threadId });
  if (!thread) {
    await storage.saveThread({
      thread: {
        id: input.threadId,
        resourceId: input.resourceId,
        title: "",
        metadata: {},
        createdAt: now,
        updatedAt: now,
      },
    });
  }
  await storage.saveMessages({
    messages: [
      {
        id: crypto.randomUUID(),
        role: input.role,
        threadId: input.threadId,
        resourceId: thread?.resourceId ?? input.resourceId,
        createdAt: now,
        type: "text",
        content: {
          format: 2,
          parts: [{ type: "text", text: input.text }],
          ...(input.metadata ? { metadata: input.metadata } : {}),
        },
      },
    ],
  });
}

/** A person from the team replied: the team now has the conversation. */
export async function recordTeamReply(threadId: string, text: string) {
  await prisma.conversation.update({
    where: { id: threadId },
    data: {
      lastMessage: preview(text),
      lastMessageRole: "assistant",
      messageCount: { increment: 1 },
      lastMessageAt: new Date(),
      status: "escalated",
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
