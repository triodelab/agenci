/**
 * Thin React hooks over Better Auth (`@/lib/auth-client`) used across the
 * legacy Next dashboard. Field names follow Better Auth's own models.
 */
"use client";

import { authClient } from "@/lib/auth-client";

export function useAuth() {
  const { data, isPending, error } = authClient.useSession();
  return {
    isLoaded: !isPending,
    isSignedIn: !!data?.user,
    userId: data?.user?.id ?? null,
    orgId: data?.session?.activeOrganizationId ?? null,
    sessionId: data?.session?.id ?? null,
    error,
  };
}

export function useUser() {
  const { data, isPending } = authClient.useSession();
  const user = data?.user
    ? {
        id: data.user.id,
        name: data.user.name,
        firstName: data.user.name?.split(" ")[0] ?? data.user.name,
        email: data.user.email,
        emailVerified: data.user.emailVerified,
        image: data.user.image ?? null,
        createdAt: data.user.createdAt,
      }
    : null;

  return {
    isLoaded: !isPending,
    isSignedIn: !!user,
    user,
  };
}

export function useOrganization() {
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();
  return {
    isLoaded: !isPending,
    organization: activeOrg
      ? {
          id: activeOrg.id,
          name: activeOrg.name,
          slug: activeOrg.slug,
          logo: activeOrg.logo ?? null,
        }
      : null,
  };
}

/** Sign-out + navigation to the settings pages that manage profile/org. */
export function useAuthActions() {
  return {
    signOut: async (opts?: { redirectUrl?: string }) => {
      await authClient.signOut();
      if (opts?.redirectUrl && typeof window !== "undefined") {
        window.location.href = opts.redirectUrl;
      }
    },
    goToProfileSettings: () => {
      if (typeof window !== "undefined") {
        window.location.href = "/settings/profile";
      }
    },
    goToOrganizationSettings: () => {
      if (typeof window !== "undefined") {
        window.location.href = "/settings/organization";
      }
    },
  };
}

export function useSession() {
  const { data, isPending } = authClient.useSession();
  return {
    isLoaded: !isPending,
    session: data?.session
      ? {
          id: data.session.id,
          status: "active" as const,
          createdAt: data.session.createdAt,
          expireAt: data.session.expiresAt,
        }
      : null,
  };
}
