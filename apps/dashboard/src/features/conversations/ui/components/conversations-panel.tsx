import { Link, useParams } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowUpRightIcon, MessageSquareIcon } from "lucide-react";
import type { ConversationSummary } from "../../queries/conversations-queries";
import {
  arrowChipClass,
  ContactAvatar,
  cardClass,
  contactName,
  contactSubtitle,
  formatDayTime,
  StatusPill,
} from "./conversation-ui";

export type ConversationListFilter =
  | "inbox"
  | "unresolved"
  | "escalated"
  | "resolved"
  | "all";

export const CONVERSATION_FILTERS: {
  value: ConversationListFilter;
  label: string;
}[] = [
  { value: "inbox", label: "Innboks" },
  { value: "unresolved", label: "Uavklart" },
  { value: "escalated", label: "Eskalert" },
  { value: "resolved", label: "Løst" },
  { value: "all", label: "Alle" },
];

function ConversationCard({
  conversation,
  selected,
}: {
  conversation: ConversationSummary;
  selected: boolean;
}) {
  const { orgSlug, agentId } = useParams({
    from: "/_authed/org/$orgSlug/agents/$agentId",
  });
  const c = conversation;

  return (
    <Link
      to="/org/$orgSlug/agents/$agentId/conversations/$conversationId"
      params={{ orgSlug, agentId, conversationId: c.threadId }}
      className={cn(
        cardClass,
        "group block p-4 transition-[box-shadow,transform] duration-200 hover:shadow-[0_1px_2px_rgb(16_18_20/0.04),0_14px_32px_-18px_rgb(16_18_20/0.18)]",
        selected &&
          "shadow-[0_0_0_1.5px_rgb(36_50_54/0.85),0_14px_34px_-14px_rgb(5_6_7/0.22)] hover:shadow-[0_0_0_1.5px_rgb(36_50_54/0.85),0_14px_34px_-14px_rgb(5_6_7/0.22)]",
      )}
    >
      <div className="flex items-start gap-2.5">
        <ContactAvatar contact={c.contact} size={34} />
        <div className="min-w-0 flex-1 pt-px">
          <p className="truncate text-[13px] leading-[1.25] text-(--agenci-ink-2)">
            {contactName(c.contact)}
          </p>
          <p className="truncate text-[12px] leading-[1.25] text-(--agenci-ink-3)">
            {contactSubtitle(c.contact)}
          </p>
        </div>
        <span
          aria-hidden
          className={cn(
            arrowChipClass,
            "group-hover:bg-[#f3f5f4]",
            selected &&
              "border-transparent bg-(--agenci-ink) text-white group-hover:bg-(--agenci-ink) dark:bg-white dark:text-[#0b0c0e]",
          )}
        >
          <ArrowUpRightIcon className="size-3.5" strokeWidth={1.5} />
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-[15px] font-semibold leading-snug tracking-[-0.015em] text-(--agenci-ink)">
        {c.firstMessage ?? "Ny samtale"}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-[12px] tabular-nums text-(--agenci-ink-3) [font-family:var(--font-agenci-data)]">
          {formatDayTime(c.updatedAt)}
        </span>
        <StatusPill status={c.status} className="ml-auto" />
      </div>
      {c.lastMessage ? (
        <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-(--agenci-ink-3)">
          {c.lastMessage.role === "assistant" ? "Agent: " : ""}
          {c.lastMessage.text}
        </p>
      ) : null}
    </Link>
  );
}

export function ConversationsPanel({
  conversations,
  isLoading,
  statusFilter,
  hiddenCount,
  onShowAll,
  searchQuery,
  onClearSearch,
}: {
  conversations: ConversationSummary[];
  isLoading: boolean;
  statusFilter: ConversationListFilter;
  /** Conversations matching the search but hidden by the status filter. */
  hiddenCount: number;
  onShowAll: () => void;
  searchQuery: string;
  onClearSearch: () => void;
}) {
  const filterLabel =
    CONVERSATION_FILTERS.find((f) => f.value === statusFilter)?.label ?? "";
  const { orgSlug, agentId, conversationId } = useParams({ strict: false }) as {
    orgSlug: string;
    agentId: string;
    conversationId?: string;
  };

  return (
    <div className="-mx-2 -mt-2 flex h-[calc(100%+8px)] min-h-0 flex-col overflow-y-auto px-2 pt-2 pb-3 text-(--agenci-ink) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(cardClass, "h-[150px] animate-pulse bg-white/70")}
            />
          ))}
        </div>
      ) : conversations.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {conversations.map((c) => (
            <ConversationCard
              key={c.threadId}
              conversation={c}
              selected={c.threadId === conversationId}
            />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            cardClass,
            "flex flex-col items-center gap-3 px-5 py-10 text-center",
          )}
        >
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f3f5f4] text-(--agenci-ink) dark:bg-white/5">
            <MessageSquareIcon className="size-5" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-(--agenci-ink)">
              {searchQuery.trim()
                ? "Ingen treff"
                : statusFilter === "inbox"
                  ? "Innboksen er tom"
                  : "Ingen samtaler"}
            </p>
            <p className="mx-auto mt-1 max-w-[220px] text-[13px] leading-relaxed text-(--agenci-ink-2)">
              {searchQuery.trim()
                ? "Prøv et annet søk eller velg et annet filter."
                : hiddenCount > 0
                  ? `${hiddenCount} ${hiddenCount === 1 ? "samtale er skjult" : "samtaler er skjult"} av filteret «${filterLabel}».`
                  : statusFilter === "resolved"
                    ? "Ingen samtaler er merket som løst ennå."
                    : "Når kunder chatter via widgeten, vises de her."}
            </p>
          </div>
          {!searchQuery.trim() && hiddenCount > 0 ? (
            <button
              onClick={onShowAll}
              className="mt-1 inline-flex h-9 items-center rounded-full bg-(--agenci-ink) px-4 text-[13px] font-medium text-white transition-colors hover:bg-(--agenci-accent-hover) dark:bg-white dark:text-[#0b0c0e]"
              type="button"
            >
              Vis alle samtaler
            </button>
          ) : !searchQuery.trim() && statusFilter === "inbox" ? (
            <Link
              to="/org/$orgSlug/agents/$agentId/integrations"
              params={{ orgSlug, agentId }}
              className="mt-1 inline-flex h-9 items-center rounded-full bg-(--agenci-ink) px-4 text-[13px] font-medium text-white transition-colors hover:bg-(--agenci-accent-hover) dark:bg-white dark:text-[#0b0c0e]"
            >
              Sett opp widget →
            </Link>
          ) : null}
          {searchQuery.trim() ? (
            <button
              onClick={onClearSearch}
              className="mt-1 inline-flex h-9 items-center rounded-full border border-(--agenci-line) bg-white px-4 text-[13px] font-medium text-(--agenci-ink) transition-colors hover:bg-[#f3f5f4] dark:border-white/10 dark:bg-transparent"
              type="button"
            >
              Tøm søk
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
