"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { toast } from "sonner";
import {
  GemIcon, ZapIcon, CheckIcon, ChevronRightIcon,
  Loader2Icon, MessageSquareIcon, BotIcon, DatabaseIcon,
  ArrowUpRightIcon,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { PricingTable } from "@/modules/billing/ui/components/pricing-table";

// ─── Types ────────────────────────────────────────────────────────────────────

const PLAN_LABEL: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  business: "Business",
};

const PLAN_AGENT_LIMIT: Record<string, number> = {
  starter: 1,
  pro: 3,
  business: 10,
};

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ["1 AI-agent", "Kunnskapsbase", "Widget-tilpasning", "Standard support"],
  pro: ["3 AI-agenter", "Alle integrasjoner", "Stemmeassistent (VAPI)", "Prioritert support"],
  business: ["10 AI-agenter", "Egendefinert domene", "SLA-garanti", "Dedikert support"],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border/60 bg-muted/20 px-5 py-4">
        <p className="text-[14px] font-semibold text-foreground">{title}</p>
        {description && <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>}
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function UsageStat({
  icon: Icon, label, value, max, suffix,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: number;
  max?: number;
  suffix?: string;
}) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  const nearLimit = pct >= 80;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
        </div>
        <p className="text-[12px] font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-[22px] font-bold text-foreground tabular-nums">
        {value}
        {max && (
          <span className="text-[14px] font-normal text-muted-foreground ml-1">/ {max}</span>
        )}
        {suffix && !max && (
          <span className="text-[13px] font-normal text-muted-foreground ml-1">{suffix}</span>
        )}
      </p>
      {max && (
        <div className="mt-2.5">
          <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                nearLimit ? "bg-amber-500" : "bg-foreground",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          {nearLimit && (
            <p className="mt-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              Nær grensen — vurder å oppgradere
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string | null | undefined }) {
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
      Gratis
    </span>
  );
}

// ─── Plan view ────────────────────────────────────────────────────────────────

export function PlanView() {
  const subscription = useQuery(api.private.subscription.getOwn);
  const overview = useQuery(api.private.dashboard.getOverview);
  const [portalLoading, setPortalLoading] = useState(false);

  const planKey = subscription?.planKey ?? null;
  const planLabel = planKey ? (PLAN_LABEL[planKey] ?? planKey) : "Gratis";
  const isActive = subscription?.status === "active";
  const isTrialing = subscription?.status === "trialing";
  const agentLimit = planKey ? (PLAN_AGENT_LIMIT[planKey] ?? 1) : 1;
  const features = planKey ? (PLAN_FEATURES[planKey] ?? []) : [];

  const daysLeft = subscription?.trialEndsAt
    ? Math.max(0, Math.ceil((subscription.trialEndsAt - Date.now()) / 86_400_000))
    : null;

  const totalConvs =
    (overview?.conversations.unresolved.count ?? 0) +
    (overview?.conversations.escalated.count ?? 0) +
    (overview?.conversations.resolved.count ?? 0);

  async function openPortal() {
    if (!subscription?.stripeCustomerId) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: subscription.stripeCustomerId }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else toast.error(data.error ?? "Kunne ikke åpne betalingsportalen.");
    } catch {
      toast.error("Nettverksfeil. Prøv igjen.");
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="space-y-4">

      {/* Current plan */}
      <Card title="Nåværende plan" description="Ditt aktive abonnement">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-muted">
              {isActive ? (
                <GemIcon className="size-5 text-foreground" strokeWidth={1.75} />
              ) : (
                <ZapIcon className="size-5 text-foreground" strokeWidth={1.75} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[16px] font-bold text-foreground">{planLabel}</p>
                <StatusBadge status={subscription?.status} />
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {isTrialing && daysLeft !== null
                  ? `${daysLeft} dager igjen av prøveperioden`
                  : isActive
                  ? "Aktivt abonnement"
                  : "Oppgrader for å komme i gang"}
              </p>
            </div>
          </div>
          {subscription?.stripeCustomerId ? (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-[13px] font-medium text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {portalLoading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <><ArrowUpRightIcon className="size-4" strokeWidth={1.75} />Administrer abonnement</>
              )}
            </button>
          ) : (
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-[13px] font-medium text-background hover:bg-foreground/90 transition-colors"
            >
              <ChevronRightIcon className="size-4" />
              Velg plan
            </a>
          )}
        </div>

        {features.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-border/40">
            {features.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground/70"
              >
                <CheckIcon className="size-3" strokeWidth={2.5} />
                {f}
              </span>
            ))}
          </div>
        )}

        {subscription?.trialEndsAt && isTrialing && (
          <div className="mt-4 rounded-lg border border-amber-200/60 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20 px-4 py-3">
            <p className="text-[12px] font-medium text-amber-800 dark:text-amber-300">
              Prøveperioden utløper {new Date(subscription.trialEndsAt).toLocaleDateString("no-NO", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="mt-0.5 text-[11px] text-amber-700/70 dark:text-amber-400/70">
              Velg en plan under for å fortsette uten avbrudd.
            </p>
          </div>
        )}
      </Card>

      {/* Usage */}
      <Card title="Bruk" description="Ressurser brukt av organisasjonen din">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <UsageStat
            icon={BotIcon}
            label="AI-agenter"
            value={0}
            max={agentLimit}
          />
          <UsageStat
            icon={MessageSquareIcon}
            label="Samtaler totalt"
            value={totalConvs}
          />
          <UsageStat
            icon={DatabaseIcon}
            label="Kunnskapsbase"
            value={overview?.knowledge.approxIndexedKb ?? 0}
            suffix="KB"
          />
        </div>
      </Card>

      {/* Pricing table */}
      <div id="pricing">
        <Card title="Tilgjengelige planer" description="Alle priser ekskl. 25 % MVA">
          <PricingTable currentPlanKey={subscription?.planKey ?? null} />
        </Card>
      </div>

    </div>
  );
}
