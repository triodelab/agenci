"use client";

import { useOrganization } from "@clerk/nextjs";
import { AuthLayout } from "@/modules/auth/ui/layouts/auth-layout";
import { OrgSelectionView } from "@/modules/auth/ui/views/org-selection-view";
import { DashboardFullSkeleton } from "@/modules/dashboard/ui/components/dashboard-skeleton";

export const OrganizationGuard = ({ children }: { children: React.ReactNode }) => {
  const { organization, isLoaded } = useOrganization();

  // Clerk hasn't loaded yet — show full skeleton instead of flashing org-selection
  if (!isLoaded) {
    return <DashboardFullSkeleton />;
  }

  if (!organization) {
    return (
      <AuthLayout>
        <OrgSelectionView />
      </AuthLayout>
    );
  }

  return <>{children}</>;
};
