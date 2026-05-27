"use client";

import { useState } from "react";
import { useOrganization, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Building2, CopyIcon, CheckIcon, UsersIcon,
  MailIcon, ShieldCheckIcon, UserIcon, ExternalLinkIcon,
  RefreshCwIcon, ClockIcon,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useCopy(text: string | undefined | null) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return { copy, copied };
}

function formatDate(ts: number | Date | null | undefined) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("no-NO", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function formatTimeAgo(ts: number | Date | null | undefined) {
  if (!ts) return "—";
  const diff = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "I dag";
  if (days === 1) return "I går";
  if (days < 30) return `${days} dager siden`;
  return formatDate(ts);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ title, description, children, action }: {
  title: string; description?: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-5 py-4 gap-4">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-foreground">{title}</p>
          {description && <p className="mt-0.5 text-[12px] text-muted-foreground truncate">{description}</p>}
        </div>
        {action}
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "org:admin";
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
      isAdmin
        ? "bg-foreground/10 text-foreground"
        : "bg-muted text-muted-foreground",
    )}>
      {isAdmin ? <ShieldCheckIcon className="size-3" strokeWidth={2} /> : <UserIcon className="size-3" strokeWidth={1.75} />}
      {isAdmin ? "Admin" : "Medlem"}
    </span>
  );
}

// ─── Organization view ────────────────────────────────────────────────────────

export function OrganizationView() {
  const { organization, membership, memberships, isLoaded } = useOrganization({
    memberships: { pageSize: 50 },
  });
  const { openOrganizationProfile } = useClerk();
  const { copy: copyId, copied: copiedId } = useCopy(organization?.id);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-muted/40" />
        ))}
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-10 text-center max-w-2xl">
        <Building2 className="mx-auto size-10 text-muted-foreground/40 mb-3" strokeWidth={1.5} />
        <p className="text-[14px] font-medium text-foreground">Ingen organisasjon valgt</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Velg eller opprett en organisasjon via org-bytter øverst til høyre.
        </p>
      </div>
    );
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !organization) return;
    setInviting(true);
    try {
      await organization.inviteMember({ emailAddress: inviteEmail.trim(), role: "org:member" });
      toast.success(`Invitasjon sendt til ${inviteEmail.trim()}`);
      setInviteEmail("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Kunne ikke sende invitasjon.";
      toast.error(msg);
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* Org info */}
      <Card
        title="Organisasjonsprofil"
        description="Navn og identifikasjon"
        action={
          <button
            onClick={() => openOrganizationProfile()}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-muted/70 transition-colors"
          >
            <ExternalLinkIcon className="size-3.5" strokeWidth={1.75} />
            Rediger
          </button>
        }
      >
        <div className="flex items-start gap-4 mb-5">
          {organization.imageUrl ? (
            <img
              src={organization.imageUrl}
              alt={organization.name}
              className="size-16 rounded-xl object-cover ring-2 ring-border/40 shrink-0"
            />
          ) : (
            <div className="size-16 rounded-xl bg-muted flex items-center justify-center ring-2 ring-border/40 text-[22px] font-bold text-foreground/70 shrink-0">
              {organization.name[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-[17px] font-semibold text-foreground">{organization.name}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <UsersIcon className="size-3.5" strokeWidth={1.75} />
              {organization.membersCount ?? 0} {(organization.membersCount ?? 0) === 1 ? "medlem" : "medlemmer"}
            </p>
            {organization.createdAt && (
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                <ClockIcon className="size-3" strokeWidth={1.75} />
                Opprettet {formatDate(organization.createdAt)}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border/60 overflow-hidden">
          <div className="flex items-center justify-between py-3 px-4 border-b border-border/40">
            <span className="text-[13px] text-muted-foreground">Organisasjonsnavn</span>
            <span className="text-[13px] font-medium text-foreground">{organization.name}</span>
          </div>
          <div className="flex items-center justify-between py-3 px-4 border-b border-border/40">
            <span className="text-[13px] text-muted-foreground">Din rolle</span>
            <RoleBadge role={membership?.role ?? "org:member"} />
          </div>
          <div className="flex items-center justify-between py-3 px-4">
            <span className="text-[13px] text-muted-foreground">Org-ID</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[180px]">
                {organization.id}
              </span>
              <button
                onClick={copyId}
                className="flex size-6 items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                {copiedId
                  ? <CheckIcon className="size-3.5" strokeWidth={2.5} />
                  : <CopyIcon className="size-3.5" strokeWidth={1.75} />
                }
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Invite member */}
      {membership?.role === "org:admin" && (
        <Card title="Inviter medlem" description="Send invitasjon til ny bruker">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" strokeWidth={1.75} />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                placeholder="epost@eksempel.no"
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
              />
            </div>
            <button
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviting}
              className="h-9 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 text-[13px] font-medium text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {inviting ? <RefreshCwIcon className="size-3.5 animate-spin" /> : null}
              Send invitasjon
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Inviterte brukere får e-post med lenke og tildeles rollen «Medlem» automatisk.
          </p>
        </Card>
      )}

      {/* Members list */}
      <Card
        title="Medlemmer"
        description={`${memberships?.data?.length ?? 0} ${(memberships?.data?.length ?? 0) === 1 ? "person" : "personer"} i organisasjonen`}
      >
        {!memberships?.data || memberships.data.length === 0 ? (
          <p className="text-[13px] text-muted-foreground text-center py-4">Ingen medlemmer å vise.</p>
        ) : (
          <ul className="divide-y divide-border/40">
            {memberships.data.map((m) => {
              const member = m.publicUserData;
              const name = [member?.firstName, member?.lastName].filter(Boolean).join(" ") || "—";
              const initials = name !== "—"
                ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                : "?";
              return (
                <li key={m.id} className="flex items-center gap-3 py-3">
                  {member?.imageUrl ? (
                    <img
                      src={member.imageUrl}
                      alt={name}
                      className="size-8 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-[11px] font-semibold text-foreground/70 shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-foreground truncate">{name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {member?.identifier ?? ""}
                      {m.createdAt && (
                        <span className="ml-2 text-muted-foreground/50">· Ble med {formatTimeAgo(m.createdAt)}</span>
                      )}
                    </p>
                  </div>
                  <RoleBadge role={m.role} />
                </li>
              );
            })}
          </ul>
        )}
      </Card>

    </div>
  );
}
