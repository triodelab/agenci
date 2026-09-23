/**
 * Task 1.2 — AuthGuard uses Better Auth session instead of Convex Authenticated/Unauthenticated
 * (those depended on Clerk JWT via ConvexProviderWithClerk).
 */
"use client";

import { Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { AuthLayout } from "../layouts/auth-layout";
import { SignInView } from "../views/sign-in-view";
import { DashboardFullSkeleton } from "@/modules/dashboard/ui/components/dashboard-skeleton";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <DashboardFullSkeleton />;
  }

  if (!session?.user) {
    return (
      <AuthLayout>
        <Suspense>
          <SignInView />
        </Suspense>
      </AuthLayout>
    );
  }

  return <>{children}</>;
};
