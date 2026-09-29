import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { cn } from "@workspace/ui/lib/utils";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  InfoIcon,
  MailIcon,
  MailPlusIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  UserCheckIcon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

/* ─── Roles ─────────────────────────────────────────────────────────────── */

type Role = "owner" | "admin" | "member";

const ROLE: Record<Role, { label: string; dot: string; chip: string }> = {
  owner: {
    label: "Eier",
    dot: "bg-[#243236]",
    chip: "border-[#243236]/30 text-(--agenci-ink)",
  },
  admin: {
    label: "Admin",
    dot: "bg-[#D9493E]",
    chip: "border-[#D9493E]/40 text-(--dash-bad)",
  },
  member: {
    label: "Medlem",
    dot: "bg-[#5FA06F]",
    chip: "border-[#5FA06F]/45 text-(--dash-good)",
  },
};

/**
 * What each role can do, mirroring the Better Auth roles in
 * packages/auth/src/permissions.ts (the server enforces those).
 */
const ACCESS: Record<Role, string[]> = {
  owner: ["All tilgang", "Kan slette organisasjonen"],
  admin: ["Agenter", "Kunnskap", "Samtaler", "Team", "Faktura"],
  member: ["Svarer i samtaler", "Ser agenter", "Ser kunnskap", "Bestillinger"],
};

const asRole = (r: string | null | undefined): Role =>
  r === "owner" || r === "admin" ? r : "member";

const PAGE_SIZE = 10;

type Row =
  | {
      kind: "member";
      id: string;
      name: string;
      email: string;
      image?: string | null;
      role: Role;
      isMe: boolean;
      since: Date;
    }
  | {
      kind: "invite";
      id: string;
      name: string;
      email: string;
      role: Role;
      expiresAt: Date;
    };

type Filter = "all" | Role | "invited";
type Sort = "name" | "role" | "newest";

const inviteLink = (id: string) =>
  `${window.location.origin}/accept-invitation/${id}`;

function daysLeft(d: Date) {
  const n = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  return n <= 0 ? "Utløpt" : n === 1 ? "Utløper i morgen" : `Utløper om ${n} d`;
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });

/* ─── Small pieces ──────────────────────────────────────────────────────── */

function Avatar({ name, image, size = 28 }: { name: string; image?: string | null; size?: number }) {
  const letters = name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return image ? (
    <img src={image} alt="" style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover" />
  ) : (
    <span
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#f1f2f4] to-[#e3e6ea] font-medium text-(--agenci-ink) dark:from-white/10 dark:to-white/5"
    >
      {letters}
    </span>
  );
}

function RoleChip({ role }: { role: Role }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] border bg-(--dash-surface) px-2 py-px text-[12px] font-medium dark:bg-transparent",
        ROLE[role].chip,
      )}
    >
      {ROLE[role].label}
    </span>
  );
}

function AccessChips({ role }: { role: Role }) {
  const all = ACCESS[role];
  const shown = all.slice(0, 2);
  const rest = all.length - shown.length;
  return (
    <span className="flex items-center gap-1.5">
      {shown.map((a) => (
        <span key={a} className="rounded-full border border-(--agenci-line) bg-(--dash-surface) px-2.5 py-0.5 text-[12px] text-(--agenci-ink) dark:bg-transparent">
          {a}
        </span>
      ))}
      {rest > 0 ? (
        <span title={all.slice(2).join(", ")} className="rounded-full border border-(--agenci-line) bg-(--dash-surface) px-2 py-0.5 text-[12px] text-(--agenci-ink-2) dark:bg-transparent">
          +{rest}
        </span>
      ) : null}
    </span>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setDone(true);
        window.setTimeout(() => setDone(false), 1500);
      }}
      className="flex size-6 shrink-0 items-center justify-center rounded-md text-(--agenci-ink-3) transition-colors hover:bg-(--dash-subtle) hover:text-(--agenci-ink)"
    >
      {done ? <CheckIcon className="size-3.5 text-(--dash-good)" strokeWidth={2.2} /> : <CopyIcon className="size-3.5" strokeWidth={1.7} />}
    </button>
  );
}

