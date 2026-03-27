"use client";

import { useAuth } from "@clerk/nextjs";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { formatDistanceToNow } from "date-fns";
import { api } from "@workspace/backend/_generated/api";
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
  DownloadIcon,
  InboxIcon,
  ListIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { useAtomValue, useSetAtom } from "jotai/react";
import {
  type ConversationListFilter,
  statusFilterAtom,
} from "../../atoms";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useMemo, useState } from "react";
import { EmptyState } from "./legacy-ui";
import { ContactAvatar } from "./contact-avatar";

type LastMessageDoc = {
  _creationTime?: number;
  text?: string;
  message?: { role?: string };
};

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
          status: statusFilter,
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
      const email = c.contactSession.email?.toLowerCase() ?? "";
      const last = c.lastMessage?.text?.toLowerCase() ?? "";
      return name.includes(q) || email.includes(q) || last.includes(q);
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
    <div className="flex h-full min-h-0 w-full flex-col bg-muted/15 text-foreground dark:bg-transparent">
      <header className="border-border/60 border-b bg-card/90 px-4 py-4 backdrop-blur-sm">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="grid size-8 place-items-center rounded-lg border border-border/80 bg-background text-foreground shadow-sm"
              aria-hidden
            >
              <MessageSquareIcon className="size-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
                Chat logs
              </h2>
              <p className="text-[11px] text-muted-foreground">Samtaler</p>
            </div>
          </div>
          <span className="rounded-full border border-border/50 bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground tabular-nums">
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
                className="h-9 rounded-lg border-border/70 bg-background pl-8 text-sm"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Søk navn, e-post eller melding…"
                type="search"
                value={searchQuery}
              />
            </div>
          </div>
          <Select
            onValueChange={(value) =>
              setStatusFilter(value as ConversationListFilter)
            }
            value={statusFilter}
          >
            <SelectTrigger className="h-9 w-full rounded-lg border-border/70 bg-background text-sm">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inbox">
                <div className="flex items-center gap-2">
                  <InboxIcon className="size-4" />
                  <span>Innboks</span>
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
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <ListIcon className="size-4" />
                  <span>Alle</span>
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
              : statusFilter === "inbox"
                ? "Ingen åpne samtaler akkurat nå — enten er alt løst, eller det har ikke kommet inn noe ennå."
                : statusFilter === "resolved"
                  ? "Ingen samtaler er merket som løst ennå."
                  : "Nye samtaler vises her."
          }
          icon={<MessageSquareIcon className="size-10 stroke-[1.25]" />}
          title={
            searchQuery.trim()
              ? "Ingen treff"
              : statusFilter === "inbox"
                ? "Innboksen er tom"
                : "Ingen samtaler funnet"
          }
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <nav
            aria-label="Liste over samtaler"
            className="divide-y divide-border/50"
          >
            {filtered.map((conversation) => {
              const last = conversation.lastMessage as LastMessageDoc | null;
              const lastAt =
                last?._creationTime ?? conversation._creationTime;
              const lastRole = last?.message?.role;
              const preview = last?.text ?? "Ingen melding ennå";
              const previewLabel =
                lastRole === "user" ? "Kunde" : "Siste svar";

              const selected = pathname === `/conversations/${conversation._id}`;
              const displayName = conversation.contactSession.name?.trim() || "Uten navn";

              return (
                <Link
                  className={cn(
                    "block px-4 py-3 text-left transition-colors duration-150",
                    "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    selected &&
                      "border-l-[3px] border-l-foreground bg-background shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-none",
                  )}
                  href={`/conversations/${conversation._id}`}
                  key={conversation._id}
                >
                  <div className="flex gap-3">
                    <ContactAvatar name={displayName} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-semibold leading-tight text-foreground">
                            {displayName}
                          </p>
                          {conversation.contactSession.email ? (
                            <p className="mt-0.5 truncate text-[11px] leading-snug text-muted-foreground">
                              {conversation.contactSession.email}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <ConversationStatusIcon
                            status={conversation.status}
                          />
                          <span
                            className="text-[11px] text-muted-foreground tabular-nums"
                            suppressHydrationWarning
                          >
                            {formatDistanceToNow(lastAt, {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-2 line-clamp-2 text-[12px] leading-snug">
                        <span className="font-medium text-foreground/70">
                          {previewLabel}:{" "}
                        </span>
                        {preview}
                      </p>
                    </div>
                  </div>
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
          className="flex gap-3 border-border/50 border-b px-4 py-3.5"
          key={index}
        >
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16 shrink-0" />
            </div>
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
