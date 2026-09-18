import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsView } from "@/features/integrations/ui/views/integrations-view";

export const Route = createFileRoute(
  "/_authed/org/$orgSlug/agents/$agentId/integrations",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <IntegrationsView />
    </div>
  );
}
