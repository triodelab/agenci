"use client";

import {
  DashboardPageHeader,
  DashboardPagePanel,
  DashboardPageShell,
} from "@/modules/dashboard/ui/components/dashboard-page-shell";
import { PricingTable } from "../components/pricing-table";

export const BillingView = () => {
  return (
    <DashboardPageShell contentClassName="max-w-3xl">
      <DashboardPageHeader
        description="Velg plan som passer teamet deres."
        kicker="Konto"
        title="Plans & Billing"
      />

      <DashboardPagePanel className="mt-2" variant="lattice">
        <PricingTable />
      </DashboardPagePanel>
    </DashboardPageShell>
  );
};