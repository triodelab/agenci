import { StructuredData } from "@/components/structured-data";
import { LandingNav } from "@/modules/landing/ui/components/landing-nav";
import { LandingHeroSection } from "@/modules/landing/ui/components/landing-hero-section";
import { LandingMascotPromiseSection } from "@/modules/landing/ui/components/landing-mascot-promise-section";
import {
  LandingMeetSection,
  LandingOutcomeDemosSection,
  LandingBrandSection,
  LandingWorkflowSection,
} from "@/modules/landing/ui/components/landing-product-story-sections";
import storyStyles from "@/modules/landing/ui/components/product-story.module.css";
import { LandingFooter } from "@/modules/landing/ui/components/landing-footer";
import { LandingFeatureCarousel } from "@/modules/landing/ui/components/landing-feature-carousel";

export function LandingPageView() {
  return (
    <>
      <StructuredData />
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        tabIndex={0}
      >
        Hopp til hovedinnhold
      </a>
      <LandingNav variant="auto" />
      <main
        id="main-content"
        className="landing-warp min-h-svh overflow-x-clip bg-[#FAFAFA] antialiased [text-rendering:optimizeLegibility]"
      >
        {/* dark */}
        <LandingHeroSection />
        {/* mascot */}
        <LandingMascotPromiseSection />
        <div className={storyStyles.root} data-agenci-product-sections>
          <LandingMeetSection />
          <LandingOutcomeDemosSection />
          <LandingBrandSection />
          <LandingFeatureCarousel />
          <LandingWorkflowSection />
        </div>
      </main>
      <div className="bg-[#FAFAFA]">
        <LandingFooter />
      </div>
    </>
  );
}
