/**
 * Staff inbox over widget conversations (docs/task.md Task 5.2, read side).
 * A conversation = one Mastra memory thread whose resource is
 * `${organizationId}:contact:${contactSessionId}` (see `widget.chat.send`).
 * Status lives in the thread's metadata (`status`), default "unresolved".
 */
import { ORPCError } from "@orpc/server";
import { createPrismaClient } from "@agenci/db";
import { privateProcedure } from "@/routers/procedures";
import { memoryStore } from "@/mastra/store";
import {
  type ConversationStatus,
  ConversationStatusSchema,
  GetConversationResponseSchema,
  GetConversationSchema,
  ListConversationsResponseSchema,
  ListConversationsSchema,
  SetConversationStatusResponseSchema,
  SetConversationStatusSchema,
} from "./schema";

const prisma = createPrismaClient();

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
type Thread = NonNullable<Awaited<ReturnType<MemoryStorage["getThreadById"]>>>;
type DbMessage = Awaited<ReturnType<MemoryStorage["listMessages"]>>["messages"][number];
type ContactSessionRow = NonNullable<
  Awaited<ReturnType<typeof prisma.contactSession.findFirst>>
>;

const resourcePrefix = (organizationId: string) => `${organizationId}:contact:`;

/**
 * A visitor writing again in a resolved conversation reopens it, so it shows
 * up in the staff inbox again (standard helpdesk behaviour).
 */
export async function reopenIfResolved(threadId: string, resourceId: string) {
  const storage = await memoryStorage();
  const thread = await storage.getThreadById({ threadId });
  if (!thread || thread.resourceId !== resourceId) return;
  if (thread.metadata?.status !== "resolved") return;
  await storage.updateThread({
    id: thread.id,
    title: thread.title ?? "",
    metadata: { ...thread.metadata, status: "unresolved" },
  });
}

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
  return fromParts || (typeof content?.content === "string" ? content.content.trim() : "");
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

function statusOf(thread: Thread): ConversationStatus {
  const parsed = ConversationStatusSchema.safeParse(thread.metadata?.status);
  return parsed.success ? parsed.data : "unresolved";
}

function metaString(meta: unknown, key: string): string | null {
  if (!meta || typeof meta !== "object") return null;
  const value = (meta as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function toContact(session: ContactSessionRow) {
  return {
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
  };
}

function summarize(thread: Thread, session: ContactSessionRow, raw: DbMessage[]) {
  const messages = toMessages(raw);
  const last = messages[messages.length - 1] ?? null;
  return {
    threadId: thread.id,
    status: statusOf(thread),
    contact: toContact(session),
    firstMessage: messages.find((m) => m.role === "user")?.text ?? null,
    lastMessage: last,
    messageCount: messages.length,
    createdAt: new Date(thread.createdAt).toISOString(),
    updatedAt: (last?.createdAt ?? new Date(thread.updatedAt).toISOString()),
  };
}

/** Org-scoped agent + whether it's the widget's default (used when no agentId is embedded). */
async function resolveAgent(organizationId: string, agentId: string) {
  const agent = await prisma.agent.findFirst({
    where: { id: agentId, organizationId },
    select: { id: true, name: true },
  });
  if (!agent) {
    throw new ORPCError("NOT_FOUND", { message: "Agenten ble ikke funnet" });
  }
  const defaultAgent = await prisma.agent.findFirst({
    where: { organizationId, status: "COMPLETED" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  return { ...agent, isDefault: defaultAgent?.id === agent.id };
}

function belongsToAgent(
  session: ContactSessionRow,
  agent: { id: string; isDefault: boolean },
) {
  return session.agentId === agent.id || (session.agentId === null && agent.isDefault);
}

/** Thread → its contact session, verifying the thread belongs to this org + agent. */
async function loadOwnedThread(
  storage: MemoryStorage,
  organizationId: string,
  agent: { id: string; isDefault: boolean },
  threadId: string,
) {
  const thread = await storage.getThreadById({ threadId });
  const prefix = resourcePrefix(organizationId);
  if (!thread || !thread.resourceId.startsWith(prefix)) return null;

  const session = await prisma.contactSession.findFirst({
    where: { id: thread.resourceId.slice(prefix.length), organizationId },
  });
  if (!session || !belongsToAgent(session, agent)) return null;
  return { thread, session };
}

export const conversationsRouter = {
  list: privateProcedure
    .input(ListConversationsSchema)
    .output(ListConversationsResponseSchema)
    .handler(async ({ input, context }) => {
      const agent = await resolveAgent(context.organizationId, input.agentId);
      const storage = await memoryStorage();

      const sessions = await prisma.contactSession.findMany({
        where: { organizationId: context.organizationId },
        orderBy: { updatedAt: "desc" },
      });

      const conversations = [];
      for (const session of sessions.filter((s) => belongsToAgent(s, agent))) {
        const { threads } = await storage.listThreads({
          filter: { resourceId: `${resourcePrefix(context.organizationId)}${session.id}` },
          perPage: false,
        });
        for (const thread of threads) {
          const { messages } = await storage.listMessages({
            threadId: thread.id,
            perPage: false,
          });
          const summary = summarize(thread, session, messages);
          if (summary.messageCount > 0) conversations.push(summary);
        }
      }

      conversations.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      return { conversations };
    }),

  getOne: privateProcedure
    .input(GetConversationSchema)
    .output(GetConversationResponseSchema)
    .handler(async ({ input, context }) => {
      const agent = await resolveAgent(context.organizationId, input.agentId);
      const storage = await memoryStorage();
      const owned = await loadOwnedThread(
        storage,
        context.organizationId,
        agent,
        input.threadId,
      );
      if (!owned) return { conversation: null };

      const { messages } = await storage.listMessages({
        threadId: owned.thread.id,
        perPage: false,
      });
      return {
        conversation: {
          ...summarize(owned.thread, owned.session, messages),
          agentName: agent.name,
          messages: toMessages(messages),
        },
      };
    }),

  setStatus: privateProcedure
    .input(SetConversationStatusSchema)
    .output(SetConversationStatusResponseSchema)
    .handler(async ({ input, context }) => {
      const agent = await resolveAgent(context.organizationId, input.agentId);
      const storage = await memoryStorage();
      const owned = await loadOwnedThread(
        storage,
        context.organizationId,
        agent,
        input.threadId,
      );
      if (!owned) {
        throw new ORPCError("NOT_FOUND", { message: "Samtalen ble ikke funnet" });
      }

      await storage.updateThread({
        id: owned.thread.id,
        title: owned.thread.title ?? "",
        metadata: { ...(owned.thread.metadata ?? {}), status: input.status },
      });
      return { status: input.status };
    }),
};
