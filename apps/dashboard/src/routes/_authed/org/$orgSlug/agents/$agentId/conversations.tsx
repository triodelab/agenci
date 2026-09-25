import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ConversationsLayout } from "@/features/conversations/ui/layouts/conversations-layout";

export const Route = createFileRoute(
  "/_authed/org/$orgSlug/agents/$agentId/conversations",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    // Free-standing cards directly on the glass (no page box), like the
    // reference mail layout.
    <div className="dash-page">
      <ConversationsLayout>
        <Outlet />
      </ConversationsLayout>
    </div>
  );
}
