import { createFileRoute } from "@tanstack/react-router";
import AgentsListView from "@/features/agents/ui/views/agents-list-view";

export const Route = createFileRoute("/_authed/org/$orgSlug/agents/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-0 flex-1 overflow-auto p-6 md:p-8">
      <AgentsListView />
    </div>
  );
}
