import { ProPlanGate } from "@/modules/billing/ui/components/pro-plan-gate";
import { FilesView } from "@/modules/files/ui/views/files-view";
import { Id } from "@workspace/backend/_generated/dataModel";

const Page = async ({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) => {
  const { agentId } = await params;
  return (
    <ProPlanGate>
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <FilesView agentId={agentId as Id<"agents">} />
      </div>
    </ProPlanGate>
  );
};

export default Page;
