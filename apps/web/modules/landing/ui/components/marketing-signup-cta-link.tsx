"use client";

import type { ComponentProps } from "react";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { LANDING_AUTH_PATHS } from "@/modules/landing/constants";

type Props = Omit<ComponentProps<typeof AuthAwareLink>, "href" | "loggedInHref"> & {
  /**
   * `landing` — innlogget bruker sendes til `/produkt` (ikke innboks).
   * `app` — innlogget bruker sendes til app-oversikt (f.eks. fra `/produkt` når de allerede har konto).
   */
  loggedInBehavior?: "landing" | "app";
};

/**
 * «Opprett konto» / «Kom i gang» som går til Clerk når gjest, men ikke alltid til innboks når innlogget.
 */
export function MarketingSignupCtaLink({
  loggedInBehavior = "landing",
  children,
  ...props
}: Props) {
  const loggedInHref =
    loggedInBehavior === "app"
      ? LANDING_AUTH_PATHS.appOverview
      : LANDING_AUTH_PATHS.marketingLoggedInCta;
  return (
    <AuthAwareLink href={LANDING_AUTH_PATHS.signUp} loggedInHref={loggedInHref} {...props}>
      {children}
    </AuthAwareLink>
  );
}
