import { Link, useParams, useRouterState } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { cn } from "@workspace/ui/lib/utils";
import {
  DownloadIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DemoSwitch } from "@/components/demo-switch";
import {
  type ConversationSummary,
  useConversationsQuery,
} from "../../queries/conversations-queries";
import {
  contactName,
  dataTextClass,
  STATUS_META,
} from "../components/conversation-ui";
import {
  CONVERSATION_FILTERS,
  type ConversationListFilter,
  ConversationsPanel,
} from "../components/conversations-panel";

function matchesFilter(c: ConversationSummary, filter: ConversationListFilter) {
  if (filter === "all") return true;
  if (filter === "inbox") return c.status !== "resolved";
  return c.status === filter;
}

function matchesSearch(c: ConversationSummary, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    c.contact.name,
    c.contact.email,
    c.firstMessage,
    c.lastMessage?.text,
  ].some((v) => v?.toLowerCase().includes(q));
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

const roundIconButton =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-(--agenci-ink-2) shadow-[0_1px_2px_rgb(5_6_7/0.04),0_6px_18px_-10px_rgb(5_6_7/0.12)] transition-[color,transform] duration-150 hover:text-(--agenci-ink) active:scale-95 dark:bg-white/5";

export function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { orgSlug, agentId } = useParams({
    from: "/_authed/org/$orgSlug/agents/$agentId",
  });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDetailOpen =
    /\/conversations\/[^/]+/.test(pathname) &&
    !pathname.endsWith("/conversations");

  const [statusFilter, setStatusFilter] =
    useState<ConversationListFilter>("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isPending, isFetching, refetch } =
    useConversationsQuery(agentId);

  const all = data ?? [];
  const searched = useMemo(
    () => all.filter((c) => matchesSearch(c, searchQuery)),
    [all, searchQuery],
  );
  const visible = useMemo(
    () => searched.filter((c) => matchesFilter(c, statusFilter)),
    [searched, statusFilter],
  );

  const open = all.filter((c) => c.status !== "resolved").length;
  const escalated = all.filter((c) => c.status === "escalated").length;
  const filterOptions = CONVERSATION_FILTERS.map((f) => ({
    ...f,
    count: searched.filter((c) => matchesFilter(c, f.value)).length,
  }));

  const handleExport = () => {
    const rows = [
      ["Navn", "E-post", "Status", "Sist melding"],
      ...visible.map((c) => [
        contactName(c.contact),
        c.contact.email ?? "",
        STATUS_META[c.status].label,
        c.lastMessage?.text ?? "",
      ]),
    ];
    const blob = new Blob(
      [rows.map((r) => r.map(csvCell).join(",")).join("\n")],
      { type: "text/csv;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `konversasjoner-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFilter = filterOptions.find((f) => f.value === statusFilter);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-3 overflow-hidden pl-2">
      {/* Top bar (reference: search pill over the list, round actions right) */}
      <div className="flex shrink-0 items-center gap-2.5">
        <div className="relative flex h-10 w-full items-center lg:w-[292px]">
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute left-3.5 size-4 text-(--agenci-ink-3)"
            strokeWidth={1.5}
            absoluteStrokeWidth
          />
          <input
            aria-label="Søk i samtaler"
            className="h-10 w-full rounded-full bg-white pr-11 pl-10 text-[13.5px] text-(--agenci-ink) shadow-[0_1px_2px_rgb(5_6_7/0.04),0_6px_18px_-10px_rgb(5_6_7/0.12)] outline-none transition-shadow duration-150 placeholder:text-(--agenci-ink-3) focus:shadow-[0_0_0_3px_rgb(36_50_54/0.08)] dark:bg-white/5"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Søk i ${activeFilter?.label.toLowerCase() ?? "samtaler"}…`}
            type="search"
            value={searchQuery}
          />
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Filtrer samtaler"
              className="absolute right-1.5 flex size-7 items-center justify-center rounded-full text-(--agenci-ink-2) outline-none transition-colors hover:bg-[#f3f5f4] hover:text-(--agenci-ink) data-[state=open]:bg-[#f3f5f4]"
            >
              <SlidersHorizontalIcon
                className="size-4"
                strokeWidth={1.5}
                absoluteStrokeWidth
              />
              {statusFilter !== "inbox" ? (
                <span
                  aria-hidden
                  className="absolute top-1 right-1 size-1.5 rounded-full bg-(--agenci-ink)"
                />
              ) : null}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-56 rounded-[14px] border-(--agenci-line) p-1.5 shadow-[0_12px_32px_-12px_rgb(5_6_7/0.25)]"
            >
              <DropdownMenuLabel className="flex items-baseline justify-between text-[12px] font-medium text-(--agenci-ink-3)">
                Vis samtaler
                <span className={dataTextClass}>
                  {open} åpne{escalated ? ` · ${escalated} eskalert` : ""}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(v as ConversationListFilter)
                }
              >
                {filterOptions.map((f) => (
                  <DropdownMenuRadioItem
                    key={f.value}
                    value={f.value}
                    className="rounded-[10px] text-[13.5px]"
                  >
                    <span className="flex-1">{f.label}</span>
                    <span
                      className={cn(
                        dataTextClass,
                        "text-[12px] text-(--agenci-ink-3)",
                      )}
                    >
                      {f.count}
                    </span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <DemoSwitch />
          <button
            aria-label="Oppdater"
            className={roundIconButton}
            onClick={() => void refetch()}
            title="Oppdater"
            type="button"
          >
            <RefreshCwIcon
              className={cn("size-4", isFetching && "animate-spin")}
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
          </button>
          <button
            aria-label="Last ned CSV"
            className={roundIconButton}
            onClick={handleExport}
            title="Last ned CSV"
            type="button"
          >
            <DownloadIcon
              className="size-4"
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
          </button>
          <Link
            to="/org/$orgSlug/agents/$agentId/integrations"
            params={{ orgSlug, agentId }}
            className="hidden h-10 items-center gap-1.5 rounded-full bg-(--agenci-ink) pr-4 pl-3.5 text-[13px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-(--agenci-accent-hover) active:scale-[0.985] sm:inline-flex dark:text-[#0b0c0e]"
          >
            <PlusIcon
              className="size-4"
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
            Sett opp widget
          </Link>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-3">
        <aside
          className={cn(
            "min-h-0 w-full shrink-0 flex-col lg:w-[292px]",
            isDetailOpen ? "hidden lg:flex" : "flex",
          )}
        >
          <ConversationsPanel
            conversations={visible}
            isLoading={isPending}
            statusFilter={statusFilter}
            hiddenCount={searched.length - visible.length}
            onShowAll={() => setStatusFilter("all")}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery("")}
          />
        </aside>

        <section
          className={cn(
            "min-h-0 min-w-0 flex-1 flex-col",
            isDetailOpen ? "flex" : "hidden lg:flex",
          )}
        >
          {children}
        </section>
      </div>
    </div>
  );
}
