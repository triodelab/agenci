import type { Metadata } from "next";
import { AuthLayout } from "@/modules/auth/ui/layouts/auth-layout";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthLayout>
      {children}
    </AuthLayout>
  );
};

export default Layout;
