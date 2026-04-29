"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useAuth } from "@clerk/nextjs";

/**
 * Points to the app when signed in, otherwise sign-in (Clerk).
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
