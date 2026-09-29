import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginView from "@/features/authentication/ui/views/login-view";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
  // `?mode=signin` opens «Logg inn» (the website's login button); without it
  // the page opens on «Opprett konto».
  validateSearch: (search: Record<string, unknown>): { mode?: "signin" } =>
    search.mode === "signin" ? { mode: "signin" } : {},
  component: RouteComponent,
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (data) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const { mode } = Route.useSearch();
  return <LoginView initialSignIn={mode === "signin"} />;
}
