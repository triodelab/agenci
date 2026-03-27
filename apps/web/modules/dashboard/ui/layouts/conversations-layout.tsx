import { ConversationsPanel } from "../components/conversations-panel";

/** Eldre dashboard: fast 320px liste + hovedflate, full bredde. */
export const ConversationsLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-transparent">
      <div className="dash-subpane-rail flex w-[22rem] min-w-[19rem] shrink-0 flex-col border-border/40 border-r bg-muted/10 sm:w-96 dark:bg-muted/5">
        <ConversationsPanel />
      </div>
      <div className="dash-subpane-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};
