"use client";

import { useState } from "react";
import { CheckIcon, MinusIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";

type Bullet = { text: string; included: boolean };

type Plan = {
  key: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  conversations: string;
  blurb: string;
  featured: boolean;
  monthlyPriceId: string;
  yearlyPriceId: string;
  bullets: Bullet[];
};

const PLANS: Plan[] = [
  {
    key: "starter",
    name: "Starter",
    monthlyPrice: 499,
    yearlyPrice: 399,
    conversations: "500 samtaler / mnd",
    blurb: "For bedrifter som vil spare tid på kundehenvendelser.",
    featured: false,
    monthlyPriceId: "price_1TUVOv5i2xNBpguUAddDz9Vu",
    yearlyPriceId: "price_1TUVTm5i2xNBpguUzSERdjQY",
    bullets: [
      { text: "1 AI-agent", included: true },
      { text: "Chat-widget på nettsiden", included: true },
      { text: "2 teammedlemmer", included: true },
      { text: "Grunnleggende analyser", included: true },
      { text: "Fjern «Powered by Agenci»", included: false },
      { text: "Prioritert support", included: false },
    ],
  },
  {
    key: "pro",
    name: "Pro",
    monthlyPrice: 1499,
    yearlyPrice: 1199,
    conversations: "2 000 samtaler / mnd",
    blurb: "Full AI-kraft for voksende team med høyere volum.",
    featured: true,
    monthlyPriceId: "price_1TUVPn5i2xNBpguU5ySJ7b7r",
    yearlyPriceId: "price_1TUVUd5i2xNBpguUw2KOkCpU",
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
    key: "business",
    name: "Business",
    monthlyPrice: 3999,
    yearlyPrice: 3199,
    conversations: "10 000 samtaler / mnd",
    blurb: "For organisasjoner med høyt volum og flere kanaler.",
    featured: false,
    monthlyPriceId: "price_1TUVQH5i2xNBpguUXW338drQ",
    yearlyPriceId: "price_1TUVVE5i2xNBpguUPrDfEhRn",
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

export function PricingTable({ currentPlanKey }: { currentPlanKey: string | null }) {
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function startCheckout(plan: Plan) {
    const priceId = isYearly ? plan.yearlyPriceId : plan.monthlyPriceId;
    setLoadingPlan(plan.key);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Kunne ikke starte betaling. Prøv igjen.");
      }
    } catch {
      toast.error("Nettverksfeil. Sjekk internettforbindelsen og prøv igjen.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Billing toggle */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">
          Spar 20&nbsp;% med årlig fakturering
        </p>
        <div className="flex items-center rounded-full border border-border/60 bg-muted/30 p-0.5">
          {(["monthly", "yearly"] as const).map((key) => {
            const active = (key === "yearly") === isYearly;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setIsYearly(key === "yearly")}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors duration-150",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {key === "monthly" ? "Månedlig" : "Årlig"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isCurrent = currentPlanKey === plan.key;

          return (
            <article
              key={plan.key}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-xl border p-5 transition-[border-color,box-shadow] duration-200",
                plan.featured
                  ? "border-primary/40 bg-card shadow-[0_0_0_1px_hsl(var(--primary)/0.12),0_8px_32px_-12px_hsl(var(--primary)/0.15)]"
                  : "border-border/60 bg-card/60 hover:border-border",
              )}
            >
              {plan.featured && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--primary)/0.06), transparent 70%)",
                  }}
                />
              )}

              <div className="relative mb-3 flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {plan.name}
                </span>
                {plan.featured && (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium tracking-[0.1em] text-primary uppercase">
                    Populær
                  </span>
                )}
                {isCurrent && !plan.featured && (
                  <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
                    Aktiv
                  </span>
                )}
              </div>

              <div className="relative mb-1 flex items-baseline gap-1">
                <span className="text-[2rem] font-semibold leading-none tracking-tight text-foreground">
                  {price.toLocaleString("nb-NO")}
                </span>
                <span className="text-[13px] text-muted-foreground">kr / mnd</span>
              </div>

              <p className="relative mb-4 text-[11px] text-muted-foreground/60">
                {isYearly
                  ? `Faktureres ${(price * 12).toLocaleString("nb-NO")} kr/år`
                  : "Faktureres månedlig"}
              </p>

              <div className="relative mb-4 inline-flex w-fit items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2.5 py-1">
                <span className="size-1.5 rounded-full bg-primary/60" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {plan.conversations}
                </span>
              </div>

              <p className="relative mb-5 text-[13px] leading-relaxed text-muted-foreground">
                {plan.blurb}
              </p>

              <div className="relative mb-5 h-px bg-border/60" />

              <ul className="relative flex flex-1 flex-col gap-2.5">
                {plan.bullets.map((bullet) => (
                  <li key={bullet.text} className="flex items-start gap-2.5">
                    {bullet.included ? (
                      <CheckIcon
                        className={cn(
                          "mt-0.5 size-3.5 shrink-0",
                          plan.featured ? "text-primary" : "text-muted-foreground",
                        )}
                        strokeWidth={2.5}
                        aria-hidden
                      />
                    ) : (
                      <MinusIcon
                        className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/30"
                        strokeWidth={2}
                        aria-hidden
                      />
                    )}
                    <span
                      className={cn(
                        "text-[12.5px] leading-relaxed",
                        bullet.included ? "text-muted-foreground" : "text-muted-foreground/40",
                      )}
                    >
                      {bullet.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="relative mt-6">
                <button
                  type="button"
                  disabled={isCurrent || loadingPlan === plan.key}
                  onClick={() => startCheckout(plan)}
                  className={cn(
                    "flex h-9 w-full items-center justify-center rounded-lg text-[13px] font-medium transition-all duration-150",
                    isCurrent
                      ? "cursor-default border border-border/60 bg-transparent text-muted-foreground"
                      : plan.featured
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.4)]"
                        : "border border-border/60 bg-transparent text-muted-foreground hover:border-border hover:text-foreground",
                  )}
                >
                  {loadingPlan === plan.key ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isCurrent ? (
                    "Aktiv plan"
                  ) : (
                    "Velg plan"
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-muted-foreground/60">
        Alle priser ekskl. 25&nbsp;% MVA · Ingen bindingstid · Bytt plan når som helst
      </p>
    </div>
  );
}
