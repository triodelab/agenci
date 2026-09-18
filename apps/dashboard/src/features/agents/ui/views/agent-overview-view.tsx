import { useParams } from "@tanstack/react-router";
import { BotIcon } from "lucide-react";

import { useAgentQuery } from "@/features/agents/queries/agents-queries";

export default function AgentOverviewView() {
  const { agentId } = useParams({ from: "/_authed/org/$orgSlug/agents/$agentId/" });
  const { data, isPending } = useAgentQuery(agentId);
  const agent = data?.agent;

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-muted/50" />
        <div className="h-4 w-72 animate-pulse rounded-lg bg-muted/40" />
      </div>
    );
  }

  if (!agent) {
    return (
      <p className="text-[13px] text-muted-foreground">Agenten ble ikke funnet.</p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex items-start gap-3">
        <div className="grid size-10 place-items-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground">
          <BotIcon className="size-5" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">
            {agent.name}
          </h1>
          {agent.description ? (
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              {agent.description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
