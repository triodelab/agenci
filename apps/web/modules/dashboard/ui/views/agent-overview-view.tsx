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
  BookOpenIcon,
  BotIcon,
  CheckCircle2Icon,
  CircleIcon,
  CreditCardIcon,
  InboxIcon,
  LibraryBigIcon,
  Loader2Icon,
  MessageCircleIcon,
  PaletteIcon,
  PencilLineIcon,
  PlugIcon,
  AlertCircleIcon,
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

function StatBlock({
  label,
  value,
  sublabel,
  colorClass,
  href,
}: {
  label: string;
  value: number | string;
  sublabel?: string;
  colorClass?: string;
  href?: string;
}) {
  const inner = (
    <div className={cn(
      "flex flex-col gap-1 rounded-2xl border border-border/60 bg-card p-5 transition-all",
      href && "hover:shadow-md hover:-translate-y-px cursor-pointer"
    )}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className={cn(
        "text-[2.5rem] font-bold tracking-tight leading-none tabular-nums",
        colorClass ?? "text-foreground"
      )}>
        {value}
      </p>
      {sublabel && (
        <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>
      )}
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

const STATUS_CFG = {
  unresolved: { label: "Åpen",     cls: "bg-amber-100 text-amber-700" },
  escalated:  { label: "Eskalert", cls: "bg-red-100 text-red-700" },
  resolved:   { label: "Løst",     cls: "bg-emerald-100 text-emerald-700" },
} as const;

export function AgentOverviewView({ agentId }: { agentId: Id<"agents"> }) {
  const agent = useQuery(api.private.agents.getOne, { agentId });
  const overview = useQuery(api.private.dashboard.getAgentOverview, { agentId });
  const widgetSettings = useQuery(api.public.widgetSettings.getByOrganizationId,
    agent?.organizationId ? { organizationId: agent.organizationId } : "skip"
  );
  const updateAgent = useMutation(api.private.agents.update);

  const recentConvs = usePaginatedQuery(
    api.private.conversations.getMany,
    { agentId, status: "all" },
    { initialNumItems: 5 },
  );

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editBusy, setEditBusy] = useState(false);

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

  if (agent === undefined || overview === undefined) {
    return (
      <DashboardPageShell contentClassName="max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="size-14 animate-pulse rounded-2xl bg-muted/50" />
            <div className="space-y-2 pt-1 flex-1">
              <div className="h-6 w-48 animate-pulse rounded-lg bg-muted/50" />
              <div className="h-4 w-32 animate-pulse rounded-lg bg-muted/40" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/40" />
            ))}
          </div>
        </div>
      </DashboardPageShell>
    );
  }

  if (agent === null) {
    return (
      <DashboardPageShell contentClassName="max-w-4xl">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BotIcon className="size-12 text-muted-foreground/30 mb-4" strokeWidth={1} />
          <p className="text-[14px] font-semibold text-foreground">Agent ikke funnet</p>
          <Button asChild className="mt-4 rounded-xl" size="sm" variant="outline">
            <Link href="/agents">← Alle agenter</Link>
          </Button>
        </div>
      </DashboardPageShell>
    );
  }

  const openCount = (overview?.conversations.unresolved ?? 0) + (overview?.conversations.escalated ?? 0);
  const escalatedCount = overview?.conversations.escalated ?? 0;
  const resolvedCount = overview?.conversations.resolved ?? 0;

  const setupItems = [
    {
      label: "Kunnskapskilder lagt til",
      detail: "Last opp filer eller nettsider",
      ok: (overview?.fileCount ?? 0) > 0,
      href: `/agents/${agentId}/files`,
      icon: LibraryBigIcon,
    },
    {
      label: "Widget konfigurert",
      detail: "Tilpass utseende og tekster",
      ok: !!widgetSettings,
      href: `/agents/${agentId}/customization`,
      icon: PaletteIcon,
    },
    {
      label: "Integrasjon satt opp",
      detail: "Legg widget-koden på nettsiden",
      ok: false,
      href: `/agents/${agentId}/integrations`,
      icon: PlugIcon,
    },
  ];
  const setupDone = setupItems.filter((i) => i.ok).length;

  return (
    <DashboardPageShell contentClassName="max-w-4xl">

      {/* Agent header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-border/60 bg-muted/40 text-muted-foreground">
            <BotIcon className="size-7" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 pt-1">
            <h1 className="text-[22px] font-bold tracking-tight text-foreground leading-snug">
              {agent.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className={cn("size-1.5 rounded-full", agent.isActive ? "bg-emerald-500" : "bg-zinc-400")} />
                <span className={cn("text-[12px] font-medium", agent.isActive ? "text-emerald-600" : "text-muted-foreground")}>
                  {agent.isActive ? "Aktiv" : "Inaktiv"}
                </span>
              </span>
              <span className="font-mono text-[11px] text-muted-foreground/60">slug: {agent.slug}</span>
            </div>
            {agent.description && (
              <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed max-w-md">
                {agent.description}
              </p>
            )}
          </div>
        </div>
        <Button
          className="shrink-0 gap-2 rounded-xl w-full sm:w-auto"
          onClick={openEdit}
          size="sm"
          type="button"
          variant="outline"
        >
          <PencilLineIcon className="size-3.5" />
          Rediger
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <StatBlock
          label="Åpne samtaler"
          value={openCount}
          sublabel={openCount > 0 ? "Venter på svar" : "Ingen åpne"}
          colorClass="text-amber-600"
          href={`/agents/${agentId}/conversations`}
        />
        <StatBlock
          label="Eskalerte"
          value={escalatedCount}
          sublabel={escalatedCount > 0 ? "Trenger oppfølging" : "Ingen eskalert"}
          colorClass={escalatedCount > 0 ? "text-red-600" : "text-foreground"}
          href={`/agents/${agentId}/conversations`}
        />
        <StatBlock
          label="Løste samtaler"
          value={resolvedCount}
          sublabel="Totalt avsluttet"
          colorClass="text-emerald-600"
          href={`/agents/${agentId}/conversations`}
        />
        <StatBlock
          label="Kunnskapskilder"
          value={overview?.fileCount ?? 0}
          sublabel={overview?.lastIndexedAt ? "Indeks klar" : "Ingen filer ennå"}
          href={`/agents/${agentId}/files`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

        {/* Siste samtaler */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-foreground">Siste samtaler</h2>
            <Link
              href={`/agents/${agentId}/conversations`}
              className="group flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Se alle
              <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
            </Link>
          </div>

          {recentConvs.status === "LoadingFirstPage" ? (
            <div className="space-y-2">
              {[1,2,3].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/40" />)}
            </div>
          ) : recentConvs.results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 py-16 text-center">
              <InboxIcon className="size-8 text-muted-foreground/30" strokeWidth={1.5} />
              <div>
                <p className="text-[14px] font-semibold text-foreground">Ingen samtaler ennå</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Samtaler fra widget-en vises her.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {recentConvs.results.map((conv) => {
                const status = conv.status as keyof typeof STATUS_CFG;
                const cfg = STATUS_CFG[status] ?? STATUS_CFG.unresolved;
                const displayName = conv.contactSession?.name?.trim() || "Uten navn";
                const lastAt = conv.lastMessage?._creationTime ?? conv._creationTime;
                const preview = conv.lastMessage?.text;
                return (
                  <Link
                    key={conv._id}
                    href={`/agents/${agentId}/conversations/${conv._id}`}
                    className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 transition-all hover:shadow-md hover:-translate-y-px"
                  >
                    <ContactAvatar name={displayName} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-foreground truncate">{displayName}</p>
                        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", cfg.cls)}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {preview ?? "Ingen melding ennå"}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground/50" suppressHydrationWarning>
                      {formatDistanceToNow(lastAt, { addSuffix: true, locale: nb })}
                    </span>
                    <ArrowRightIcon className="size-3.5 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" strokeWidth={2.5} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Høyre: oppsett + snarveier */}
        <div className="flex flex-col gap-4">

          {/* Setup checklist */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="border-b border-border/60 px-4 py-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-foreground">Oppsett</h3>
                <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                  {setupDone}/{setupItems.length}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${Math.round((setupDone / setupItems.length) * 100)}%` }}
                />
              </div>
            </div>
            <div className="divide-y divide-border/40">
              {setupItems.map(({ label, detail, ok, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/20"
                >
                  <div className="mt-0.5 shrink-0">
                    {ok
                      ? <CheckCircle2Icon className="size-4 text-emerald-500" strokeWidth={2} />
                      : <CircleIcon className="size-4 text-border" strokeWidth={2} />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-[12px] font-medium leading-tight", ok ? "text-muted-foreground line-through" : "text-foreground")}>
                      {label}
                    </p>
                    {!ok && <p className="mt-0.5 text-[11px] text-muted-foreground">{detail}</p>}
                  </div>
                  {!ok && <ArrowRightIcon className="mt-0.5 size-3 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors" strokeWidth={2.5} />}
                </Link>
              ))}
            </div>
          </div>

          {/* Snarveier */}
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Snarveier</p>
            <div className="flex flex-col gap-1.5">
              {[
                { href: `/agents/${agentId}/customization`, label: "Widget", icon: PaletteIcon },
                { href: `/agents/${agentId}/integrations`, label: "Integrer", icon: PlugIcon },
                { href: `/agents/${agentId}/files`, label: "Kunnskapsbase", icon: LibraryBigIcon },
                { href: `/agents/${agentId}/billing`, label: "Faktura", icon: CreditCardIcon },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                >
                  <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                  {label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Edit dialog */}
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
                <Input id="edit-name" onChange={(e) => setEditName(e.target.value)} value={editName} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Beskrivelse</Label>
              <Textarea className="min-h-[80px] resize-y" id="edit-desc" onChange={(e) => setEditDescription(e.target.value)} value={editDescription} />
            </div>
            {!agent.isBuiltIn && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium">Aktiv</p>
                  <p className="text-[12px] text-muted-foreground">Inaktive agenter svarer ikke på nye henvendelser.</p>
                </div>
                <Switch checked={editActive} onCheckedChange={setEditActive} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setEditOpen(false)} type="button" variant="outline">Avbryt</Button>
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
