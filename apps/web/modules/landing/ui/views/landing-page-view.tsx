import { StructuredData } from "@/components/structured-data";
import { LandingNav } from "@/modules/landing/ui/components/landing-nav";
import { LandingContactSection } from "@/modules/landing/ui/components/landing-contact-section";
import { LandingFaqSection } from "@/modules/landing/ui/components/landing-faq-section";
import { LandingFinalCtaSection } from "@/modules/landing/ui/components/landing-final-cta-section";
import { LandingHeroSection } from "@/modules/landing/ui/components/landing-hero-section";
import { LandingIntegrationsSection } from "@/modules/landing/ui/components/landing-integrations-section";
import { LandingPricingSection } from "@/modules/landing/ui/components/landing-pricing-section";
import { LandingWorkflowSection } from "@/modules/landing/ui/components/landing-workflow-section";
import { LandingFooter } from "@/modules/landing/ui/components/landing-footer";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";

/**
 * Forside — hero → verdier → integrasjoner → priser → FAQ → kontakt → CTA → footer.
 */
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
        className="landing-warp min-h-svh overflow-x-hidden font-sans antialiased [text-rendering:optimizeLegibility]"
      >
        <LandingHeroSection />
        <LandingWorkflowSection />
        <LandingIntegrationsSection />
        <LandingPricingSection />
        <LandingFaqSection />
        <LandingContactSection />
        <LandingFinalCtaSection />
      </main>
      <LandingFooter />
      <CookieConsentBanner />
    </>
  );
}
