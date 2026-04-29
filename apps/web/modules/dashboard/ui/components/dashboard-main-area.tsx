"use client";

import { cn } from "@workspace/ui/lib/utils";

export function DashboardMainArea({ children }: { children: React.ReactNode }) {
  return (
    <main
      className={cn(
        "app-dashboard-main flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
        "border-l border-border/60",
      )}
    >
      {children}
    </main>
  );
}
