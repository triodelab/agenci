"use client";

import Link from "next/link";
import { CheckIcon, MinusIcon, ArrowRightIcon } from "lucide-react";
import { useState } from "react";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
  LANDING_AUTH_PATHS,
  LANDING_SECTION_IDS,
  landingSectionHref,
} from "@/modules/landing/constants";

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

export function LandingPricingSection({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const [isYearly, setIsYearly] = useState(false);
  /* Prisbyttet animeres først etter første valg — ikke ved sidelasting. */
  const [toggled, setToggled] = useState(false);
  const Container = embedded ? "div" : "section";
  return (
    <Container
      id={embedded ? undefined : LANDING_SECTION_IDS.pricing}
      data-landing-nav-surface="light"
      className="agenci-editorial agenci-pricing"
      aria-labelledby="pricing-heading"
    >
      <header className="agenci-heading-row">
        <div>
          <span className="agenci-eyebrow">Plass til å vokse</span>
          <h2 id="pricing-heading">
            Start enkelt.
            <br />
            <em>Voks i ditt tempo.</em>
          </h2>
          <p className="agenci-pricing-lead">
            Ingen kortinfo for å starte. Ingen bindingstid.
          </p>
        </div>
        <div className="agenci-billing">
          <div role="group" aria-label="Faktureringsperiode">
            {[false, true].map((yearly) => (
              <button
                key={String(yearly)}
                type="button"
                aria-pressed={isYearly === yearly}
                onClick={() => {
                  setIsYearly(yearly);
                  setToggled(true);
                }}
              >
                {yearly ? "Årlig" : "Månedlig"}
              </button>
            ))}
          </div>
          <span>Spar 20 % med årlig fakturering</span>
        </div>
      </header>
      <div className="agenci-price-grid">
        {PLANS.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          return (
            <article
              key={plan.id}
              className={`agenci-price-card ${plan.featured ? "is-featured" : ""}`}
            >
              <div className="agenci-price-name">
                <h3>{plan.name}</h3>
                {plan.featured && <span>Populær</span>}
              </div>
              {/* key={isYearly}: ny pris glir inn ved bytte (agenci-price-swap). */}
              <p
                key={`value-${isYearly}`}
                className={`agenci-price-value${toggled ? " agenci-price-swap" : ""}`}
              >
                {price.toLocaleString("nb-NO")}
                <span>kr{price > 0 ? " / mnd" : ""}</span>
              </p>
              <p
                key={`period-${isYearly}`}
                className={`agenci-price-period${toggled ? " agenci-price-swap" : ""}`}
              >
                {price === 0
                  ? "Alltid gratis"
                  : isYearly
                    ? `Faktureres ${(price * 12).toLocaleString("nb-NO")} kr/år`
                    : "Faktureres månedlig"}
              </p>
              <p className="agenci-price-blurb">{plan.blurb}</p>
              <span className="agenci-price-volume">{plan.conversations}</span>
              <ul>
                {plan.bullets.map((bullet) => (
                  <li
                    key={bullet.text}
                    className={!bullet.included ? "is-excluded" : ""}
                  >
                    {bullet.included ? (
                      <CheckIcon size={16} aria-hidden />
                    ) : (
                      <MinusIcon size={16} aria-hidden />
                    )}
                    <span>{bullet.text}</span>
                  </li>
                ))}
              </ul>
              <AuthAwareLink
                href={LANDING_AUTH_PATHS.signUp}
                loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
                className="agenci-price-cta"
              >
                {plan.cta}
                <ArrowRightIcon size={16} />
              </AuthAwareLink>
            </article>
          );
        })}
      </div>
      <div className="agenci-enterprise">
        <div>
          <strong>Noe litt større?</strong>
          <p>La oss finne et oppsett som passer organisasjonen deres.</p>
        </div>
        <Link href={landingSectionHref("contact")} className="agenci-text-link">
          Snakk med oss <ArrowRightIcon size={18} />
        </Link>
      </div>
      <p className="agenci-price-note">
        Alle priser ekskl. 25 % MVA · Ingen bindingstid
        {isYearly ? " · Faktureres årlig" : ""}
      </p>
    </Container>
  );
}
