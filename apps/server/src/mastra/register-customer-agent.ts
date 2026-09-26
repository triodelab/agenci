import { createPrismaClient } from "@agenci/db";
import type { Agent } from "@mastra/core/agent";
import type { AgentBehaviorInput } from "./agent-behavior";
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
  console.log(`[mastra] registered customer agent ${input.id} (${input.name})`);
  return agent;
}

/**
 * Agent for a chat turn. Without behaviour settings this is the registered
 * agent; with them, a variant built for exactly those settings (cached by
 * their content, so a saved change takes effect on the next message).
 */
const customised = new Map<string, Agent>();

export function getCustomerServiceAgent(
  row: { id: string; name: string; description: string | null },
  behavior: AgentBehaviorInput | null | undefined,
): Agent {
  if (!behavior || Object.keys(behavior).length === 0) {
    return registerCustomerServiceAgent(row);
  }
  const key = `${row.id}:${row.name}:${row.description ?? ""}:${JSON.stringify(behavior)}`;
  const hit = customised.get(key);
  if (hit) return hit;
  // Drop older variants of this agent so the cache stays small.
  for (const k of customised.keys())
    if (k.startsWith(`${row.id}:`)) customised.delete(k);
  const agent = createCustomerServiceAgent({
    id: row.id,
    name: row.name,
    description: row.description?.trim() || row.name,
    behavior,
  });
  customised.set(key, agent);
  return agent;
}

/**
 * Drop the registered agent and its variants (after a rename or delete); the
 * next chat turn rebuilds it from the current row.
 */
export function forgetCustomerServiceAgent(agentId: string) {
  for (const k of customised.keys()) {
    if (k.startsWith(`${agentId}:`)) customised.delete(k);
  }
  if (getRegisteredAgent(agentId)) mastra.removeAgent(agentId);
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
