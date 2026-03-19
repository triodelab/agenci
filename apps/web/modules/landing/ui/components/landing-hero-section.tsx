"use client";

import { LandingNav } from "./landing-nav";
import { LandingHeroTop } from "./landing-hero-top";
import { LandingHeroShowcase } from "./landing-hero-showcase";
import { LandingHeroPodium } from "./landing-hero-podium";

export function LandingHeroSection() {
  return (
    <>
      <LandingNav />
      <div className="relative overflow-visible bg-background">
        <div
          aria-hidden
          className="landing-hero-mesh pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(92vh,980px)]"
        />
        <section
          aria-labelledby="hero-heading"
          className="relative z-10 border-b border-border/40"
        >
          <LandingHeroTop />
          <div className="relative min-h-[440px] md:min-h-[400px]">
            <div className="sticky top-[12vh] z-20 w-full">
              <LandingHeroShowcase />
            </div>
          </div>
        </section>
        <LandingHeroPodium />
      </div>
    </>
  );
}
