"use client";

import { LandingFooter } from "./landing-footer";
import { LandingNav } from "./landing-nav";

/** Offentlige undersider: samme nav/footer som forsiden */
export function MarketingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingNav />
      <div className="min-h-[60vh] bg-[var(--hero-bg)] pt-[4.75rem] dark:bg-background md:pt-[5.25rem]">
        {children}
      </div>
      <LandingFooter />
    </>
  );
}
