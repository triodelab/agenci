import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/org/$orgSlug/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/org/$orgSlug/agents",
      params: { orgSlug: params.orgSlug },
    });
  },
});
