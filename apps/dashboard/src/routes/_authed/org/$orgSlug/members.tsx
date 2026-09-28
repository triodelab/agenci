import { createFileRoute } from "@tanstack/react-router";
import OrganizationInviteView from "@/features/organizations/ui/views/organization-invite-view";

export const Route = createFileRoute("/_authed/org/$orgSlug/members")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="dash-page">
      <div className="dash-page-box">
        <div className="flex min-h-0 flex-1 overflow-auto p-6 md:p-8">
          <OrganizationInviteView />
        </div>
      </div>
    </div>
  );
}
