"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useUser } from "@clerk/nextjs";
import { hasUiPremiumBypass } from "@/lib/dev-bypass";
import { PremiumFeatureOverlay } from "./premium-feature-overlay";
import { CardGridSkeleton } from "@/modules/dashboard/ui/components/dashboard-skeleton";

export function ProPlanGate({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const subscription = useQuery(api.private.subscription.getOwn);

  if (hasUiPremiumBypass(email)) {
    return <>{children}</>;
  }

  if (!isLoaded || subscription === undefined) {
    return <CardGridSkeleton count={3} />;
  }

  const hasAccess =
    subscription?.status === "active" || subscription?.status === "trialing";

  if (!hasAccess) {
    return <PremiumFeatureOverlay>{children}</PremiumFeatureOverlay>;
  }

  return <>{children}</>;
}
