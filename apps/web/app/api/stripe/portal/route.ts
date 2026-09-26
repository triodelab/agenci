/**
 * Stripe customer portal scoped to the Better Auth session.
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

    const { customerId } = (await req.json()) as { customerId?: string };
    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ??
      req.headers.get("origin") ??
      "http://localhost:3000";

    const portal = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (err) {
    console.error("[stripe/portal]", err);
    return NextResponse.json({ error: "Portal session failed" }, { status: 500 });
  }
}
