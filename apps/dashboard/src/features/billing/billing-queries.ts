import { useQuery } from "@tanstack/react-query";
import { demoConversationList } from "@/features/agents/ui/components/overview-mock";
import { client } from "@/lib/api";
import { useDemoMode } from "@/lib/demo-mode";

export type Usage = {
  month: string;
  days: number[];
  total: number;
  previousTotal: number;
};

/** Seeded demo usage: the demo conversations started this month, per day. */
function demoUsage(): Usage {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const days = Array.from({ length: now.getDate() }, () => 0);
  let previousTotal = 0;
  for (const c of demoConversationList()) {
    const t = new Date(c.createdAt).getTime();
    if (t >= start) {
      const i = new Date(t).getDate() - 1;
      days[i] = (days[i] ?? 0) + 1;
    } else if (t >= prevStart) previousTotal++;
  }
  return {
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    days,
    total: days.reduce((a, b) => a + b, 0),
    previousTotal,
  };
}

/** Conversations this month for the whole organization (demo-aware). */
export function useUsageQuery() {
  const { on: demo } = useDemoMode();
  return useQuery({
    queryKey: ["billing-usage", demo ? "demo" : "live"],
    queryFn: async (): Promise<Usage> =>
      demo ? demoUsage() : client.private.conversations.usage(),
    refetchInterval: demo ? false : 60_000,
  });
}

/* ── Subscription, trial and payments (server-side truth) ─────────────── */

export type BillingStatus = Awaited<ReturnType<typeof client.private.billing.status>>;
export type CompanyLookup = Awaited<ReturnType<typeof client.private.billing.lookupCompany>>;

export const billingKeys = {
  status: ["billing-status"] as const,
  payments: ["billing-payments"] as const,
};

/** Plan, trial and whether the AI may answer — for the whole organization. */
export function useBillingStatus() {
  return useQuery({
    queryKey: billingKeys.status,
    queryFn: () => client.private.billing.status(),
    staleTime: 30_000,
  });
}

export function useBillingPayments() {
  return useQuery({
    queryKey: billingKeys.payments,
    queryFn: () => client.private.billing.payments(),
  });
}

/** Enhetsregisteret lookup for a complete (9-digit) org number. */
export function useCompanyLookup(orgNumber: string) {
  const digits = orgNumber.replace(/\D/g, "");
  return useQuery({
    queryKey: ["company-lookup", digits],
    queryFn: () => client.private.billing.lookupCompany({ orgNumber: digits }),
    enabled: digits.length === 9,
    staleTime: 5 * 60_000,
    retry: false,
  });
}
