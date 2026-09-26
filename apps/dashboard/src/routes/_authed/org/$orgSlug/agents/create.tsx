import { createFileRoute } from "@tanstack/react-router";
import AgentCreationView from "@/features/agents/ui/views/agent-creation-view";

export const Route = createFileRoute("/_authed/org/$orgSlug/agents/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="dash-page">
      <div className="dash-page-box">
        <div className="flex min-h-0 flex-1 overflow-auto p-6 md:p-8">
          <AgentCreationView />
        </div>
      </div>
    </div>
  );
}
