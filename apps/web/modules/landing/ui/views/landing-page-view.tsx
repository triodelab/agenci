import { LandingHeroSection } from "@/modules/landing/ui/components/landing-hero-section";
import { LandingHowItWorksSection } from "@/modules/landing/ui/components/landing-how-it-works-section";
import { LandingUseCasesSection } from "@/modules/landing/ui/components/landing-use-cases-section";
import { LandingKeyFeaturesSection } from "@/modules/landing/ui/components/landing-key-features-section";
import { LandingIntegrationsSection } from "@/modules/landing/ui/components/landing-integrations-section";
import { LandingTrustSection } from "@/modules/landing/ui/components/landing-trust-section";
import { LandingPricingSection } from "@/modules/landing/ui/components/landing-pricing-section";
import { LandingFaqSection } from "@/modules/landing/ui/components/landing-faq-section";
import { LandingCtaSection } from "@/modules/landing/ui/components/landing-cta-section";
import { LandingContactSection } from "@/modules/landing/ui/components/landing-contact-section";
import { LandingFooter } from "@/modules/landing/ui/components/landing-footer";
import { ScrollToHash } from "@/components/scroll-to-hash";
import { StructuredData } from "@/components/structured-data";

export function LandingPageView() {
  return (
    <>
      <ScrollToHash />
      <StructuredData />
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        tabIndex={0}
      >
        Hopp til hovedinnhold
      </a>
      <main
        id="main-content"
        className="overflow-x-hidden font-sans antialiased [text-rendering:optimizeLegibility]"
      >
        <LandingHeroSection />
        <LandingHowItWorksSection />
        <LandingUseCasesSection />
        <LandingKeyFeaturesSection />
        <LandingIntegrationsSection />
        <LandingTrustSection />
        <LandingPricingSection />
        <LandingFaqSection />
        <LandingCtaSection />
        <LandingContactSection />
        <LandingFooter />
      </main>
    </>
  );
}
