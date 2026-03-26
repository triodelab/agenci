"use client";

import { useAuth } from "@clerk/nextjs";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { formatDistanceToNow } from "date-fns";
import { getCountryFlagUrl, getCountryFromTimezone } from "@/lib/country-utils";
import { api } from "@workspace/backend/_generated/api";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import { usePaginatedQuery } from "convex/react";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  CornerUpLeftIcon,
  DownloadIcon,
  ListIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { useAtomValue, useSetAtom } from "jotai/react";
import { statusFilterAtom } from "../../atoms";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useMemo, useState } from "react";
import { EmptyState } from "./legacy-ui";

export const ConversationsPanel = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded: authLoaded, orgId: clerkOrgId } = useAuth();

  const statusFilter = useAtomValue(statusFilterAtom);
  const setStatusFilter = useSetAtom(statusFilterAtom);
  const [searchQuery, setSearchQuery] = useState("");

  const conversations = usePaginatedQuery(
    api.private.conversations.getMany,
    !authLoaded || !clerkOrgId
      ? "skip"
      : {
          status:
            statusFilter === "all" ? undefined : statusFilter,
        },
    {
      initialNumItems: 10,
    },
  );

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingMore,
    isLoadingFirstPage,
  } = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
    loadSize: 10,
  });

  const filtered = useMemo(() => {
    const rows = conversations.results;
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return rows;
    }
    return rows.filter((c) => {
      const name = c.contactSession.name?.toLowerCase() ?? "";
      const last = c.lastMessage?.text?.toLowerCase() ?? "";
      return name.includes(q) || last.includes(q);
    });
  }, [conversations.results, searchQuery]);

  const handleExport = () => {
    const lines = [
      ["Navn", "E-post", "Status", "Sist melding"].join(","),
      ...conversations.results.map((c) =>
        [
          JSON.stringify(c.contactSession.name ?? ""),
          JSON.stringify(c.contactSession.email ?? ""),
          c.status,
          JSON.stringify(c.lastMessage?.text ?? ""),
        ].join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `konversasjoner-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-transparent text-foreground">
      <header className="dash-surface-header border-border/70 border-b px-4 py-4">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="grid size-8 place-items-center rounded-lg border border-border bg-card text-foreground shadow-sm"
              aria-hidden
            >
              <MessageSquareIcon className="size-4" strokeWidth={1.75} />
            </span>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Konversasjoner
            </h2>
          </div>
          <span className="rounded-full bg-muted/80 px-2 py-0.5 text-[11px] text-muted-foreground tabular-nums">
            {filtered.length} av {conversations.results.length}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1">
            <Button
              aria-label="Oppdater"
              className="size-8 shrink-0"
              onClick={() => router.refresh()}
              size="icon"
              type="button"
              variant="ghost"
            >
              <RefreshCwIcon className="size-4" />
            </Button>
            <Button
              aria-label="Last ned CSV"
              className="size-8 shrink-0"
              onClick={handleExport}
              size="icon"
              type="button"
              variant="ghost"
            >
              <DownloadIcon className="size-4" />
            </Button>
            <div className="relative min-w-0 flex-1">
              <SearchIcon
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                aria-label="Søk i konversasjoner"
                className="h-9 border-border/70 bg-card/90 pl-8 text-sm shadow-sm"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Søk etter navn eller melding…"
                type="search"
                value={searchQuery}
              />
            </div>
          </div>
          <Select
            onValueChange={(value) =>
              setStatusFilter(
                value as "unresolved" | "escalated" | "resolved" | "all",
              )
            }
            value={statusFilter}
          >
            <SelectTrigger className="h-9 w-full border-border/70 bg-card/90 text-sm shadow-sm">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <ListIcon className="size-4" />
                  <span>Alle</span>
                </div>
              </SelectItem>
              <SelectItem value="unresolved">
                <div className="flex items-center gap-2">
                  <ArrowRightIcon className="size-4" />
                  <span>Uavklart</span>
                </div>
              </SelectItem>
              <SelectItem value="escalated">
                <div className="flex items-center gap-2">
                  <ArrowUpIcon className="size-4" />
                  <span>Eskalert</span>
                </div>
              </SelectItem>
              <SelectItem value="resolved">
                <div className="flex items-center gap-2">
                  <CheckIcon className="size-4" />
                  <span>Løst</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {isLoadingFirstPage ? (
        <SkeletonConversations />
      ) : filtered.length === 0 ? (
        <EmptyState
          description={
            searchQuery.trim()
              ? "Prøv et annet søk eller fjern filter."
              : "Nye samtaler vises her."
          }
          icon={<MessageSquareIcon className="size-10 stroke-[1.25]" />}
          title={
            searchQuery.trim() ? "Ingen treff" : "Ingen samtaler funnet"
          }
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <nav
            aria-label="Liste over samtaler"
            className="divide-y divide-border/60"
          >
            {filtered.map((conversation) => {
              const isLastMessageFromOperator =
                conversation.lastMessage?.message?.role !== "user";
              const country = getCountryFromTimezone(
                conversation.contactSession.metadata?.timezone,
              );
              const countryFlagUrl = country?.code
                ? getCountryFlagUrl(country.code)
                : undefined;
              const selected = pathname === `/conversations/${conversation._id}`;

              return (
                <Link
                  className={cn(
                    "grid w-full grid-cols-[2.25rem_1fr] gap-x-3 gap-y-1 px-4 py-3 text-left transition-colors duration-150",
                    "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    selected &&
                      "border-l-[3px] border-l-foreground bg-[var(--dash-nav-active-bg)] pl-[calc(1rem-3px)]",
                  )}
                  href={`/conversations/${conversation._id}`}
                  key={conversation._id}
                >
                  <div className="col-start-1 row-span-2 self-start pt-0.5">
                    <DicebearAvatar
                      badgeImageUrl={countryFlagUrl}
                      seed={conversation.contactSession._id}
                      size={36}
                    />
                  </div>
                  <div className="col-start-2 row-start-1 flex min-w-0 items-start gap-2">
                    <span className="min-w-0 flex-1 break-words text-sm font-semibold leading-snug text-foreground sm:text-[15px]">
                      {conversation.contactSession.name}
                    </span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <ConversationStatusIcon status={conversation.status} />
                      {isLastMessageFromOperator ? (
                        <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground whitespace-nowrap">
                          <CornerUpLeftIcon className="size-3 shrink-0" />
                          Operatør
                        </span>
                      ) : null}
                      <span
                        className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap"
                        suppressHydrationWarning
                      >
                        {formatDistanceToNow(conversation._creationTime, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="col-start-2 row-start-2 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                    {conversation.lastMessage?.text ?? "Ingen melding ennå"}
                  </p>
                </Link>
              );
            })}
            <InfiniteScrollTrigger
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={handleLoadMore}
              ref={topElementRef}
            />
          </nav>
        </div>
      )}
    </div>
  );
};

export const SkeletonConversations = () => {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0 overflow-auto">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          className="grid grid-cols-[2.25rem_1fr] gap-x-3 gap-y-2 border-border/50 border-b px-4 py-3.5"
          key={index}
        >
          <Skeleton className="row-span-2 size-9 shrink-0 self-start rounded-full" />
          <div className="col-start-2 flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-14 shrink-0" />
          </div>
          <Skeleton className="col-start-2 h-3 w-full" />
        </div>
      ))}
    </div>
  );
};
