/**
 * Nexi webhooks: POST /api/billing/nexi/webhook.
 * Nexi sends our secret in the Authorization header (set per payment). We
 * act only on what the Payment API itself confirms (we re-read the payment),
 * so a forged body can't activate anything. Nexi retries until it gets 200.
 */
import type { Hono } from "hono";
import { timingSafeEqual } from "node:crypto";
import { webhookAuthorization } from "./nexi";
import { applyChargedPayment, markChargeFailed } from "./service";

function sameSecret(given: string | undefined) {
  const expected = webhookAuthorization();
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

type NexiWebhook = { id?: string; event?: string; data?: { paymentId?: string } };

// biome-ignore lint/suspicious/noExplicitAny: works with any Hono env
export function registerNexiWebhook(app: Hono<any>) {
  app.post("/api/billing/nexi/webhook", async (c) => {
    if (!sameSecret(c.req.header("authorization"))) return c.text("unauthorized", 401);
    const body = (await c.req.json().catch(() => ({}))) as NexiWebhook;
    const paymentId = body.data?.paymentId;
    if (!paymentId) return c.text("ok", 200);
    try {
      if (body.event?.startsWith("payment.charge.created")) await applyChargedPayment(paymentId);
      else if (body.event === "payment.reservation.failed") await markChargeFailed(paymentId);
    } catch (error) {
      // Not 200 → Nexi retries later.
      console.error("[nexi webhook]", body.event, paymentId, error);
      return c.text("retry", 500);
    }
    return c.text("ok", 200);
  });
}
