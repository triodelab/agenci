"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useAuth } from "@/lib/auth-hooks";
import { DASHBOARD_ENABLED, LANDING_AUTH_PATHS } from "@/modules/landing/constants";

/**
 * Points to the dashboard when signed in (Better Auth), otherwise to the
 * dashboard login.
 */
export function AuthAwareLink({
  href = LANDING_AUTH_PATHS.signIn,
  loggedInHref = LANDING_AUTH_PATHS.appHome,
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & {
  href?: string;
  loggedInHref?: string;
}) {
  const { isSignedIn } = useAuth();
  const target = isSignedIn ? loggedInHref : href;
  return (
    <Link
      href={target}
      {...props}
      onClick={(event) => {
        if (!DASHBOARD_ENABLED) event.preventDefault();
        props.onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
