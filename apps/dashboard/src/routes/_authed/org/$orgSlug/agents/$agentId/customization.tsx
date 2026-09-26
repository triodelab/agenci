import { createFileRoute } from "@tanstack/react-router";
import { CustomizationView } from "@/features/customization/ui/views/customization-view";

export const Route = createFileRoute(
  "/_authed/org/$orgSlug/agents/$agentId/customization",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { agentId } = Route.useParams();
  return (
    <div className="dash-page">
      <div className="dash-page-box">
        <CustomizationView agentId={agentId} />
      </div>
    </div>
  );
}
