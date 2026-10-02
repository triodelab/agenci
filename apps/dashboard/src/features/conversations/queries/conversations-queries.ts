import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api";
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

const listKey = (agentId: string) => ["conversations", agentId] as const;
const detailKey = (agentId: string, threadId: string) =>
  ["conversation", agentId, threadId] as const;

/** Conversations for an agent. */
export function useConversationsQuery(agentId: string) {
  return useQuery({
    queryKey: listKey(agentId),
    queryFn: async () => {
      const { conversations } = await client.private.conversations.list({
        agentId,
      });
      return conversations;
    },
    refetchInterval: 15_000,
  });
}

export function useConversationQuery(agentId: string, threadId: string) {
  return useQuery({
    queryKey: detailKey(agentId, threadId),
    queryFn: async (): Promise<ConversationDetail | null> => {
      const { conversation } = await client.private.conversations.getOne({
        agentId,
        threadId,
      });
      return conversation;
    },
    refetchInterval: 10_000,
  });
}

/** A person from the team answers the visitor (the team takes the chat). */
export function useReplyMutation(agentId: string, threadId: string) {
  return useMutation({
    mutationFn: (text: string) =>
      client.private.conversations.reply({ agentId, threadId, text }),
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
        error instanceof Error ? error.message : "Kunne ikke sende svaret",
      );
    },
  });
}

export function useSetConversationStatusMutation(
  agentId: string,
  threadId: string,
) {
  return useMutation({
    mutationFn: (status: ConversationStatus) =>
      client.private.conversations.setStatus({ agentId, threadId, status }),
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
