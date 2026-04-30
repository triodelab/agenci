"use client";

import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import {
  ArrowRightIcon,
  BotIcon,
  CheckIcon,
  CreditCardIcon,
  InboxIcon,
  LibraryBigIcon,
  Loader2Icon,
  PaletteIcon,
  PencilIcon,
  PlugIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { DashboardPageShell } from "@/modules/dashboard/ui/components/dashboard-page-shell";
import { ContactAvatar } from "@/modules/dashboard/ui/components/contact-avatar";
import { formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";

function formatMutationError(err: unknown, fallback: string): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const o = err as { message?: string; data?: { message?: string } };
    const m = o.data?.message ?? o.message;
    if (typeof m === "string" && m.length > 0) return m;
  }
  return fallback;
}

// ─── Status config ─────────────────────────────────────────────────────────

const STATUS_CFG = {
  unresolved: { label: "Åpen",     dot: "bg-amber-400" },
  escalated:  { label: "Eskalert", dot: "bg-rose-500"  },
  resolved:   { label: "Løst",     dot: "bg-emerald-500" },
} as const;

// ─── Stat number block ─────────────────────────────────────────────────────

function Stat({
  label,
  value,
  accent,
  href,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
  href?: string;
}) {
  const inner = (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-medium text-muted-foreground/70">{label}</p>
      <p className={cn(
        "text-[2.25rem] font-semibold leading-none tracking-tight tabular-nums",
        accent ? "text-rose-500" : "text-foreground",
      )}>
        {value}
      </p>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-70">
        {inner}
      </Link>
    );
  }
  return inner;
}

// ─── Main view ─────────────────────────────────────────────────────────────

