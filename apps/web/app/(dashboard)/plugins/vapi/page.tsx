import { ProPlanGate } from "@/modules/billing/ui/components/pro-plan-gate";
import { VapiView } from "@/modules/plugins/ui/views/vapi-view";

const Page = () => {
  return (
    <ProPlanGate>
      <VapiView />
    </ProPlanGate>
  );
};
 
export default Page;
