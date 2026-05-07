"use client";

import { api } from "@workspace/backend/_generated/api";
import type { Doc } from "@workspace/backend/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  BookOpenIcon,
  BotIcon,
  LibraryBigIcon,
  Loader2Icon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  PaletteIcon,
  PencilLineIcon,
  PhoneForwardedIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DashboardAccentButton } from "@/modules/dashboard/ui/components/dashboard-accent";
import { DashboardPageShell } from "@/modules/dashboard/ui/components/dashboard-page-shell";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";

type AgentDoc = Doc<"agents">;

const BUILT_IN_TOOLS = [
  { name: "Søk i kunnskapsbase", detail: "Finner relevante svar fra innholdet du har lastet opp", icon: SearchIcon },
  { name: "Eskalering", detail: "Sender saken videre til et menneske med full historikk", icon: PhoneForwardedIcon },
  { name: "Avslutt samtale", detail: "Markerer saken som løst når kunden er ferdig", icon: MessageCircleIcon },
] as const;

function formatMutationError(err: unknown, fallback: string): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const o = err as { message?: string; data?: { message?: string } };
    const m = o.data?.message ?? o.message;
    if (typeof m === "string" && m.length > 0) return m;
  }
  return fallback;
}

function AgentAvatar({ isBuiltIn, size = "lg" }: { isBuiltIn: boolean; size?: "lg" | "sm" }) {
  return (
    <div
      className={cn(
        "shrink-0 grid place-items-center rounded-2xl",
        size === "lg" ? "size-14" : "size-10",
        isBuiltIn
          ? "bg-gradient-to-br from-teal-500/20 to-teal-600/10 ring-1 ring-teal-500/20 text-teal-600 dark:from-teal-500/15 dark:to-teal-600/5 dark:text-teal-400"
          : "bg-muted/60 ring-1 ring-border/60 text-muted-foreground",
      )}
    >
      <BotIcon className={size === "lg" ? "size-7" : "size-5"} strokeWidth={1.5} />
    </div>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={cn(
          "size-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600",
        )}
      />
      <span className={cn("text-[11px] font-medium", active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
        {active ? "Aktiv" : "Inaktiv"}
      </span>
    </span>
  );
}

export function AgentsView() {
  const agents = useQuery(api.private.agents.list);
  const subscription = useQuery(api.private.subscription.getOwn);
  const seedDefaults = useMutation(api.private.agents.seedDefaults);
  const createAgent = useMutation(api.private.agents.create);
  const updateAgent = useMutation(api.private.agents.update);
  const removeAgent = useMutation(api.private.agents.remove);

  const seedAttempted = useRef(false);
  useEffect(() => {
    if (agents === undefined) seedAttempted.current = false;
  }, [agents]);
  useEffect(() => {
    if (agents === undefined || agents === null || agents.length > 0 || seedAttempted.current) return;
    seedAttempted.current = true;
    void seedDefaults().catch((err) => {
      seedAttempted.current = false;
      toast.error(formatMutationError(err, "Kunne ikke opprette standard støtte-agent."));
    });
  }, [agents, seedDefaults]);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createBusy, setCreateBusy] = useState(false);

  const [editTarget, setEditTarget] = useState<AgentDoc | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editBusy, setEditBusy] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AgentDoc | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");

  const openEdit = useCallback((a: AgentDoc) => {
    setEditTarget(a);
    setEditName(a.name);
    setEditDescription(a.description ?? "");
    setEditActive(a.isActive);
  }, []);

  const onCreate = async () => {
    const n = createName.trim();
    if (!n) { toast.error("Skriv inn et navn."); return; }
    setCreateBusy(true);
    try {
      await createAgent({ name: n, description: createDescription.trim() || undefined });
      toast.success("Agent opprettet.");
      setCreateOpen(false);
      setCreateName("");
      setCreateDescription("");
    } catch (err) {
      toast.error(formatMutationError(err, "Kunne ikke opprette agent."));
    } finally {
      setCreateBusy(false);
    }
  };

  const onSaveEdit = async () => {
    if (!editTarget) return;
    const n = editName.trim();
    if (!n) { toast.error("Skriv inn et navn."); return; }
    setEditBusy(true);
    try {
      await updateAgent({ agentId: editTarget._id, name: n, description: editDescription.trim() || undefined, isActive: editActive });
      toast.success("Agent oppdatert.");
      setEditTarget(null);
    } catch (err) {
      toast.error(formatMutationError(err, "Kunne ikke oppdatere agent."));
    } finally {
      setEditBusy(false);
    }
  };

  const onConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await removeAgent({ agentId: deleteTarget._id });
      toast.success("Agent slettet.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(formatMutationError(err, "Kunne ikke slette agent."));
    } finally {
      setDeleteBusy(false);
    }
  };

  const filteredAgents = useMemo(() => {
    if (!agents) return [];
    const q = filterQuery.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(
      (a) => a.name.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q) || (a.description ?? "").toLowerCase().includes(q),
    );
  }, [agents, filterQuery]);

  const agentCount = agents?.length ?? 0;
  const maxAgents = subscription?.maxAgents ?? 1;
  const atLimit = agentCount >= maxAgents;

  return (
    <DashboardPageShell contentClassName="max-w-6xl">

      {/* ── Page header ── */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Organisasjon
          </p>
          <h1 className="text-[26px] font-bold tracking-[-0.03em] text-foreground leading-tight">
            Agenter
          </h1>
          <p className="text-[14px] text-muted-foreground max-w-lg leading-relaxed">
            AI-assistentene som svarer kundene dine. Innebygd støtte-agent er aktiv som standard.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {agents !== undefined && agents !== null && (
            <span className={cn(
              "text-[12px] font-medium tabular-nums",
              atLimit ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
            )}>
              {agentCount}/{maxAgents} agenter
            </span>
          )}
          {atLimit ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/billing"
                  className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 text-[13px] font-medium text-amber-700 transition-colors hover:bg-amber-500/15 dark:text-amber-400"
                >
                  <PlusIcon className="size-4" />
                  Oppgrader plan
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Du har nådd maks {maxAgents} agent{maxAgents === 1 ? "" : "er"} på din plan.
              </TooltipContent>
            </Tooltip>
          ) : (
            <DashboardAccentButton
              className="w-full sm:w-auto shrink-0 gap-2"
              onClick={() => setCreateOpen(true)}
              type="button"
            >
              <PlusIcon className="size-4" />
              Ny agent
            </DashboardAccentButton>
          )}
        </div>
      </div>

      {/* ── Loading ── */}
      {agents === undefined ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border/60 bg-card">
              <div className="h-1.5 w-full animate-pulse bg-muted/50" />
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="size-14 shrink-0 animate-pulse rounded-2xl bg-muted/50" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-5 w-36 animate-pulse rounded-lg bg-muted/50" />
                    <div className="h-3.5 w-20 animate-pulse rounded-lg bg-muted/50" />
                  </div>
                </div>
                <div className="h-20 w-full animate-pulse rounded-xl bg-muted/40" />
              </div>
            </div>
          ))}
        </div>
      ) : agents === null ? (
        <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-card py-16">
          <p className="text-[13px] text-muted-foreground">Velg organisasjon for å se agenter.</p>
        </div>
      ) : (
        <>
          {/* Search */}
          {agents.length > 0 && (
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <SearchIcon aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
                <Input
                  aria-label="Søk blant agenter"
                  className="h-9 rounded-xl pl-9 text-[13px] border-border/70"
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Søk navn eller beskrivelse…"
                  value={filterQuery}
                />
              </div>
              <p className="text-[12px] text-muted-foreground tabular-nums shrink-0">
                {filteredAgents.length} {agents.length === 1 ? "agent" : "agenter"}
              </p>
            </div>
          )}

          {/* No search results */}
          {filteredAgents.length === 0 && agents.length > 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-border/60 bg-card px-4 py-16 text-center">
              <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-border/50 bg-muted/30">
                <SearchIcon className="size-5 text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <p className="text-[14px] font-semibold text-foreground">Ingen treff</p>
              <p className="mt-1 text-[13px] text-muted-foreground">Prøv et annet søkeord.</p>
              <Button className="mt-4 rounded-xl" onClick={() => setFilterQuery("")} size="sm" variant="outline">
                Vis alle
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {filteredAgents.map((agent) => (
                <AgentDocCard key={agent._id} agent={agent} onDelete={setDeleteTarget} onEdit={openEdit} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Info banner ── */}
      <div className="mt-10 flex items-start gap-4 rounded-2xl border border-border/60 bg-muted/20 p-5">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-border/60 bg-card">
          <ZapIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground">Standard støtte-agent</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
            Widgeten bruker agenten med slug{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground/90">support</code>.
            {" "}Egendefinerte agenter kan bygges ut for spesifikke brukstilfeller.
          </p>
        </div>
      </div>

      {/* ── Create dialog ── */}
      <Dialog onOpenChange={setCreateOpen} open={createOpen}>
        <DialogContent className="dashboard-app-shell sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ny agent</DialogTitle>
            <DialogDescription>
              Opprett en egendefinert agent med unik slug.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Navn</Label>
              <Input id="agent-name" onChange={(e) => setCreateName(e.target.value)} placeholder="F.eks. Nybegynnerstøtte" value={createName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-desc">Beskrivelse <span className="text-muted-foreground font-normal">(valgfritt)</span></Label>
              <Textarea className="min-h-[88px] resize-y" id="agent-desc" onChange={(e) => setCreateDescription(e.target.value)} placeholder="Hva skal denne agenten brukes til?" value={createDescription} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setCreateOpen(false)} type="button" variant="outline">Avbryt</Button>
            <Button disabled={createBusy} onClick={() => void onCreate()} type="button">
              {createBusy ? <Loader2Icon className="size-4 animate-spin" /> : null}
              Opprett
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ── */}
      <Dialog onOpenChange={(open) => { if (!open) setEditTarget(null); }} open={editTarget !== null}>
        <DialogContent className="dashboard-app-shell sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rediger agent</DialogTitle>
            <DialogDescription>Oppdater navn, beskrivelse og status.</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4 py-1">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Navn</Label>
                <Input id="edit-name" onChange={(e) => setEditName(e.target.value)} value={editName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Beskrivelse</Label>
                <Textarea className="min-h-[88px] resize-y" id="edit-desc" onChange={(e) => setEditDescription(e.target.value)} value={editDescription} />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium">Aktiv</p>
                  <p className="text-[12px] text-muted-foreground">Inaktive agenter svarer ikke på nye henvendelser.</p>
                </div>
                <Switch checked={editActive} onCheckedChange={setEditActive} />
              </div>
              <p className="font-mono text-[11px] text-muted-foreground">slug: {editTarget.slug}</p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setEditTarget(null)} type="button" variant="outline">Avbryt</Button>
            <Button disabled={editBusy} onClick={() => void onSaveEdit()} type="button">
              {editBusy ? <Loader2Icon className="size-4 animate-spin" /> : null}
              Lagre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete dialog ── */}
      <AlertDialog onOpenChange={(o) => { if (!o) setDeleteTarget(null); }} open={deleteTarget !== null}>
        <AlertDialogContent className="dashboard-app-shell">
          <AlertDialogHeader>
            <AlertDialogTitle>Slette agent?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? `«${deleteTarget.name}» slettes permanent og kan ikke gjenopprettes.` : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBusy}
              onClick={(e) => { e.preventDefault(); void onConfirmDelete(); }}
            >
              {deleteBusy ? <Loader2Icon className="size-4 animate-spin" /> : "Slett"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardPageShell>
  );
}

function AgentDocCard({ agent, onEdit, onDelete }: { agent: AgentDoc; onEdit: (a: AgentDoc) => void; onDelete: (a: AgentDoc) => void; }) {
  return (
    <div className={cn(
      "group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-200",
      "hover:shadow-lg hover:-translate-y-px",
      agent.isBuiltIn
        ? "border-teal-200/60 dark:border-teal-900/40 shadow-[0_0_0_1px_rgba(20,184,166,0.08)]"
        : "border-border/60",
      !agent.isActive && "opacity-60",
    )}>

      {/* Top accent line */}
      <div className={cn(
        "h-[3px] w-full shrink-0",
        agent.isBuiltIn
          ? "bg-gradient-to-r from-teal-500/60 via-teal-400/40 to-transparent"
          : "bg-muted/60",
      )} />

      <div className="flex flex-1 flex-col p-6">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4 min-w-0">
            <AgentAvatar isBuiltIn={agent.isBuiltIn} />
            <div className="min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[15px] font-semibold tracking-tight text-foreground leading-snug">
                  {agent.name}
                </h2>
                {agent.isBuiltIn && (
                  <span className="rounded-full border border-teal-200/60 bg-teal-50/60 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:border-teal-800/40 dark:bg-teal-950/40 dark:text-teal-400">
                    Innebygd
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <StatusDot active={agent.isActive} />
                {agent.modelLabel && (
                  <span className="font-mono text-[11px] text-muted-foreground/70">{agent.modelLabel}</span>
                )}
              </div>
            </div>
          </div>

          {!agent.isBuiltIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="size-8 shrink-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" size="icon" type="button" variant="ghost">
                  <span className="sr-only">Handlinger</span>
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dashboard-app-shell w-40">
                <DropdownMenuItem className="gap-2" onClick={() => onEdit(agent)}>
                  <PencilLineIcon className="size-4" />
                  Rediger
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => onDelete(agent)}>
                  <Trash2Icon className="size-4" />
                  Slett
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Slug */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">Slug</span>
          <code className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-foreground/80">
            {agent.slug}
          </code>
        </div>

        {/* Description */}
        {agent.description && (
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {agent.description}
          </p>
        )}

        {/* Built-in tools */}
        {agent.isBuiltIn && (
          <div className="mt-5 flex flex-1 flex-col gap-4 border-t border-border/40 pt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
              Innebygde verktøy
            </p>
            <ul className="space-y-2">
              {BUILT_IN_TOOLS.map((t) => (
                <li key={t.name} className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-border/50 bg-background/80">
                    <t.icon className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12px] font-semibold text-foreground">{t.name}</span>
                    <span className="block text-[11px] text-muted-foreground leading-snug">{t.detail}</span>
                  </span>
                </li>
              ))}
            </ul>

            {/* Quick links */}
            <div className="mt-auto flex flex-wrap gap-2 pt-1">
              <Button asChild className="h-8 rounded-xl gap-1.5 text-[12px]" size="sm" variant="outline">
                <Link href="/files">
                  <LibraryBigIcon className="size-3.5" />
                  Kunnskapsbase
                </Link>
              </Button>
              <Button asChild className="h-8 rounded-xl gap-1.5 text-[12px]" size="sm" variant="outline">
                <Link href="/customization">
                  <PaletteIcon className="size-3.5" />
                  Tilpasning
                </Link>
              </Button>
              <Button asChild className="h-8 rounded-xl gap-1.5 text-[12px]" size="sm" variant="outline">
                <Link href="/conversations">
                  <MessageCircleIcon className="size-3.5" />
                  Samtaler
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Custom agent — edit shortcut */}
        {!agent.isBuiltIn && (
          <div className="mt-5 border-t border-border/40 pt-4">
            <Button
              className="h-8 w-full rounded-xl gap-2 text-[12px]"
              onClick={() => onEdit(agent)}
              size="sm"
              type="button"
              variant="outline"
            >
              <PencilLineIcon className="size-3.5" />
              Rediger agent
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
