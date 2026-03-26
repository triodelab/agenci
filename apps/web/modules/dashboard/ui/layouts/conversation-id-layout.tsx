import { ContactPanel } from "../components/contact-panel";

/** Tre kolonner som i eldre prosjekt: liste | tråd | detaljer (320px). */
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
      <div className="hidden w-80 min-w-[18rem] shrink-0 flex-col border-border/60 border-l bg-card/30 backdrop-blur-md dark:bg-card/20 lg:flex">
        <ContactPanel />
      </div>
    </div>
  );
};
