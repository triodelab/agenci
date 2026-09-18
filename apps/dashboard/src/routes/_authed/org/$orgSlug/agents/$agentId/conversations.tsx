import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ConversationsLayout } from "@/features/conversations/ui/layouts/conversations-layout";

export const Route = createFileRoute(
  "/_authed/org/$orgSlug/agents/$agentId/conversations",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ConversationsLayout>
        <Outlet />
      </ConversationsLayout>
    </div>
  );
}
