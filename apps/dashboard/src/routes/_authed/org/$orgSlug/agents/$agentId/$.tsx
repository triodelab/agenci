import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authed/org/$orgSlug/agents/$agentId/$",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-0 flex-1 overflow-auto p-6 md:p-8">
      <p className="text-[13px] text-muted-foreground">
        Denne siden er ikke klar ennå.
      </p>
    </div>
  );
}
