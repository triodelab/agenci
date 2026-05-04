"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeftIcon } from "lucide-react";
import { useWidgetDisplayTitle } from "@/lib/widget-display-title";
import {
  contactSessionIdAtomFamily,
  conversationIdAtomFamily,
  organizationIdAtom,
  screenAtom,
} from "@/modules/widget/atoms/widget-atoms";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { WidgetFooter } from "../components/widget-footer";
import { usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";

export const WidgetInboxScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const widgetTitle = useWidgetDisplayTitle();

  const organizationId = useAtomValue(organizationIdAtom);
  const setConversationId = useSetAtom(
    conversationIdAtomFamily(organizationId || ""),
  );
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  const conversations = usePaginatedQuery(
    api.public.conversations.getMany,
    contactSessionId
      ? {
          contactSessionId,
        }
      : "skip",
    {
      initialNumItems: 10,
    },
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
    loadSize: 10,
  });

  return (
    <>
      <WidgetHeader>
        <div className="flex items-center gap-x-2">
          <Button
            variant="transparent"
            size="icon"
            onClick={() => setScreen("selection")}
          >
            <ArrowLeftIcon />
          </Button>
          <p className="truncate font-semibold">{widgetTitle}</p>
        </div>
      </WidgetHeader>
      <div
        className="flex flex-1 flex-col gap-y-2 p-4 overflow-y-auto"
        style={{ backgroundColor: "var(--widget-bg, #fff)" }}
      >
        {conversations?.results.length > 0 &&
          conversations?.results.map((conversation) => (
            <button
              type="button"
              className="flex h-20 w-full items-center justify-between rounded-xl border px-4 text-left transition-opacity hover:opacity-80"
              key={conversation._id}
              style={{
                backgroundColor: "var(--widget-input-bg, #fff)",
                borderColor: "var(--widget-input-border, #e4e4e7)",
                color: "var(--widget-input-text, #18181b)",
              }}
              onClick={() => {
                setConversationId(conversation._id);
                setScreen("chat");
              }}
            >
              <div className="flex w-full flex-col gap-2 overflow-hidden">
                <div className="flex w-full items-center justify-between gap-x-2">
                  <p
                    className="text-xs"
                    style={{ color: "var(--widget-input-placeholder, #8a8f98)" }}
                  >
                    Chat
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--widget-input-placeholder, #8a8f98)" }}
                  >
                    {formatDistanceToNow(new Date(conversation._creationTime))}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between gap-x-2">
                  <p className="truncate text-sm">
                    {conversation.lastMessage?.text}
                  </p>
                  <ConversationStatusIcon status={conversation.status} className="shrink-0" />
                </div>
              </div>
            </button>
          ))
        }
        <InfiniteScrollTrigger
          canLoadMore={canLoadMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
          ref={topElementRef}
        />
      </div>
      <WidgetFooter />
    </>
  );
};
