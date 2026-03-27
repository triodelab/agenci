export const ConversationsView = () => {
  return (
    <div
      className="dash-conversations-canvas flex h-full min-h-0 flex-1 flex-col"
      role="main"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-lg flex flex-col items-center text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Konversasjoner
          </p>
          <h2 className="mt-2 text-[22px] font-semibold tracking-tight text-foreground sm:text-[24px]">
            Velg en samtale
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md text-[14px] leading-relaxed">
            Samtaler fra widget og kanaler ligger i listen til venstre. Velg en
            rad for å åpne tråden, svare og forbedre AI-svar.
          </p>
        </div>
      </div>
    </div>
  );
};
