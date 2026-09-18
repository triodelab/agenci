import { createFileRoute } from "@tanstack/react-router";
import { FilesView } from "@/features/files/ui/views/files-view";

export const Route = createFileRoute(
  "/_authed/org/$orgSlug/agents/$agentId/files",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { agentId } = Route.useParams();
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <FilesView agentId={agentId} />
    </div>
  );
}
