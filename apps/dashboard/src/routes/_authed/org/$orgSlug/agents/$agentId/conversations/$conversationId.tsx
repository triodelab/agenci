import { createFileRoute } from "@tanstack/react-router";
import { ConversationIdView } from "@/features/conversations/ui/views/conversation-id-view";

export const Route = createFileRoute(
  "/_authed/org/$orgSlug/agents/$agentId/conversations/$conversationId",
)({
  component: ConversationIdView,
});
