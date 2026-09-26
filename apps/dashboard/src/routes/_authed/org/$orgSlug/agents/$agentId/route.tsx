import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/org/$orgSlug/agents/$agentId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
