import { AgentOverviewView } from "@/modules/dashboard/ui/views/agent-overview-view";
import { Id } from "@workspace/backend/_generated/dataModel";

const Page = async ({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) => {
  const { agentId } = await params;
  return <AgentOverviewView agentId={agentId as Id<"agents">} />;
};

export default Page;
