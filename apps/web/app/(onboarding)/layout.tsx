import type { Metadata } from "next";
import { AuthGuard } from "@/modules/auth/ui/components/auth-guard";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
