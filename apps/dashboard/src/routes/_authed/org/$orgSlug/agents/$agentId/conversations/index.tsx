import { createFileRoute } from "@tanstack/react-router";
import { ConversationsView } from "@/features/conversations/ui/views/conversations-view";

export const Route = createFileRoute(
  "/_authed/org/$orgSlug/agents/$agentId/conversations/",
)({
  component: ConversationsView,
});
