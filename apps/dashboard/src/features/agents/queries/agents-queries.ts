import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAgentDraftStore } from "@/features/agents/store/agent-draft-store";
import { client } from "@/lib/api";
import { getQueryClient } from "@/router";

export type AgentSummary = {
  id: string;
  name: string;
  description: string | null;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
};

export type AgentCreated = {
  id: string;
  name: string;
};

export type AgentDocument = {
  id: string;
  type: "DOCUMENT" | "WEBPAGE" | "MEDIA";
  status: "PENDING" | "PROCESSING" | "INDEXING" | "COMPLETED" | "FAILED";
  documentName: string | null;
  webpageUrl?: string | null;
  mediaName?: string | null;
};

const agentsQueryKey = ["agents"] as const;

function agentQueryKey(agentId: string) {
  return ["agent", agentId] as const;
}

function agentDocumentsQueryKey(agentId: string) {
  return ["agent-documents", agentId] as const;
}

function queryErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Noe gikk galt";
}

export function invalidateAgentsQueries() {
  const queryClient = getQueryClient();
  void queryClient.invalidateQueries({ queryKey: agentsQueryKey });
  void queryClient.invalidateQueries({ queryKey: ["agent"] });
  void queryClient.invalidateQueries({ queryKey: ["agent-documents"] });
}

export function useAgentsListQuery(opts?: {
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: agentsQueryKey,
    queryFn: async () => {
      const { agents } = await client.private.agents.list();
      return agents;
    },
    refetchInterval: opts?.refetchInterval,
  });
}

export function useAgentQuery(agentId: string | undefined) {
  return useQuery({
    queryKey: agentQueryKey(agentId ?? ""),
    queryFn: async () => {
      const { agent } = await client.private.agents.getOne({
        id: agentId ?? "",
      });
      return { agent };
    },
    enabled: Boolean(agentId),
  });
}

export function useAgentDocumentsQuery(agentId: string | undefined) {
  return useQuery({
    queryKey: agentDocumentsQueryKey(agentId ?? ""),
    queryFn: async () => {
      const { documents } = await client.private.agents.listDocuments({
        agentId: agentId ?? "",
      });
      return documents;
    },
    enabled: Boolean(agentId),
    refetchInterval: (query) => {
      const docs = query.state.data;
      if (!docs) return false;
      const busy = docs.some(
        (doc) =>
          doc.status === "PENDING" ||
          doc.status === "PROCESSING" ||
          doc.status === "INDEXING",
      );
      return busy ? 4_000 : false;
    },
  });
}

export function useAddWebpageMutation(agentId: string) {
  return useMutation({
    mutationFn: (input: { url: string; agentId?: string }) =>
      client.private.agents.addWebpage({
        agentId: input.agentId ?? agentId,
        url: input.url,
      }),
    onSuccess: () => {
      const queryClient = getQueryClient();
      void queryClient.invalidateQueries({
        queryKey: agentDocumentsQueryKey(agentId),
      });
    },
  });
}

export function useUploadDocumentMutation(agentId: string) {
  return useMutation({
    mutationFn: (input: { file: File; agentId?: string }) =>
      client.private.documents.upload({
        agentId: input.agentId ?? agentId,
        file: input.file,
      }),
    onSuccess: () => {
      const queryClient = getQueryClient();
      void queryClient.invalidateQueries({
        queryKey: agentDocumentsQueryKey(agentId),
      });
    },
  });
}

export type AgentListItem = NonNullable<
  ReturnType<typeof useAgentsListQuery>["data"]
>[number];

export function useUpdateAgentMutation() {
  return useMutation({
    mutationFn: (input: { id: string; name: string; description: string }) =>
      client.private.agents.update(input),
    onSuccess: () => {
      invalidateAgentsQueries();
      toast.success("Agenten er oppdatert");
    },
    onError: (error) => {
      toast.error(queryErrorMessage(error) || "Kunne ikke lagre endringene.");
    },
  });
}

export function useDeleteAgentMutation() {
  return useMutation({
    mutationFn: (input: { id: string }) => client.private.agents.delete(input),
    onSuccess: (_result, { id }) => {
      const queryClient = getQueryClient();
      queryClient.setQueryData<AgentListItem[]>(agentsQueryKey, (list) =>
        list?.filter((a) => a.id !== id),
      );
      queryClient.removeQueries({ queryKey: agentQueryKey(id) });
      queryClient.removeQueries({ queryKey: agentDocumentsQueryKey(id) });
      invalidateAgentsQueries();
    },
    onError: (error) => {
      toast.error(queryErrorMessage(error) || "Kunne ikke slette agenten.");
    },
  });
}

/**
 * `stay: true` keeps the user on the onboarding page (it shows the agent
 * learning) instead of jumping to the agent right away.
 */
export function useCreateAgentMutation(opts?: { stay?: boolean }) {
  const navigate = useNavigate();
  const { orgSlug } = useParams({ from: "/_authed/org/$orgSlug" });
  const clearDraft = useAgentDraftStore((s) => s.clearDraft);

  return useMutation({
    mutationFn: (input: { name: string; description: string; url?: string }) =>
      client.private.agents.create(input),
    onSuccess: (result) => {
      if (!result.agent) {
        toast.error("Kunne ikke opprette agent.");
        return;
      }

      clearDraft();
      invalidateAgentsQueries();
      if (opts?.stay) return;
      toast.success("Agent opprettet. Kunnskapsbasen hentes i bakgrunnen.");
      void navigate({
        to: "/org/$orgSlug/agents/$agentId",
        params: {
          orgSlug,
          agentId: result.agent.id,
        },
      });
    },
    onError: (error) => {
      toast.error(queryErrorMessage(error) || "Kunne ikke opprette agent.");
    },
  });
}
