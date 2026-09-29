import { createFileRoute, redirect } from "@tanstack/react-router";
import AgentsListView from "@/features/agents/ui/views/agents-list-view";
import { client } from "@/lib/api";
import { hasSkippedOnboarding } from "@/lib/onboarding";
import { getQueryClient } from "@/router";

export const Route = createFileRoute("/_authed/org/$orgSlug/agents/")({
  // No agents yet (fresh signup, or logging in before finishing): continue
  // the onboarding flow instead of showing an empty list.
  beforeLoad: async ({ params }) => {
    if (hasSkippedOnboarding(params.orgSlug)) return;
    let count: number;
    try {
      const agents = await getQueryClient().fetchQuery({
        queryKey: ["agents"],
        queryFn: async () => (await client.private.agents.list()).agents,
        staleTime: 10_000,
      });
      count = agents.length;
    } catch {
      return; // Never block the dashboard on this check.
    }
    if (count === 0) {
      throw redirect({
        to: "/org/$orgSlug/onboarding",
        params: { orgSlug: params.orgSlug },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="dash-page">
      <div className="dash-page-box">
        <div className="flex min-h-0 flex-1 overflow-auto p-6 md:p-8">
          <AgentsListView />
        </div>
      </div>
    </div>
  );
}
