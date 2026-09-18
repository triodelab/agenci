import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  DownloadIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";

type ConversationListFilter =
  | "inbox"
  | "unresolved"
  | "escalated"
  | "resolved"
  | "all";

const FILTERS: { value: ConversationListFilter; label: string }[] = [
  { value: "inbox", label: "Innboks" },
  { value: "unresolved", label: "Uavklart" },
  { value: "escalated", label: "Eskalert" },
  { value: "resolved", label: "Løst" },
  { value: "all", label: "Alle" },
];

export function ConversationsPanel() {
  const { orgSlug, agentId } = useParams({
    from: "/_authed/org/$orgSlug/agents/$agentId",
  });
  const [statusFilter, setStatusFilter] =
    useState<ConversationListFilter>("inbox");
  const [searchQuery, setSearchQuery] = useState("");

  const handleExport = () => {
    const blob = new Blob(
      [["Navn", "E-post", "Status", "Sist melding"].join(",")],
      { type: "text/csv;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `konversasjoner-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col text-foreground">
      <header className="shrink-0 border-b border-border/60 bg-card px-4 pb-3 pt-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              className="grid size-8 place-items-center rounded-lg border border-border/80 bg-background text-foreground shadow-sm"
              aria-hidden
            >
              <MessageSquareIcon className="size-4" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold leading-none tracking-tight text-foreground">
                Konversasjoner
              </h2>
              <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                0 totalt
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              aria-label="Oppdater"
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
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

        <div className="relative mb-3">
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
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

        <div className="flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              type="button"
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-[12px] font-medium outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                statusFilter === filter.value
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-5 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
          <MessageSquareIcon
            className="size-5 text-muted-foreground/50"
            strokeWidth={1.5}
          />
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
        {!searchQuery.trim() && statusFilter === "inbox" ? (
          <Link
            to="/org/$orgSlug/agents/$agentId/integrations"
            params={{ orgSlug, agentId }}
            className="mt-1 flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-muted"
          >
            Sett opp widget →
          </Link>
        ) : null}
        {searchQuery.trim() ? (
          <button
            onClick={() => setSearchQuery("")}
            className="mt-1 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-muted"
            type="button"
          >
            Tøm søk
          </button>
        ) : null}
      </div>
    </div>
  );
}
