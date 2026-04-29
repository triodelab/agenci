"use client";

import { Protect, useUser } from "@clerk/nextjs";
import { hasUiPremiumBypass } from "@/lib/dev-bypass";
import { PremiumFeatureOverlay } from "./premium-feature-overlay";
import { CardGridSkeleton } from "@/modules/dashboard/ui/components/dashboard-skeleton";

export function ProPlanGate({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (hasUiPremiumBypass(email)) {
    return <>{children}</>;
  }

  if (!isLoaded) {
    return <CardGridSkeleton count={3} />;
  }

  return (
    <Protect
      condition={(has) => has({ plan: "pro" })}
      fallback={<PremiumFeatureOverlay>{children}</PremiumFeatureOverlay>}
    >
      {children}
    </Protect>
  );
}
