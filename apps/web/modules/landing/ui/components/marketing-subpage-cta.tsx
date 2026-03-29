import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { LANDING_AUTH_PATHS, LANDING_CONTACT_PAGE_PATH } from "@/modules/landing/constants";

type MarketingSubpageCtaProps = {
  /** På `/kontakt`: skjul «Kontaktskjema» (allerede på siden) */
  omitContactButton?: boolean;
};

const accentBtn =
  "rounded-2xl bg-[#2DD4BF] font-semibold text-neutral-950 shadow-[0_14px_36px_-14px_rgba(45,212,191,0.35)] hover:bg-[#2DD4BF]/90";
const outlineAccentBtn =
  "rounded-2xl border-[#2DD4BF]/45 bg-background/90 text-foreground hover:bg-[#2DD4BF]/12 hover:text-foreground";

export function MarketingSubpageCta({ omitContactButton = false }: MarketingSubpageCtaProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 md:px-6">
      <div className="rounded-2xl border border-[#2DD4BF]/25 bg-gradient-to-br from-[#2DD4BF]/[0.09] via-background to-muted/35 p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] ring-1 ring-[#2DD4BF]/10 backdrop-blur-sm md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0f766e]">Neste steg</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              Klar til å prate med oss?
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Opprett konto eller send en melding — vi hjelper dere å komme i gang på riktig nivå.
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-wrap gap-3">
            <Button asChild size="lg" className={accentBtn}>
              <AuthAwareLink href={LANDING_AUTH_PATHS.signUp} loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}>
                Kom i gang
              </AuthAwareLink>
            </Button>
            {!omitContactButton ? (
              <Button asChild variant="outline" size="lg" className={outlineAccentBtn}>
                <Link href={LANDING_CONTACT_PAGE_PATH}>Kontaktskjema</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="lg" className={outlineAccentBtn}>
                <Link href="/">Til forsiden</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
