/**
 * Staff inbox over widget conversations.
 * The list, status and counts come from the `conversations` table (kept in
 * step on every message, see ./service.ts); the full message history of one
 * conversation is read from its Mastra memory thread (same id).
 */
import prisma from "@agenci/db";
import { ORPCError } from "@orpc/server";
import { memoryStore } from "@/mastra/store";
import { privateProcedure } from "@/routers/procedures";
import {
  GetConversationResponseSchema,
  GetConversationSchema,
  ListConversationsResponseSchema,
  ListConversationsSchema,
  SetConversationStatusResponseSchema,
  SetConversationStatusSchema,
} from "./schema";

async function memoryStorage() {
  const storage = await memoryStore.getStore("memory");
  if (!storage) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Samtalelageret er ikke tilgjengelig",
    });
  }
  return storage;
}

type MemoryStorage = Awaited<ReturnType<typeof memoryStorage>>;
type DbMessage = Awaited<
  ReturnType<MemoryStorage["listMessages"]>
>["messages"][number];

function textOf(message: DbMessage): string {
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

function toMessages(raw: DbMessage[]) {
  return raw
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      text: textOf(m),
      createdAt: new Date(m.createdAt).toISOString(),
    }))
    .filter((m) => m.text.length > 0)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function metaString(meta: unknown, key: string): string | null {
  if (!meta || typeof meta !== "object") return null;
  const value = (meta as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value : null;
}

const conversationInclude = {
  contactSession: true,
  agent: { select: { name: true } },
} as const;

type ConversationRow = NonNullable<
  Awaited<
    ReturnType<
      typeof prisma.conversation.findFirst<{
        include: typeof conversationInclude;
      }>
    >
  >
>;

function toSummary(row: ConversationRow) {
  const session = row.contactSession;
  return {
    threadId: row.id,
    status: row.status,
    contact: {
      contactSessionId: session.id,
      name: session.name,
      email: session.email,
      anonymous: session.anonymous,
      language: metaString(session.metadata, "language"),
      timezone: metaString(session.metadata, "timezone"),
      userAgent: metaString(session.metadata, "userAgent"),
      referrer: metaString(session.metadata, "referrer"),
      currentUrl: metaString(session.metadata, "currentUrl"),
      expiresAt: session.expiresAt.toISOString(),
    },
    firstMessage: row.firstMessage,
    lastMessage: row.lastMessage
      ? {
          id: `${row.id}:last`,
          role: (row.lastMessageRole === "user" ? "user" : "assistant") as
            | "user"
            | "assistant",
          text: row.lastMessage,
          createdAt: row.lastMessageAt.toISOString(),
        }
      : null,
    messageCount: row.messageCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.lastMessageAt.toISOString(),
  };
}

async function assertAgent(organizationId: string, agentId: string) {
  const agent = await prisma.agent.findFirst({
    where: { id: agentId, organizationId },
    select: { id: true },
  });
  if (!agent) {
    throw new ORPCError("NOT_FOUND", { message: "Agenten ble ikke funnet" });
  }
}

export const conversationsRouter = {
  list: privateProcedure
    .input(ListConversationsSchema)
    .output(ListConversationsResponseSchema)
    .handler(async ({ input, context }) => {
      await assertAgent(context.organizationId, input.agentId);
      const rows = await prisma.conversation.findMany({
        where: {
          organizationId: context.organizationId,
          agentId: input.agentId,
          messageCount: { gt: 0 },
        },
        include: conversationInclude,
        orderBy: { lastMessageAt: "desc" },
      });
      return { conversations: rows.map(toSummary) };
    }),

  getOne: privateProcedure
    .input(GetConversationSchema)
    .output(GetConversationResponseSchema)
    .handler(async ({ input, context }) => {
      const row = await prisma.conversation.findFirst({
        where: {
          id: input.threadId,
          organizationId: context.organizationId,
          agentId: input.agentId,
        },
        include: conversationInclude,
      });
      if (!row) return { conversation: null };

      const storage = await memoryStorage();
      const { messages } = await storage.listMessages({
        threadId: row.id,
        perPage: false,
      });
      return {
        conversation: {
          ...toSummary(row),
          agentName: row.agent.name,
          messages: toMessages(messages),
        },
      };
    }),

  setStatus: privateProcedure
    .input(SetConversationStatusSchema)
    .output(SetConversationStatusResponseSchema)
    .handler(async ({ input, context }) => {
      const { count } = await prisma.conversation.updateMany({
        where: {
          id: input.threadId,
          organizationId: context.organizationId,
          agentId: input.agentId,
        },
        data: { status: input.status },
      });
      if (count === 0) {
        throw new ORPCError("NOT_FOUND", {
          message: "Samtalen ble ikke funnet",
        });
      }
      return { status: input.status };
    }),
};
