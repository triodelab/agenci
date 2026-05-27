import type { Metadata } from "next";
import { VoiceComingSoonGate } from "@/modules/billing/ui/components/voice-coming-soon-gate";
import { VapiView } from "@/modules/plugins/ui/views/vapi-view";

export const metadata: Metadata = { title: "Stemmeagent" };

const Page = () => {
  return (
    <VoiceComingSoonGate>
      <VapiView />
    </VoiceComingSoonGate>
  );
};

export default Page;
