import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordView from "@/features/authentication/ui/views/reset-password-view";

/**
 * Where the e-mailed reset link lands (via /api/auth/reset-password/:token):
 * `?token=…`, or `?error=INVALID_TOKEN` when it is used up or expired.
 */
export const Route = createFileRoute("/nytt-passord")({
  validateSearch: (search: Record<string, unknown>): { token?: string; error?: string } => ({
    ...(typeof search.token === "string" ? { token: search.token } : {}),
    ...(typeof search.error === "string" ? { error: search.error } : {}),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { token, error } = Route.useSearch();
  return <ResetPasswordView token={token} error={error} />;
}
