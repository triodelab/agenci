import { useState } from "react";

import { useAgentDraftStore } from "@/features/agents/store/agent-draft-store";
import AgentsCreationForm from "@/features/agents/ui/components/agents-creation-form";
import CustomFacingOnboardingCard from "@/features/agents/ui/components/custom-facing-onboarding-card";

export default function AgentCreationView() {
  const draft = useAgentDraftStore((s) => s.draft);
  const clearDraft = useAgentDraftStore((s) => s.clearDraft);
  const [phase, setPhase] = useState<"details" | "onboarding">(
    draft ? "onboarding" : "details",
  );

  if (phase === "onboarding" && draft) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <CustomFacingOnboardingCard
          draft={draft}
          onBack={() => setPhase("details")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <AgentsCreationForm
          onCancel={draft ? () => clearDraft() : undefined}
          onContinue={() => setPhase("onboarding")}
        />
      </div>
    </div>
  );
}
