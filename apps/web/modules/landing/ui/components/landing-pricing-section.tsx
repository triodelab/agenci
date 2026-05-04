"use client";

import Link from "next/link";
import { CheckIcon, MinusIcon, ArrowRightIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
  LANDING_AUTH_PATHS,
  LANDING_SECTION_IDS,
  landingSectionHref,
} from "@/modules/landing/constants";
import { cn } from "@workspace/ui/lib/utils";

// ─── Plan definitions ─────────────────────────────────────────────────────────

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
    blurb: "Kom i gang uten kortinfo. Test Agenci på din bedrift.",
    featured: false,
    cta: "Start gratis",
    bullets: [
      { text: "1 AI-agent", included: true },
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
    blurb: "For bedrifter som vil spare tid på kundehenvendelser.",
    featured: false,
    cta: "Kom i gang",
    bullets: [
      { text: "1 AI-agent", included: true },
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
    blurb: "Full AI-kraft for voksende team med høyere volum.",
    featured: true,
    cta: "Kom i gang",
    bullets: [
      { text: "3 AI-agenter", included: true },
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
    blurb: "For organisasjoner med høyt volum og flere kanaler.",
    featured: false,
    cta: "Kom i gang",
    bullets: [
      { text: "10 AI-agenter", included: true },
      { text: "Alle integrasjoner", included: true },
      { text: "Ubegrenset teammedlemmer", included: true },
      { text: "Full analyse + CSV-eksport", included: true },
      { text: "Fjern «Powered by Agenci»", included: true },
      { text: "Dedikert support", included: true },
    ],
  },
];

// ─── Section ──────────────────────────────────────────────────────────────────

export function LandingPricingSection() {
  const reduceMotion = useReducedMotion();
  const [isYearly, setIsYearly] = useState(false);

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      id={LANDING_SECTION_IDS.pricing}
      data-landing-nav-surface="dark"
      className="border-t border-[#23252a] bg-[#010102]"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32 xl:px-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          className="mb-14"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease }}
        >
          {/* Kicker */}
          <div className="mb-5 inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[#5e6ad2]" />
            <span className="font-mono text-[11px] font-medium tracking-[0.18em] text-[#5e6ad2] uppercase">
              Priser
            </span>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="pricing-heading"
                className="text-[2.25rem] font-semibold leading-[1.06] tracking-[-0.055em] text-[#f7f8f8] sm:text-[2.5rem] md:text-[3rem]"
              >
                Start gratis.
                <br />
                Betal når dere vokser.
              </h2>
              <p className="mt-5 max-w-sm text-[15px] leading-[1.7] text-[#8a8f98]">
                Ingen kortinfo for å starte. Oppgrader når volumet krever det. Alle priser ekskl. 25&nbsp;% MVA.
              </p>
            </div>

            {/* Billing toggle */}
            <BillingToggle isYearly={isYearly} onToggle={setIsYearly} reduceMotion={reduceMotion ?? false} />
          </div>
        </motion.div>

        {/* ── Plan cards ─────────────────────────────────────────────────── */}
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isYearly={isYearly}
              index={i}
              reduceMotion={reduceMotion ?? false}
            />
          ))}
        </div>

        {/* ── Enterprise band ────────────────────────────────────────────── */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.5, delay: 0.28, ease }}
          className="mt-2.5 flex flex-col items-start justify-between gap-6 rounded-[12px] border border-[#23252a] bg-[#0f1011] p-6 sm:flex-row sm:items-center"
        >
          <div>
            <p className="text-[13px] font-semibold tracking-[-0.01em] text-[#d0d6e0]">
              Enterprise
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#62666d]">
              Skreddersydd oppsett for større organisasjoner — dedikert onboarding, SLA, egne integrasjoner og volumpriser.
            </p>
          </div>
          <Link
            href={landingSectionHref("contact")}
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#34343a] bg-[#141516] px-4 py-2 text-[13px] font-medium text-[#8a8f98] transition-all duration-150 hover:border-[#5e6ad2]/40 hover:text-[#d0d6e0]"
          >
            Ta kontakt
            <ArrowRightIcon className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {/* ── Footnote ───────────────────────────────────────────────────── */}
        <p className="mt-6 text-center text-[12px] text-[#3e3e44]">
          Alle priser ekskl. 25&nbsp;% MVA · Ingen bindingstid · Bytt plan når som helst
          {isYearly && " · Faktureres årlig"}
        </p>

      </div>
    </section>
  );
}

// ─── Billing toggle ───────────────────────────────────────────────────────────

