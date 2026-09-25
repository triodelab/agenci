/**
 * OrganizationGuard uses the Better Auth active organization.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { DashboardFullSkeleton } from "@/modules/dashboard/ui/components/dashboard-skeleton";

export const OrganizationGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: activeOrg, isPending: orgPending } =
    authClient.useActiveOrganization();

  const isLoaded = !sessionPending && !orgPending;
  const hasOrg =
    !!activeOrg?.id || !!session?.session?.activeOrganizationId;

  useEffect(() => {
    if (isLoaded && session?.user && !hasOrg) {
      router.replace("/onboarding");
    }
  }, [isLoaded, session?.user, hasOrg, router]);

  if (!isLoaded || (session?.user && !hasOrg)) {
    return <DashboardFullSkeleton />;
  }

  return <>{children}</>;
};
