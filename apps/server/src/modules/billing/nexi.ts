/**
 * Nexi Checkout Payment API (formerly Nets Easy). Test and live differ only
 * in the hosts and keys — NEXI_MODE picks the host.
 * Docs: https://developer.nexigroup.com/nexi-checkout/en-EU/api/payment-v1/
 */
import { env } from "@agenci/env/server";
import { type BillingInterval, type PlanId, PLANS, planAmounts } from "./plans";

const API = env.NEXI_MODE === "live" ? "https://api.dibspayment.eu" : "https://test.api.dibspayment.eu";

/** Checkout.js for the embedded payment form (frontend). */
export const NEXI_CHECKOUT_JS =
  env.NEXI_MODE === "live"
    ? "https://checkout.dibspayment.eu/v1/checkout.js?v=1"
    : "https://test.checkout.dibspayment.eu/v1/checkout.js?v=1";

/** Webhook events we act on. */
export const NEXI_EVENTS = ["payment.charge.created.v2", "payment.reservation.failed"] as const;

export class NexiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "NexiError";
  }
}

export function nexiConfigured() {
  return Boolean(env.NEXI_SECRET_KEY && env.NEXI_CHECKOUT_KEY && env.NEXI_WEBHOOK_SECRET);
}

/** Nexi caps the webhook authorization value; ours is a random hex string. */
export function webhookAuthorization() {
  return (env.NEXI_WEBHOOK_SECRET ?? "").slice(0, 32);
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (!env.NEXI_SECRET_KEY) throw new NexiError("NEXI_SECRET_KEY mangler", 500);
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: env.NEXI_SECRET_KEY, "Content-Type": "application/json", Accept: "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  const text = await res.text();
  if (!res.ok) throw new NexiError(`Nexi ${method} ${path} → ${res.status}: ${text.slice(0, 400)}`, res.status);
  return (text ? JSON.parse(text) : {}) as T;
}

function orderFor(plan: PlanId, reference: string, interval: BillingInterval) {
  const a = planAmounts(plan, interval);
  const yearly = interval === "year";
  return {
    items: [
      {
        reference: `agenci-${plan}-${interval}`,
        name: `Agenci ${PLANS[plan].name} – ${yearly ? "12 måneder" : "1 måned"}`,
        quantity: 1,
        unit: yearly ? "år" : "mnd",
        unitPrice: a.net,
        taxRate: a.taxRate,
        taxAmount: a.tax,
        grossTotalAmount: a.gross,
        netTotalAmount: a.net,
      },
    ],
    amount: a.gross,
    currency: "NOK",
    reference,
  };
}

/** Nexi only calls public https URLs; locally the checkout page confirms instead. */
function webhooks(publicUrl: string) {
  if (!publicUrl.startsWith("https://")) return [];
  return NEXI_EVENTS.map((eventName) => ({
    eventName,
    url: `${publicUrl}/api/billing/nexi/webhook`,
    authorization: webhookAuthorization(),
  }));
}

/**
 * Embedded checkout that starts a monthly subscription and charges the first
 * month right away. `checkoutUrl` must be exactly the page that shows it.
 */
export async function createSubscriptionCheckout(input: {
  plan: PlanId;
  interval: BillingInterval;
  reference: string;
  checkoutUrl: string;
  termsUrl: string;
  publicUrl: string;
  /** Update the card on an existing subscription instead of creating one. */
  subscriptionId?: string;
  /** Payer's e-mail, for Nexi's receipt. */
  email?: string | null;
}) {
  const fiveYears = new Date();
  fiveYears.setFullYear(fiveYears.getFullYear() + 5);
  return call<{ paymentId: string }>("POST", "/v1/payments", {
    checkout: {
      integrationType: "EmbeddedCheckout",
      url: input.checkoutUrl,
      termsUrl: input.termsUrl,
      charge: !input.subscriptionId,
      // The company is already verified in Brønnøysund: show only the card form.
      merchantHandlesConsumerData: true,
    },
    ...(input.email ? { consumer: { reference: input.reference.slice(0, 36), email: input.email } } : {}),
    order: orderFor(input.plan, input.reference, input.interval),
    subscription: input.subscriptionId
      ? { subscriptionId: input.subscriptionId }
      : { endDate: fiveYears.toISOString(), interval: 0 },
    notifications: { webhooks: webhooks(input.publicUrl) },
  });
}

export type NexiPayment = {
  payment: {
    paymentId: string;
    summary?: { chargedAmount?: number; reservedAmount?: number };
    subscription?: { id?: string };
    orderDetails?: { amount?: number; reference?: string };
  };
};

export function getPayment(paymentId: string) {
  return call<NexiPayment>("GET", `/v1/payments/${paymentId}`);
}

/**
 * Charge subscriptions (asynchronous at Nexi). `externalBulkChargeId` makes
 * a retried request a no-op instead of a second charge.
 */
export function bulkCharge(input: {
  externalBulkChargeId: string;
  publicUrl: string;
  charges: { subscriptionId: string; plan: PlanId; interval: BillingInterval; reference: string }[];
}) {
  return call<{ bulkId: string }>("POST", "/v1/subscriptions/charges", {
    externalBulkChargeId: input.externalBulkChargeId,
    notifications: { webhooks: webhooks(input.publicUrl) },
    subscriptions: input.charges.map((c) => ({
      subscriptionId: c.subscriptionId,
      order: orderFor(c.plan, c.reference, c.interval),
    })),
  });
}
