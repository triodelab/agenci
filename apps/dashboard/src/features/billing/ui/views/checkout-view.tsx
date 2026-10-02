import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, LockIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AgenciLoader } from "@/components/agenci-loader";
import { client } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { billingKeys, useBillingStatus } from "../../billing-queries";

const icon = { strokeWidth: 1.5, absoluteStrokeWidth: true } as const;

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
export default function CheckoutView({ paymentId }: { paymentId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const status = useBillingStatus();
  const { data: org } = authClient.useActiveOrganization();
  const [phase, setPhase] = useState<"loading" | "ready" | "confirming" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);
  const config = status.data?.checkout;

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
    <div className="min-h-svh bg-(--dash-bg) px-4 py-8 md:py-14">
      <div className="mx-auto w-full max-w-[640px]">
        {org?.slug ? (
          <Link
            to="/org/$orgSlug/billing"
            params={{ orgSlug: org.slug }}
            className="inline-flex items-center gap-1.5 text-[14px] text-(--agenci-ink-2) hover:text-(--agenci-ink)"
          >
            <ArrowLeftIcon className="size-4" {...icon} /> Tilbake til plan og faktura
          </Link>
        ) : null}

        <h1 className="mt-6 [font-family:var(--font-agenci-title)] text-[32px] leading-tight font-medium tracking-[-0.02em] text-(--agenci-ink)">
          Betaling
        </h1>
        <p className="mt-2 flex items-center gap-1.5 text-[14px] text-(--agenci-ink-3)">
          <LockIcon className="size-3.5" {...icon} /> Kortbetaling via Nexi. Vi ser aldri kortnummeret ditt.
        </p>

        {status.data?.testMode ? (
          <p className="mt-5 rounded-[12px] border border-[#ecd9a4] bg-[#fdf8e8] px-4 py-3 text-[13.5px] leading-relaxed text-[#6b5413]">
            <strong className="font-semibold">Testmodus.</strong> Ingen ekte penger trekkes. Bruk et testkort fra{" "}
            <a
              href="https://developer.nexigroup.com/nexi-checkout/en-EU/docs/test-card-processing/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              Nexi sin testside
            </a>
            .
          </p>
        ) : null}

        <div className="mt-6 min-h-[420px] rounded-[18px] border border-(--dash-edge)/80 bg-(--dash-surface) p-2 md:p-4">
          {phase === "loading" || phase === "confirming" ? (
            <div className="flex h-[400px] flex-col items-center justify-center gap-3 text-[14px] text-(--agenci-ink-2)">
              <AgenciLoader size={40} decorative />
              {phase === "confirming" ? "Bekrefter betalingen …" : "Laster betalingsvinduet …"}
            </div>
          ) : null}
          {phase === "error" ? (
            <p className="p-6 text-[14px] text-(--dash-bad)">{error}</p>
          ) : null}
          {!config && status.isSuccess ? (
            <p className="p-6 text-[14px] text-(--agenci-ink-2)">Betaling er ikke satt opp ennå.</p>
          ) : null}
          <div id="nexi-checkout" className={phase === "ready" ? "" : "hidden"} />
        </div>
      </div>
    </div>
  );
}
