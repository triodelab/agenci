import { LandingHeroSection } from "@/modules/landing/ui/components/landing-hero-section";
import { LandingProductOverviewSection } from "@/modules/landing/ui/components/landing-product-overview-section";
import { LandingHowItWorksSection } from "@/modules/landing/ui/components/landing-how-it-works-section";
import { LandingUseCasesSection } from "@/modules/landing/ui/components/landing-use-cases-section";
import { LandingPricingSection } from "@/modules/landing/ui/components/landing-pricing-section";
import { LandingFaqSection } from "@/modules/landing/ui/components/landing-faq-section";
import { LandingContactSection } from "@/modules/landing/ui/components/landing-contact-section";
import { LandingFooter } from "@/modules/landing/ui/components/landing-footer";
import { StructuredData } from "@/components/structured-data";

/** Forside: hero → produkt → hvordan → brukstilfeller → pris → FAQ → kontakt → footer */
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
      <main
        id="main-content"
        className="overflow-x-hidden font-sans antialiased [text-rendering:optimizeLegibility]"
      >
        <LandingHeroSection />
        <LandingProductOverviewSection />
        <LandingHowItWorksSection />
        <LandingUseCasesSection />
        <LandingPricingSection />
        <LandingFaqSection />
        <LandingContactSection />
        <LandingFooter />
      </main>
    </>
  );
}
