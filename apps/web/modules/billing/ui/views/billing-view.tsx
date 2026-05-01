"use client";

import { OrganizationProfile, useUser } from "@clerk/nextjs";
import { Suspense } from "react";
import {
  DashboardPageHeader,
  DashboardPagePanel,
  DashboardPageShell,
} from "@/modules/dashboard/ui/components/dashboard-page-shell";
import { getBillingUiMode } from "@/lib/dev-bypass";
import {
  BillingClerkLoadingSkeleton,
  DevBillingBypassPlaceholder,
} from "../components/dev-billing-bypass-placeholder";
import { ClerkBillingUnavailableBoundary } from "../components/clerk-billing-unavailable-boundary";
import { PricingTable } from "../components/pricing-table";

const clerkBillingAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "w-full max-w-none!",
    card: "w-full! max-w-none! shadow-none! border-0! bg-transparent!",
    navbar: "bg-muted/40! border-r! border-border/60! min-w-[11rem]!",
    navbarButtons: "gap-0.5! px-2!",
    navbarButton: "rounded-lg! w-full! justify-start! px-3! py-2! text-[13px]! font-medium! text-muted-foreground! hover:bg-muted! hover:text-foreground!",
    navbarButtonIcon: "shrink-0! opacity-70!",
    navbarButtonLabel: "block! opacity-100! visible! truncate!",
    scrollBox: "flex-1!",
  },
} as const;

export const BillingView = () => {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const orgBillingMode = getBillingUiMode(isLoaded, email);

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        description="Administrer abonnement, betalingsmåte og fakturaer. Velg plan under om dere skal oppgradere."
        kicker="Konto"
        title="Abonnement og betaling"
      />

      <section className="mt-8 space-y-3">
        <h2 className="dash-page-kicker text-foreground">Abonnement og faktura</h2>
        <p className="text-muted-foreground max-w-2xl text-[13px] leading-relaxed">
          Her finner dere Clerk sitt organisasjonsoppsett med fane for faktura og betaling når Clerk Billing er
          aktivert.
        </p>
        <DashboardPagePanel className="mt-2 overflow-hidden !p-0" variant="lattice">
          {orgBillingMode === "loading" ? (
            <BillingClerkLoadingSkeleton />
          ) : orgBillingMode === "placeholder" ? (
            <DevBillingBypassPlaceholder />
          ) : (
            <ClerkBillingUnavailableBoundary>
              <Suspense fallback={<BillingClerkLoadingSkeleton />}>
                <OrganizationProfile
                  routing="hash"
                  afterLeaveOrganizationUrl="/dashboard"
                  appearance={clerkBillingAppearance}
                />
              </Suspense>
            </ClerkBillingUnavailableBoundary>
          )}
        </DashboardPagePanel>
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="dash-page-kicker text-foreground">Planer</h2>
        <p className="text-muted-foreground max-w-2xl text-[13px] leading-relaxed">
          Sammenlign planer og start eller endre abonnement (krever aktivert billing i Clerk).
        </p>
        <DashboardPagePanel className="mt-2" variant="lattice">
          <PricingTable />
        </DashboardPagePanel>
      </section>
    </DashboardPageShell>
  );
};