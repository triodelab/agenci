import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  demoConversationDetail,
  demoConversationList,
  isDemoId,
  setDemoConversationStatus,
} from "@/features/agents/ui/components/overview-mock";
import { client } from "@/lib/api";
import { useDemoMode } from "@/lib/demo-mode";
import { getQueryClient } from "@/router";

export type ConversationStatus = "unresolved" | "escalated" | "resolved";

export type ConversationSummary = Awaited<
  ReturnType<typeof client.private.conversations.list>
>["conversations"][number];

export type ConversationDetail = NonNullable<
  Awaited<
    ReturnType<typeof client.private.conversations.getOne>
  >["conversation"]
>;

const listKey = (agentId: string, demo: boolean) =>
  ["conversations", agentId, demo ? "demo" : "live"] as const;
const detailKey = (agentId: string, threadId: string) =>
  ["conversation", agentId, threadId] as const;

/** Conversations for an agent — the seeded demo set when "Demodata" is on. */
export function useConversationsQuery(agentId: string) {
  const { on: demo } = useDemoMode();
  return useQuery({
    queryKey: listKey(agentId, demo),
    queryFn: async () => {
      if (demo) return demoConversationList();
      const { conversations } = await client.private.conversations.list({
        agentId,
      });
      return conversations;
    },
    refetchInterval: demo ? false : 15_000,
  });
}

export function useConversationQuery(agentId: string, threadId: string) {
  const demo = isDemoId(threadId);
  return useQuery({
    queryKey: detailKey(agentId, threadId),
    queryFn: async (): Promise<ConversationDetail | null> => {
      if (demo) {
        const { agent } = await client.private.agents.getOne({ id: agentId });
        return demoConversationDetail(threadId, agent?.name ?? "Agent");
      }
      const { conversation } = await client.private.conversations.getOne({
        agentId,
        threadId,
      });
      return conversation;
    },
    refetchInterval: demo ? false : 10_000,
  });
}

export function useSetConversationStatusMutation(
  agentId: string,
  threadId: string,
) {
  return useMutation({
    mutationFn: async (status: ConversationStatus) => {
      if (isDemoId(threadId)) {
        setDemoConversationStatus(threadId, status);
        return { status };
      }
      return client.private.conversations.setStatus({
        agentId,
        threadId,
        status,
      });
    },
    onSuccess: () => {
      const queryClient = getQueryClient();
      void queryClient.invalidateQueries({
        queryKey: ["conversations", agentId],
      });
      void queryClient.invalidateQueries({
        queryKey: detailKey(agentId, threadId),
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Kunne ikke oppdatere status",
      );
    },
  });
}
