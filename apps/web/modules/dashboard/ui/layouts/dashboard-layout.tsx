import { AuthGuard } from "@/modules/auth/ui/components/auth-guard";
import { OrganizationGuard } from "@/modules/auth/ui/components/organization-guard";
import { UserSync } from "@/modules/auth/ui/components/user-sync";
import { DashboardMainArea } from "@/modules/dashboard/ui/components/dashboard-main-area";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";
import { DashboardTopNav } from "@/modules/dashboard/ui/components/dashboard-top-nav";
import { TrialBanner } from "@/modules/dashboard/ui/components/trial-banner";
import { SidebarProvider } from "@workspace/ui/components/sidebar";
import { Provider } from "jotai";
import { cookies } from "next/headers";

export const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <AuthGuard>
      <OrganizationGuard>
        <Provider>
          {/*
           * SidebarProvider wraps everything so useSidebar() works in DashboardTopNav.
           * flex-col: TopNav on top, sidebar+main below.
           * Sidebar/MainArea are siblings inside the inner div — flex-1 handles widths.
           */}
          <SidebarProvider
            className="dashboard-app-shell flex h-svh min-h-0 max-h-svh w-full flex-col overflow-hidden"
            defaultOpen={defaultOpen}
          >
            <UserSync />
            <DashboardTopNav />
            <TrialBanner />
            <div className="flex min-h-0 flex-1 overflow-hidden">
              <DashboardSidebar />
              <DashboardMainArea>{children}</DashboardMainArea>
            </div>
          </SidebarProvider>
        </Provider>
      </OrganizationGuard>
    </AuthGuard>
  );
};
