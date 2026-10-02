import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import AdminView from "@/features/admin/ui/admin-view";

/**
 * Agenci's own admin area. Only the developers get data from it — the server
 * answers NOT_FOUND to everyone else — and the link only shows for them.
 */
export const Route = createFileRoute("/_authed/admin")({
  validateSearch: z.object({
    tab: z.enum(["overview", "activity", "organizations", "users", "database", "audit"]).catch("overview"),
    org: z.string().optional().catch(undefined),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { tab, org } = Route.useSearch();
  return <AdminView tab={tab} org={org} />;
}
