import { createFileRoute } from "@tanstack/react-router";
import ForgotPasswordView from "@/features/authentication/ui/views/forgot-password-view";

/** «Glemt passord» — public, works signed in or out. */
export const Route = createFileRoute("/glemt-passord")({
  validateSearch: (search: Record<string, unknown>): { email?: string } =>
    typeof search.email === "string" ? { email: search.email } : {},
  component: RouteComponent,
});

function RouteComponent() {
  const { email } = Route.useSearch();
  return <ForgotPasswordView initialEmail={email} />;
}
