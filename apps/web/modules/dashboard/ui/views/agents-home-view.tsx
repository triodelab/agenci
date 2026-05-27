"use client";

import { api } from "@workspace/backend/_generated/api";
import type { Doc } from "@workspace/backend/_generated/dataModel";
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
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  BookOpenIcon,
  BotIcon,
  ChevronRightIcon,
  CodeIcon,
  InboxIcon,
  Loader2Icon,
  PaletteIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardAccentButton } from "@/modules/dashboard/ui/components/dashboard-accent";
import { DashboardPageShell } from "@/modules/dashboard/ui/components/dashboard-page-shell";

type AgentWithCount = Doc<"agents"> & { openConversationCount: number };

function formatMutationError(err: unknown, fallback: string): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const o = err as { message?: string; data?: { message?: string } };
    const m = o.data?.message ?? o.message;
    if (typeof m === "string" && m.length > 0) return m;
  }
  return fallback;
}

function AgentCard({ agent, onDelete }: { agent: AgentWithCount; onDelete: () => void }) {
  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-200",
        "hover:shadow-md hover:-translate-y-px",
        "border-border/60",
        !agent.isActive && "opacity-60",
      )}
    >
      {/* Clickable body */}
      <Link href={`/agents/${agent._id}`} className="flex flex-1 flex-col gap-4 p-6 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground">
              <BotIcon className="size-5" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[14px] font-semibold tracking-tight text-foreground leading-snug">
                {agent.name}
              </p>
              <div className="mt-1 flex items-center gap-1">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    agent.isActive ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600",
                  )}
                />
                <span className={cn("text-[11px] font-medium", agent.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                  {agent.isActive ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
            </div>
          </div>
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground mt-1" />
        </div>

        {agent.description && (
          <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
            {agent.description}
          </p>
        )}
      </Link>

      {/* Footer — separate from Link so delete button doesn't trigger navigation */}
      <div className="flex items-center justify-between border-t border-border/40 px-6 py-3">
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <InboxIcon className="size-3.5" strokeWidth={1.75} />
          <span>
            {agent.openConversationCount > 0 ? (
              <span className="font-semibold text-foreground">{agent.openConversationCount}</span>
            ) : (
              <span>0</span>
            )}{" "}
            åpne samtaler
          </span>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="grid size-7 place-items-center rounded-lg text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Slett agent"
        >
          <Trash2Icon className="size-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

function AgentCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="size-10 shrink-0 animate-pulse rounded-xl bg-muted/50" />
          <div className="flex-1 space-y-2 pt-0.5">
            <div className="h-4 w-32 animate-pulse rounded-lg bg-muted/50" />
            <div className="h-3 w-16 animate-pulse rounded-lg bg-muted/50" />
          </div>
        </div>
        <div className="h-8 w-full animate-pulse rounded-lg bg-muted/40" />
        <div className="h-3 w-24 animate-pulse rounded-lg bg-muted/40 pt-2" />
      </div>
    </div>
  );
}

export function AgentsHomeView() {
  const agents = useQuery(api.private.agents.listWithCounts);
  const createAgent = useMutation(api.private.agents.create);
  const removeAgent = useMutation(api.private.agents.remove);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AgentWithCount | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);

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

  const onConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await removeAgent({ agentId: deleteTarget._id });
      toast.success("Agent slettet.");
      setDeleteTarget(null);
      setDeleteConfirmName("");
    } catch (err) {
      toast.error(formatMutationError(err, "Kunne ikke slette agent."));
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <DashboardPageShell contentClassName="max-w-4xl">

      {/* Header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Organisasjon
          </p>
          <h1 className="text-[26px] font-bold tracking-[-0.03em] text-foreground leading-tight">
            Dine agenter
          </h1>
          <p className="text-[14px] text-muted-foreground max-w-lg leading-relaxed">
            Velg en agent for å se samtaler, kunnskapsbase og innstillinger.
          </p>
        </div>
        <DashboardAccentButton asChild className="w-full sm:w-auto shrink-0 gap-2">
          <Link href="/onboarding?new=1">
            <PlusIcon className="size-4" />
            Ny agent
          </Link>
        </DashboardAccentButton>
      </div>

      {/* Agent grid */}
      {agents === undefined ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1].map((i) => <AgentCardSkeleton key={i} />)}
        </div>
      ) : agents === null || agents.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          {/* Hero */}
          <div className="flex flex-col items-center px-6 py-12 text-center sm:px-12">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
              <SparklesIcon className="size-6 text-muted-foreground/60" strokeWidth={1.5} />
            </div>
            <h2 className="text-[18px] font-bold tracking-tight text-foreground">
              Ingen agenter ennå
            </h2>
            <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
              Opprett din første agent og kom i gang på under 5 minutter.
            </p>
            <Button asChild className="mt-6">
              <Link href="/onboarding">
                <SparklesIcon className="size-4" />
                Kom i gang
                <ChevronRightIcon className="size-4" />
              </Link>
            </Button>
          </div>

          {/* Steps preview */}
          <div className="grid divide-y border-t border-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {[
              { icon: BotIcon,       label: "Opprett agent",     desc: "Gi agenten et navn og beskrivelse" },
              { icon: BookOpenIcon,  label: "Legg til kunnskap", desc: "Nettside-URL eller dokument" },
              { icon: PaletteIcon,   label: "Tilpass utseende",  desc: "Farger, tittel og velkomstmelding" },
              { icon: CodeIcon,      label: "Integrer på nett",  desc: "Lim inn én kodelinje" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3.5 px-5 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/40">
                  <Icon className="size-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{label}</p>
                  <p className="text-[12px] text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent._id} agent={agent} onDelete={() => setDeleteTarget(agent)} />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog onOpenChange={setCreateOpen} open={createOpen}>
        <DialogContent className="dashboard-app-shell sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ny agent</DialogTitle>
            <DialogDescription>Gi agenten et navn og beskriv hva den skal hjelpe med.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Navn</Label>
              <Input
                id="agent-name"
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="F.eks. Salgsstøtte"
                value={createName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-desc">
                Beskrivelse <span className="text-muted-foreground font-normal">(valgfritt)</span>
              </Label>
              <Textarea
                className="min-h-[80px] resize-y"
                id="agent-desc"
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Hva skal denne agenten brukes til?"
                value={createDescription}
              />
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

      {/* Delete dialog — requires typing the agent name */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o) { setDeleteTarget(null); setDeleteConfirmName(""); }
        }}
      >
        <DialogContent className="dashboard-app-shell sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Slett agent</DialogTitle>
            <DialogDescription>
              Dette kan ikke angres. Agenten og alle tilknyttede data slettes permanent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <p className="text-[13px] text-muted-foreground">
              Skriv inn <span className="font-semibold text-foreground">{deleteTarget?.name}</span> for å bekrefte.
            </p>
            <Input
              autoFocus
              placeholder={deleteTarget?.name ?? ""}
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && deleteConfirmName === deleteTarget?.name) {
                  void onConfirmDelete();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleteBusy}
              onClick={() => { setDeleteTarget(null); setDeleteConfirmName(""); }}
            >
              Avbryt
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteBusy || deleteConfirmName !== deleteTarget?.name}
              onClick={() => void onConfirmDelete()}
            >
              {deleteBusy ? <Loader2Icon className="size-4 animate-spin" /> : "Slett permanent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageShell>
  );
}
