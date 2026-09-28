import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { getLastAgent, getStartPage } from "@/lib/preferences";

export const Route = createFileRoute("/_authed/")({
  beforeLoad: async ({ context }) => {
    // Innstillinger → Preferanser → Startside: reopen the last agent.
    const last = getStartPage() === "last-agent" ? getLastAgent() : null;
    if (last) {
      const { data: organizations } = await authClient.organization.list();
      if (organizations?.some((o) => o.slug === last.orgSlug)) {
        throw redirect({
          to: "/org/$orgSlug/agents/$agentId",
          params: { orgSlug: last.orgSlug, agentId: last.agentId },
        });
      }
    }

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
