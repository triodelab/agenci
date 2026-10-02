import { sellerVatRegistered } from "./seller";

/**
 * Plans as sold on agenci.no/priser. Prices are per month, excluding MVA,
 * in øre: `price` billed monthly, `yearlyPrice` per month when billed
 * yearly (20 % off, charged as 12 months at once). The trial gets Starter's limits.
 */
export const PLANS = {
  starter: { id: "starter", name: "Starter", price: 49_900, yearlyPrice: 39_900, conversations: 500, agents: 1 },
  pro: { id: "pro", name: "Pro", price: 149_900, yearlyPrice: 119_900, conversations: 2_000, agents: 3 },
  business: { id: "business", name: "Business", price: 399_900, yearlyPrice: 319_900, conversations: 10_000, agents: 10 },
} as const;

export type PlanId = keyof typeof PLANS;
export const PLAN_IDS = Object.keys(PLANS) as PlanId[];

export type BillingInterval = "month" | "year";
export const INTERVALS = ["month", "year"] as const;
export const isInterval = (v: unknown): v is BillingInterval => v === "month" || v === "year";

export const TRIAL_DAYS = 30;
export const TRIAL_PLAN: PlanId = "starter";
/** Days a failed payment keeps the plan running before it is cancelled. */
export const GRACE_DAYS = 7;
export const VAT_RATE = 0.25;

/**
 * Amounts for one billing period of a plan (øre): a month, or 12 months at
 * the yearly price. No VAT until the seller is VAT-registered.
 */
export function planAmounts(plan: PlanId, interval: BillingInterval = "month") {
  const net = interval === "year" ? PLANS[plan].yearlyPrice * 12 : PLANS[plan].price;
  const rate = sellerVatRegistered() ? VAT_RATE : 0;
  const tax = Math.round(net * rate);
  return { net, tax, gross: net + tax, taxRate: Math.round(rate * 10_000) };
}

export function isPlanId(value: string): value is PlanId {
  return value in PLANS;
}
