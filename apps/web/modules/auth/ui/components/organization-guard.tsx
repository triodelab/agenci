"use client";

import { useOrganization } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardFullSkeleton } from "@/modules/dashboard/ui/components/dashboard-skeleton";

export const OrganizationGuard = ({ children }: { children: React.ReactNode }) => {
  const { organization, isLoaded } = useOrganization();
  const router = useRouter();

  // Brief delay after load to allow the JWT to refresh after org creation
  const [stable, setStable] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      setStable(false);
      return;
    }
    // Give Clerk 800ms to refresh the session after org creation before deciding
    timerRef.current = setTimeout(() => setStable(true), 800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoaded, organization?.id]);

  useEffect(() => {
    if (stable && !organization) {
      router.replace("/onboarding");
    }
  }, [stable, organization, router]);

  if (!isLoaded || !stable || (!organization && stable)) {
    return <DashboardFullSkeleton />;
  }

  return <>{children}</>;
};
