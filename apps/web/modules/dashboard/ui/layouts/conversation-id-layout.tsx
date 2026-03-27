/** Liste ligger i foreldrelayout; samtale er full bredde med faner (Chat / Detaljer) inne i visningen. */
export const ConversationIdLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden bg-transparent">
      <div className="dash-subpane-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};
