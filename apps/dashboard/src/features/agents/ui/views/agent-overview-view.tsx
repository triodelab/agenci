import { useParams } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { DemoSwitch } from "@/components/demo-switch";
import {
  useAgentDocumentsQuery,
  useAgentQuery,
} from "@/features/agents/queries/agents-queries";
import {
  ActivityTile,
  AlertsTile,
  buildAlerts,
  ConversationsChartTile,
  KnowledgeTile,
  ResolutionTile,
  tileClass,
} from "@/features/agents/ui/components/overview-cards";
import { demoDocuments } from "@/features/agents/ui/components/overview-mock";
import { useConversationsQuery } from "@/features/conversations/queries/conversations-queries";
import { authClient } from "@/lib/auth-client";
import { useDemoMode } from "@/lib/demo-mode";

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function greeting(hour: number) {
  if (hour < 5) return "God natt";
  if (hour < 10) return "God morgen";
  if (hour < 18) return "God dag";
  return "God kveld";
}

const AGENT_STATE: Record<string, { label: string; dot: string }> = {
  COMPLETED: { label: "er aktiv og svarer kunder", dot: "bg-[#3F7A4A]" },
  PENDING: { label: "venter på indeksering", dot: "bg-[#A3762A]" },
  PROCESSING: { label: "indekserer kunnskapsbasen", dot: "bg-[#A3762A]" },
  FAILED: {
    label: "kan ikke svare — indekseringen feilet",
    dot: "bg-[#9A4B3F]",
  },
};

export default function AgentOverviewView() {
  const { agentId } = useParams({
    from: "/_authed/org/$orgSlug/agents/$agentId/",
  });
  const now = useNow();
  const { data: session } = authClient.useSession();
  const { data, isPending } = useAgentQuery(agentId);
  const { data: conversations = [], isPending: conversationsPending } =
    useConversationsQuery(agentId);
  const { data: realDocuments = [], isPending: documentsPending } =
    useAgentDocumentsQuery(agentId);
  const agent = data?.agent;

  // Conversations come from the shared query (demo-aware); documents are
  // swapped here since the documents query is not demo-aware.
  const { on: demo } = useDemoMode();
  const demoDocs = useMemo(() => demoDocuments(), []);
  const documents = demo ? demoDocs : realDocuments;

  if (!isPending && !agent) {
    return (
      <p className="text-[13px] text-(--agenci-ink-2)">
        Agenten ble ikke funnet.
      </p>
    );
  }

  const loading =
    isPending || (!demo && (conversationsPending || documentsPending));
  const state = (agent && AGENT_STATE[agent.status]) ?? {
    label: "er aktiv og svarer kunder",
    dot: "bg-[#3F7A4A]",
  };
  const firstName = session?.user?.name?.trim().split(/\s+/)[0];
  const alerts = buildAlerts(conversations, documents, agent?.status);

  return (
    <div className="flex min-h-full w-full flex-col gap-5">
      {/* Greeting */}
      <header className="flex flex-wrap items-end gap-x-6 gap-y-3 px-1 pt-1 pb-2">
        <div className="min-w-0">
          <h1 className="[font-family:var(--font-agenci-title)] text-[24px] leading-[1.15] font-medium tracking-[-0.03em] text-(--agenci-ink)">
            {greeting(now.getHours())}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1.5 flex items-center gap-2 text-[13.5px] text-(--agenci-ink-2)">
            <span
              aria-hidden
              className={cn("size-1.5 rounded-full", state.dot)}
            />
            {agent ? (
              <>
                <span className="text-(--agenci-ink)">{agent.name}</span>{" "}
                {state.label}
              </>
            ) : (
              "Laster agent…"
            )}
          </p>
        </div>
        <div className="ml-auto">
          <DemoSwitch />
        </div>
      </header>

      {loading ? (
        <div className="grid auto-rows-[480px] gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                tileClass,
                "animate-pulse",
                i === 3 && "md:col-span-2",
              )}
            />
          ))}
        </div>
      ) : (
        <div className="grid auto-rows-[480px] gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AlertsTile alerts={alerts} />
          <ResolutionTile
            agentName={agent?.name ?? ""}
            conversations={conversations}
          />
          <ConversationsChartTile conversations={conversations} />
          <ActivityTile conversations={conversations} now={now} />
          <KnowledgeTile documents={documents} />
        </div>
      )}
    </div>
  );
}
