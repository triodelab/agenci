import { Suspense } from "react";
import { OnboardingView } from "@/modules/onboarding/ui/views/onboarding-view";

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingView />
    </Suspense>
  );
}
