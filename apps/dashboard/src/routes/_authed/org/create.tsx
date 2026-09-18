import { createFileRoute } from "@tanstack/react-router";
import OrganizationCreationView from "@/features/organizations/ui/views/organization-creation-view";

export const Route = createFileRoute("/_authed/org/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return <OrganizationCreationView />;
}