export function AgentOverviewView({ agentId }: { agentId: Id<"agents"> }) {
  const agent        = useQuery(api.private.agents.getOne, { agentId });
  const overview     = useQuery(api.private.dashboard.getAgentOverview, { agentId });
  const widgetSettings = useQuery(
    api.public.widgetSettings.getByOrganizationId,
    agent?.organizationId ? { organizationId: agent.organizationId } : "skip",
  );
  const updateAgent  = useMutation(api.private.agents.update);
  const recentConvs  = usePaginatedQuery(
    api.private.conversations.getMany,
    { agentId, status: "all" },
    { initialNumItems: 8 },
  );

  const [editOpen, setEditOpen]               = useState(false);
  const [editName, setEditName]               = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editActive, setEditActive]           = useState(true);
  const [editBusy, setEditBusy]               = useState(false);

  const openEdit = useCallback(() => {
    if (!agent) return;
    setEditName(agent.name);
    setEditDescription(agent.description ?? "");
    setEditActive(agent.isActive);
    setEditOpen(true);
  }, [agent]);

  const onSaveEdit = async () => {
    if (!agent) return;
    const n = editName.trim();
    if (!n) { toast.error("Skriv inn et navn."); return; }
    setEditBusy(true);
    try {
      await updateAgent({
        agentId: agent._id,
        name: agent.isBuiltIn ? undefined : n,
        description: editDescription.trim() || undefined,
        isActive: editActive,
      });
      toast.success("Agent oppdatert.");
      setEditOpen(false);
    } catch (err) {
      toast.error(formatMutationError(err, "Kunne ikke oppdatere agent."));
    } finally {
      setEditBusy(false);
    }
  };

  // ── Skeleton ────────────────────────────────────────────────────────────
  if (agent === undefined || overview === undefined) {
    return (
      <DashboardPageShell>
        <div className="space-y-10">
          <div className="space-y-3">
            <div className="h-7 w-40 animate-pulse rounded-lg bg-muted/50" />
            <div className="h-4 w-64 animate-pulse rounded-lg bg-muted/40" />
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60 sm:grid-cols-4">
            {[0,1,2,3].map((i) => <div key={i} className="h-24 animate-pulse bg-muted/30" />)}
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            <div className="h-80 animate-pulse rounded-xl bg-muted/30" />
            <div className="space-y-4">
              <div className="h-48 animate-pulse rounded-xl bg-muted/30" />
              <div className="h-32 animate-pulse rounded-xl bg-muted/30" />
            </div>
          </div>
        </div>
      </DashboardPageShell>
    );
  }

  if (agent === null) {
    return (
      <DashboardPageShell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BotIcon className="mb-4 size-10 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="text-[15px] font-medium text-foreground">Agent ikke funnet</p>
          <Button asChild className="mt-4 rounded-lg" size="sm" variant="outline">
            <Link href="/agents">← Alle agenter</Link>
          </Button>
        </div>
      </DashboardPageShell>
    );
  }

  const openCount      = (overview?.conversations.unresolved ?? 0) + (overview?.conversations.escalated ?? 0);
  const escalatedCount = overview?.conversations.escalated ?? 0;
  const resolvedCount  = overview?.conversations.resolved ?? 0;
  const totalCount     = overview?.conversations.total ?? 0;

  const setupItems = [
    {
      label: "Kunnskapskilder",
      detail: "Last opp filer eller nettsider",
      ok: (overview?.fileCount ?? 0) > 0,
      href: `/agents/${agentId}/files`,
    },
    {
      label: "Widget konfigurert",
      detail: "Tilpass utseende og tekster",
      ok: !!widgetSettings,
      href: `/agents/${agentId}/customization`,
    },
    {
      label: "Integrasjon satt opp",
      detail: "Legg widget-koden på nettsiden",
      ok: false,
      href: `/agents/${agentId}/integrations`,
    },
  ];
  const setupDone = setupItems.filter((i) => i.ok).length;

  return (
    <DashboardPageShell>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-muted/40 text-muted-foreground">
            <BotIcon className="size-5" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[20px] font-semibold tracking-tight text-foreground">
                {agent.name}
              </h1>
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                agent.isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-border/60 bg-muted/30 text-muted-foreground",
              )}>
                <span className={cn("size-1.5 rounded-full", agent.isActive ? "bg-emerald-500" : "bg-zinc-400")} />
                {agent.isActive ? "Aktiv" : "Inaktiv"}
              </span>
            </div>
            {agent.description ? (
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {agent.description}
              </p>
            ) : (
              <p className="mt-1 text-[13px] italic text-muted-foreground/40">
                Ingen beskrivelse
              </p>
            )}
          </div>
        </div>
        <Button
          className="shrink-0 gap-1.5 rounded-lg"
          onClick={openEdit}
          size="sm"
          type="button"
          variant="outline"
        >
          <PencilIcon className="size-3.5" />
          Rediger
        </Button>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      {/* Inspired by Vercel's analytics / Linear's metrics row */}
      <div className="mb-10 grid grid-cols-2 overflow-hidden rounded-xl border border-border/60 sm:grid-cols-4">
        {[
          { label: "Åpne samtaler",   value: openCount,      accent: false, href: `/agents/${agentId}/conversations` },
          { label: "Eskalerte",       value: escalatedCount, accent: escalatedCount > 0, href: `/agents/${agentId}/conversations` },
          { label: "Løste",           value: resolvedCount,  accent: false, href: `/agents/${agentId}/conversations` },
          { label: "Kunnskapskilder", value: overview?.fileCount ?? 0, accent: false, href: `/agents/${agentId}/files` },
        ].map((s, i, arr) => (
          <div
            key={s.label}
            className={cn(
              "bg-card px-5 py-5",
              i < arr.length - 1 && "border-r border-border/60",
              // second row on mobile
              i >= 2 && "border-t border-border/60 sm:border-t-0",
            )}
          >
            <Stat {...s} />
          </div>
        ))}
      </div>

      {/* ── Two-column grid ─────────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-[1fr_268px]">

        {/* Left: conversations */}
        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-foreground">Siste samtaler</h2>
            <Link
              href={`/agents/${agentId}/conversations`}
              className="group flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Se alle
              <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
            </Link>
          </div>

          {recentConvs.status === "LoadingFirstPage" ? (
            <div className="space-y-px overflow-hidden rounded-xl border border-border/60">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-[62px] animate-pulse bg-muted/30" />
              ))}
            </div>
          ) : recentConvs.results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 py-16 text-center">
              <InboxIcon className="size-8 text-muted-foreground/25" strokeWidth={1.5} />
              <div>
                <p className="text-[13px] font-medium text-foreground">Ingen samtaler ennå</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Samtaler fra widget-en vises her.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/60">
              {recentConvs.results.map((conv, idx) => {
                const status  = conv.status as keyof typeof STATUS_CFG;
                const cfg     = STATUS_CFG[status] ?? STATUS_CFG.unresolved;
                const name    = conv.contactSession?.name?.trim() || "Uten navn";
                const lastAt  = conv.lastMessage?._creationTime ?? conv._creationTime;
                const preview = conv.lastMessage?.text;

                return (
                  <Link
                    key={conv._id}
                    href={`/agents/${agentId}/conversations/${conv._id}`}
                    className={cn(
                      "group flex min-w-0 items-center gap-3 bg-card px-4 py-3.5 transition-colors hover:bg-muted/30",
                      idx > 0 && "border-t border-border/50",
                    )}
                  >
                    {/* status dot */}
                    <span className={cn("size-1.5 shrink-0 rounded-full", cfg.dot)} />

                    <ContactAvatar name={name} size={30} className="shrink-0" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-foreground">{name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {preview ?? "Ingen melding"}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[10px] tabular-nums text-muted-foreground/50" suppressHydrationWarning>
                        {formatDistanceToNow(lastAt, { addSuffix: false, locale: nb })}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground/50">{cfg.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: sidebar */}
        <div className="flex flex-col gap-5">

          {/* Setup checklist — inspired by GitHub repo setup steps */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
            <div className="border-b border-border/50 px-4 py-3.5">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-foreground">Kom i gang</p>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {setupDone} / {setupItems.length}
                </span>
              </div>
              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className="h-full rounded-full bg-foreground/80 transition-all duration-700"
                  style={{ width: `${Math.round((setupDone / setupItems.length) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              {setupItems.map(({ label, detail, ok, href }, i) => (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/20",
                    i > 0 && "border-t border-border/40",
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {ok ? (
                      <div className="flex size-4 items-center justify-center rounded-full bg-foreground">
                        <CheckIcon className="size-2.5 text-background" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="size-4 rounded-full border-2 border-border/60 bg-transparent" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      "text-[12px] font-medium",
                      ok ? "text-muted-foreground line-through decoration-muted-foreground/40" : "text-foreground",
                    )}>
                      {label}
                    </p>
                    {!ok && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{detail}</p>
                    )}
                  </div>
                  {!ok && (
                    <ArrowRightIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/20 transition-colors group-hover:text-muted-foreground/60" strokeWidth={2.5} />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Summary numbers */}
          {totalCount > 0 && (
            <div className="rounded-xl border border-border/60 bg-card px-4 py-4">
              <p className="mb-3 text-[11px] font-semibold text-muted-foreground">Sammendrag</p>
              <div className="divide-y divide-border/40">
                {[
                  { label: "Totalt",          value: totalCount },
                  { label: "Løsningsgrad",    value: totalCount > 0 ? `${Math.round((resolvedCount / totalCount) * 100)}%` : "—" },
                  { label: "Åpne / eskalert", value: `${openCount} / ${escalatedCount}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2 py-2">
                    <span className="text-[12px] text-muted-foreground">{label}</span>
                    <span className="text-[13px] font-semibold tabular-nums text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="rounded-xl border border-border/60 bg-card px-4 py-4">
            <p className="mb-3 text-[11px] font-semibold text-muted-foreground">Hurtigtilgang</p>
            <div className="space-y-1">
              {[
                { href: `/agents/${agentId}/customization`, label: "Widget-tilpasning", icon: PaletteIcon    },
                { href: `/agents/${agentId}/integrations`,  label: "Integrasjoner",     icon: PlugIcon       },
                { href: `/agents/${agentId}/files`,         label: "Kunnskapsbase",     icon: LibraryBigIcon },
                { href: `/agents/${agentId}/billing`,       label: "Plan og faktura",   icon: CreditCardIcon },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                >
                  <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                  {label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Edit dialog ─────────────────────────────────────────────────── */}
      <Dialog onOpenChange={(open) => { if (!open) setEditOpen(false); }} open={editOpen}>
        <DialogContent className="dashboard-app-shell sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rediger agent</DialogTitle>
            <DialogDescription>Oppdater navn, beskrivelse og status.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            {!agent.isBuiltIn && (
              <div className="space-y-2">
                <Label htmlFor="edit-name">Navn</Label>
                <Input
                  id="edit-name"
                  onChange={(e) => setEditName(e.target.value)}
                  value={editName}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Beskrivelse</Label>
              <Textarea
                className="min-h-[80px] resize-y"
                id="edit-desc"
                onChange={(e) => setEditDescription(e.target.value)}
                value={editDescription}
              />
            </div>
            {!agent.isBuiltIn && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium">Aktiv</p>
                  <p className="text-[12px] text-muted-foreground">
                    Inaktive agenter svarer ikke på nye henvendelser.
                  </p>
                </div>
                <Switch checked={editActive} onCheckedChange={setEditActive} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setEditOpen(false)} type="button" variant="outline">
              Avbryt
            </Button>
            <Button disabled={editBusy} onClick={() => void onSaveEdit()} type="button">
              {editBusy ? <Loader2Icon className="size-4 animate-spin" /> : null}
              Lagre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardPageShell>
  );
}
