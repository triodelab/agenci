"use client";

import { PricingTable as ClerkPricingTable, useUser } from "@clerk/nextjs";
import { getBillingUiMode } from "@/lib/dev-bypass";
import {
  BillingClerkLoadingSkeleton,
  DevBillingBypassPlaceholder,
} from "./dev-billing-bypass-placeholder";
import { ClerkBillingUnavailableBoundary } from "./clerk-billing-unavailable-boundary";

export const PricingTable = () => {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const mode = getBillingUiMode(isLoaded, email);

  if (mode === "loading") {
    return <BillingClerkLoadingSkeleton />;
  }
  if (mode === "placeholder") {
    return <DevBillingBypassPlaceholder />;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-y-4">
      <ClerkBillingUnavailableBoundary>
        <ClerkPricingTable
          forOrganizations
          appearance={{
            elements: {
              pricingTableCard:
                "shadow-none! border! rounded-2xl! border-border/80! bg-card/95! backdrop-blur-sm!",
              pricingTableCardHeader: "bg-transparent!",
              pricingTableCardBody: "bg-transparent!",
              pricingTableCardFooter: "bg-transparent!",
            },
          }}
        />
      </ClerkBillingUnavailableBoundary>
    </div>
  );
};