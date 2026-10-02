/**
 * Shared core behind both the private (staff test-chat) and public (widget)
 * `chat.send` procedures — same agent lookup + Mastra call, different auth
 * and different memory "resource" (staff user vs. anonymous contact session).
 */
import { ORPCError } from "@orpc/server";
import { createPrismaClient } from "@agenci/db";
import { buildTurnSystem } from "@/mastra/agent-behavior";
import { customerAgentModel } from "@/mastra/agents/customer-service-agent";
import { getCustomerServiceAgent } from "@/mastra/register-customer-agent";
import { recordUsage } from "@/modules/billing/service";
import { productsFromSteps, tidyReply } from "@/mastra/tools/product-search-tool";
import { AgentBehaviorSchema } from "@/modules/widget/schema";

const prisma = createPrismaClient();


export async function sendChatMessage(input: {
  organizationId: string;
  agentId: string;
  message: string;
  threadId?: string;
  /** Mastra memory resource id — unique per staff user or per visitor. */
  memoryResourceId: string;
}) {
  const row = await prisma.agent.findFirst({
    where: { id: input.agentId, organizationId: input.organizationId },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      widgetBrand: { select: { settings: true } },
    },
  });

  if (!row) {
    throw new ORPCError("NOT_FOUND", { message: "Agenten ble ikke funnet" });
  }

  if (row.status !== "COMPLETED") {
    throw new ORPCError("CONFLICT", {
      message: "Kunnskapsbasen er ikke ferdig indeksert ennå",
    });
  }

  // The customer's behaviour settings (tone, rules, model …) shape the agent.
  const settings = row.widgetBrand?.settings as { behavior?: unknown } | null;
  const behavior = AgentBehaviorSchema.safeParse(settings?.behavior ?? {});
  const behaviorData = behavior.success ? behavior.data : null;
  const agent = getCustomerServiceAgent(row, behaviorData);
  const threadId = input.threadId ?? crypto.randomUUID();

  const result = await agent.generate(input.message, {
    // Time of day in Norway + the language rule, next to the message.
    system: buildTurnSystem(behaviorData),
    memory: {
      resource: input.memoryResourceId,
      thread: threadId,
    },
  });

  // Cost tracking: never let it break a reply.
  const usage = result.usage as { inputTokens?: number; outputTokens?: number; promptTokens?: number; completionTokens?: number } | undefined;
  void recordUsage(input.organizationId, customerAgentModel(behaviorData), {
    inputTokens: usage?.inputTokens ?? usage?.promptTokens,
    outputTokens: usage?.outputTokens ?? usage?.completionTokens,
  }).catch((error) => console.error("[usage]", error));

  const products = productsFromSteps(result.steps);
  return { threadId, message: tidyReply(result.text, products), products };
}
