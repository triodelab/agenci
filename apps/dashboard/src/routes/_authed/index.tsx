import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_authed/")({
  beforeLoad: async ({ context }) => {
    const activeId = context.session?.session.activeOrganizationId;
    if (activeId) {
      const { data: organization } =
        await authClient.organization.getOrganization({
          query: { organizationId: activeId },
        });
      if (organization) {
        throw redirect({
          to: "/org/$orgSlug/agents",
          params: { orgSlug: organization.slug },
        });
      }
    }

    // No active org in this session (e.g. a fresh login): use the first org
    // the user belongs to — the org route makes it active. Only users without
    // any organization are sent to create one.
    const { data: organizations } = await authClient.organization.list();
    const first = organizations?.[0];
    if (first) {
      throw redirect({
        to: "/org/$orgSlug/agents",
        params: { orgSlug: first.slug },
      });
    }
    throw redirect({ to: "/org/create" });
  },
});
