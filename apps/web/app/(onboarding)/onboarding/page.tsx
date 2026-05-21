import type { Metadata } from "next";
import { Suspense } from "react";
import { OnboardingView } from "@/modules/onboarding/ui/views/onboarding-view";

export const metadata: Metadata = { title: "Kom i gang" };

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingView />
    </Suspense>
  );
}
