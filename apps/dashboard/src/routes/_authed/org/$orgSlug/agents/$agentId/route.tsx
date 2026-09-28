import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { rememberLastAgent } from "@/lib/preferences";

export const Route = createFileRoute("/_authed/org/$orgSlug/agents/$agentId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgSlug, agentId } = Route.useParams();
  // Used by "Startside: sist brukte agent" in Innstillinger → Preferanser.
  useEffect(() => rememberLastAgent(orgSlug, agentId), [orgSlug, agentId]);
  return <Outlet />;
}
