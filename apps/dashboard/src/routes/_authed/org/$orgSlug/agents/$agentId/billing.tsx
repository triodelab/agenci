import { createFileRoute } from "@tanstack/react-router";
import BillingView from "@/features/billing/ui/views/billing-view";

/** Same billing page, but inside the agent so its sidebar stays. */
export const Route = createFileRoute(
  "/_authed/org/$orgSlug/agents/$agentId/billing",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="dash-page">
      <div className="dash-page-box">
        <div className="flex min-h-0 flex-1 overflow-auto p-6 md:p-8">
          <BillingView />
        </div>
      </div>
    </div>
  );
}
