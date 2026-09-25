import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { demoKnowledge } from "@/features/agents/ui/components/overview-mock";
import { client } from "@/lib/api";
import { useDemoMode } from "@/lib/demo-mode";
import { getQueryClient } from "@/router";

export type KnowledgeOverview = Awaited<
  ReturnType<typeof client.private.knowledge.overview>
>;
export type KnowledgeSource = KnowledgeOverview["sources"][number];
export type KnowledgeChunk = KnowledgeSource["chunks"][number];
export type KnowledgeSourceDetail = NonNullable<
  Awaited<ReturnType<typeof client.private.knowledge.source>>["source"]
>;

const BUSY = ["PENDING", "PROCESSING", "INDEXING"];

export const isSourceBusy = (s: { status: string }) => BUSY.includes(s.status);

function invalidateKnowledge(agentId: string) {
  const queryClient = getQueryClient();
  void queryClient.invalidateQueries({ queryKey: ["knowledge", agentId] });
  void queryClient.invalidateQueries({
    queryKey: ["agent-documents", agentId],
  });
  void queryClient.invalidateQueries({ queryKey: ["agent", agentId] });
}

/**
 * Everything the agent knows. With "Demodata" on, agent profile and brand are
 * real but sources/chunks come from the seeded demo set.
 */
export function useKnowledgeOverviewQuery(agentId: string) {
  const { on: demo } = useDemoMode();
  return useQuery({
    queryKey: ["knowledge", agentId, "overview", demo ? "demo" : "live"],
    queryFn: async (): Promise<KnowledgeOverview> => {
      const real = await client.private.knowledge.overview({ agentId });
      if (!demo) return real;
      return { ...real, ...demoKnowledge() } as KnowledgeOverview;
    },
    // Poll while something is still being indexed.
    refetchInterval: (query) =>
      !demo && query.state.data?.sources.some(isSourceBusy) ? 4_000 : false,
  });
}

export function useKnowledgeSourceQuery(
  agentId: string,
  documentId: string | null,
) {
  const { on: demo } = useDemoMode();
  return useQuery({
    queryKey: ["knowledge", agentId, "source", documentId, demo],
    enabled: Boolean(documentId),
    queryFn: async (): Promise<KnowledgeSourceDetail | null> => {
      if (!documentId) return null;
      if (demo) {
        const s = demoKnowledge().sources.find((x) => x.id === documentId);
        if (!s) return null;
        return {
          id: s.id,
          name: s.name,
          url: s.url,
          preview: s.chunks.map((c) => c.excerpt).join("\n\n"),
          chunks: s.chunks.map((c) => ({
            index: c.index,
            title: c.title,
            text: c.excerpt,
          })),
        };
      }
      const { source } = await client.private.knowledge.source({
        agentId,
        documentId,
      });
      return source;
    },
  });
}

export function useDeleteSourceMutation(agentId: string) {
  return useMutation({
    mutationFn: (documentId: string) =>
      client.private.documents.delete({ documentId }),
    onSuccess: () => {
      invalidateKnowledge(agentId);
      toast.success("Kilden er fjernet fra kunnskapsbasen");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Kunne ikke fjerne kilden",
      );
    },
  });
}

export function useAddWebpageSourceMutation(agentId: string) {
  return useMutation({
    mutationFn: (url: string) =>
      client.private.agents.addWebpage({ agentId, url }),
    onSuccess: (_, url) => {
      invalidateKnowledge(agentId);
      toast.success(`Nettsiden legges til: ${url}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Kunne ikke legge til nettsiden",
      );
    },
  });
}

export function useUploadSourceMutation(agentId: string) {
  return useMutation({
    mutationFn: (file: File) =>
      client.private.documents.upload({ agentId, file }),
    onSuccess: (_, file) => {
      invalidateKnowledge(agentId);
      toast.success(`Filen legges til: ${file.name}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Kunne ikke laste opp filen",
      );
    },
  });
}

export type KnowledgeAnswer = Awaited<
  ReturnType<typeof client.private.knowledge.ask>
>;
export type KnowledgeCitation = KnowledgeAnswer["citations"][number];

/** Staff knowledge assistant — always answers from the real knowledge base. */
export function useAskKnowledgeMutation(agentId: string) {
  return useMutation({
    mutationFn: (input: {
      question: string;
      documentId?: string;
      history?: { role: "user" | "assistant"; content: string }[];
    }) => client.private.knowledge.ask({ agentId, ...input }),
  });
}
