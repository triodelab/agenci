import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import CheckoutView from "@/features/billing/ui/views/checkout-view";

/**
 * Nexi embedded checkout. A fixed path on purpose: Nexi requires the exact
 * page URL when the payment is created (see the server's billing service).
 */
export const Route = createFileRoute("/_authed/betaling")({
  validateSearch: z.object({
    paymentId: z.string().catch(""),
    /** The plan being bought; absent when only the card is updated. */
    plan: z.enum(["starter", "pro", "business"]).optional().catch(undefined),
    interval: z.enum(["month", "year"]).optional().catch(undefined),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { paymentId, plan, interval } = Route.useSearch();
  return <CheckoutView paymentId={paymentId} plan={plan} interval={interval ?? "month"} />;
}
