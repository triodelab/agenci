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
import { useMutation, useQuery } from "convex/react";
import {
  BookOpenIcon,
  BotIcon,
  InboxIcon,
  LibraryBigIcon,
  Loader2Icon,
  MessageCircleIcon,
  PencilLineIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { DashboardPageShell } from "@/modules/dashboard/ui/components/dashboard-page-shell";

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
}: {
  label: string;
  value: number | string;
  sublabel?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="text-[28px] font-bold tracking-tight text-foreground leading-none tabular-nums">
        {value}
      </p>
      {sublabel && (
        <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>
      )}
    </div>
  );
}

export function AgentOverviewView({ agentId }: { agentId: Id<"agents"> }) {
  const agent = useQuery(api.private.agents.getOne, { agentId });
  const overview = useQuery(api.private.dashboard.getAgentOverview, { agentId });
  const updateAgent = useMutation(api.private.agents.update);

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

  // Loading state
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
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/40" />
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
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    agent.isActive ? "bg-emerald-500" : "bg-zinc-400",
                  )}
                />
                <span className={cn("text-[12px] font-medium", agent.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                  {agent.isActive ? "Aktiv" : "Inaktiv"}
                </span>
              </span>
              {agent.isBuiltIn && (
                <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border/50">
                  Innebygd
                </span>
              )}
              <span className="font-mono text-[11px] text-muted-foreground/60">
                slug: {agent.slug}
              </span>
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-8">
        <StatBlock
          label="Åpne samtaler"
          value={openCount}
          sublabel={openCount > 0 ? "Venter på svar" : "Ingen åpne"}
        />
        <StatBlock
          label="Løste samtaler"
          value={overview?.conversations.resolved ?? 0}
          sublabel="Totalt avsluttet"
        />
        <StatBlock
          label="Kunnskapskilder"
          value={overview?.fileCount ?? 0}
          sublabel={overview?.lastIndexedAt ? "Indeks klar" : "Ingen filer ennå"}
        />
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={`/agents/${agentId}/conversations`}
          className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-md hover:-translate-y-px"
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-border/60 bg-muted/40">
            <InboxIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-foreground">Samtaler</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {openCount > 0 ? `${openCount} åpne` : "Se alle samtaler"}
            </p>
          </div>
          <MessageCircleIcon className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
        </Link>

        <Link
          href={`/agents/${agentId}/files`}
          className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-md hover:-translate-y-px"
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-border/60 bg-muted/40">
            <LibraryBigIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-foreground">Kunnskapsbase</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {(overview?.fileCount ?? 0) > 0
                ? `${overview?.fileCount} kilder indeksert`
                : "Legg til filer og nettsider"}
            </p>
          </div>
          <BookOpenIcon className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
        </Link>
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
