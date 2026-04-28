import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
  LANDING_AUTH_PATHS,
  LANDING_CONTACT_PAGE_PATH,
  LANDING_MARKETING_OUTLINE_CTA_CLASS,
  LANDING_MARKETING_PRIMARY_CTA_CLASS,
} from "@/modules/landing/constants";
import { cn } from "@workspace/ui/lib/utils";

type MarketingSubpageCtaProps = {
  /** På `/kontakt`: skjul «Kontaktskjema» (allerede på siden) */
  omitContactButton?: boolean;
};

export function MarketingSubpageCta({ omitContactButton = false }: MarketingSubpageCtaProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 md:px-6">
      <div
        className={cn(
          "rounded-2xl border border-[#2DD4BF]/25 bg-gradient-to-br from-[#2DD4BF]/[0.09] via-background to-muted/35 p-8 ring-1 ring-[#2DD4BF]/10 backdrop-blur-sm md:p-10",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]",
          "dark:from-[#2DD4BF]/[0.07] dark:via-background dark:to-muted/25 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] dark:ring-[#2DD4BF]/20",
        )}
      >
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0f766e]">Neste steg</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              Vil dere se Agenci på deres egen nettside?
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Opprett konto for å teste widget og dashboard, eller send oss en melding — vi hjelper med
              oppsett og nivå som passer volumet deres.
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-wrap gap-3">
            <Button asChild size="lg" className={LANDING_MARKETING_PRIMARY_CTA_CLASS}>
              <AuthAwareLink href={LANDING_AUTH_PATHS.signUp} loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}>
                Kom i gang
              </AuthAwareLink>
            </Button>
            {!omitContactButton ? (
              <Button asChild variant="outline" size="lg" className={LANDING_MARKETING_OUTLINE_CTA_CLASS}>
                <Link href={LANDING_CONTACT_PAGE_PATH}>Kontaktskjema</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="lg" className={LANDING_MARKETING_OUTLINE_CTA_CLASS}>
                <Link href="/">Til forsiden</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
