import { createFileRoute } from "@tanstack/react-router";
import OrganizationInviteView from "@/features/organizations/ui/views/organization-invite-view";

export const Route = createFileRoute("/_authed/org/organization")({
  component: RouteComponent,
});

function RouteComponent() {
  return <OrganizationInviteView />;
}
