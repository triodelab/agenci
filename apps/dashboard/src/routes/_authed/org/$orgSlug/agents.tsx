import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/org/$orgSlug/agents")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
