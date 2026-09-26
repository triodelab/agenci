import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsView } from "@/features/integrations/ui/views/integrations-view";

export const Route = createFileRoute(
  "/_authed/org/$orgSlug/agents/$agentId/integrations",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { agentId } = Route.useParams();
  return (
    <div className="dash-page">
      <div className="dash-page-box">
        <IntegrationsView agentId={agentId} />
      </div>
    </div>
  );
}
