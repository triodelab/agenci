import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginView from "@/features/authentication/ui/views/login-view";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (data) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  return <LoginView />;
}
