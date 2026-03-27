"use client";

import { usePathname } from "next/navigation";

import { cn } from "@workspace/ui/lib/utils";

/**
 * Prikket canvas kun der det gir mening — oversikt (/dashboard) har ren bakgrunn.
 */
export function DashboardMainArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const overviewPlain =
    pathname === "/dashboard" || pathname === "/dashboard/";

  return (
    <main
      className={cn(
        "app-dashboard-main flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-border/60 border-l",
        !overviewPlain && "app-dashboard-canvas",
      )}
    >
      {children}
    </main>
  );
}
