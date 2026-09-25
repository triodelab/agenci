"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CheckIcon, MinusIcon, ArrowRightIcon } from "lucide-react";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { LANDING_AUTH_PATHS, LANDING_CONTACT_PAGE_PATH } from "@/modules/landing/constants";
import { cn } from "@workspace/ui/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Data ─────────────────────────────────────────────────────────────────────

type Bullet = { text: string; included: boolean };

type Plan = {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  conversations: string;
  blurb: string;
  featured: boolean;
  cta: string;
  bullets: Bullet[];
};

const PLANS: Plan[] = [
  {
    id: "gratis",
    name: "Gratis",
    monthlyPrice: 0,
    yearlyPrice: 0,
    conversations: "50 samtaler / mnd",
    blurb: "Se hva Agenci gjør for deg — uten å legge inn kortinfo.",
    featured: false,
    cta: "Start gratis",
    bullets: [
      { text: "1 AI-agent", included: true },
      { text: "Timebestilling i chatten", included: false },
      { text: "Chat-widget på nettsiden", included: true },
      { text: "1 teammedlem", included: true },
      { text: "Grunnleggende analyser", included: true },
      { text: "Fjern «Powered by Agenci»", included: false },
      { text: "Prioritert support", included: false },
    ],
  },
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 499,
    yearlyPrice: 399,
    conversations: "500 samtaler / mnd",
    blurb: "For deg som er klar til å automatisere de vanligste spørsmålene.",
    featured: false,
    cta: "Kom i gang",
    bullets: [
      { text: "1 AI-agent", included: true },
      { text: "Timebestilling i chatten", included: true },
      { text: "Chat-widget på nettsiden", included: true },
      { text: "2 teammedlemmer", included: true },
      { text: "Grunnleggende analyser", included: true },
      { text: "Fjern «Powered by Agenci»", included: false },
      { text: "E-poststøtte", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 1499,
    yearlyPrice: 1199,
    conversations: "2 000 samtaler / mnd",
    blurb: "For team som vokser og trenger full kontroll over kundeservice.",
    featured: true,
    cta: "Kom i gang",
    bullets: [
      { text: "3 AI-agenter", included: true },
      { text: "Timebestilling i chatten", included: true },
      { text: "Chat-widget på nettsiden", included: true },
      { text: "5 teammedlemmer", included: true },
      { text: "Full analyse og rapporter", included: true },
      { text: "Fjern «Powered by Agenci»", included: true },
      { text: "Prioritert e-poststøtte", included: true },
    ],
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 3999,
    yearlyPrice: 3199,
    conversations: "10 000 samtaler / mnd",
    blurb: "Når én agent ikke er nok og dere trenger alt på plass.",
    featured: false,
    cta: "Kom i gang",
    bullets: [
      { text: "10 AI-agenter", included: true },
      { text: "Timebestilling i chatten", included: true },
      { text: "Alle integrasjoner", included: true },
      { text: "Ubegrenset teammedlemmer", included: true },
      { text: "Full analyse + CSV-eksport", included: true },
      { text: "Fjern «Powered by Agenci»", included: true },
      { text: "Dedikert support", included: true },
    ],
  },
];

// ─── View ─────────────────────────────────────────────────────────────────────

export function PriserView() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <MarketingPageLayout>
      <HeroSection reduceMotion={reduceMotion} />
      <PricingSection reduceMotion={reduceMotion} />
      <CTASection reduceMotion={reduceMotion} />
    </MarketingPageLayout>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <section className="relative overflow-hidden bg-[#1C1C1C]" aria-labelledby="pricing-hero-heading">
      <div className="relative mx-auto max-w-[1200px] px-6 pb-20 pt-24 text-center md:pt-32 xl:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mb-7 inline-flex items-center gap-2"
        >
          <span className="size-1.5 rounded-full bg-[#6b7280]" />
          <span className="font-mono text-[11px] font-medium tracking-[0.18em] text-[#6b7280] uppercase">
            Priser
          </span>
        </motion.div>

        <motion.h1
          id="pricing-hero-heading"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.07, ease }}
          className="mx-auto max-w-3xl text-[2.8rem] font-semibold leading-[1.06] tracking-[-0.055em] text-[#f2f3f5] sm:text-[3.6rem] md:text-[4rem]"
        >
          Start enkelt.
          <br />
          <span className="text-[#6b7280]">Voks i ditt tempo.</span>
        </motion.h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.16, ease }}
          className="mx-auto mt-6 max-w-xl text-[17px] leading-[1.65] text-[#6b7280]"
        >
          Ingen kortinfo for å starte. Ingen bindingstid. Bytt eller si opp planen når dere vil.
        </motion.p>
      </div>
    </section>
  );
}

