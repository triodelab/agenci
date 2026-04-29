import { ChatSkeleton } from "@/modules/dashboard/ui/components/dashboard-skeleton";

export default function Loading() {
  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ChatSkeleton />
      </div>
    </div>
  );
}
