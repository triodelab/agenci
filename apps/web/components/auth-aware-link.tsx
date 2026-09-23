"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useAuth } from "@/lib/auth-compat";

/**
 * Task 1.2 — Points to the app when signed in (Better Auth), otherwise sign-in.
 * Previously used Clerk `useAuth`.
 */
export function AuthAwareLink({
  href = "/sign-in",
  loggedInHref = "/agents",
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & {
  href?: string;
  loggedInHref?: string;
}) {
  const { isSignedIn } = useAuth();
  const target = isSignedIn ? loggedInHref : href;
  return (
    <Link href={target} {...props}>
      {children}
    </Link>
  );
}
