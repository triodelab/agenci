import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/")({
  beforeLoad: async ({ context }) => {
    if (!context.session?.session.activeOrganizationId) {
      throw redirect({ to: "/org/create" });
    }

    const { data: organization } =
      await authClient.organization.getOrganization({
        query: { organizationId: context.session.session.activeOrganizationId },
      });

    if (!organization) {
      throw redirect({ to: "/org/create" });
    }

    throw redirect({
      to: "/org/$orgSlug/agents",
      params: { orgSlug: organization.slug },
    });
  },
});
