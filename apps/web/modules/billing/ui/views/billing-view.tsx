"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  DashboardPageHeader,
  DashboardPagePanel,
  DashboardPageShell,
} from "@/modules/dashboard/ui/components/dashboard-page-shell";
import { PricingTable } from "../components/pricing-table";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  business: "Business",
};

function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status || status === "free") {
    return (
      <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
        Gratis
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-[11px] font-medium text-green-600 dark:text-green-400">
        Aktiv
      </span>
    );
  }
  if (status === "trialing") {
    return (
      <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
        Prøveperiode
      </span>
    );
  }
  if (status === "canceled") {
    return (
      <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-400">
        Avsluttet
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      {status}
    </span>
  );
}

export const BillingView = () => {
  const subscription = useQuery(api.private.subscription.getOwn);
  const [portalLoading, setPortalLoading] = useState(false);

  const planLabel = PLAN_LABELS[subscription?.planKey ?? ""] ?? "Gratis";
  const hasStripeCustomer = !!subscription?.stripeCustomerId;

  async function openPortal() {
    if (!subscription?.stripeCustomerId) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: subscription.stripeCustomerId }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        description="Administrer abonnement, betalingsmåte og fakturaer. Velg plan under for å starte eller oppgradere."
        kicker="Konto"
        title="Abonnement og betaling"
      />

      <section className="mt-8 space-y-3">
        <h2 className="dash-page-kicker text-foreground">Nåværende abonnement</h2>
        <DashboardPagePanel className="mt-2" variant="lattice">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-semibold text-foreground">{planLabel}</p>
                <StatusBadge status={subscription?.status} />
              </div>
              {subscription?.trialEndsAt && (
                <p className="text-[12px] text-muted-foreground">
                  Prøveperiode slutter{" "}
                  {new Date(subscription.trialEndsAt).toLocaleDateString("nb-NO")}
                </p>
              )}
              {!hasStripeCustomer && (
                <p className="text-[12px] text-muted-foreground">
                  Velg en plan under for å komme i gang.
                </p>
              )}
            </div>
            {hasStripeCustomer && (
              <Button
                variant="outline"
                size="sm"
                onClick={openPortal}
                disabled={portalLoading}
                className="shrink-0 self-start sm:self-auto"
              >
                {portalLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "Administrer abonnement"
                )}
              </Button>
            )}
          </div>
        </DashboardPagePanel>
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="dash-page-kicker text-foreground">Planer</h2>
        <p className="text-muted-foreground max-w-2xl text-[13px] leading-relaxed">
          Velg plan som passer din bedrift. Alle priser ekskl. 25&nbsp;% MVA.
        </p>
        <DashboardPagePanel className="mt-2" variant="lattice">
          <PricingTable currentPlanKey={subscription?.planKey ?? null} />
        </DashboardPagePanel>
      </section>
    </DashboardPageShell>
  );
};
