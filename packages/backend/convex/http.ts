import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const PRICE_TO_PLAN: Record<string, string> = {
  price_1TUVOv5i2xNBpguUAddDz9Vu: "starter",
  price_1TUVTm5i2xNBpguUzSERdjQY: "starter",
  price_1TUVPn5i2xNBpguU5ySJ7b7r: "pro",
  price_1TUVUd5i2xNBpguUw2KOkCpU: "pro",
  price_1TUVQH5i2xNBpguUXW338drQ: "business",
  price_1TUVVE5i2xNBpguUPrDfEhRn: "business",
};

function planFromSubscription(sub: { items?: { data?: Array<{ price?: { id: string } }> } }): string {
  const priceId = sub.items?.data?.[0]?.price?.id;
  return priceId ? (PRICE_TO_PLAN[priceId] ?? "starter") : "starter";
}

const http = httpRouter();

// ── Stripe webhook ───────────────────────────────────────────────────────────

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return new Response("Missing stripe-signature or STRIPE_WEBHOOK_SECRET", { status: 400 });
    }

    const valid = await verifyStripeSignature(payload, signature, secret);
    if (!valid) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(payload) as {
      type: string;
      data: { object: Record<string, unknown> };
    };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          metadata?: { orgId?: string; priceId?: string };
          subscription?: string;
          customer?: string;
        };
        const orgId = session.metadata?.orgId;
        if (!orgId) {
          console.error("[stripe-webhook] checkout.session.completed missing orgId in metadata");
          break;
        }

        const priceId = session.metadata?.priceId;
        const planKey = priceId ? (PRICE_TO_PLAN[priceId] ?? "starter") : "starter";

        console.log("[stripe-webhook] checkout.session.completed", { orgId, priceId, planKey });

        await ctx.runMutation(internal.system.subscriptions.upsert, {
          organizationId: orgId,
          status: "active",
          stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
          stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
          planKey,
        });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as {
          id: string;
          status: string;
          customer: string;
          trial_end?: number | null;
          items?: { data?: Array<{ price?: { id: string } }> };
          metadata?: { orgId?: string };
        };

        const existing = await ctx.runQuery(
          internal.system.subscriptions.getByStripeCustomerId,
          { stripeCustomerId: sub.customer },
        );

        const orgId = existing?.organizationId ?? sub.metadata?.orgId;
        if (!orgId) break;

        await ctx.runMutation(internal.system.subscriptions.upsert, {
          organizationId: orgId,
          status: sub.status,
          trialEndsAt: sub.trial_end ? sub.trial_end * 1000 : undefined,
          stripeCustomerId: sub.customer,
          stripeSubscriptionId: sub.id,
          planKey: planFromSubscription(sub),
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as { customer: string };

        const existing = await ctx.runQuery(
          internal.system.subscriptions.getByStripeCustomerId,
          { stripeCustomerId: sub.customer },
        );
        if (!existing) break;

        await ctx.runMutation(internal.system.subscriptions.upsert, {
          organizationId: existing.organizationId,
          status: "canceled",
          stripeCustomerId: sub.customer,
        });
        break;
      }

      default:
        console.log("Ignored Stripe event", event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const parts = signature.split(",");
    const tPart = parts.find((p) => p.startsWith("t="));
    const v1Parts = parts.filter((p) => p.startsWith("v1="));
    if (!tPart || v1Parts.length === 0) return false;

    const timestamp = tPart.slice(2);
    const signedPayload = `${timestamp}.${payload}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const buf = await crypto.subtle.sign("HMAC", key, enc.encode(signedPayload));
    const computed = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return v1Parts.some((v1) => v1.slice(3) === computed);
  } catch {
    return false;
  }
}

export default http;
