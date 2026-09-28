import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/org/$orgSlug/agents/$agentId/settings/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/org/$orgSlug/agents/$agentId/settings/$section",
      params: { ...params, section: "profil" },
    });
  },
});
