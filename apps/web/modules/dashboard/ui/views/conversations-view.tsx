import { InboxIcon } from "lucide-react";

export const ConversationsView = () => {
  return (
    <div
      className="dash-conversations-canvas flex h-full min-h-0 flex-1 flex-col"
      role="main"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="flex w-full max-w-lg flex-col items-center text-center">
          <div
            aria-hidden
            className="mb-7 flex size-[4.25rem] items-center justify-center rounded-2xl border border-border/80 bg-muted/60 shadow-[0_0_48px_-20px_rgba(0,0,0,0.12)] dark:bg-muted/20"
          >
            <InboxIcon
              className="size-[1.65rem] text-foreground/80"
              strokeWidth={1.65}
            />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Konversasjoner
          </p>
          <h2 className="mt-2 text-[22px] font-semibold tracking-tight text-foreground sm:text-[24px]">
            Velg en samtale
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md text-[14px] leading-relaxed">
            Velg en samtale fra listen for å lese tråden, svare på kunden og
            gi tilbakemelding på AI-svar.
          </p>
        </div>
      </div>
    </div>
  );
};
