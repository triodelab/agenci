import { createFileRoute } from "@tanstack/react-router";
import InvoiceView from "@/features/billing/ui/views/invoice-view";

/** One invoice, outside the org layout so it prints as a clean page. */
export const Route = createFileRoute("/_authed/faktura/$invoiceId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { invoiceId } = Route.useParams();
  return <InvoiceView invoiceId={invoiceId} />;
}
