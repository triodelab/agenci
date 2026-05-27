import type { Metadata } from "next";
import { DashboardLayout } from "@/modules/dashboard/ui/layouts/dashboard-layout";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default Layout;
