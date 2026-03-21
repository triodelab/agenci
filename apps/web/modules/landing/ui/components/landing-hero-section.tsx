"use client";

import { LandingNav } from "./landing-nav";
import { LandingHeroTop } from "./landing-hero-top";
import { LandingHeroShowcase } from "./landing-hero-showcase";

export function LandingHeroSection() {
  return (
    <>
      <LandingNav />
      <div className="relative overflow-visible bg-background">
        <div
          aria-hidden
          className="landing-hero-mesh pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(88vh,860px)]"
        />
        <section
          aria-labelledby="hero-heading"
          className="relative z-10 border-b border-border/40"
        >
          <LandingHeroTop />
          <div className="relative min-h-[min(52vh,380px)] md:min-h-[340px]">
            <div className="sticky top-[14vh] z-20 w-full pb-8">
              <LandingHeroShowcase />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
