"use client";

import { usePathname } from "next/navigation";
import { ConversationsPanel } from "../components/conversations-panel";

export const ConversationsLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();

  // On mobile: detect if we're inside a specific conversation
  // Pattern: /conversations/[id] or /agents/[agentId]/conversations/[id]
  const isDetailOpen =
    /\/conversations\/[^/]+/.test(pathname) &&
    !pathname.endsWith("/conversations");

  return (
    <div className="flex h-full min-h-0 w-full max-h-full flex-1 overflow-hidden bg-transparent">
      {/* List panel: hidden on mobile when detail is open */}
      <div
        className={[
          "dash-subpane-rail flex w-full shrink-0 flex-col border-border/40 border-r bg-muted/10 dark:bg-muted/5",
          "lg:flex lg:w-[22rem] lg:min-w-[19rem]",
          // Mobile: hide list when conversation is open; show list fullscreen when none selected
          isDetailOpen ? "hidden lg:flex" : "flex lg:flex lg:w-[22rem]",
        ].join(" ")}
      >
        <ConversationsPanel />
      </div>

      {/* Detail panel: hidden on mobile when no conversation is selected */}
      <div
        className={[
          "dash-subpane-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
          !isDetailOpen ? "hidden lg:flex" : "flex",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
};
