import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";

export type Usage = {
  month: string;
  days: number[];
  total: number;
  previousTotal: number;
};

/** Conversations this month for the whole organization. */
export function useUsageQuery() {
  return useQuery({
    queryKey: ["billing-usage"],
    queryFn: (): Promise<Usage> => client.private.conversations.usage(),
    refetchInterval: 60_000,
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
