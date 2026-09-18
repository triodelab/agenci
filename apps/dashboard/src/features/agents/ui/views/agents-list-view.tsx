import { Link, useParams } from "@tanstack/react-router";
import {
  BookOpenIcon,
  BotIcon,
  ChevronRightIcon,
  CodeIcon,
  PaletteIcon,
  PlusIcon,
  SparklesIcon,
} from "lucide-react";

import { useAgentsListQuery } from "@/features/agents/queries/agents-queries";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

type AgentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

const STATUS_LABEL: Record<AgentStatus, string> = {
  COMPLETED: "Aktiv",
  PROCESSING: "Behandler",
  PENDING: "Venter",
  FAILED: "Feilet",
};

function statusDotClass(status: AgentStatus) {
  if (status === "COMPLETED") return "bg-emerald-500";
  if (status === "PROCESSING") return "bg-amber-500";
  if (status === "FAILED") return "bg-red-500";
  return "bg-zinc-400 dark:bg-zinc-600";
}

function statusTextClass(status: AgentStatus) {
  if (status === "COMPLETED") return "text-emerald-600 dark:text-emerald-400";
  if (status === "PROCESSING") return "text-amber-600 dark:text-amber-400";
  if (status === "FAILED") return "text-red-600 dark:text-red-400";
  return "text-muted-foreground";
}

function AgentCard({
  agent,
  orgSlug,
}: {
  agent: {
    id: string;
    name: string;
    description: string | null;
    status: AgentStatus;
  };
  orgSlug: string;
}) {
  return (
    <Link
      to="/org/$orgSlug/agents/$agentId"
      params={{ orgSlug, agentId: agent.id }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-200",
        "hover:-translate-y-px hover:shadow-md",
        "border-border/60",
        agent.status === "FAILED" && "opacity-80",
      )}
    >
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground">
              <BotIcon className="size-5" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[14px] font-semibold leading-snug tracking-tight text-foreground">
                {agent.name}
              </p>
              <div className="mt-1 flex items-center gap-1">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    statusDotClass(agent.status),
                  )}
                />
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    statusTextClass(agent.status),
                  )}
                >
                  {STATUS_LABEL[agent.status]}
                </span>
              </div>
            </div>
          </div>
          <ChevronRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
        </div>
        {agent.description ? (
          <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
            {agent.description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function AgentCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="space-y-4 p-6">
        <div className="flex items-start gap-3">
          <div className="size-10 shrink-0 animate-pulse rounded-xl bg-muted/50" />
          <div className="flex-1 space-y-2 pt-0.5">
            <div className="h-4 w-32 animate-pulse rounded-lg bg-muted/50" />
            <div className="h-3 w-16 animate-pulse rounded-lg bg-muted/50" />
          </div>
        </div>
        <div className="h-8 w-full animate-pulse rounded-lg bg-muted/40" />
      </div>
    </div>
  );
}

export default function AgentsListView() {
  const { orgSlug } = useParams({ from: "/_authed/org/$orgSlug" });
  const { data, isPending, isError } = useAgentsListQuery();
  const agents = data ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Organisasjon
          </p>
          <h1 className="text-[26px] font-bold leading-tight tracking-[-0.03em] text-foreground">
            Dine agenter
          </h1>
          <p className="max-w-lg text-[14px] leading-relaxed text-muted-foreground">
            Velg en agent for å se samtaler, kunnskapsbase og innstillinger.
          </p>
        </div>
        <Button asChild className="w-full shrink-0 gap-2 sm:w-auto">
          <Link
            to="/org/$orgSlug/agents/create"
            params={{ orgSlug }}
          >
            <PlusIcon className="size-4" />
            Ny agent
          </Link>
        </Button>
      </div>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1].map((i) => (
            <AgentCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <p className="text-[13px] text-destructive">
          Kunne ikke hente agenter. Prøv å laste siden på nytt.
        </p>
      ) : agents.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <div className="flex flex-col items-center px-6 py-12 text-center sm:px-12">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
              <SparklesIcon
                className="size-6 text-muted-foreground/60"
                strokeWidth={1.5}
              />
            </div>
            <h2 className="text-[18px] font-bold tracking-tight text-foreground">
              Ingen agenter ennå
            </h2>
            <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
              Opprett din første agent og kom i gang på under 5 minutter.
            </p>
            <Button asChild className="mt-6">
              <Link to="/org/$orgSlug/agents/create" params={{ orgSlug }}>
                <SparklesIcon className="size-4" />
                Kom i gang
                <ChevronRightIcon className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid divide-y border-t border-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {[
              {
                icon: BotIcon,
                label: "Opprett agent",
                desc: "Gi agenten et navn og beskrivelse",
              },
              {
                icon: BookOpenIcon,
                label: "Legg til kunnskap",
                desc: "Nettside-URL eller dokument",
              },
              {
                icon: PaletteIcon,
                label: "Tilpass utseende",
                desc: "Farger, tittel og velkomstmelding",
              },
              {
                icon: CodeIcon,
                label: "Integrer på nett",
                desc: "Lim inn én kodelinje",
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3.5 px-5 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/40">
                  <Icon className="size-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">
                    {label}
                  </p>
                  <p className="text-[12px] text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} orgSlug={orgSlug} />
          ))}
        </div>
      )}
    </div>
  );
}
