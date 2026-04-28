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
import { Badge } from "@workspace/ui/components/badge";
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
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
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
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { DashboardAccentButton } from "@/modules/dashboard/ui/components/dashboard-accent";
import {
  DashboardPageHeader,
  DashboardPagePanel,
  DashboardPageShell,
} from "@/modules/dashboard/ui/components/dashboard-page-shell";

type AgentDoc = Doc<"agents">;

const BUILT_IN_TOOLS = [
  { name: "Søk", detail: "Kunnskapsbase / RAG", icon: SearchIcon },
  { name: "Eskalering", detail: "Over til menneske", icon: PhoneForwardedIcon },
  { name: "Løst", detail: "Avslutt samtale", icon: MessageCircleIcon },
] as const;

function formatMutationError(err: unknown, fallback: string): string {
  if (typeof err === "string") {
    return err;
  }
  if (err && typeof err === "object") {
    const o = err as { message?: string; data?: { message?: string } };
    const m = o.data?.message ?? o.message;
    if (typeof m === "string" && m.length > 0) {
      return m;
    }
  }
  return fallback;
}

function AgentCardShell({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  /** Innebygd agent: tynn nøytral stripe øverst */
  variant?: "default" | "featured";
}) {
  return (
    <div
      className={cn(
        "group app-dashboard-panel flex h-full min-h-0 flex-col overflow-hidden rounded-2xl p-0 transition-[border-color,box-shadow] duration-200",
        "hover:border-foreground/12 hover:shadow-[0_20px_48px_-28px_oklch(0_0_0/0.08)]",
        "dark:hover:border-foreground/10 dark:hover:shadow-[0_24px_56px_-32px_oklch(0_0_0/0.35)]",
        className,
      )}
    >
      {variant === "featured" ? (
        <div aria-hidden className="bg-muted-foreground/20 h-1 w-full shrink-0" />
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">{children}</div>
    </div>
  );
}

export function AgentsView() {
  const agents = useQuery(api.private.agents.list);
  const seedDefaults = useMutation(api.private.agents.seedDefaults);
  const createAgent = useMutation(api.private.agents.create);
  const updateAgent = useMutation(api.private.agents.update);
  const removeAgent = useMutation(api.private.agents.remove);

  const seedAttempted = useRef(false);
  useEffect(() => {
    if (agents === undefined) {
      seedAttempted.current = false;
    }
  }, [agents]);
  useEffect(() => {
    if (agents === undefined || agents === null) {
      return;
    }
    if (agents.length > 0) {
      return;
    }
    if (seedAttempted.current) {
      return;
    }
    seedAttempted.current = true;
    void seedDefaults()
      .catch((err) => {
        seedAttempted.current = false;
        toast.error(
          formatMutationError(err, "Kunne ikke opprette standard støtte-agent."),
        );
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

  const openEdit = useCallback((a: AgentDoc) => {
    setEditTarget(a);
    setEditName(a.name);
    setEditDescription(a.description ?? "");
    setEditActive(a.isActive);
  }, []);

  const onCreate = async () => {
    const n = createName.trim();
    if (!n) {
      toast.error("Skriv inn et navn.");
      return;
    }
    setCreateBusy(true);
    try {
      await createAgent({
        name: n,
        description: createDescription.trim() || undefined,
      });
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
    if (!editTarget) {
      return;
    }
    const n = editName.trim();
    if (!n) {
      toast.error("Skriv inn et navn.");
      return;
    }
    setEditBusy(true);
    try {
      await updateAgent({
        agentId: editTarget._id,
        name: n,
        description: editDescription.trim() || undefined,
        isActive: editActive,
      });
      toast.success("Agent oppdatert.");
      setEditTarget(null);
    } catch (err) {
      toast.error(formatMutationError(err, "Kunne ikke oppdatere agent."));
    } finally {
      setEditBusy(false);
    }
  };

  const onConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }
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

  const [filterQuery, setFilterQuery] = useState("");
  const filteredAgents = useMemo(() => {
    if (!agents || agents === null) {
      return [];
    }
    const q = filterQuery.trim().toLowerCase();
    if (!q) {
      return agents;
    }
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        (a.description ?? "").toLowerCase().includes(q),
    );
  }, [agents, filterQuery]);

  return (
    <DashboardPageShell contentClassName="max-w-6xl">
      <DashboardPageHeader
        actions={
          <DashboardAccentButton
            className="w-full sm:w-auto"
            onClick={() => setCreateOpen(true)}
            type="button"
          >
            <PlusIcon className="size-4" />
            Ny agent
          </DashboardAccentButton>
        }
        description="Oversikt over innebygde og egendefinerte agenter. Widget i produksjon følger fortsatt standard støtte-agenten."
        kicker="Organisasjon"
        title="Agenter"
      />

      {agents === undefined ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <div className="app-dashboard-panel rounded-2xl p-6" key={i}>
              <div className="flex gap-4">
                <Skeleton className="size-14 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/5 rounded-md" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
              </div>
              <Skeleton className="mt-5 h-16 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : agents === null ? (
        <DashboardPagePanel className="mt-8" variant="plain">
          <p className="text-muted-foreground p-6 text-[13px] leading-relaxed">
            Velg organisasjon for å se agenter.
          </p>
        </DashboardPagePanel>
      ) : (
        <>
          {agents.length > 0 ? (
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="relative w-full sm:max-w-md">
                <SearchIcon
                  aria-hidden
                  className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
                  strokeWidth={1.75}
                />
                <Input
                  aria-label="Søk blant agenter"
                  className="h-10 rounded-xl pl-9 shadow-none"
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Søk etter navn, slug eller beskrivelse …"
                  value={filterQuery}
                />
              </div>
              <p className="text-muted-foreground shrink-0 text-[13px] tabular-nums">
                {filteredAgents.length} av {agents.length}{" "}
                {agents.length === 1 ? "agent" : "agenter"}
              </p>
            </div>
          ) : null}

          {filteredAgents.length === 0 && agents.length > 0 ? (
            <DashboardPagePanel className="mt-8" variant="plain">
              <div className="flex flex-col items-center px-4 py-14 text-center">
                <div className="bg-muted/50 mb-4 grid size-14 place-items-center rounded-2xl">
                  <SearchIcon className="text-muted-foreground size-6" strokeWidth={1.5} />
                </div>
                <p className="text-foreground text-[15px] font-semibold tracking-tight">
                  Ingen treff
                </p>
                <p className="text-muted-foreground mt-1.5 max-w-sm text-[13px] leading-relaxed">
                  Prøv et annet søkeord, eller tøm søket for å vise alle agenter.
                </p>
                <Button
                  className="mt-5 rounded-xl"
                  onClick={() => setFilterQuery("")}
                  type="button"
                  variant="outline"
                >
                  Vis alle
                </Button>
              </div>
            </DashboardPagePanel>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {filteredAgents.map((agent) => (
                <AgentDocCard
                  agent={agent}
                  key={agent._id}
                  onDelete={setDeleteTarget}
                  onEdit={openEdit}
                />
              ))}
            </div>
          )}
        </>
      )}

      <DashboardPagePanel className="mt-10 max-w-3xl" variant="plain">
        <div className="flex gap-4">
          <div
            aria-hidden
            className="bg-muted text-muted-foreground grid size-11 shrink-0 place-items-center rounded-xl"
          >
            <BotIcon className="size-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 space-y-1.5">
            <p className="text-foreground text-[13px] font-semibold leading-snug">
              Widget og standard agent
            </p>
            <p className="text-muted-foreground text-[12px] leading-relaxed">
              Widget i produksjon bruker fortsatt standard støtte-agent med slug{" "}
              <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground/90">
                support
              </code>
              . Egendefinerte agenter er synlige her for oversikt og videre utvikling.
            </p>
          </div>
        </div>
      </DashboardPagePanel>

      <Dialog onOpenChange={setCreateOpen} open={createOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ny agent</DialogTitle>
            <DialogDescription>
              Oppretter en egendefinert agent med unik slug. Krever aktivt abonnement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Navn</Label>
              <Input
                id="agent-name"
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="F.eks. Nybegynnerstøtte"
                value={createName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-desc">Beskrivelse (valgfritt)</Label>
              <Textarea
                className="min-h-[88px] resize-y"
                id="agent-desc"
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Kort hva denne agenten skal brukes til."
                value={createDescription}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setCreateOpen(false)}
              type="button"
              variant="outline"
            >
              Avbryt
            </Button>
            <Button disabled={createBusy} onClick={() => void onCreate()} type="button">
              {createBusy ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              Opprett
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setEditTarget(null);
          }
        }}
        open={editTarget !== null}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rediger agent</DialogTitle>
            <DialogDescription>
              Oppdaterer navn, beskrivelse og status for den egendefinerte agenten.
            </DialogDescription>
          </DialogHeader>
          {editTarget ? (
            <div className="space-y-4 py-1">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Navn</Label>
                <Input
                  id="edit-name"
                  onChange={(e) => setEditName(e.target.value)}
                  value={editName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Beskrivelse</Label>
                <Textarea
                  className="min-h-[88px] resize-y"
                  id="edit-desc"
                  onChange={(e) => setEditDescription(e.target.value)}
                  value={editDescription}
                />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 px-3 py-2.5">
                <div>
                  <p className="text-[13px] font-medium">Aktiv</p>
                  <p className="text-muted-foreground text-[12px]">
                    Inaktive agenter vises fortsatt i listen.
                  </p>
                </div>
                <Switch
                  checked={editActive}
                  onCheckedChange={setEditActive}
                />
              </div>
              <p className="text-muted-foreground font-mono text-[11px]">
                slug: {editTarget.slug}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              onClick={() => setEditTarget(null)}
              type="button"
              variant="outline"
            >
              Avbryt
            </Button>
            <Button
              disabled={editBusy}
              onClick={() => void onSaveEdit()}
              type="button"
            >
              {editBusy ? <Loader2Icon className="size-4 animate-spin" /> : null}
              Lagre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={(o) => {
          if (!o) {
            setDeleteTarget(null);
          }
        }}
        open={deleteTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slette agent?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `«${deleteTarget.name}» slettes permanent. Dette kan ikke angres.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBusy}
              onClick={(e) => {
                e.preventDefault();
                void onConfirmDelete();
              }}
            >
              {deleteBusy ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Slett"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardPageShell>
  );
}

function AgentDocCard({
  agent,
  onEdit,
  onDelete,
}: {
  agent: AgentDoc;
  onEdit: (a: AgentDoc) => void;
  onDelete: (a: AgentDoc) => void;
}) {
  return (
    <AgentCardShell variant={agent.isBuiltIn ? "featured" : "default"}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-4">
          <div
            aria-hidden
            className={cn(
              "grid size-14 shrink-0 place-items-center rounded-2xl shadow-sm ring-1 ring-inset",
              agent.isBuiltIn
                ? "bg-secondary text-secondary-foreground ring-foreground/10"
                : "bg-muted/60 text-foreground ring-border/60 dark:bg-muted/40",
            )}
          >
            <BotIcon className="size-7" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 pt-0.5">
            <h2 className="text-foreground text-lg font-semibold leading-snug tracking-tight">
              {agent.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                className={agent.isBuiltIn ? "font-medium" : "text-muted-foreground"}
                variant={agent.isBuiltIn ? "secondary" : "outline"}
              >
                {agent.isBuiltIn ? "Innebygd" : "Egendefinert"}
              </Badge>
              <Badge variant={agent.isActive ? "default" : "secondary"}>
                {agent.isActive ? "Aktiv" : "Inaktiv"}
              </Badge>
            </div>
          </div>
        </div>
        {!agent.isBuiltIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="size-9 shrink-0 rounded-xl"
                size="icon"
                type="button"
                variant="ghost"
              >
                <span className="sr-only">Handlinger</span>
                <MoreHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                className="gap-2"
                onClick={() => onEdit(agent)}
              >
                <PencilLineIcon className="size-4" />
                Rediger
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive gap-2"
                onClick={() => onDelete(agent)}
              >
                <Trash2Icon className="size-4" />
                Slett
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
          Slug
        </span>
        <code className="rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-foreground/90 dark:bg-muted/25">
          {agent.slug}
        </code>
      </div>

      {agent.modelLabel ? (
        <p className="text-muted-foreground mt-3 text-[12px] leading-relaxed">
          <span className="text-foreground/80 font-medium">Modell</span>{" "}
          <span className="font-mono text-[12px] text-foreground/90">{agent.modelLabel}</span>
        </p>
      ) : !agent.isBuiltIn ? (
        <p className="text-muted-foreground mt-3 text-[12px]">Modell ikke angitt</p>
      ) : null}

      {agent.description ? (
        <p className="text-muted-foreground mt-3 text-[13px] leading-relaxed">
          {agent.description}
        </p>
      ) : null}

      {agent.isBuiltIn ? (
        <div className="mt-6 flex min-h-0 flex-1 flex-col gap-4 border-t border-border/50 pt-5">
          <p className="dash-page-kicker">Innebygde verktøy</p>
          <ul className="grid gap-2">
            {BUILT_IN_TOOLS.map((t) => (
              <li
                className="bg-muted/35 dark:bg-muted/20 flex items-center gap-3 rounded-xl border border-border/40 px-3 py-2.5 text-[12px] text-foreground/95"
                key={t.name}
              >
                <span className="bg-background/80 dark:bg-background/40 grid size-8 shrink-0 place-items-center rounded-lg border border-border/50">
                  <t.icon className="text-muted-foreground size-3.5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-muted-foreground"> — {t.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-xl gap-1.5" size="sm" variant="outline">
              <Link href="/files">
                <LibraryBigIcon className="size-4" />
                Kunnskapsbase
              </Link>
            </Button>
            <Button asChild className="rounded-xl gap-1.5" size="sm" variant="outline">
              <Link href="/customization">
                <PaletteIcon className="size-4" />
                Tilpasning
              </Link>
            </Button>
            <Button asChild className="rounded-xl gap-1.5" size="sm" variant="outline">
              <Link href="/conversations">
                <MessageCircleIcon className="size-4" />
                Konversasjoner
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </AgentCardShell>
  );
}
