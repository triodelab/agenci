import { useRouterState } from "@tanstack/react-router";
import { ConversationsPanel } from "../components/conversations-panel";

export function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDetailOpen =
    /\/conversations\/[^/]+/.test(pathname) &&
    !pathname.endsWith("/conversations");

  return (
    <div className="flex h-full min-h-0 w-full max-h-full flex-1 overflow-hidden bg-transparent">
      <div
        className={[
          "dash-subpane-rail flex w-full shrink-0 flex-col border-border/40 border-r bg-muted/10 dark:bg-muted/5",
          "lg:flex lg:w-[22rem] lg:min-w-[19rem]",
          isDetailOpen ? "hidden lg:flex" : "flex lg:flex lg:w-[22rem]",
        ].join(" ")}
      >
        <ConversationsPanel />
      </div>

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
}
