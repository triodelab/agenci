import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowLeftIcon, CheckIcon, LockIcon, MessageCircleIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AgenciLoader } from "@/components/agenci-loader";
import { client } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { billingKeys, useBillingStatus } from "../../billing-queries";

const icon = { strokeWidth: 1.5, absoluteStrokeWidth: true } as const;

type PlanId = "starter" | "pro" | "business";

/** What each plan includes — the same lists as agenci.no/priser. */
const INCLUDED: Record<PlanId, string[]> = {
  starter: ["1 AI-agent", "Timebestilling i chatten", "Chat-widget på nettsiden", "2 teammedlemmer", "Grunnleggende analyser"],
  pro: ["3 AI-agenter", "Timebestilling i chatten", "5 teammedlemmer", "Full analyse og rapporter", "Fjern «Powered by Agenci»", "Prioritert e-poststøtte"],
  business: ["10 AI-agenter", "Alle integrasjoner", "Ubegrenset teammedlemmer", "Full analyse + CSV-eksport", "Fjern «Powered by Agenci»", "Dedikert support"],
};

const kr = (ore: number) => new Intl.NumberFormat("nb-NO").format(Math.round(ore / 100));
const orgNr = (n: string) => n.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");

type NexiCheckout = { on: (event: string, cb: (payload: unknown) => void) => void; cleanup?: () => void };
declare global {
  interface Window {
    Dibs?: { Checkout: new (opts: Record<string, unknown>) => NexiCheckout };
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.Dibs) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    const s = existing ?? document.createElement("script");
    s.addEventListener("load", () => resolve(), { once: true });
    s.addEventListener("error", () => reject(new Error("Kunne ikke laste betalingsvinduet.")), { once: true });
    if (!existing) {
      s.src = src;
      document.head.appendChild(s);
    }
  });
}

/**
 * Nexi's embedded payment form. The URL must be exactly the one given when
 * the payment was created (…/betaling), with ?paymentId= from the server.
 */
