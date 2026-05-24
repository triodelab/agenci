import { StructuredData } from "@/components/structured-data";
import { LandingNav } from "@/modules/landing/ui/components/landing-nav";
import { LandingHeroSection } from "@/modules/landing/ui/components/landing-hero-section";
import { LandingWhySection } from "@/modules/landing/ui/components/landing-why-section";
import { LandingProductIntroSection } from "@/modules/landing/ui/components/landing-product-intro-section";
import { LandingPlatformSection } from "@/modules/landing/ui/components/landing-platform-section";
import { LandingModulesSection } from "@/modules/landing/ui/components/landing-modules-section";
import { LandingFinalCtaSection } from "@/modules/landing/ui/components/landing-final-cta-section";
import { LandingIntegrationsSection } from "@/modules/landing/ui/components/landing-integrations-section";
import { LandingPricingSection } from "@/modules/landing/ui/components/landing-pricing-section";
import { LandingFaqSection } from "@/modules/landing/ui/components/landing-faq-section";
import { LandingContactSection } from "@/modules/landing/ui/components/landing-contact-section";
import { LandingFooter } from "@/modules/landing/ui/components/landing-footer";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";

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
        className="landing-warp min-h-svh overflow-x-hidden antialiased [text-rendering:optimizeLegibility]"
      >
        {/* dark */}
        <LandingHeroSection />
        {/* cream */}
        <LandingWhySection />
        {/* dark */}
        <LandingProductIntroSection />
        {/* dark */}
        <LandingPlatformSection />
        {/* cream */}
        <LandingModulesSection />
        {/* cream */}
        <LandingFinalCtaSection />
        {/* dark */}
        <LandingIntegrationsSection />
        {/* dark */}
        <LandingPricingSection />
        {/* cream */}
        <LandingFaqSection />
        {/* dark */}
        <LandingContactSection />
      </main>
      <LandingFooter />
      <CookieConsentBanner />
    </>
  );
}
