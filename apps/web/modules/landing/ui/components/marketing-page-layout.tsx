"use client";

import { LandingFooter } from "./landing-footer";
import { LandingNav } from "./landing-nav";

/** Offentlige undersider: lys toppnav + footer */
export function MarketingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingNav variant="light" />
      <div className="min-h-[60vh] bg-background pt-[4.25rem] md:pt-[4.5rem]">
        {children}
      </div>
      <LandingFooter />
    </>
  );
}
