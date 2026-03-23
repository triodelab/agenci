"use client";

import {
  DashboardPagePanel,
  DashboardPageShell,
} from "@/modules/dashboard/ui/components/dashboard-page-shell";
import { PricingTable } from "../components/pricing-table";

export const BillingView = () => {
  return (
    <DashboardPageShell contentClassName="max-w-3xl">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">
          Plans & Billing
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Velg plan som passer teamet deres.
        </p>
      </header>

      <DashboardPagePanel className="mt-8">
        <PricingTable />
      </DashboardPagePanel>
    </DashboardPageShell>
  );
};