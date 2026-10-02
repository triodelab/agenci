import { sellerVatRegistered } from "./seller";

/**
 * Plans as sold on agenci.no/priser. Prices are per month, excluding MVA,
 * in øre. The 30-day trial gets the Starter limits.
 */
export const PLANS = {
  starter: { id: "starter", name: "Starter", price: 49_900, conversations: 500, agents: 1 },
  pro: { id: "pro", name: "Pro", price: 149_900, conversations: 2_000, agents: 3 },
  business: { id: "business", name: "Business", price: 399_900, conversations: 10_000, agents: 10 },
} as const;

export type PlanId = keyof typeof PLANS;
export const PLAN_IDS = Object.keys(PLANS) as PlanId[];

export const TRIAL_DAYS = 30;
export const TRIAL_PLAN: PlanId = "starter";
/** Days a failed payment keeps the plan running before it is cancelled. */
export const GRACE_DAYS = 7;
export const VAT_RATE = 0.25;

/**
 * Amounts for one month of a plan (øre). No VAT until the seller is
 * VAT-registered (it may not charge VAT before that).
 */
export function planAmounts(plan: PlanId) {
  const net = PLANS[plan].price;
  const rate = sellerVatRegistered() ? VAT_RATE : 0;
  const tax = Math.round(net * rate);
  return { net, tax, gross: net + tax, taxRate: Math.round(rate * 10_000) };
}

export function isPlanId(value: string): value is PlanId {
  return value in PLANS;
}