function RoleOptions({
  value,
  onChange,
  roles,
}: {
  value: Role;
  onChange: (r: Role) => void;
  roles: Role[];
}) {
  return (
    <div className="grid gap-2">
      {roles.map((r) => (
        <button
          key={r}
          type="button"
          aria-pressed={value === r}
          onClick={() => onChange(r)}
          className={cn(
            "flex items-center gap-3 rounded-[12px] border px-3.5 py-2.5 text-left transition-[border-color,background-color] duration-150",
            value === r ? "border-(--agenci-ink) bg-(--dash-subtle-2) dark:bg-white/5" : "border-(--agenci-line) hover:border-(--dash-field)",
          )}
        >
          <span className={cn("size-2 rounded-full", ROLE[r].dot)} />
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-medium text-(--agenci-ink)">{ROLE[r].label}</span>
            <span className="block text-[12px] text-(--agenci-ink-3)">{ACCESS[r].join(" · ")}</span>
          </span>
          {value === r ? <CheckIcon className="size-4 text-(--agenci-ink)" strokeWidth={2.2} /> : null}
        </button>
      ))}
    </div>
  );
}

const ghostBtn =
  "inline-flex h-10 items-center justify-center rounded-full border border-(--agenci-line) px-4 text-[13.5px] text-(--agenci-ink) transition-colors hover:bg-(--dash-subtle) disabled:opacity-40";
const inkBtn =
  "inline-flex h-10 items-center justify-center rounded-full bg-(--agenci-ink) px-5 text-[13.5px] font-medium text-white transition-[background-color,opacity] hover:bg-(--agenci-accent-hover) disabled:opacity-40 dark:text-[#0b0c0e]";

/* ─── Dialogs ───────────────────────────────────────────────────────────── */

