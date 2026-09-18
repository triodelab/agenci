import { createFileRoute, Outlet } from "@tanstack/react-router";
import AppSidebar from "@/components/app-sidebar";

export const Route = createFileRoute("/_authed/org/$orgSlug")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AppSidebar>
      <Outlet />
    </AppSidebar>
  );
}
