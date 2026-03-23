import { ProPlanGate } from "@/modules/billing/ui/components/pro-plan-gate";
import { FilesView } from "@/modules/files/ui/views/files-view";

const Page = () => {
  return (
    <ProPlanGate>
      <FilesView />
    </ProPlanGate>
  );
};
 
export default Page;
