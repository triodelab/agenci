"use client";

import { PricingTable as ClerkPricingTable } from "@clerk/nextjs";
import { isDevBypassPremium } from "@/lib/dev-bypass";

export const PricingTable = () => {
  if (isDevBypassPremium) {
    return (
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="dash-panel-glass flex flex-col gap-3 p-6 text-left">
          <p className="dash-page-kicker">Dev</p>
          <p className="text-lg font-semibold tracking-tight text-foreground">Bypass aktiv</p>
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            Billing UI er omgått i dette miljøet.
          </p>
        </div>
        <div className="dash-bento-block flex flex-col gap-3 p-6 text-left">
          <p className="dash-page-kicker">Miljøvariabel</p>
          <code className="break-all rounded-lg bg-muted/60 px-2 py-1.5 font-mono text-[11px] text-foreground">
            NEXT_PUBLIC_DEV_BYPASS_PREMIUM=true
          </code>
          <p className="text-muted-foreground text-[12px] leading-relaxed">
            Clerk PricingTable rendres ikke når billing er av i Clerk.
          </p>
        </div>
        <div className="app-dashboard-panel flex flex-col justify-between gap-4 p-6 text-left">
          <div>
            <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Neste steg
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-foreground">
              Fjern bypass eller aktiver billing i Clerk for å teste ekte priser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-y-4">
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
    </div>
  );
};