function InviteDialog({
  open,
  onOpenChange,
  roles,
  onDone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  roles: Role[];
  onDone: () => Promise<unknown>;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState("");
  const reset = () => {
    setEmail("");
    setRole("member");
    setError(null);
    setLink(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const { data, error: err } = await authClient.organization.inviteMember({ email: email.trim(), role });
      if (err) return setError(err.message ?? "Kunne ikke sende invitasjonen.");
      if (data?.id) {
        setSentTo(email.trim());
        setLink(inviteLink(data.id));
      }
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke sende invitasjonen.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="gap-0 overflow-hidden rounded-[20px] p-0 sm:max-w-md [&>*]:min-w-0">
        <DialogHeader className="px-6 pt-6 text-left">
          <DialogTitle className="text-[18px] font-semibold tracking-[-0.01em]">Legg til medlem</DialogTitle>
          <DialogDescription className="text-[13.5px] text-(--agenci-ink-2)">
            Personen får en e-post med en lenke for å bli med i teamet. Lenken gjelder i 48 timer.
          </DialogDescription>
        </DialogHeader>
        {link ? (
          <div className="min-w-0 space-y-4 px-6 pt-5 pb-6">
            <p className="flex items-center gap-2.5 rounded-[12px] bg-(--dash-good-bg) px-4 py-3 text-[13.5px] text-(--dash-good)">
              <CheckIcon className="size-4 shrink-0" strokeWidth={2.2} />
              Invitasjonen er sendt til {sentTo}.
            </p>
            <div>
              <p className="text-[12.5px] text-(--agenci-ink-2)">
                Kom den ikke fram? Send lenken selv, den gjør det samme.
              </p>
              <div className="mt-2 flex min-w-0 items-center gap-2 rounded-[12px] border border-(--agenci-line) bg-(--dash-subtle-2) py-1.5 pr-1.5 pl-3 dark:bg-white/5">
                <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-(--agenci-ink)">{link}</span>
                <CopyButton value={link} label="Kopier invitasjonslenken" />
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" className={ghostBtn} onClick={reset}>
                Inviter en til
              </button>
              <a
                className={inkBtn}
                href={`mailto:${sentTo}?subject=${encodeURIComponent("Bli med i teamet på Agenci")}&body=${encodeURIComponent(`Hei!\n\nJeg har invitert deg til teamet vårt på Agenci. Trykk på lenken for å bli med:\n\n${link}\n\nLenken gjelder i 48 timer.`)}`}
              >
                <MailIcon className="size-4" strokeWidth={1.7} />
                Send på e-post
              </a>
            </div>
          </div>
        ) : (
          <form className="space-y-5 px-6 pt-5 pb-6" onSubmit={submit}>
            <label className="block">
              <span className="text-[13px] font-medium text-(--agenci-ink)">E-post</span>
              <span className="mt-1.5 flex items-center gap-2 rounded-[12px] border border-(--agenci-line) bg-(--dash-surface) px-3 focus-within:border-(--agenci-ink) focus-within:shadow-[0_0_0_4px_rgb(36_50_54/0.08)] dark:bg-transparent">
                <MailIcon className="size-4 shrink-0 text-(--agenci-ink-3)" strokeWidth={1.6} />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  disabled={sending}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  placeholder="navn@bedrift.no"
                  className="h-11 w-full bg-transparent text-[14px] text-(--agenci-ink) outline-none placeholder:text-(--agenci-ink-3)"
                />
              </span>
            </label>
            <fieldset>
              <legend className="mb-1.5 text-[13px] font-medium text-(--agenci-ink)">Rolle</legend>
              <RoleOptions value={role} onChange={setRole} roles={roles} />
            </fieldset>
            {error ? <p className="rounded-[12px] bg-(--dash-bad-bg) px-3 py-2 text-[13px] text-(--dash-bad)">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <button type="button" className={ghostBtn} onClick={() => onOpenChange(false)}>
                Avbryt
              </button>
              <button type="submit" className={inkBtn} disabled={sending || !email.trim()}>
                {sending ? "Sender…" : "Send invitasjon"}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MemberDialog({
  row,
  onClose,
  roles,
  canEdit,
  onChanged,
}: {
  row: Extract<Row, { kind: "member" }> | null;
  onClose: () => void;
  roles: Role[];
  canEdit: boolean;
  onChanged: () => Promise<unknown>;
}) {
  const [role, setRole] = useState<Role>("member");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (row) setRole(row.role);
  }, [row]);

  const act = async (fn: () => Promise<{ error?: { message?: string } | null }>, ok: string) => {
    setBusy(true);
    try {
      const res = await fn();
      if (res?.error) throw new Error(res.error.message ?? "Noe gikk galt.");
      await onChanged();
      toast.success(ok);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="gap-0 overflow-hidden rounded-[20px] p-0 sm:max-w-md [&>*]:min-w-0">
        {row ? (
          <>
            <DialogHeader className="px-6 pt-6 text-left">
              <div className="flex items-center gap-3">
                <Avatar name={row.name} image={row.image} size={44} />
                <div className="min-w-0">
                  <DialogTitle className="truncate text-[17px] font-semibold tracking-[-0.01em]">
                    {row.name}
                    {row.isMe ? <span className="ml-1.5 font-normal text-(--agenci-ink-3)">(deg)</span> : null}
                  </DialogTitle>
                  <DialogDescription className="truncate text-[13px] text-(--agenci-ink-2)">
                    {row.email} · med siden {fmtDate(row.since)}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-5 px-6 pt-5 pb-6">
              <fieldset disabled={!canEdit || busy}>
                <legend className="mb-1.5 text-[13px] font-medium text-(--agenci-ink)">Rolle</legend>
                <RoleOptions value={role} onChange={setRole} roles={canEdit ? roles : [row.role]} />
              </fieldset>
              {!canEdit ? (
                <p className="text-[12.5px] text-(--agenci-ink-3)">
                  {row.isMe ? "Du kan ikke endre din egen rolle." : "Bare en eier kan endre denne personen."}
                </p>
              ) : null}
              <div className="flex items-center justify-between gap-2">
                {canEdit ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm(`Fjerne ${row.name} fra teamet? Personen mister tilgangen med én gang.`)) {
                        void act(() => authClient.organization.removeMember({ memberIdOrEmail: row.id }), `${row.name} er fjernet`);
                      }
                    }}
                    className="text-[13.5px] text-(--dash-bad) hover:underline disabled:opacity-40"
                  >
                    Fjern fra teamet
                  </button>
                ) : (
                  <span />
                )}
                <span className="flex gap-2">
                  <button type="button" className={ghostBtn} onClick={onClose}>
                    Lukk
                  </button>
                  {canEdit ? (
                    <button
                      type="button"
                      className={inkBtn}
                      disabled={busy || role === row.role}
                      onClick={() =>
                        act(
                          () => authClient.organization.updateMemberRole({ memberId: row.id, role }),
                          `${row.name} er nå ${ROLE[role].label.toLowerCase()}`,
                        )
                      }
                    >
                      Lagre
                    </button>
                  ) : null}
                </span>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function OrganizationInviteView() {
  const { data: org, refetch } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("name");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [inviteOpen, setInviteOpen] = useState(false);
  const [viewing, setViewing] = useState<Extract<Row, { kind: "member" }> | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const me = session?.user?.id;
  const myRole = asRole(org?.members.find((m) => m.userId === me)?.role);
  const canManage = myRole === "owner" || myRole === "admin";
  const assignable: Role[] = myRole === "owner" ? ["member", "admin", "owner"] : ["member", "admin"];

  const rows = useMemo<Row[]>(() => {
    const members: Row[] = (org?.members ?? []).map((m) => ({
      kind: "member",
      id: m.id,
      name: m.user?.name || m.user?.email || "Uten navn",
      email: m.user?.email ?? "",
      image: m.user?.image,
      role: asRole(m.role),
      isMe: m.userId === me,
      since: new Date(m.createdAt),
    }));
    const invites: Row[] = (org?.invitations ?? [])
      .filter((i) => i.status === "pending")
      .map((i) => ({
        kind: "invite",
        id: i.id,
        name: i.email.split("@")[0] ?? i.email,
        email: i.email,
        role: asRole(i.role),
        expiresAt: new Date(i.expiresAt),
      }));
    return [...invites, ...members];
  }, [org, me]);

  const counts = {
    total: rows.length,
    active: rows.filter((r) => r.kind === "member").length,
    admins: rows.filter((r) => r.kind === "member" && r.role !== "member").length,
    invited: rows.filter((r) => r.kind === "invite").length,
  };

  const q = query.trim().toLowerCase();
  const order: Record<Role, number> = { owner: 0, admin: 1, member: 2 };
  const filtered = rows
    .filter(
      (r) =>
        (filter === "all" || (filter === "invited" ? r.kind === "invite" : r.kind === "member" && r.role === filter)) &&
        (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)),
    )
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "invite" ? -1 : 1;
      if (sort === "role") return order[a.role] - order[b.role] || a.name.localeCompare(b.name, "nb");
      if (sort === "newest" && a.kind === "member" && b.kind === "member") return b.since.getTime() - a.since.getTime();
      return a.name.localeCompare(b.name, "nb");
    });

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const pageRows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const invites = pageRows.filter((r) => r.kind === "invite");
  const members = pageRows.filter((r) => r.kind === "member");

  useEffect(() => setPage(1), [filter, query, sort]);

  const cancelInvite = async (id: string) => {
    setBusy(id);
    try {
      const { error } = await authClient.organization.cancelInvitation({ invitationId: id });
      if (error) throw new Error(error.message ?? "Noe gikk galt.");
      await refetch();
      toast.success("Invitasjonen er trukket tilbake");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setBusy(null);
    }
  };

  const selectable = pageRows.filter((r) => r.kind === "member" && !r.isMe);
  const allSelected = selectable.length > 0 && selectable.every((r) => selected.has(r.id));
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const stats = [
    { label: "Totalt", value: counts.total, hint: "Medlemmer og invitasjoner", icon: UsersIcon, tint: "bg-[#EEF1FB] text-[#4D68A8]" },
    { label: "Aktive", value: counts.active, hint: counts.total ? `${Math.round((counts.active / counts.total) * 100)} % av teamet` : "Ingen ennå", icon: UserCheckIcon, tint: "bg-[#E7F3EA] text-(--dash-good)" },
    { label: "Eiere og admin", value: counts.admins, hint: "Kan endre oppsett og team", icon: ShieldCheckIcon, tint: "bg-[#FBECEA] text-(--dash-bad)" },
    { label: "Invitert", value: counts.invited, hint: counts.invited ? "Invitasjon sendt" : "Ingen ventende", icon: MailPlusIcon, tint: "bg-(--dash-warn-bg) text-(--dash-warn)" },
  ];

  const filters: { id: Filter; label: string; dot?: string }[] = [
    { id: "all", label: "Alle", dot: "bg-(--agenci-ink)" },
    { id: "owner", label: "Eier", dot: ROLE.owner.dot },
    { id: "admin", label: "Admin", dot: ROLE.admin.dot },
    { id: "member", label: "Medlem", dot: ROLE.member.dot },
    { id: "invited", label: "Invitert", dot: "bg-[#E49A62]" },
  ];

  const th = "h-10 px-3 text-left text-[12.5px] font-medium text-(--agenci-ink-2)";
  const td = "h-[52px] px-3 align-middle text-[13.5px]";
  const check =
    "size-4 cursor-pointer appearance-none rounded-[5px] border border-(--dash-field) bg-(--dash-surface) transition-colors checked:border-(--agenci-ink) checked:bg-(--agenci-ink) checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222.4%22><path d=%22M4 8.5l2.5 2.5L12 5.5%22/></svg>')] disabled:cursor-default disabled:opacity-40";

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} roles={assignable} onDone={refetch} />
      <MemberDialog
        row={viewing}
        onClose={() => setViewing(null)}
        roles={assignable}
        canEdit={!!viewing && canManage && !viewing.isMe && !(viewing.role === "owner" && myRole !== "owner")}
        onChanged={refetch}
      />

      {/* Header */}
      <header className="flex items-center gap-4">
        <h1 className="[font-family:var(--font-agenci-title)] text-[22px] leading-none font-medium tracking-[-0.02em] text-(--agenci-ink)">
          Medlemmer
        </h1>
        {canManage ? (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-(--agenci-ink) px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-(--agenci-accent-hover) dark:text-[#0b0c0e]"
          >
            <PlusIcon className="size-4" strokeWidth={2} />
            Legg til medlem
          </button>
        ) : null}
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 overflow-hidden rounded-[14px] border border-(--agenci-line) bg-(--dash-surface) lg:grid-cols-4 dark:bg-(--card)">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={cn(
              "p-4",
              i % 2 === 1 && "border-l border-(--agenci-line)",
              i >= 2 && "border-t border-(--agenci-line) lg:border-t-0",
              i === 2 && "lg:border-l",
            )}
          >
            <p className="flex items-center gap-2 text-[13.5px] font-medium text-(--agenci-ink)">
              <span className={cn("flex size-7 items-center justify-center rounded-full", s.tint)}>
                <s.icon className="size-3.5" strokeWidth={1.8} />
              </span>
              {s.label}
            </p>
            <p className="mt-3 text-[28px] leading-none font-semibold tracking-[-0.02em] text-(--agenci-ink) tabular-nums">
              {String(s.value).padStart(2, "0")}
            </p>
            <p className="mt-1.5 text-[12.5px] text-(--agenci-ink-3)">{s.hint}</p>
          </div>
        ))}
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors",
              filter === f.id
                ? "border-(--agenci-ink) bg-(--dash-surface) font-medium text-(--agenci-ink) shadow-[0_0_0_1px_var(--agenci-ink)] dark:bg-white/10"
                : "border-(--agenci-line) bg-(--dash-surface) text-(--agenci-ink-2) hover:text-(--agenci-ink) dark:bg-transparent",
            )}
          >
            <span className={cn("size-1.5 rounded-full", f.dot)} />
            {f.label}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-(--agenci-line) bg-(--dash-surface) px-3 text-[13px] text-(--agenci-ink) outline-none hover:bg-(--dash-subtle) dark:bg-transparent">
              <SlidersHorizontalIcon className="size-3.5" strokeWidth={1.7} />
              Sorter
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-[12px] p-1.5">
              <DropdownMenuLabel className="text-[12px] font-medium text-(--agenci-ink-3)">Sorter etter</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as Sort)}>
                <DropdownMenuRadioItem value="name" className="rounded-[8px] text-[13px]">Navn</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="role" className="rounded-[8px] text-[13px]">Rolle</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="newest" className="rounded-[8px] text-[13px]">Nyest først</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <label className="flex h-9 w-56 items-center gap-2 rounded-[10px] border border-(--agenci-line) bg-(--dash-surface) px-3 dark:bg-transparent">
            <SearchIcon className="size-4 text-(--agenci-ink-3)" strokeWidth={1.6} />
            <input
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              placeholder="Søk etter navn"
              className="w-full bg-transparent text-[13px] text-(--agenci-ink) outline-none placeholder:text-(--agenci-ink-3)"
            />
          </label>
        </span>
      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-[14px] border border-(--agenci-line) bg-(--dash-surface) dark:bg-(--card)">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse">
            <thead className="bg-(--dash-subtle-2) dark:bg-white/5">
              <tr>
                <th className={cn(th, "w-10 pl-4")}>
                  <input
                    type="checkbox"
                    aria-label="Velg alle"
                    className={check}
                    disabled={!canManage || selectable.length === 0}
                    checked={allSelected}
                    onChange={() =>
                      setSelected(allSelected ? new Set() : new Set(selectable.map((r) => r.id)))
                    }
                  />
                </th>
                <th className={th}>
                  <span className="inline-flex items-center gap-1">
                    Navn
                    <InfoIcon className="size-3.5 text-(--agenci-ink-3)" strokeWidth={1.7} aria-label="Invitasjoner står øverst" />
                  </span>
                </th>
                <th className={th}>Rolle</th>
                <th className={th}>E-post</th>
                <th className={th}>Tilgang</th>
                <th className={th}>Status</th>
                <th className={cn(th, "pr-4 text-center")}>Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {invites.length ? <GroupRow label="Invitert" /> : null}
              {invites.map((r) =>
                r.kind === "invite" ? (
                  <tr key={r.id} className="border-t border-(--agenci-line) dark:border-white/5">
                    <td className={cn(td, "pl-4")}>
                      <input type="checkbox" disabled className={check} aria-label="Kan ikke velges" />
                    </td>
                    <td className={td}>
                      <span className="flex items-center gap-2.5 text-(--agenci-ink-3)">
                        <Avatar name={r.name} size={28} />
                        {r.name}
                      </span>
                    </td>
                    <td className={td}><RoleChip role={r.role} /></td>
                    <td className={td}>
                      <span className="flex items-center gap-1.5 text-(--agenci-ink)">
                        {r.email}
                        <CopyButton value={r.email} label={`Kopier ${r.email}`} />
                      </span>
                    </td>
                    <td className={td}><AccessChips role={r.role} /></td>
                    <td className={td}>
                      <span className="whitespace-nowrap rounded-[6px] bg-(--dash-subtle) px-2 py-0.5 text-[12px] text-(--agenci-ink-2)">
                        {daysLeft(r.expiresAt)}
                      </span>
                    </td>
                    <td className={cn(td, "pr-4 text-center")}>
                      {canManage ? (
                        <span className="inline-flex items-center gap-1">
                          <CopyButton value={inviteLink(r.id)} label="Kopier invitasjonslenken" />
                          <button
                            type="button"
                            disabled={busy === r.id}
                            onClick={() => void cancelInvite(r.id)}
                            className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[13px] font-medium text-(--agenci-ink) hover:bg-(--dash-subtle) disabled:opacity-40"
                          >
                            <XCircleIcon className="size-4" strokeWidth={1.7} />
                            Trekk tilbake
                          </button>
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ) : null,
              )}

              {members.length ? <GroupRow label="Medlemmer" /> : null}
              {members.map((r) =>
                r.kind === "member" ? (
                  <tr key={r.id} className="border-t border-(--agenci-line) dark:border-white/5">
                    <td className={cn(td, "pl-4")}>
                      <input
                        type="checkbox"
                        aria-label={`Velg ${r.name}`}
                        className={check}
                        disabled={!canManage || r.isMe}
                        checked={selected.has(r.id)}
                        onChange={() => toggle(r.id)}
                      />
                    </td>
                    <td className={td}>
                      <span className="flex items-center gap-2.5">
                        <Avatar name={r.name} image={r.image} />
                        <span className="truncate font-medium text-(--agenci-ink)">
                          {r.name}
                          {r.isMe ? <span className="ml-1 font-normal text-(--agenci-ink-3)">(deg)</span> : null}
                        </span>
                      </span>
                    </td>
                    <td className={td}><RoleChip role={r.role} /></td>
                    <td className={td}>
                      <span className="flex items-center gap-1.5 text-(--agenci-ink)">
                        {r.email}
                        <CopyButton value={r.email} label={`Kopier ${r.email}`} />
                      </span>
                    </td>
                    <td className={td}><AccessChips role={r.role} /></td>
                    <td className={td}>
                      <span className="rounded-[6px] bg-(--dash-good-bg) px-2 py-0.5 text-[12px] text-(--dash-good)">Aktiv</span>
                    </td>
                    <td className={cn(td, "pr-4 text-center")}>
                      <button
                        type="button"
                        onClick={() => setViewing(r)}
                        className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-(--dash-subtle) pr-2 pl-3.5 text-[13px] font-medium text-(--agenci-ink) transition-colors hover:bg-[#e8eae8] dark:bg-white/10"
                      >
                        Vis
                        <ChevronRightIcon className="size-4" strokeWidth={1.7} />
                      </button>
                    </td>
                  </tr>
                ) : null,
              )}

              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <p className="text-[14px] font-medium text-(--agenci-ink)">
                      {rows.length ? "Ingen treff" : "Ingen i teamet ennå"}
                    </p>
                    <p className="mt-1 text-[13px] text-(--agenci-ink-3)">
                      {rows.length ? "Prøv et annet søk eller filter." : "Legg til kollegaene dine, så kan dere dele på samtalene."}
                    </p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {/* Selection + pagination */}
      <footer className="flex flex-wrap items-center gap-3">
        {selected.size > 0 ? (
          <span className="text-[13px] text-(--agenci-ink-2)">
            {selected.size} valgt ·{" "}
            <button type="button" className="text-(--agenci-ink) underline underline-offset-4" onClick={() => setSelected(new Set())}>
              Fjern valg
            </button>
          </span>
        ) : null}
        <span className="mx-auto flex items-center gap-4 text-[13px] text-(--agenci-ink-2)">
          <span className="flex items-center gap-2">
            Side
            <span className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-(--agenci-line) bg-(--dash-surface) px-2.5 text-(--agenci-ink) tabular-nums dark:bg-transparent">
              {String(current).padStart(2, "0")}
              <ChevronDownIcon className="size-3.5 text-(--agenci-ink-3)" />
            </span>
            av {pages}
          </span>
          <span className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Forrige side"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
              className="flex size-8 items-center justify-center rounded-[8px] border border-(--agenci-line) bg-(--dash-surface) text-(--agenci-ink) disabled:opacity-40 dark:bg-transparent"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                aria-current={p === current ? "page" : undefined}
                onClick={() => setPage(p)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-[8px] text-[13px] tabular-nums",
                  p === current ? "border border-(--agenci-line) bg-(--dash-surface) font-medium text-(--agenci-ink) dark:bg-white/10" : "text-(--agenci-ink-2) hover:bg-(--dash-subtle)",
                )}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              aria-label="Neste side"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
              className="flex size-8 items-center justify-center rounded-[8px] border border-(--agenci-line) bg-(--dash-surface) text-(--agenci-ink) disabled:opacity-40 dark:bg-transparent"
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </span>
        </span>
      </footer>
    </div>
  );
}

function GroupRow({ label }: { label: string }) {
  return (
    <tr className="border-t border-(--agenci-line) dark:border-white/5">
      <td colSpan={7} className="h-9 bg-(--dash-subtle-2) px-4 text-[12.5px] font-medium text-(--agenci-ink-2) dark:bg-white/[0.03]">
        {label}
      </td>
    </tr>
  );
}
