import { createFileRoute, redirect } from "@tanstack/react-router";

/** Moved to /org/$orgSlug/members (inside the sidebar layout). */
export const Route = createFileRoute("/_authed/org/organization")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
