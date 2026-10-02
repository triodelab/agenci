import { createFileRoute, Outlet, redirect, useMatch } from "@tanstack/react-router";
import AppSidebar from "@/components/app-sidebar";
import { useBillingStatus } from "@/features/billing/billing-queries";
import RegisterCompanyView from "@/features/billing/ui/views/register-company-view";
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
  const billing = useBillingStatus();
  const { data: session } = authClient.useSession();
  const { data: org } = authClient.useActiveOrganization();
  // No org number yet (organizations made before it was required): the
  // company is registered first. The server enforces this too.
  if (billing.data?.status === "needs_registration") {
    const role = org?.members.find((m) => m.userId === session?.user.id)?.role;
    return <RegisterCompanyView canEdit={role === "owner" || role === "admin"} />;
  }
  if (onboarding) return <Outlet />;
  return (
    <AppSidebar>
      <Outlet />
    </AppSidebar>
  );
}
