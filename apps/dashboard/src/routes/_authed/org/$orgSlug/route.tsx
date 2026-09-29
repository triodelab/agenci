import { createFileRoute, Outlet, redirect, useMatch } from "@tanstack/react-router";
import AppSidebar from "@/components/app-sidebar";
import { authClient } from "@/lib/auth-client";

/** Slug already made active in this tab (skips the call on every navigation). */
let activeSlug: string | null = null;

export const Route = createFileRoute("/_authed/org/$orgSlug")({
  // The API is scoped to the session's active organization. Make the org in
  // the URL the active one, so a fresh login (no active org yet) or a link to
  // another of the user's orgs works instead of hanging on loading.
  beforeLoad: async ({ params }) => {
    if (activeSlug === params.orgSlug) return;
    const { data, error } = await authClient.organization.setActive({
      organizationSlug: params.orgSlug,
    });
    if (error || !data) {
      activeSlug = null;
      throw redirect({ to: "/" });
    }
    activeSlug = params.orgSlug;
  },
  component: RouteComponent,
});

function RouteComponent() {
  // Onboarding is full screen: no sidebar until the first agent exists.
  const onboarding = useMatch({
    from: "/_authed/org/$orgSlug/onboarding",
    shouldThrow: false,
  });
  if (onboarding) return <Outlet />;
  return (
    <AppSidebar>
      <Outlet />
    </AppSidebar>
  );
}