export default function CheckoutView({
  paymentId,
  plan: planId,
  interval,
}: {
  paymentId: string;
  plan?: PlanId;
  interval: "month" | "year";
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const status = useBillingStatus();
  const { data: org } = authClient.useActiveOrganization();
  const [phase, setPhase] = useState<"loading" | "ready" | "confirming" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);
  const config = status.data?.checkout;
  const plan = planId ? status.data?.plans.find((p) => p.id === planId) : undefined;
  const company = status.data?.company;
  const vat = status.data?.vatRegistered ?? false;
  const yearly = interval === "year";
  /** Net price for the period (øre), and the total charged today. */
  const net = plan ? (yearly ? plan.yearlyPrice * 12 : plan.price) : 0;
  const total = plan ? (yearly ? plan.yearWithVat : plan.priceWithVat) : 0;

  useEffect(() => {
    if (!config || !paymentId || mounted.current) return;
    mounted.current = true;
    let checkout: NexiCheckout | null = null;
    loadScript(config.scriptUrl)
      .then(() => {
        if (!window.Dibs) throw new Error("Kunne ikke laste betalingsvinduet.");
        checkout = new window.Dibs.Checkout({
          checkoutKey: config.checkoutKey,
          paymentId,
          containerId: "nexi-checkout",
          language: "nb-NO",
        });
        setPhase("ready");
        checkout.on("payment-completed", async () => {
          setPhase("confirming");
          try {
            await client.private.billing.confirmCheckout({ paymentId });
          } catch {
            // The webhook activates it too; the billing page shows the result.
          }
          await queryClient.invalidateQueries({ queryKey: billingKeys.status });
          await queryClient.invalidateQueries({ queryKey: billingKeys.payments });
          if (org?.slug) await navigate({ to: "/org/$orgSlug/billing", params: { orgSlug: org.slug } });
        });
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Kunne ikke laste betalingsvinduet.");
        setPhase("error");
      });
    return () => checkout?.cleanup?.();
  }, [config, paymentId, navigate, org?.slug, queryClient]);

  return (
    <div className="min-h-svh bg-(--dash-bg) px-4 py-8 md:py-12">
      <div className="mx-auto w-full max-w-[1040px]">
        {org?.slug ? (
          <Link
            to="/org/$orgSlug/billing"
            params={{ orgSlug: org.slug }}
            className="inline-flex h-9 items-center gap-1.5 rounded-full pr-3 pl-2 text-[13.5px] font-medium text-(--agenci-ink-2) transition-colors hover:bg-(--dash-subtle) hover:text-(--agenci-ink)"
          >
            <ArrowLeftIcon className="size-4" {...icon} /> Tilbake til plan og faktura
          </Link>
        ) : null}

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-10">
          {/* Order summary */}
          <section className="lg:sticky lg:top-8">
            <h1 className="[font-family:var(--font-agenci-title)] text-[34px] leading-tight font-medium tracking-[-0.03em] text-(--agenci-ink)">
              {plan ? `Agenci ${plan.name}` : "Oppdater kort"}
            </h1>
            <p className="mt-2 text-[14.5px] leading-relaxed text-(--agenci-ink-2)">
              {plan
                ? yearly
                  ? "Første år betales nå. Deretter trekkes beløpet automatisk hvert år. Ingen binding, si opp når du vil."
                  : "Første måned betales nå. Deretter trekkes beløpet automatisk hver måned. Ingen binding, si opp når du vil."
                : "Det nye kortet brukes fra neste månedlige trekk. Ingenting trekkes nå."}
            </p>

            {status.data?.testMode ? (
              <p className="mt-5 rounded-[12px] border border-[#ecd9a4] bg-[#fdf8e8] px-4 py-3 text-[13px] leading-relaxed text-[#6b5413]">
                <strong className="font-semibold">Testmodus.</strong> Ingen ekte penger trekkes. Bruk testkortet{" "}
                <span className="font-medium tabular-nums">4268 2700 8737 4847</span>, en fremtidig dato og valgfri CVC.
              </p>
            ) : null}

            <div className="mt-6 overflow-hidden rounded-[20px] border border-(--dash-edge)/80 bg-(--dash-surface) shadow-[0_1px_3px_rgb(5_6_7/0.06),0_14px_34px_-16px_rgb(5_6_7/0.18)]">
              {plan ? (
                <>
                  <div className="p-6">
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <p className="text-[15px] font-semibold text-(--agenci-ink)">{plan.name}</p>
                        <p className="mt-0.5 text-[12.5px] text-(--agenci-ink-3)">
                          {yearly ? "Faktureres årlig · spar 20 %" : "Faktureres månedlig"}
                        </p>
                      </div>
                      <p className="text-(--agenci-ink)">
                        <span className="[font-family:var(--font-agenci-title)] text-[28px] leading-none font-medium tracking-[-0.03em] tabular-nums">
                          {kr(yearly ? plan.yearlyPrice : plan.price)}
                        </span>
                        <span className="ml-1 text-[13px] text-(--agenci-ink-3)">kr / mnd</span>
                      </p>
                    </div>
                    <p className="mt-4 flex items-center gap-2 rounded-[12px] bg-(--dash-subtle) px-3 py-2.5 text-[13px] font-medium text-(--agenci-ink)">
                      <MessageCircleIcon className="size-4" {...icon} />
                      {new Intl.NumberFormat("nb-NO").format(plan.conversations)} samtaler / mnd
                    </p>
                    <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                      {INCLUDED[plan.id as PlanId].map((t) => (
                        <li key={t} className="flex items-center gap-2.5 text-[13.5px] text-(--agenci-ink)">
                          <CheckIcon className="size-4 shrink-0" strokeWidth={2} />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <dl className="border-t border-(--agenci-line) bg-(--dash-subtle-2) px-6 py-4 text-[13.5px]">
                    <div className="flex justify-between py-1">
                      <dt className="text-(--agenci-ink-2)">{yearly ? "12 måneder" : "Pris per måned"}</dt>
                      <dd className="tabular-nums text-(--agenci-ink)">{kr(net)} kr</dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="text-(--agenci-ink-2)">Mva.</dt>
                      <dd className="tabular-nums text-(--agenci-ink)">
                        {vat ? `${kr(total - net)} kr` : "Ikke mva-pliktig"}
                      </dd>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between border-t border-(--agenci-line) pt-3">
                      <dt className="font-medium text-(--agenci-ink)">Å betale i dag</dt>
                      <dd className="text-[18px] font-semibold tabular-nums text-(--agenci-ink)">{kr(total)} kr</dd>
                    </div>
                  </dl>
                </>
              ) : (
                <p className="p-6 text-[14px] leading-relaxed text-(--agenci-ink-2)">
                  Fyll inn det nye kortet. Abonnementet og planen fortsetter som før.
                </p>
              )}
              {company ? (
                <div className="border-t border-(--agenci-line) px-6 py-4">
                  <p className="text-[12px] text-(--agenci-ink-3)">Faktureres til</p>
                  <p className="mt-0.5 text-[14px] font-medium text-(--agenci-ink)">{company.name}</p>
                  <p className="text-[12.5px] text-(--agenci-ink-3)">Org.nr. {orgNr(company.orgNumber)}</p>
                </div>
              ) : null}
            </div>
          </section>

          {/* Nexi's payment form */}
          <section className="rounded-[20px] border border-(--dash-edge)/80 bg-(--dash-surface) p-3 shadow-[0_1px_3px_rgb(5_6_7/0.06),0_14px_34px_-16px_rgb(5_6_7/0.18)] md:p-5">
            <p className="flex items-center gap-1.5 px-1 pb-3 text-[12.5px] text-(--agenci-ink-3)">
              <LockIcon className="size-3.5" {...icon} /> Sikker kortbetaling via Nexi. Vi ser aldri kortnummeret ditt.
            </p>
            {phase === "loading" || phase === "confirming" ? (
              <div className="flex h-[360px] flex-col items-center justify-center gap-3 text-[14px] text-(--agenci-ink-2)">
                <AgenciLoader size={40} decorative />
                {phase === "confirming" ? "Bekrefter betalingen …" : "Laster betalingsvinduet …"}
              </div>
            ) : null}
            {phase === "error" ? <p className="p-6 text-[14px] text-(--dash-bad)">{error}</p> : null}
            {!config && status.isSuccess ? (
              <p className="p-6 text-[14px] text-(--agenci-ink-2)">Betaling er ikke satt opp ennå.</p>
            ) : null}
            {/* Never display:none — Nexi sizes its frame from this width when it starts. */}
            <div
              id="nexi-checkout"
              className={cn(
                "w-full [&_iframe]:!w-full [&_iframe]:min-w-[320px]",
                phase !== "ready" && "h-0 overflow-hidden",
              )}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
