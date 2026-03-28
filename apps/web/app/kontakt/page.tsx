import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { LandingContactForm } from "@/modules/landing/ui/components/landing-contact-form";
import { MarketingSubpageCta } from "@/modules/landing/ui/components/marketing-subpage-cta";
import { landingSectionHref, LANDING_MARKETING_EYEBROW_CLASS } from "@/modules/landing/constants";
import { cn } from "@workspace/ui/lib/utils";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Book demo, spør om pris eller send oss en melding. Vi svarer vanligvis innen én arbeidsdag.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <MarketingPageLayout>
      <article className="landing-section-mesh border-b border-border/40">
        <div className="mx-auto max-w-2xl px-4 py-14 md:px-6 md:py-20">
          <p className={cn("text-sm", LANDING_MARKETING_EYEBROW_CLASS)}>Kontakt</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Snakk med oss
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Fyll ut skjemaet — eller gå til{" "}
            <Link
              href={landingSectionHref("contact")}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              kontaktseksjonen på forsiden
            </Link>{" "}
            om du allerede er der.
          </p>
          <LandingContactForm variant="light" className="mt-10" />
        </div>
        <MarketingSubpageCta omitContactButton />
      </article>
    </MarketingPageLayout>
  );
}
