"use client";

import { Suspense } from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { KnowledgeTrainingPlayground } from "../components/knowledge-training-playground";
import type { Id } from "@workspace/backend/_generated/dataModel";

function FilesViewLoading() {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-3">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-[min(55vh,640px)] w-full rounded-2xl" />
      </div>
    </div>
  );
}

function FilesViewInner({ agentId }: { agentId?: Id<"agents"> }) {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <KnowledgeTrainingPlayground agentId={agentId} />
    </div>
  );
}

export function FilesView({ agentId }: { agentId?: Id<"agents"> }) {
  return (
    <Suspense fallback={<FilesViewLoading />}>
      <FilesViewInner agentId={agentId} />
    </Suspense>
  );
}
