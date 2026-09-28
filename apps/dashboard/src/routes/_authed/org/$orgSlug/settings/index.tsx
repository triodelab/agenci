import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/org/$orgSlug/settings/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/org/$orgSlug/settings/$section",
      params: { orgSlug: params.orgSlug, section: "profil" },
    });
  },
});
