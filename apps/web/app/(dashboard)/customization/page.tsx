import { ProPlanGate } from "@/modules/billing/ui/components/pro-plan-gate";
import { CustomizationView } from "@/modules/customization/ui/views/customization-view";

const Page = () => {
  return (
    <ProPlanGate>
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <CustomizationView />
      </div>
    </ProPlanGate>
  );
};
 
export default Page;
