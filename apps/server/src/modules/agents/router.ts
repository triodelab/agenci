import { createPrismaClient } from "@agenci/db";
import { ORPCError } from "@orpc/server";
import { agentOnboardingEvent, inngest } from "@/inngest/client";
import { deleteFile } from "@/lib/s3-client";
import { forgetCustomerServiceAgent } from "@/mastra/register-customer-agent";
import { privateProcedure } from "@/routers/procedures";
import {
  AddWebpageResponseSchema,
  AddWebpageSchema,
  CreateAgentsResponseSchema,
  CreateAgentsSchema,
  DeleteAgentResponseSchema,
  DeleteAgentSchema,
  GetAgentResponseSchema,
  GetAgentSchema,
  ListAgentsResponseSchema,
  ListDocumentsResponseSchema,
  ListDocumentsSchema,
  UpdateAgentSchema,
} from "./schema";

const prisma = createPrismaClient();

function slugFromName(name: string) {
  const base = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "agent"}-${crypto.randomUUID().slice(0, 8)}`;
}

function toAgentSummary(agent: {
  id: string;
  name: string;
  description: string | null;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: Date;
}) {
  return {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    status: agent.status,
    createdAt: agent.createdAt.toISOString(),
  };
}

/**
 * Step 3 — persist onboarding name/description, then kick off URL ingest.
 * Mastra is NOT created here; that happens after the worker finishes ingest
 * (`register-customer-agent.ts`).
 */
export const agentsRouter = {
  list: privateProcedure
    .output(ListAgentsResponseSchema)
    .handler(async ({ context }) => {
      const organizationId = context.organizationId;
      const [agents, sources, failed, sessions, daily] = await Promise.all([
        prisma.agent.findMany({
          where: { organizationId },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            widgetBrand: {
              select: { sourceUrl: true, logoUrl: true, primaryColor: true },
            },
          },
        }),
        prisma.document.groupBy({
          by: ["agentId"],
          where: { organizationId },
          _count: { _all: true },
        }),
        prisma.document.groupBy({
          by: ["agentId"],
          where: { organizationId, status: "FAILED" },
          _count: { _all: true },
        }),
        prisma.contactSession.groupBy({
          by: ["agentId"],
          where: { organizationId },
          _count: { _all: true },
          _max: { updatedAt: true },
        }),
        prisma.$queryRaw<{ agentId: string | null; day: number; n: bigint }[]>`
          SELECT "agentId",
                 floor(extract(epoch FROM (now() - "createdAt")) / 86400)::int AS day,
                 count(*) AS n
          FROM contact_sessions
          WHERE "organizationId" = ${organizationId}
            AND "createdAt" > now() - interval '14 days'
          GROUP BY 1, 2`,
      ]);
      const count = (
        rows: { agentId: string | null; _count: { _all: number } }[],
        id: string,
      ) => rows.find((r) => r.agentId === id)?._count._all ?? 0;

      return {
        agents: agents.map((agent) => {
          const chat = sessions.find((r) => r.agentId === agent.id);
          const lastChat = chat?._max.updatedAt ?? null;
          const last =
            lastChat && lastChat > agent.updatedAt ? lastChat : agent.updatedAt;
          return {
            ...toAgentSummary(agent),
            websiteUrl: agent.widgetBrand?.sourceUrl ?? null,
            logoUrl: agent.widgetBrand?.logoUrl ?? null,
            brandColor: agent.widgetBrand?.primaryColor ?? null,
            sourceCount: count(sources, agent.id),
            failedSourceCount: count(failed, agent.id),
            conversationCount: chat?._count._all ?? 0,
            lastActivityAt: last.toISOString(),
            activity: Array.from({ length: 14 }, (_, i) => {
              const row = daily.find(
                (d) => d.agentId === agent.id && d.day === 13 - i,
              );
              return row ? Number(row.n) : 0;
            }),
          };
        }),
      };
    }),

  getOne: privateProcedure
    .input(GetAgentSchema)
    .output(GetAgentResponseSchema)
    .handler(async ({ input, context }) => {
      const agent = await prisma.agent.findFirst({
        where: {
          id: input.id,
          organizationId: context.organizationId,
        },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          createdAt: true,
        },
      });

      return { agent: agent ? toAgentSummary(agent) : null };
    }),

  update: privateProcedure
    .input(UpdateAgentSchema)
    .output(GetAgentResponseSchema)
    .handler(async ({ input, context }) => {
      const found = await prisma.agent.findFirst({
        where: { id: input.id, organizationId: context.organizationId },
        select: { id: true },
      });
      if (!found) {
        throw new ORPCError("NOT_FOUND", {
          message: "Agenten ble ikke funnet",
        });
      }
      const agent = await prisma.agent.update({
        where: { id: found.id },
        data: { name: input.name, description: input.description },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          createdAt: true,
        },
      });
      // The chat agent carries its name/description in the prompt.
      forgetCustomerServiceAgent(agent.id);
      return { agent: toAgentSummary(agent) };
    }),

  /**
   * Deletes the agent and everything it owns: uploaded files, knowledge
   * (documents + vectors), visitor sessions and widget settings.
   */
  delete: privateProcedure
    .input(DeleteAgentSchema)
    .output(DeleteAgentResponseSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.organizationId;
      const agent = await prisma.agent.findFirst({
        where: { id: input.id, organizationId },
        select: { id: true },
      });
      if (!agent) {
        throw new ORPCError("NOT_FOUND", {
          message: "Agenten ble ikke funnet",
        });
      }

      const documents = await prisma.document.findMany({
        where: { agentId: agent.id, organizationId },
        select: { s3Key: true },
      });
      await Promise.all(
        documents
          .map((d) => d.s3Key)
          .filter((key): key is string => Boolean(key))
          .map((key) => deleteFile(key).catch(() => undefined)),
      );
      await prisma.$executeRaw`DELETE FROM embeddings WHERE metadata->>'agentId' = ${agent.id}`;
      const sessions = await prisma.contactSession.deleteMany({
        where: { agentId: agent.id, organizationId },
      });
      // Documents and widget settings cascade with the agent row.
      await prisma.agent.delete({ where: { id: agent.id } });
      forgetCustomerServiceAgent(agent.id);

      return {
        success: true,
        deleted: { sources: documents.length, conversations: sessions.count },
      };
    }),

  listDocuments: privateProcedure
    .input(ListDocumentsSchema)
    .output(ListDocumentsResponseSchema)
    .handler(async ({ input, context }) => {
      const agent = await prisma.agent.findFirst({
        where: {
          id: input.agentId,
          organizationId: context.organizationId,
        },
        select: { id: true },
      });

      if (!agent) {
        throw new ORPCError("NOT_FOUND", {
          message: "Agenten ble ikke funnet",
        });
      }

      const documents = await prisma.document.findMany({
        where: {
          agentId: input.agentId,
          organizationId: context.organizationId,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          status: true,
          documentName: true,
          createdAt: true,
        },
      });

      return {
        documents: documents.map((doc) => ({
          id: doc.id,
          type: doc.type,
          status: doc.status,
          webpageUrl:
            doc.type === "WEBPAGE" ? (doc.documentName ?? null) : null,
          documentName: doc.documentName,
          mediaName: null,
          createdAt: doc.createdAt.toISOString(),
        })),
      };
    }),

  addWebpage: privateProcedure
    .input(AddWebpageSchema)
    .output(AddWebpageResponseSchema)
    .handler(async ({ input, context }) => {
      const agent = await prisma.agent.findFirst({
        where: {
          id: input.agentId,
          organizationId: context.organizationId,
        },
        select: { id: true },
      });

      if (!agent) {
        throw new ORPCError("NOT_FOUND", {
          message: "Agenten ble ikke funnet",
        });
      }

      const document = await prisma.document.create({
        data: {
          ownerId: context.userId,
          agentId: agent.id,
          organizationId: context.organizationId,
          type: "WEBPAGE",
          status: "PENDING",
          documentName: input.url,
        },
        select: { id: true },
      });

      await inngest.send(
        agentOnboardingEvent.create({
          url: input.url,
          agentId: agent.id,
          organizationId: context.organizationId,
          userId: context.userId,
          documentId: document.id,
        }),
      );

      return {
        success: true,
        message: "Nettsiden er lagt i kø for indeksering",
      };
    }),

  create: privateProcedure
    .input(CreateAgentsSchema)
    .output(CreateAgentsResponseSchema)
    .handler(async ({ input, context }) => {
      if (!input.name) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Navn er påkrevd",
        });
      }

      const agent = await prisma.agent.create({
        data: {
          name: input.name,
          description: input.description,
          slug: slugFromName(input.name),
          organizationId: context.organizationId,
          status: input.url ? "PROCESSING" : "PENDING",
        },
      });

      if (input.url) {
        const document = await prisma.document.create({
          data: {
            ownerId: context.userId,
            agentId: agent.id,
            organizationId: context.organizationId,
            type: "WEBPAGE",
            status: "PENDING",
            documentName: input.url,
          },
          select: { id: true },
        });

        await inngest.send(
          agentOnboardingEvent.create({
            url: input.url,
            agentId: agent.id,
            organizationId: context.organizationId,
            userId: context.userId,
            documentId: document.id,
          }),
        );
      }

      return {
        message: "Agent created successfully",
        success: true,
        agent: {
          id: agent.id,
          name: agent.name,
        },
      };
    }),
};
