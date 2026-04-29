"use client";

import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { format, formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";
import {
  ArrowRightIcon,
  BotIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  CreditCardIcon,
  InboxIcon,
  LibraryBigIcon,
  MessageCircleIcon,
  MicIcon,
  PaletteIcon,
  PlugIcon,
  PlusIcon,
  SearchIcon,
  AlertCircleIcon,
  CircleIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DashboardPageShell } from "@/modules/dashboard/ui/components/dashboard-page-shell";
import { ContactAvatar } from "@/modules/dashboard/ui/components/contact-avatar";
import { cn } from "@workspace/ui/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ConvStatus = "unresolved" | "escalated" | "resolved";

type ConvRow = {
  _id: string;
  _creationTime: number;
  status: ConvStatus;
  lastMessage: {
    _creationTime?: number;
    text?: string;
    message?: { role?: string };
  } | null;
  contactSession: { name: string; email: string };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "God morgen";
  if (h < 17) return "God ettermiddag";
  return "God kveld";
}

// ─── Stat card (referanse: store tall, ikon, trend-linje) ─────────────────────

function StatCard({
  label,
  description,
  value,
  capped,
  href,
  colorClass,
  icon: Icon,
}: {
  label: string;
  description: string;
  value: number | undefined;
  capped?: boolean;
  href: string;
  colorClass: string;
  icon: typeof InboxIcon;
}) {
  return (
    <Link href={href} className="group flex flex-col gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-px">
      {/* Header row */}
      <div className="flex items-start justify-between p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className={cn("flex size-10 items-center justify-center rounded-xl", colorClass)}>
            <Icon className="size-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground leading-tight">{label}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{description}</p>
          </div>
        </div>
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/30 mt-0.5 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground/60" strokeWidth={2.5} />
      </div>

      {/* Number */}
      <div className="px-5 pb-5">
        {value === undefined ? (
          <div className="mt-2 h-12 w-20 animate-pulse rounded-xl bg-muted/40" />
        ) : (
          <p className="text-[3.25rem] font-bold tabular-nums tracking-[-0.04em] text-foreground leading-none">
            {value}{capped ? "+" : ""}
          </p>
        )}
        {/* Thin accent line at bottom */}
        <div className={cn("mt-3 h-[3px] w-full rounded-full opacity-60", colorClass.split(" ")[0]?.replace("bg-", "bg-"))} />
      </div>
    </Link>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CFG = {
  unresolved: { label: "Åpen",     cls: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" },
  escalated:  { label: "Eskalert", cls: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400" },
  resolved:   { label: "Løst",     cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" },
} as const;

function StatusBadge({ status }: { status: ConvStatus }) {
  const { label, cls } = STATUS_CFG[status];
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide", cls)}>
      {label}
    </span>
  );
}

// ─── Conversation card (referanse: kunde-kort med CTA) ────────────────────────

function ConvCard({ conv }: { conv: ConvRow }) {
  const lastAt = conv.lastMessage?._creationTime ?? conv._creationTime;
  const preview = conv.lastMessage?.text;
  const role = conv.lastMessage?.message?.role;
  const displayName = conv.contactSession.name?.trim() || "Uten navn";
  const roleLabel = role === "user" ? "Kunde" : role === "assistant" ? "Agenci" : null;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-px">
      {/* Card header */}
      <div className="flex items-start gap-3 p-5 pb-4">
        <ContactAvatar name={displayName} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-foreground leading-tight">{displayName}</p>
              <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{conv.contactSession.email}</p>
            </div>
            <StatusBadge status={conv.status} />
          </div>
        </div>
      </div>

      {/* Message preview */}
      <div className="mx-5 mb-4 rounded-xl border border-border/50 bg-muted/30 p-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {roleLabel ? `Siste melding — ${roleLabel}` : "Siste melding"}
          </p>
          <span className="text-[10px] tabular-nums text-muted-foreground/60" suppressHydrationWarning>
            {formatDistanceToNow(lastAt, { addSuffix: true })}
          </span>
        </div>
        <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
          {preview ?? "Ingen melding ennå."}
        </p>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 mt-auto">
        <Link
          href={`/conversations/${conv._id}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-[12px] font-semibold text-background transition-colors hover:bg-foreground/85"
        >
          Se samtale
          <ArrowRightIcon className="size-3.5" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}

function ConvCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="flex items-start gap-3 p-5 pb-4">
        <div className="size-11 shrink-0 animate-pulse rounded-full bg-muted/50" />
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <div className="h-4 w-32 animate-pulse rounded-lg bg-muted/50" />
          <div className="h-3 w-44 animate-pulse rounded-lg bg-muted/50" />
        </div>
      </div>
      <div className="mx-5 mb-4 h-16 animate-pulse rounded-xl bg-muted/30" />
      <div className="px-5 pb-5">
        <div className="h-10 w-full animate-pulse rounded-xl bg-muted/40" />
      </div>
    </div>
  );
}

// ─── Right panel: Knowledge sources ───────────────────────────────────────────

function KnowledgePanel({
  overview,
}: {
  overview: { knowledge: { count: number; hasMore: boolean; approxIndexedKb: number; lastIndexedAt: number | null } } | null | undefined;
}) {
  const kb = overview?.knowledge;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div>
          <h3 className="text-[13px] font-semibold text-foreground">Kunnskapsbase</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Indekserte datakilder for AI-agenten</p>
        </div>
        <Link
          href="/files"
          className="flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background transition-colors hover:bg-foreground/85"
        >
          <PlusIcon className="size-3" strokeWidth={2.5} />
          Legg til
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 divide-x divide-border/60 border-b border-border/60">
        <div className="flex flex-col items-center py-4">
          {kb === undefined ? (
            <div className="h-8 w-10 animate-pulse rounded-lg bg-muted/40" />
          ) : (
            <p className="text-[2rem] font-bold tabular-nums tracking-tight text-foreground leading-none">
              {kb.count}{kb.hasMore ? "+" : ""}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">Kilder</p>
        </div>
        <div className="flex flex-col items-center py-4">
          {kb === undefined ? (
            <div className="h-8 w-14 animate-pulse rounded-lg bg-muted/40" />
          ) : (
            <p className="text-[2rem] font-bold tabular-nums tracking-tight text-foreground leading-none">
              {kb.approxIndexedKb > 0 ? `${kb.approxIndexedKb}` : "0"}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">KB indeksert</p>
        </div>
      </div>

      {/* Last indexed */}
      <div className="px-5 py-4">
        <p className="text-[11px] font-medium text-muted-foreground">Sist oppdatert</p>
        <p className="mt-1 text-[12px] font-semibold text-foreground" suppressHydrationWarning>
          {kb?.lastIndexedAt
            ? formatDistanceToNow(kb.lastIndexedAt, { addSuffix: true })
            : kb?.count === 0
              ? "Ingen kilder ennå"
              : "—"}
        </p>
      </div>

      {/* Progress bar: sources indexed */}
      {(kb?.count ?? 0) > 0 && (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Kilde-status</p>
            <p className="text-[10px] text-muted-foreground">Alle klar</p>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
            <div className="h-full w-full rounded-full bg-emerald-500" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Right panel: Setup checklist ─────────────────────────────────────────────

function SetupPanel({
  overview,
}: {
  overview: { hasWidgetSettings: boolean; vapiConnected: boolean; knowledge: { count: number } } | null | undefined;
}) {
  const items = [
    {
      label: "Kunnskapskilder lagt til",
      detail: "Last opp filer eller nettsider",
      ok: (overview?.knowledge.count ?? 0) > 0,
      href: "/files",
    },
    {
      label: "Widget konfigurert",
      detail: "Tilpass utseende og tekster",
      ok: overview?.hasWidgetSettings ?? false,
      href: "/customization",
    },
    {
      label: "Stemmeassistent koblet",
      detail: "Koble til Vapi for tale-støtte",
      ok: overview?.vapiConnected ?? false,
      href: "/plugins/vapi",
    },
  ];

  const done = items.filter((i) => i.ok).length;
  const pct = Math.round((done / items.length) * 100);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      {/* Header */}
      <div className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-foreground">Oppsett</h3>
          <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
            {done}/{items.length} fullført
          </span>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-border/40">
        {items.map(({ label, detail, ok, href }) => (
          <Link
            key={label}
            href={href}
            className="group flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/20"
          >
            <div className="mt-0.5 shrink-0">
              {ok ? (
                <CheckCircle2Icon className="size-4 text-emerald-500" strokeWidth={2} />
              ) : (
                <CircleIcon className="size-4 text-border" strokeWidth={2} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn("text-[13px] font-medium leading-tight", ok ? "text-muted-foreground line-through decoration-muted-foreground/50" : "text-foreground")}>
                {label}
              </p>
              {!ok && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">{detail}</p>
              )}
            </div>
            {!ok && (
              <ArrowRightIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground/70" strokeWidth={2.5} />
            )}
          </Link>
        ))}
      </div>

      {/* Shortcuts */}
      <div className="border-t border-border/60 px-5 py-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Snarveier</p>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/customization", label: "Widget", icon: PaletteIcon },
            { href: "/integrations", label: "Integrer", icon: PlugIcon },
            { href: "/agents", label: "Agenter", icon: BotIcon },
            { href: "/billing", label: "Faktura", icon: CreditCardIcon },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <Icon className="size-3" strokeWidth={1.75} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function DashboardOverviewView() {
  const { organization } = useOrganization();
  const overview = useQuery(api.private.dashboard.getOverview);
  const [search, setSearch] = useState("");

  const convs = usePaginatedQuery(
    api.private.conversations.getMany,
    { status: "all" },
    { initialNumItems: 6 },
  );

  const filtered = (convs.results as ConvRow[]).filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = c.contactSession.name?.toLowerCase() ?? "";
    const email = c.contactSession.email?.toLowerCase() ?? "";
    return name.includes(q) || email.includes(q);
  });

  const total = convs.results.length;
  const isLoading = convs.status === "LoadingFirstPage";

  return (
    <DashboardPageShell>
      <div className="w-full space-y-6">

        {/* ── Greeting ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70" suppressHydrationWarning>
              {format(new Date(), "EEEE d. MMMM yyyy", { locale: nb })}
            </p>
            <h1 className="mt-1 text-[26px] font-bold tracking-[-0.03em] text-foreground" suppressHydrationWarning>
              {getGreeting()},{" "}
              <span className="text-foreground/70">{organization?.name ?? "…"}</span>
            </h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Oversikt over kundeservicen din akkurat nå.
            </p>
          </div>
          <Link
            href="/conversations"
            className="hidden shrink-0 items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-[13px] font-semibold text-background shadow-sm transition-colors hover:bg-foreground/85 sm:flex"
          >
            <InboxIcon className="size-4" strokeWidth={1.75} />
            Åpne innboks
          </Link>
        </div>

        {/* ── Stat row ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Åpne samtaler"
            description="Henvendelser som venter på svar"
            value={overview?.conversations.unresolved.count}
            capped={overview?.conversations.unresolved.capped}
            href="/conversations"
            colorClass="bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            icon={InboxIcon}
          />
          <StatCard
            label="Eskalerte saker"
            description="Trenger menneskelig oppfølging"
            value={overview?.conversations.escalated.count}
            capped={overview?.conversations.escalated.capped}
            href="/conversations"
            colorClass="bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
            icon={MessageCircleIcon}
          />
          <StatCard
            label="Løste samtaler"
            description="Avsluttet og besvart totalt"
            value={overview?.conversations.resolved.count}
            capped={overview?.conversations.resolved.capped}
            href="/conversations"
            colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
            icon={CheckCircle2Icon}
          />
        </div>

        {/* ── Content row ── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

          {/* Left: conversations */}
          <div className="flex flex-col gap-4">

            {/* Panel header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-bold tracking-tight text-foreground">Dine samtaler</h2>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Alle innkommende kundehenvendelser
                </p>
              </div>
              <Link
                href="/conversations"
                className="group flex items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Se alle
                <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </Link>
            </div>

            {/* Search row */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-xs">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
                <input
                  type="search"
                  placeholder="Søk navn eller e-post…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-full rounded-xl border border-border/60 bg-card pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10 transition-colors"
                />
              </div>
              <span className="shrink-0 text-[12px] font-medium text-muted-foreground">
                {total} samtaler
              </span>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => <ConvCardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 py-20 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
                  <InboxIcon className="size-7 text-muted-foreground/40" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-foreground">
                    {search.trim() ? "Ingen treff" : "Ingen samtaler ennå"}
                  </p>
                  <p className="mt-1 max-w-[280px] text-[13px] leading-relaxed text-muted-foreground">
                    {search.trim()
                      ? "Prøv et annet søk."
                      : "Når kunder starter en chat på nettsiden din, vises de her."}
                  </p>
                </div>
                {!search.trim() && (
                  <Link
                    href="/integrations"
                    className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-[13px] font-semibold text-background transition-colors hover:bg-foreground/85"
                  >
                    <PlugIcon className="size-4" strokeWidth={1.75} />
                    Sett opp widget
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((conv) => (
                  <ConvCard key={conv._id} conv={conv} />
                ))}
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-4">
            <KnowledgePanel overview={overview} />
            <SetupPanel overview={overview} />
          </div>
        </div>
      </div>
    </DashboardPageShell>
  );
}
