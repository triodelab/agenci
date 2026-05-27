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
      <div className="marketing-warp min-h-[60vh] bg-[#1C1C1C] pt-[4.25rem] md:pt-[4.5rem]">
        {children}
      </div>
      <LandingFooter />
      <CookieConsentBanner />
    </>
  );
}
