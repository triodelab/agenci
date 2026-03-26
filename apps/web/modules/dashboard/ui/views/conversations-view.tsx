export const ConversationsView = () => {
  return (
    <div
      className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-6 bg-transparent px-6 py-10 text-center md:px-10"
      role="main"
    >
      <div className="app-dashboard-panel max-w-md rounded-2xl px-8 py-10 shadow-lg">
        <div
          className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl border border-border bg-card text-muted-foreground shadow-sm"
          aria-hidden
        >
          <svg
            className="size-7"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            viewBox="0 0 24 24"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p className="text-lg font-semibold tracking-tight text-foreground">
          Velg en samtale
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Klikk på en konversasjon til venstre for å se meldinger og kundedetaljer.
        </p>
      </div>
    </div>
  );
};
