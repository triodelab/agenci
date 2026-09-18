/**
 * Task 1.2 — Temporary Clerk → Better Auth compatibility shims.
 *
 * Many dashboard modules still import `@clerk/nextjs` hooks. Rather than rewrite
 * every settings/billing file in this task, these shims expose a minimal Clerk-like
 * API backed by Better Auth so the shell boots without `ClerkProvider`.
 *
 * Prefer importing `authClient` / these hooks from `@/lib/*` going forward.
 * Remove this file once Phase 8 drops all Clerk call sites.
 */
"use client";

import { authClient } from "@/lib/auth-client";

/** Subset of Clerk `useAuth()` used across the app. */
export function useAuth() {
  const { data, isPending, error } = authClient.useSession();
  return {
    isLoaded: !isPending,
    isSignedIn: !!data?.user,
    userId: data?.user?.id ?? null,
    orgId: data?.session?.activeOrganizationId ?? null,
    sessionId: data?.session?.id ?? null,
    error,
    /**
     * Task 1.2 shim — Clerk JWT for Convex no longer exists.
     * ConvexProvider is unauthenticated until Phase 5 private API cutover.
     */
    getToken: async (_opts?: { template?: string }) => null as string | null,
  };
}

/** Subset of Clerk `useUser()` used across the app. */
export function useUser() {
  const { data, isPending } = authClient.useSession();
  const user = data?.user
    ? {
        id: data.user.id,
        fullName: data.user.name,
        firstName: data.user.name?.split(" ")[0] ?? data.user.name,
        imageUrl: data.user.image ?? "",
        primaryEmailAddress: {
          emailAddress: data.user.email,
        },
        emailAddresses: [{ emailAddress: data.user.email }],
      }
    : null;

  return {
    isLoaded: !isPending,
    isSignedIn: !!user,
    user,
  };
}

/** Subset of Clerk `useOrganization()` used across the app. */
export function useOrganization() {
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();
  return {
    isLoaded: !isPending,
    organization: activeOrg
      ? {
          id: activeOrg.id,
          name: activeOrg.name,
          slug: activeOrg.slug,
          imageUrl: activeOrg.logo ?? "",
        }
      : null,
  };
}

/** Subset of Clerk `useClerk()` — signOut + profile redirects during migration. */
export function useClerk() {
  return {
    signOut: async (opts?: { redirectUrl?: string }) => {
      await authClient.signOut();
      if (opts?.redirectUrl && typeof window !== "undefined") {
        window.location.href = opts.redirectUrl;
      }
    },
    /** Task 1.2 shim — Clerk modal → settings page */
    openUserProfile: () => {
      if (typeof window !== "undefined") {
        window.location.href = "/settings/profile";
      }
    },
    /** Task 1.2 shim — Clerk modal → organization settings */
    openOrganizationProfile: () => {
      if (typeof window !== "undefined") {
        window.location.href = "/settings/organization";
      }
    },
  };
}

/** Subset of Clerk `useSession()` for security settings. */
export function useSession() {
  const { data, isPending } = authClient.useSession();
  return {
    isLoaded: !isPending,
    session: data?.session
      ? {
          id: data.session.id,
          status: "active" as const,
          expireAt: data.session.expiresAt,
        }
      : null,
  };
}
