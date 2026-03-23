"use client";

import { PricingTable as ClerkPricingTable } from "@clerk/nextjs";
import { isDevBypassPremium } from "@/lib/dev-bypass";

export const PricingTable = () => {
  if (isDevBypassPremium) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-3 rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
        <p className="font-medium text-foreground">
          Billing UI er omgått (utvikling)
        </p>
        <p>
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            NEXT_PUBLIC_DEV_BYPASS_PREMIUM=true
          </code>{" "}
          er satt. Clerk PricingTable rendres ikke når billing er av i Clerk.
        </p>
        <p className="text-xs">
          Fjern bypass eller aktiver billing i Clerk for å teste ekte priser.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-y-4">
      <ClerkPricingTable
        forOrganizations
        appearance={{
          elements: {
            pricingTableCard: "shadow-none! border! rounded-lg!",
            pricingTableCardHeader: "bg-background!",
            pricingTableCardBody: "bg-background!",
            pricingTableCardFooter: "bg-background!",
          }
        }}
      />
    </div>
  );
};