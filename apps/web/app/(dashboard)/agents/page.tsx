import type { Metadata } from "next";
import { AgentsHomeView } from "@/modules/dashboard/ui/views/agents-home-view";

export const metadata: Metadata = { title: "Agenter" };

export default function AgentsPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <AgentsHomeView />
    </div>
  );
}
