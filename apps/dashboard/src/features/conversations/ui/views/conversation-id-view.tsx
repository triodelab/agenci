import { Link, useParams } from "@tanstack/react-router";
import { ChevronLeftIcon, InboxIcon } from "lucide-react";

export function ConversationIdView() {
  const { orgSlug, agentId } = useParams({
    from: "/_authed/org/$orgSlug/agents/$agentId",
  });

  return (
    <div className="dash-conversations-canvas flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b border-border/50 bg-background/70 px-4 py-3 lg:hidden">
        <Link
          to="/org/$orgSlug/agents/$agentId/conversations"
          params={{ orgSlug, agentId }}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeftIcon className="size-4" />
          Alle samtaler
        </Link>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-lg flex-col items-center text-center">
          <div
            aria-hidden
            className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-border/80 bg-muted/60"
          >
            <InboxIcon className="size-6 text-foreground/80" strokeWidth={1.65} />
          </div>
          <h2 className="text-[20px] font-semibold tracking-tight text-foreground">
            Samtalen ble ikke funnet
          </h2>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
            Samtaler fra widgeten vises her når de er migrert til det nye
            dashbordet.
          </p>
        </div>
      </div>
    </div>
  );
}
