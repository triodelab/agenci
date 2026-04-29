import { VoiceComingSoonGate } from "@/modules/billing/ui/components/voice-coming-soon-gate";
import { VapiView } from "@/modules/plugins/ui/views/vapi-view";

const Page = () => {
  return (
    <VoiceComingSoonGate>
      <VapiView />
    </VoiceComingSoonGate>
  );
};

export default Page;
