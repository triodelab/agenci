import { KnowledgeTrainingPlayground } from "../components/knowledge-training-playground";

export function FilesView({ agentId }: { agentId: string }) {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <KnowledgeTrainingPlayground agentId={agentId} />
    </div>
  );
}
