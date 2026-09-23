import { privateProcedure } from "@/routers/procedures";
import {
  AddWebpageResponseSchema,
  AddWebpageSchema,
  CreateAgentsResponseSchema,
  CreateAgentsSchema,
  GetAgentResponseSchema,
  GetAgentSchema,
  ListAgentsResponseSchema,
  ListDocumentsResponseSchema,
  ListDocumentsSchema,
} from "./schema";
import { createPrismaClient } from "@agenci/db";
import { ORPCError } from "@orpc/server";
import { inngest, agentOnboardingEvent } from "@/inngest/client";

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
      const agents = await prisma.agent.findMany({
        where: { organizationId: context.organizationId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          createdAt: true,
        },
      });

      return { agents: agents.map(toAgentSummary) };
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
        throw new ORPCError("NOT_FOUND", { message: "Agenten ble ikke funnet" });
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
          webpageUrl: doc.type === "WEBPAGE" ? (doc.documentName ?? null) : null,
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
        throw new ORPCError("NOT_FOUND", { message: "Agenten ble ikke funnet" });
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
