import { createFileRoute } from "@tanstack/react-router";
import AgentCreationView from "@/features/agents/ui/views/agent-creation-view";

/** Onboarding, step 2–4: the first agent (full screen, no sidebar). */
export const Route = createFileRoute("/_authed/org/$orgSlug/onboarding")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AgentCreationView onboarding />;
}