function BillingToggle({
  isYearly,
  onToggle,
  reduceMotion,
}: {
  isYearly: boolean;
  onToggle: (v: boolean) => void;
  reduceMotion: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <div className="flex items-center rounded-full border border-[#23252a] bg-[#0f1011] p-0.5">
        {(["monthly", "yearly"] as const).map((key) => {
          const active = (key === "yearly") === isYearly;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggle(key === "yearly")}
              className={cn(
                "relative rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors duration-150",
                active ? "text-[#f7f8f8]" : "text-[#62666d] hover:text-[#8a8f98]",
              )}
            >
              {active && !reduceMotion && (
                <motion.span
                  layoutId="billing-pill"
                  className="absolute inset-0 rounded-full bg-[#1e1f22]"
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              {active && reduceMotion && (
                <span className="absolute inset-0 rounded-full bg-[#1e1f22]" />
              )}
              <span className="relative">
                {key === "monthly" ? "Månedlig" : "Årlig"}
              </span>
            </button>
          );
        })}
      </div>
      <span
        className={cn(
          "text-[11px] transition-opacity duration-200",
          isYearly ? "text-[#27a644] opacity-100" : "text-[#3e3e44] opacity-70",
        )}
      >
        Spar 20&nbsp;% med årlig fakturering
      </span>
    </div>
  );
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  isYearly,
  index,
  reduceMotion,
}: {
  plan: Plan;
  isYearly: boolean;
  index: number;
  reduceMotion: boolean;
}) {
  const ease = [0.22, 1, 0.36, 1] as const;
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  const isFree = plan.monthlyPrice === 0;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, delay: 0.06 + index * 0.065, ease }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[12px] border p-5 transition-[border-color,box-shadow] duration-200",
        plan.featured
          ? "border-[#5e6ad2]/40 bg-[#0f1011] shadow-[0_0_0_1px_rgba(94,106,210,0.12),0_8px_32px_-12px_rgba(94,106,210,0.2)]"
          : "border-[#23252a] bg-[#0f1011] hover:border-[#34343a]",
      )}
    >
      {/* Featured glow */}
      {plan.featured && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[12px]"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(94,106,210,0.08), transparent 70%)",
          }}
        />
      )}

      {/* Plan name + badge */}
      <div className="relative mb-4 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#62666d]">
          {plan.name}
        </span>
        {plan.featured && (
          <span className="rounded-full border border-[#5e6ad2]/30 bg-[#5e6ad2]/10 px-2 py-0.5 text-[10px] font-medium tracking-[0.1em] text-[#5e6ad2] uppercase">
            Populær
          </span>
        )}
      </div>

      {/* Price */}
      <div className="relative mb-1 flex items-baseline gap-1">
        <span className="text-[2.2rem] font-semibold leading-none tracking-[-0.04em] text-[#f7f8f8]">
          {price.toLocaleString("nb-NO")}
        </span>
        {!isFree && (
          <span className="text-[13px] text-[#3e3e44]">
            kr / mnd
          </span>
        )}
        {isFree && (
          <span className="text-[13px] text-[#3e3e44]">kr</span>
        )}
      </div>

      {/* Annual note */}
      <p className="relative mb-4 text-[11px] text-[#3e3e44]">
        {isFree
          ? "Alltid gratis"
          : isYearly
            ? `Faktureres ${(price * 12).toLocaleString("nb-NO")} kr/år`
            : "Faktureres månedlig"}
      </p>

      {/* Conversations */}
      <div className="relative mb-4 inline-flex w-fit items-center gap-1.5 rounded-md border border-[#23252a] bg-[#141516] px-2.5 py-1">
        <span className="size-1.5 rounded-full bg-[#5e6ad2]/60" />
        <span className="text-[11px] font-medium text-[#8a8f98]">
          {plan.conversations}
        </span>
      </div>

      {/* Blurb */}
      <p className="relative mb-5 text-[13px] leading-relaxed text-[#62666d]">
        {plan.blurb}
      </p>

      {/* Divider */}
      <div className="relative mb-5 h-px bg-[#1e1f22]" />

      {/* Bullets */}
      <ul className="relative flex flex-1 flex-col gap-2.5">
        {plan.bullets.map((bullet) => (
          <li key={bullet.text} className="flex items-start gap-2.5">
            {bullet.included ? (
              <CheckIcon
                className={cn(
                  "mt-0.5 size-3.5 shrink-0",
                  plan.featured ? "text-[#5e6ad2]" : "text-[#3e3e44]",
                )}
                strokeWidth={2.5}
                aria-hidden
              />
            ) : (
              <MinusIcon
                className="mt-0.5 size-3.5 shrink-0 text-[#2a2b2f]"
                strokeWidth={2}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "text-[12.5px] leading-relaxed",
                bullet.included ? "text-[#8a8f98]" : "text-[#3e3e44]",
              )}
            >
              {bullet.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="relative mt-6">
        <AuthAwareLink
          href={LANDING_AUTH_PATHS.signUp}
          loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
          className={cn(
            "flex h-9 w-full items-center justify-center rounded-lg text-[13px] font-medium transition-all duration-150",
            plan.featured
              ? "bg-[#5e6ad2] text-white hover:bg-[#6b77dd] shadow-[0_4px_16px_-4px_rgba(94,106,210,0.4)]"
              : "border border-[#23252a] bg-transparent text-[#8a8f98] hover:border-[#34343a] hover:text-[#d0d6e0]",
          )}
        >
          {plan.cta}
        </AuthAwareLink>
      </div>
    </motion.article>
  );
}
