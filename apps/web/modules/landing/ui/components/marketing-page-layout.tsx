"use client";

import { LandingFooter } from "./landing-footer";
import { LandingNav } from "./landing-nav";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";

/** Offentlige undersider: lys toppnav + footer */
export function MarketingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingNav variant="dark" />
      <div className="min-h-[60vh] bg-black pt-[4.25rem] md:pt-[4.5rem]">
        {children}
      </div>
      <LandingFooter />
      <CookieConsentBanner />
    </>
  );
}
