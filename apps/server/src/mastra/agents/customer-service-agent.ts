import { Agent } from "@mastra/core/agent";
import { SUPPORT_AGENT_PROMPT } from "../constants";
import { createKnowledgeSearchTool } from "../tools/knowledge-search-tool";
import { CUSTOMER_AGENT_MODEL, customerAgentMemory } from "../store";


export type CustomerServiceAgentInput = {
  /** Prisma `Agent.id` — also used as the Mastra registration key. */
  id: string;
  name: string;
  description: string;
};

function buildInstructions(name: string, description: string) {
  return `${SUPPORT_AGENT_PROMPT}

## Denne bedriften
Du representerer «${name}».
${description}

Når instruksjonene viser til [bedriften], bruk «${name}».
`;
}

/**
 * Build a tenant-specific Mastra support agent.
 * Name + description from onboarding are baked into instructions so the model
 * speaks as that company after the website knowledge base has been ingested.
 */
export function createCustomerServiceAgent({
  id,
  name,
  description,
}: CustomerServiceAgentInput): Agent {
  return new Agent({
    id,
    name,
    instructions: buildInstructions(name, description),
    model: CUSTOMER_AGENT_MODEL,
    tools: {
      // Key must stay `searchTool` — the system prompt refers to it by name.
      searchTool: createKnowledgeSearchTool(id),
    },
    memory: customerAgentMemory,
  });
}

/** Studio / fallback instance — not tied to a Prisma org agent. */
export const customerServiceAgent: Agent = createCustomerServiceAgent({
  id: "customer-service-agent",
  name: "Customer Service Agent",
  description:
    "Generisk kundeserviceagent for Mastra Studio. Organisasjonsspesifikke agenter registreres dynamisk etter ingest.",
});
