import { createPrismaClient } from "@agenci/db";
import type { Agent } from "@mastra/core/agent";
import { createCustomerServiceAgent } from "./agents/customer-service-agent";
import { mastra } from "./index";

/**
 * Onboarding → Mastra dataflow
 *
 * 1. Dashboard: user enters name + description (local draft, no DB yet).
 * 2. Dashboard: user enters website URL and submits "Opprett agent".
 * 3. API (`agents.create`): insert Prisma `Agent` + Document, send Inngest `agent-onboarding/process`.
 * 4. Inngest: Firecrawl scrape + branding, upload markdown to S3.
 * 5. Inngest: chunk markdown, embed, upsert into Mastra GraphRAG (`pgVector`).
 * 6. This module: after ingest (or server boot), `addAgent` a Mastra
 *    instance whose instructions include that name + description.
 * 7. Runtime: `mastra.getAgent(prismaAgentId)` to chat; RAG namespace is
 *    `${organizationId}:${agentId}`.
 */

function getRegisteredAgent(id: string): Agent | undefined {
  return (mastra.listAgents() as Record<string, Agent>)[id];
}

export function registerCustomerServiceAgent(input: {
  id: string;
  name: string;
  description: string | null;
}): Agent {
  const existing = getRegisteredAgent(input.id);
  if (existing) {
    return existing;
  }

  const agent = createCustomerServiceAgent({
    id: input.id,
    name: input.name,
    description: input.description?.trim() || input.name,
  });

  mastra.addAgent(agent, input.id);
  console.log(
    `[mastra] registered customer agent ${input.id} (${input.name})`,
  );
  return agent;
}

/** After ingest: load Prisma row and register the Mastra agent. */
export async function registerCustomerServiceAgentById(agentId: string) {
  const prisma = createPrismaClient();
  const row = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { id: true, name: true, description: true, status: true },
  });

  if (!row) {
    console.warn(`[mastra] skip register — agent ${agentId} not found`);
    return;
  }

  if (row.status !== "COMPLETED") {
    console.warn(
      `[mastra] skip register — agent ${agentId} status is ${row.status}`,
    );
    return;
  }

  registerCustomerServiceAgent(row);
}

/** Cold start: re-register agents whose knowledge base is already ingested. */
export async function hydrateCompletedCustomerAgents() {
  const prisma = createPrismaClient();
  const rows = await prisma.agent.findMany({
    where: { status: "COMPLETED" },
    select: { id: true, name: true, description: true },
  });

  for (const row of rows) {
    registerCustomerServiceAgent(row);
  }

  if (rows.length > 0) {
    console.log(`[mastra] hydrated ${rows.length} customer agent(s) from db`);
  }
}
