import { createFileRoute } from "@tanstack/react-router";
import TwoFactorView from "@/features/authentication/ui/views/two-factor-view";

/** Second step of sign-in when two-factor login is on (Better Auth redirects here). */
export const Route = createFileRoute("/to-trinn")({
  component: TwoFactorView,
});
