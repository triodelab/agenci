import { cn } from "@workspace/ui/lib/utils";
import { InboxIcon } from "lucide-react";
import { cardClass } from "../components/conversation-ui";

export function ConversationsView() {
  return (
    <section className={cn(cardClass, "flex min-h-0 flex-1 flex-col")}>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="flex w-full max-w-lg flex-col items-center text-center">
          <div
            aria-hidden
            className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-[#f3f5f4] text-(--agenci-ink) dark:bg-white/5"
          >
            <InboxIcon className="size-7" strokeWidth={1.5} />
          </div>
          <p className="text-[12px] font-medium tracking-[0.06em] text-(--agenci-ink-3) uppercase [font-family:var(--font-agenci-data)]">
            Konversasjoner
          </p>
          <h2 className="mt-2 text-[24px] font-medium leading-[1.15] tracking-[-0.03em] text-(--agenci-ink) [font-family:var(--font-agenci-title)]">
            Velg en samtale
          </h2>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-(--agenci-ink-2)">
            Velg en samtale fra listen for å lese tråden, følge opp kunden og
            sette status.
          </p>
        </div>
      </div>
    </section>
  );
}
