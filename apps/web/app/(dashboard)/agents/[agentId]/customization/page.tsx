import type { Metadata } from "next";
import { ProPlanGate } from "@/modules/billing/ui/components/pro-plan-gate";
import { CustomizationView } from "@/modules/customization/ui/views/customization-view";
import type { Id } from "@workspace/backend/_generated/dataModel";

export const metadata: Metadata = { title: "Tilpasning" };

interface Props {
  params: Promise<{ agentId: string }>;
}

const Page = async ({ params }: Props) => {
  const { agentId } = await params;
  return (
    <ProPlanGate>
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <CustomizationView agentId={agentId as Id<"agents">} />
      </div>
    </ProPlanGate>
  );
};

export default Page;
