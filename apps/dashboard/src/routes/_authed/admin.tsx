import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import AdminView from "@/features/admin/ui/admin-view";
import { ADMIN_TABS } from "@/features/admin/ui/nav";

/**
 * Agenci's own admin area. Only the developers get data from it — the server
 * answers NOT_FOUND to everyone else — and the link only shows for them.
 */
export const Route = createFileRoute("/_authed/admin")({
  validateSearch: z.object({
    tab: z.enum(ADMIN_TABS).catch("overview"),
    org: z.string().optional().catch(undefined),
    user: z.string().optional().catch(undefined),
    conv: z.string().optional().catch(undefined),
  }),
  component: AdminView,
});
