import { ProPlanGate } from "@/modules/billing/ui/components/pro-plan-gate";
import { CustomizationView } from "@/modules/customization/ui/views/customization-view";

const Page = () => {
  return (
    <ProPlanGate>
      <CustomizationView />
    </ProPlanGate>
  );
};
 
export default Page;
