import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
  LANDING_AUTH_PATHS,
  LANDING_CONTACT_PAGE_PATH,
} from "@/modules/landing/constants";

type MarketingSubpageCtaProps = {
  omitContactButton?: boolean;
};

export function MarketingSubpageCta({ omitContactButton = false }: MarketingSubpageCtaProps) {
  return (
    <section className="border-t border-[#23252a] bg-[#010102]">
      <div className="mx-auto max-w-[1200px] px-6 py-24 xl:px-8">
        <div className="rounded-[12px] border border-[#23252a] bg-[#0f1011] px-8 py-10 md:px-12 md:py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[13px] font-medium uppercase tracking-[0.4px] text-[#8a8f98]">
                Neste steg
              </p>
              <h2 className="mt-4 max-w-md text-[28px] font-semibold leading-[1.20] tracking-[-0.6px] text-[#f7f8f8]">
                Vil dere se Agenci på deres egen nettside?
              </h2>
              <p className="mt-3 max-w-md text-[16px] leading-[1.5] tracking-[-0.05px] text-[#d0d6e0]">
                Opprett konto for å teste widget og dashboard, eller send oss en melding — vi hjelper
                med oppsett og nivå som passer volumet deres.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button
                className="h-9 rounded-[8px] bg-[#5e6ad2] px-3.5 text-[14px] font-medium text-white transition-colors hover:bg-[#828fff]"
                asChild
              >
                <AuthAwareLink
                  href={LANDING_AUTH_PATHS.signUp}
                  loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
                >
                  Kom i gang
                </AuthAwareLink>
              </Button>
              {!omitContactButton ? (
                <Button
                  className="h-9 rounded-[8px] border border-[#34343a] bg-transparent px-3.5 text-[14px] font-medium text-[#d0d6e0] transition-colors hover:border-[#5e6ad2]/50 hover:bg-[#5e6ad2]/5 hover:text-[#f7f8f8]"
                  asChild
                >
                  <Link href={LANDING_CONTACT_PAGE_PATH}>Kontaktskjema</Link>
                </Button>
              ) : (
                <Button
                  className="h-9 rounded-[8px] border border-[#34343a] bg-transparent px-3.5 text-[14px] font-medium text-[#d0d6e0] transition-colors hover:border-[#5e6ad2]/50 hover:bg-[#5e6ad2]/5 hover:text-[#f7f8f8]"
                  asChild
                >
                  <Link href="/">Til forsiden</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
