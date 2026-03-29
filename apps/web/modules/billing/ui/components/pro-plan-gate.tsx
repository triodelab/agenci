"use client";

import { Protect, useUser } from "@clerk/nextjs";
import { hasUiPremiumBypass } from "@/lib/dev-bypass";
import { PremiumFeatureOverlay } from "./premium-feature-overlay";

export function ProPlanGate({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (hasUiPremiumBypass(email)) {
    return <>{children}</>;
  }

  if (!isLoaded) {
    return (
      <div
        className="min-h-[12rem] animate-pulse rounded-xl bg-muted/40"
        aria-busy="true"
        aria-label="Laster tilgang"
      />
    );
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
