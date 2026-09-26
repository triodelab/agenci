/**
 * Stripe checkout scoped to the Better Auth session.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    const orgId = session?.session?.activeOrganizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId } = (await req.json()) as { priceId?: string };
    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ??
      req.headers.get("origin") ??
      "http://localhost:3000";

    const checkout = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/billing?checkout=success`,
      cancel_url: `${origin}/billing`,
      metadata: { orgId, priceId },
      subscription_data: { metadata: { orgId } },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
