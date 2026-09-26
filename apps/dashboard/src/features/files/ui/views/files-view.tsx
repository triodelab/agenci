import { KnowledgeView } from "@/features/knowledge/ui/views/knowledge-view";

export function FilesView({ agentId }: { agentId: string }) {
  return <KnowledgeView agentId={agentId} />;
}
