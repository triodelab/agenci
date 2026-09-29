import prisma from "@agenci/db";
import { registerCustomerServiceAgentById } from "@/mastra/register-customer-agent";

/**
 * An agent's status follows its knowledge sources, so one failed page or file
 * never takes a working agent offline:
 * - COMPLETED: at least one source is indexed → it can answer (and is
 *   registered with Mastra).
 * - PROCESSING: nothing indexed yet, but something is still being read.
 * - FAILED: every source failed.
 * - PENDING: no sources at all.
 *
 * Called by the ingest jobs whenever a source finishes or fails.
 */
export async function syncAgentStatus(agentId: string) {
  const docs = await prisma.document.groupBy({
    by: ["status"],
    where: { agentId },
    _count: { _all: true },
  });
  const n = (s: string) => docs.find((d) => d.status === s)?._count._all ?? 0;
  const busy = n("PENDING") + n("PROCESSING") + n("INDEXING");

  const status =
    n("COMPLETED") > 0
      ? "COMPLETED"
      : busy > 0
        ? "PROCESSING"
        : n("FAILED") > 0
          ? "FAILED"
          : "PENDING";

  const { count } = await prisma.agent.updateMany({
    where: { id: agentId },
    data: { status },
  });
  if (count > 0 && status === "COMPLETED") {
    await registerCustomerServiceAgentById(agentId);
  }
  return status;
}
