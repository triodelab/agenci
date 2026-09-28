import { createFileRoute, redirect } from "@tanstack/react-router";
import SettingsView, { isSettingsSection } from "@/features/settings/ui/settings-view";

export const Route = createFileRoute("/_authed/org/$orgSlug/settings/$section")({
  beforeLoad: ({ params }) => {
    if (!isSettingsSection(params.section)) {
      throw redirect({
        to: "/org/$orgSlug/settings/$section",
        params: { orgSlug: params.orgSlug, section: "profil" },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { orgSlug, section } = Route.useParams();
  const base = `/org/${orgSlug}`;
  return (
    <div className="dash-page">
      <div className="dash-page-box">
        <div className="flex min-h-0 flex-1 overflow-auto p-6 md:p-8">
          <SettingsView
            section={isSettingsSection(section) ? section : "profil"}
            scope={base}
            orgBase={base}
          />
        </div>
      </div>
    </div>
  );
}
