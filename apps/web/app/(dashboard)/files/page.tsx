import { ProPlanGate } from "@/modules/billing/ui/components/pro-plan-gate";
import { FilesView } from "@/modules/files/ui/views/files-view";

const Page = () => {
  return (
    <ProPlanGate>
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <FilesView />
      </div>
    </ProPlanGate>
  );
};
 
export default Page;