// ─── Pricing grid ─────────────────────────────────────────────────────────────

function PricingSection({ reduceMotion }: { reduceMotion: boolean }) {
  const [isYearly, setIsYearly] = useState(false);
  const [toggled, setToggled] = useState(false);

  return (
    <section className="border-t border-[#2a2a2a] bg-[#161616]">
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-24 xl:px-8">
        {/* Billing toggle */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease }}
          className="mb-14 flex flex-col items-center gap-3"
        >
          <div
            role="group"
            aria-label="Faktureringsperiode"
            className="inline-flex items-center rounded-full border border-[#2a2a2a] bg-[#1a1a1a] p-1"
          >
            {[false, true].map((yearly) => (
              <button
                key={String(yearly)}
                type="button"
                aria-pressed={isYearly === yearly}
                onClick={() => {
                  setIsYearly(yearly);
                  setToggled(true);
                }}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-150",
                  isYearly === yearly
                    ? "bg-white text-[#1C1C1C]"
                    : "text-[#6b7280] hover:text-[#f2f3f5]",
                )}
              >
                {yearly ? "Årlig" : "Månedlig"}
              </button>
            ))}
          </div>
          <span className="font-mono text-[11px] font-medium tracking-[0.1em] text-[#6b7280] uppercase">
            Spar 20 % med årlig fakturering
          </span>
        </motion.div>

        {/* Plan cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan, i) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <motion.article
                key={plan.id}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                className={cn(
                  "relative flex flex-col rounded-[16px] border p-7",
                  plan.featured
                    ? "border-white/20 bg-[#1a1a1a] shadow-[0_32px_80px_-24px_rgba(255,255,255,0.1)]"
                    : "border-[#2a2a2a] bg-[#141414]",
                )}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-7 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#1C1C1C]">
                    Mest populær
                  </span>
                )}

                <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-[#f2f3f5]">
                  {plan.name}
                </h3>
                <p className="mt-2 min-h-[38px] text-[13px] leading-relaxed text-[#6b7280]">
                  {plan.blurb}
                </p>

                <motion.div
                  key={`value-${isYearly}`}
                  initial={reduceMotion || !toggled ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, ease }}
                  className="mt-6 flex items-baseline gap-1.5"
                >
                  <span className="text-[2.4rem] font-semibold tracking-[-0.03em] text-[#f2f3f5]">
                    {price.toLocaleString("nb-NO")}
                  </span>
                  {price > 0 && (
                    <span className="text-[13px] text-[#6b7280]">kr / mnd</span>
                  )}
                </motion.div>
                <p className="mt-1 text-[12px] text-[#6b7280]">
                  {price === 0
                    ? "Alltid gratis"
                    : isYearly
                      ? `Faktureres ${(price * 12).toLocaleString("nb-NO")} kr/år`
                      : "Faktureres månedlig"}
                </p>

                <span className="mt-4 inline-block font-mono text-[11px] font-medium tracking-[0.06em] text-[#9ca3af] uppercase">
                  {plan.conversations}
                </span>

                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {plan.bullets.map((bullet) => (
                    <li
                      key={bullet.text}
                      className={cn(
                        "flex items-start gap-2.5 text-[13px] leading-[1.5]",
                        bullet.included ? "text-[#d1d5db]" : "text-[#4b5563]",
                      )}
                    >
                      {bullet.included ? (
                        <CheckIcon size={15} className="mt-0.5 shrink-0 text-[#8FB394]" aria-hidden />
                      ) : (
                        <MinusIcon size={15} className="mt-0.5 shrink-0 text-[#4b5563]" aria-hidden />
                      )}
                      <span>{bullet.text}</span>
                    </li>
                  ))}
                </ul>

                <AuthAwareLink
                  href={LANDING_AUTH_PATHS.signUp}
                  loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
                  className={cn(
                    "mt-8 inline-flex h-10 items-center justify-center gap-2 rounded-lg text-[14px] font-semibold transition-all duration-150",
                    plan.featured
                      ? "bg-white text-[#1C1C1C] hover:bg-[#f2f3f5]"
                      : "border border-[#2a2a2a] text-[#d1d5db] hover:border-[#3a3a3a] hover:text-white",
                  )}
                >
                  {plan.cta}
                  <ArrowRightIcon size={15} />
                </AuthAwareLink>
              </motion.article>
            );
          })}
        </div>

        {/* Enterprise strip */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.5, ease }}
          className="mt-6 flex flex-col items-center justify-between gap-4 rounded-[16px] border border-[#2a2a2a] bg-[#141414] px-7 py-6 sm:flex-row"
        >
          <div>
            <p className="text-[15px] font-semibold text-[#f2f3f5]">Noe litt større?</p>
            <p className="mt-1 text-[13px] text-[#6b7280]">
              La oss finne et oppsett som passer organisasjonen deres.
            </p>
          </div>
          <Link
            href={LANDING_CONTACT_PAGE_PATH}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-[#2a2a2a] px-5 text-[13px] font-medium text-[#9ca3af] transition-colors duration-150 hover:border-[#3a3a3a] hover:text-[#f2f3f5]"
          >
            Snakk med oss
            <ArrowRightIcon size={14} />
          </Link>
        </motion.div>

        <p className="mt-8 text-center text-[12px] text-[#4b5563]">
          Alle priser ekskl. 25 % MVA · Ingen bindingstid
          {isYearly ? " · Faktureres årlig" : ""}
        </p>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTASection({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <section className="border-t border-[#2a2a2a] bg-[#1C1C1C]">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32 xl:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease }}
          className="relative overflow-hidden rounded-[16px] border border-[#2a2a2a] bg-[#161616] px-8 py-16 text-center md:px-16 md:py-24"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)",
            }}
          />

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[#6b7280]" />
              <span className="font-mono text-[11px] font-medium tracking-[0.18em] text-[#6b7280] uppercase">
                Klar til å starte?
              </span>
            </div>

            <h2 className="mx-auto max-w-2xl text-[2rem] font-semibold leading-[1.1] tracking-[-0.045em] text-[#f2f3f5] sm:text-[2.6rem]">
              Prøv Agenci gratis
              <br />
              — ingen kort, ingen binding.
            </h2>

            <p className="mx-auto mt-5 max-w-md text-[15px] leading-[1.7] text-[#6b7280]">
              Kom i gang på under fem minutter, eller snakk med oss om et oppsett som passer volumet deres.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <AuthAwareLink
                href={LANDING_AUTH_PATHS.signUp}
                loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-6 text-[14px] font-semibold text-[#1C1C1C] shadow-[0_4px_24px_-4px_rgba(255,255,255,0.2)] transition-all duration-150 hover:bg-[#f2f3f5]"
              >
                Start gratis
                <ArrowRightIcon className="size-3.5" />
              </AuthAwareLink>
              <Link
                href={LANDING_CONTACT_PAGE_PATH}
                className="inline-flex h-10 items-center rounded-lg border border-[#2a2a2a] bg-transparent px-6 text-[14px] font-medium text-[#6b7280] transition-all duration-150 hover:border-[#3a3a3a] hover:text-[#9ca3af]"
              >
                Kontaktskjema
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
