"use client";

import { useAuth } from "@clerk/nextjs";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { formatDistanceToNow } from "date-fns";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { usePaginatedQuery } from "convex/react";
import {
  CheckIcon,
  DownloadIcon,
  InboxIcon,
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
import { useParams } from "next/navigation";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useMemo, useState } from "react";
import { ContactAvatar } from "./contact-avatar";

type LastMessageDoc = {
  _creationTime?: number;
  text?: string;
  message?: { role?: string };
};

const FILTERS: { value: ConversationListFilter; label: string }[] = [
  { value: "inbox",      label: "Innboks" },
  { value: "unresolved", label: "Uavklart" },
  { value: "escalated",  label: "Eskalert" },
  { value: "resolved",   label: "Løst" },
  { value: "all",        label: "Alle" },
];

export const ConversationsPanel = () => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const { isLoaded: authLoaded, orgId: clerkOrgId } = useAuth();

  const agentId =
    typeof params?.agentId === "string"
      ? (params.agentId as Id<"agents">)
      : undefined;

  const statusFilter = useAtomValue(statusFilterAtom);
  const setStatusFilter = useSetAtom(statusFilterAtom);
  const [searchQuery, setSearchQuery] = useState("");

  const conversations = usePaginatedQuery(
    api.private.conversations.getMany,
    !authLoaded || !clerkOrgId
      ? "skip"
      : { status: statusFilter, agentId },
    { initialNumItems: 10 },
  );

  const convBasePath = agentId ? `/agents/${agentId}/conversations` : "/conversations";

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
    if (!q) return rows;
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
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `konversasjoner-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col text-foreground">

      {/* ── Header ── */}
      <header className="shrink-0 border-b border-border/60 bg-card px-4 pb-3 pt-4">

        {/* Row 1: title + actions */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              className="grid size-8 place-items-center rounded-lg border border-border/80 bg-background text-foreground shadow-sm"
              aria-hidden
            >
              <MessageSquareIcon className="size-4" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight text-foreground leading-none">
                Konversasjoner
              </h2>
              {!isLoadingFirstPage && (
                <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                  {searchQuery.trim()
                    ? `${filtered.length} av ${conversations.results.length}`
                    : `${conversations.results.length} totalt`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              aria-label="Oppdater"
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => router.refresh()}
              size="icon"
              type="button"
              variant="ghost"
            >
              <RefreshCwIcon className="size-3.5" />
            </Button>
            <Button
              aria-label="Last ned CSV"
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={handleExport}
              size="icon"
              type="button"
              variant="ghost"
            >
              <DownloadIcon className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Row 2: search */}
        <div className="relative mb-3">
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Søk i konversasjoner"
            className="h-9 rounded-xl border-border/70 bg-muted/30 pl-[2.125rem] text-[13px] placeholder:text-muted-foreground/60 focus-visible:bg-background"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Søk navn, e-post eller melding…"
            type="search"
            value={searchQuery}
          />
        </div>

        {/* Row 3: filter pills */}
        <div className="flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              type="button"
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-[12px] font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                statusFilter === f.value
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── List ── */}
      {isLoadingFirstPage ? (
        <SkeletonConversations />
      ) : filtered.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-5 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
            <MessageSquareIcon className="size-5 text-muted-foreground/50" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-foreground">
              {searchQuery.trim()
                ? "Ingen treff"
                : statusFilter === "inbox"
                  ? "Innboksen er tom"
                  : "Ingen samtaler"}
            </p>
            <p className="mt-1 max-w-[200px] text-[12px] leading-relaxed text-muted-foreground">
              {searchQuery.trim()
                ? "Prøv et annet søk eller velg et annet filter."
                : statusFilter === "resolved"
                  ? "Ingen samtaler er merket som løst ennå."
                  : "Når kunder chatter via widgeten, vises de her."}
            </p>
          </div>
          {!searchQuery.trim() && statusFilter === "inbox" && (
            <Link
              href="/integrations"
              className="mt-1 flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              Sett opp widget →
            </Link>
          )}
          {searchQuery.trim() && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-1 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-muted"
              type="button"
            >
              Tøm søk
            </button>
          )}
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <nav
            aria-label="Liste over samtaler"
            className="divide-y divide-border/40"
          >
            {filtered.map((conversation) => {
              const last = conversation.lastMessage as LastMessageDoc | null;
              const lastAt = last?._creationTime ?? conversation._creationTime;
              const lastRole = last?.message?.role;
              const preview = last?.text ?? "Ingen melding ennå";
              const previewLabel = lastRole === "user" ? "Kunde" : "Siste svar";
              const convPath = `${convBasePath}/${conversation._id}`;
              const selected = pathname === convPath;
              const displayName = conversation.contactSession.name?.trim() || "Uten navn";

              return (
                <Link
                  className={cn(
                    "block px-4 py-3.5 text-left transition-colors duration-100",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    selected
                      ? "bg-foreground text-background hover:bg-foreground/92"
                      : "hover:bg-muted/30",
                  )}
                  href={convPath}
                  key={conversation._id}
                >
                  <div className="flex gap-3">
                    <ContactAvatar name={displayName} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            "truncate text-[13px] font-semibold leading-tight",
                            selected ? "text-background" : "text-foreground",
                          )}>
                            {displayName}
                          </p>
                          {conversation.contactSession.email ? (
                            <p className={cn(
                              "mt-0.5 truncate text-[11px] leading-snug",
                              selected ? "text-background/70" : "text-muted-foreground",
                            )}>
                              {conversation.contactSession.email}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <ConversationStatusIcon status={conversation.status} />
                          <span
                            className={cn(
                              "text-[10px] tabular-nums",
                              selected ? "text-background/60" : "text-muted-foreground/70",
                            )}
                            suppressHydrationWarning
                          >
                            {formatDistanceToNow(lastAt, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <p className={cn(
                        "mt-2 line-clamp-2 text-[12px] leading-snug",
                        selected ? "text-background/75" : "text-muted-foreground",
                      )}>
                        <span className={cn(
                          "font-medium",
                          selected ? "text-background/90" : "text-foreground/65",
                        )}>
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
          className="flex gap-3 border-b border-border/40 px-4 py-3.5"
          key={index}
        >
          <Skeleton className="size-[2.375rem] shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-14 shrink-0" />
            </div>
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
