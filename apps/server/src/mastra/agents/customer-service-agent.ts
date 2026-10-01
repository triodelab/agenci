import { Agent } from "@mastra/core/agent";
import { SUPPORT_AGENT_PROMPT } from "../constants";
import {
  createEscalateConversationTool,
  createResolveConversationTool,
} from "../tools/conversation-tools";
import { createKnowledgeSearchTool } from "../tools/knowledge-search-tool";
import { CUSTOMER_AGENT_MODEL, customerAgentMemory } from "../store";
import {
  type AgentBehaviorInput,
  buildBehaviorInstructions,
  buildHandoverInstructions,
  buildLanguageLead,
  handoverEnabled,
} from "../agent-behavior";

export type CustomerServiceAgentInput = {
  /** Prisma `Agent.id` — also used as the Mastra registration key. */
  id: string;
  name: string;
  description: string;
  /** Customer's behaviour settings (tone, rules, model …), if any. */
  behavior?: AgentBehaviorInput | null;
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
  behavior,
}: CustomerServiceAgentInput): Agent {
  return new Agent({
    id,
    name,
    instructions:
      buildLanguageLead(behavior) +
      buildInstructions(name, description) +
      buildBehaviorInstructions(behavior) +
      // Hand-over rules always apply; the defaults when not customised.
      (behavior?.escalation
        ? ""
        : `\n## Overlevering\n${buildHandoverInstructions(undefined)}\n`),
    // Mini models keep answering in Norwegian; replying in the customer's own
    // language needs GPT-4o unless a stronger model is already chosen.
    model:
      behavior?.language === "kundens" && (!behavior.model || behavior.model.endsWith("-mini"))
        ? "openai/gpt-4o"
        : behavior?.model || CUSTOMER_AGENT_MODEL,
    tools: {
      // Keys must match the names the system prompt uses.
      searchTool: createKnowledgeSearchTool(id),
      // With every hand-over trigger off, the agent can't escalate at all.
      ...(handoverEnabled(behavior?.escalation)
        ? { escalateConversationTool: createEscalateConversationTool(id) }
        : {}),
      resolveConversationTool: createResolveConversationTool(id),
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
