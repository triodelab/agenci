/**
 * One-off: fill the `conversations` table from existing Mastra threads
 * (widget conversations created before the table existed).
 *
 *   cd apps/server && bun scripts/backfill-conversations.ts
 *
 * Idempotent — re-running refreshes the rows from the threads. Only touches
 * Postgres (no Mastra agents are loaded), so it is safe while the server runs.
 */
import prisma from "@agenci/db";
import { memoryStore } from "../src/mastra/store";

type ThreadRow = {
  id: string;
  resourceId: string;
  metadata: unknown;
  createdAt: Date;
};

const STATUSES = new Set(["unresolved", "escalated", "resolved"]);

function textOf(content: unknown): string {
  const c = content as {
    parts?: { type?: string; text?: string }[];
    content?: string;
  } | null;
  const fromParts = (c?.parts ?? [])
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text as string)
    .join("\n")
    .trim();
  return fromParts || (typeof c?.content === "string" ? c.content.trim() : "");
}

function statusOf(metadata: unknown) {
  const raw =
    metadata && typeof metadata === "object"
      ? (metadata as Record<string, unknown>).status
      : typeof metadata === "string"
        ? (JSON.parse(metadata) as Record<string, unknown>).status
        : undefined;
  return typeof raw === "string" && STATUSES.has(raw)
    ? (raw as "unresolved" | "escalated" | "resolved")
    : "unresolved";
}

const storage = await memoryStore.getStore("memory");
if (!storage) throw new Error("Mastra memory storage unavailable");

const threads = await prisma.$queryRaw<ThreadRow[]>`
  SELECT id, "resourceId", metadata, "createdAt"
  FROM mastra_threads
  WHERE "resourceId" LIKE '%:contact:%'`;

// Conversations from before per-agent sessions belong to the org's default
// agent (the oldest ready one) — the same rule the widget used.
const defaultAgent = new Map<string, string | null>();
async function fallbackAgent(organizationId: string) {
  if (!defaultAgent.has(organizationId)) {
    const agent =
      (await prisma.agent.findFirst({
        where: { organizationId, status: "COMPLETED" },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      })) ??
      (await prisma.agent.findFirst({
        where: { organizationId },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      }));
    defaultAgent.set(organizationId, agent?.id ?? null);
  }
  return defaultAgent.get(organizationId) ?? null;
}

let written = 0;
const skipped: string[] = [];
for (const thread of threads) {
  const [organizationId, contactSessionId] = thread.resourceId.split(":contact:");
  if (!organizationId || !contactSessionId) continue;
  const session = await prisma.contactSession.findFirst({
    where: { id: contactSessionId, organizationId },
    select: { id: true, agentId: true },
  });
  if (!session) {
    skipped.push(`${thread.id} (besøksøkten finnes ikke)`);
    continue;
  }
  const agentId = session.agentId ?? (await fallbackAgent(organizationId));
  if (!agentId) {
    skipped.push(`${thread.id} (ingen agent i organisasjonen)`);
    continue;
  }

  const { messages } = await storage.listMessages({
    threadId: thread.id,
    perPage: false,
  });
  const turns = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role,
      text: textOf(m.content),
      at: new Date(m.createdAt),
    }))
    .filter((m) => m.text)
    .sort((a, b) => a.at.getTime() - b.at.getTime());
  if (turns.length === 0) {
    skipped.push(`${thread.id} (ingen meldinger)`);
    continue;
  }
  const first = turns.find((t) => t.role === "user");
  const last = turns[turns.length - 1];
  if (!last) continue;

  const data = {
    organizationId,
    agentId,
    contactSessionId: session.id,
    status: statusOf(thread.metadata),
    firstMessage: first?.text.slice(0, 500) ?? null,
    lastMessage: last.text.slice(0, 500),
    lastMessageRole: last.role,
    messageCount: turns.length,
    lastMessageAt: last.at,
    createdAt: new Date(thread.createdAt),
  };
  await prisma.conversation.upsert({
    where: { id: thread.id },
    create: { id: thread.id, ...data },
    update: data,
  });
  written += 1;
}

console.log(`Samtaler fylt inn: ${written} av ${threads.length} tråder`);
if (skipped.length) console.log(`Hoppet over:\n  ${skipped.join("\n  ")}`);
process.exit(0);
