import { createFileRoute, redirect } from "@tanstack/react-router";
import SettingsView, { isSettingsSection } from "@/features/settings/ui/settings-view";

/** Settings inside an agent, so the agent's sidebar stays. */
export const Route = createFileRoute("/_authed/org/$orgSlug/agents/$agentId/settings/$section")({
  beforeLoad: ({ params }) => {
    if (!isSettingsSection(params.section)) {
      throw redirect({
        to: "/org/$orgSlug/agents/$agentId/settings/$section",
        params: { ...params, section: "profil" },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { orgSlug, agentId, section } = Route.useParams();
  return (
    <div className="dash-page">
      <div className="dash-page-box">
        <div className="flex min-h-0 flex-1 overflow-auto p-6 md:p-8">
          <SettingsView
            section={isSettingsSection(section) ? section : "profil"}
            scope={`/org/${orgSlug}/agents/${agentId}`}
            orgBase={`/org/${orgSlug}`}
          />
        </div>
      </div>
    </div>
  );
}
