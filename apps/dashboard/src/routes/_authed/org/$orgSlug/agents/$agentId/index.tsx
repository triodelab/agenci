import { createFileRoute } from "@tanstack/react-router";
import AgentOverviewView from "@/features/agents/ui/views/agent-overview-view";

export const Route = createFileRoute("/_authed/org/$orgSlug/agents/$agentId/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-0 flex-1 overflow-auto p-6 md:p-8">
      <AgentOverviewView />
    </div>
  );
}
