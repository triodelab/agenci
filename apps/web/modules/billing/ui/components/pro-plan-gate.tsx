"use client";

import { Protect } from "@clerk/nextjs";
import { isDevBypassPremium } from "@/lib/dev-bypass";
import { PremiumFeatureOverlay } from "./premium-feature-overlay";

export function ProPlanGate({ children }: { children: React.ReactNode }) {
  if (isDevBypassPremium) {
    return <>{children}</>;
  }

  return (
    <Protect
      condition={(has) => has({ plan: "pro" })}
      fallback={
        <PremiumFeatureOverlay>
          {children}
        </PremiumFeatureOverlay>
      }
    >
      {children}
    </Protect>
  );
}
