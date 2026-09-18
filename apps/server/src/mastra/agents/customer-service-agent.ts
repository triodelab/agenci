import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { SUPPORT_AGENT_PROMPT } from "../constants";
import { createGraphQueryTool } from "../tools/qraph-query-tool";

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
    model: "openai/gpt-5-mini",
    tools: {
      graphQueryTool: createGraphQueryTool(id),
    },
    memory: new Memory(),
  });
}

/** Studio / fallback instance — not tied to a Prisma org agent. */
export const customerServiceAgent: Agent = createCustomerServiceAgent({
  id: "customer-service-agent",
  name: "Customer Service Agent",
  description:
    "Generisk kundeserviceagent for Mastra Studio. Organisasjonsspesifikke agenter registreres dynamisk etter ingest.",
});
