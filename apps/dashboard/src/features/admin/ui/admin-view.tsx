import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import {
  ActivityIcon,
  ArrowLeftIcon,
  Building2Icon,
  CreditCardIcon,
  DatabaseIcon,
  KeyRoundIcon,
  LogOutIcon,
  ScrollTextIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  MessageCircleIcon,
  SearchIcon,
  ShieldCheckIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { AgenciLoader } from "@/components/agenci-loader";
import { client } from "@/lib/api";
import {
  useAdminAccess,
  useAdminOrganization,
  useAdminOrganizations,
  useAdminOverview,
  useAdminUsers,
  useExtendTrial,
  useAdminAudit,
  useRevokeSessions,
  useSendPasswordReset,
  useSetEmailVerified,
} from "../admin-queries";

export type AdminTab = "overview" | "activity" | "organizations" | "users" | "database" | "audit";

const TABS: { id: AdminTab; label: string; icon: typeof ActivityIcon }[] = [
  { id: "overview", label: "Oversikt", icon: LayoutDashboardIcon },
  { id: "activity", label: "Aktivitet", icon: ActivityIcon },
  { id: "organizations", label: "Bedrifter", icon: Building2Icon },
  { id: "users", label: "Brukere", icon: UsersIcon },
  { id: "database", label: "Database", icon: DatabaseIcon },
  { id: "audit", label: "Logg", icon: ScrollTextIcon },
];

const card =
  "rounded-[20px] border border-(--dash-edge)/80 bg-(--dash-surface) shadow-[0_1px_3px_rgb(5_6_7/0.06),0_14px_34px_-16px_rgb(5_6_7/0.16)] dark:border-white/5 dark:bg-(--card)";
const num = (n: number) => new Intl.NumberFormat("nb-NO").format(n);
const kr = (ore: number) => `${num(Math.round(ore / 100))} kr`;
const when = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleString("nb-NO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "–";
const day = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" }) : "–";
function ago(d: string | Date) {
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "nå";
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86_400) return `${Math.floor(s / 3600)} t`;
  return `${Math.floor(s / 86_400)} d`;
}

const STATUS_TONE: Record<string, string> = {
  developer: "bg-[#eef1fb] text-[#3949ab]",
  trialing: "bg-[#fdf3e6] text-[#a35d17]",
  active: "bg-[#e9f4ec] text-[#2f6b3c]",
  past_due: "bg-[#fbeceb] text-[#b23a2e]",
  trial_ended: "bg-(--dash-subtle) text-(--agenci-ink-2)",
  canceled: "bg-(--dash-subtle) text-(--agenci-ink-2)",
  needs_registration: "bg-(--dash-subtle) text-(--agenci-ink-3)",
};
const STATUS_LABEL: Record<string, string> = {
  developer: "Utvikler",
  trialing: "Prøveperiode",
  active: "Betaler",
  past_due: "Betaling feilet",
  trial_ended: "Prøve utløpt",
  canceled: "Sagt opp",
  needs_registration: "Ikke registrert",
};

function Badge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap", STATUS_TONE[status] ?? "bg-(--dash-subtle) text-(--agenci-ink-2)")}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function Loading() {
  return (
    <div className="flex h-60 items-center justify-center">
      <AgenciLoader size={36} decorative />
    </div>
  );
}

function Stat({ label, value, hint, icon: Icon }: { label: string; value: ReactNode; hint?: ReactNode; icon: typeof ActivityIcon }) {
  return (
    <div className={cn(card, "p-5")}>
      <p className="flex items-center gap-2 text-[12.5px] text-(--agenci-ink-3)">
        <Icon className="size-3.5" strokeWidth={1.8} /> {label}
      </p>
      <p className="mt-2 [font-family:var(--font-agenci-title)] text-[30px] leading-none font-medium tracking-[-0.03em] text-(--agenci-ink) tabular-nums">
        {value}
      </p>
      {hint ? <p className="mt-2 text-[12.5px] text-(--agenci-ink-3)">{hint}</p> : null}
    </div>
  );
}

/* ── Oversikt ─────────────────────────────────────────────────────── */

function OverviewTab({ openOrg }: { openOrg: (id: string) => void }) {
  const { data: o } = useAdminOverview();
  if (!o) return <Loading />;
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={CreditCardIcon} label="Inntekt per måned (MRR)" value={kr(o.mrr)} hint={`${o.paying} betalende · ${o.pastDue} med feilet betaling`} />
        <Stat icon={Building2Icon} label="Bedrifter" value={num(o.orgs)} hint={`${o.trials} i prøveperiode · ${o.trialsEnding} slutter innen 7 dager`} />
        <Stat icon={UsersIcon} label="Brukere" value={num(o.users)} hint={`${o.usersWeek} nye siste 7 dager`} />
        <Stat icon={MessageCircleIcon} label="Samtaler" value={num(o.conversations)} hint={`${o.conversationsDay} siste døgn · ${o.conversationsWeek} siste 7 dager`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={ShieldCheckIcon} label="Agenter" value={num(o.agents)} hint={o.agentsFailed ? `${o.agentsFailed} feilet` : "Ingen feilet"} />
        <Stat icon={UserIcon} label="Sendt til et menneske" value={num(o.escalated)} hint="Samtaler som venter på teamet" />
        <Stat icon={ActivityIcon} label="AI-meldinger denne måneden" value={num(o.usage.messages)} hint={`${num(o.usage.inputTokens + o.usage.outputTokens)} tokens`} />
        <Stat icon={CreditCardIcon} label="Feilede betalinger" value={num(o.failedPayments)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className={cn(card, "overflow-hidden")}>
          <h2 className="px-5 pt-5 pb-3 text-[14.5px] font-semibold text-(--agenci-ink)">Siste samtaler</h2>
          <ul className="divide-y divide-(--agenci-line)">
            {o.recentConversations.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => openOrg(c.organization.id)} className="flex w-full items-start gap-3 px-5 py-3 text-left hover:bg-(--dash-subtle-2)">
                  <MessageCircleIcon className="mt-0.5 size-4 shrink-0 text-(--agenci-ink-3)" strokeWidth={1.7} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] text-(--agenci-ink)">{c.firstMessage || "(ingen melding)"}</span>
                    <span className="block truncate text-[12px] text-(--agenci-ink-3)">
                      {c.organization.name} · {c.agent.name} · {c.messageCount} meldinger
                    </span>
                  </span>
                  <span className="shrink-0 text-[12px] text-(--agenci-ink-3) tabular-nums">{ago(c.lastMessageAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section className={cn(card, "overflow-hidden")}>
          <h2 className="px-5 pt-5 pb-3 text-[14.5px] font-semibold text-(--agenci-ink)">Nye brukere</h2>
          <ul className="divide-y divide-(--agenci-line)">
            {o.recentUsers.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                <UserIcon className="size-4 shrink-0 text-(--agenci-ink-3)" strokeWidth={1.7} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] text-(--agenci-ink)">{u.name || u.email}</span>
                  <span className="block truncate text-[12px] text-(--agenci-ink-3)">{u.email}</span>
                </span>
                <span className="shrink-0 text-[12px] text-(--agenci-ink-3)">{day(u.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/* ── Aktivitet (live) ─────────────────────────────────────────────── */

const KIND_ICON = {
  user: UserIcon,
  organization: Building2Icon,
  agent: ShieldCheckIcon,
  conversation: MessageCircleIcon,
  message: MessageCircleIcon,
  document: FileTextIcon,
  payment: CreditCardIcon,
} as const;

function ActivityTab({ openOrg }: { openOrg: (id: string) => void }) {
  const { data, dataUpdatedAt } = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: () => client.admin.activity(),
    refetchInterval: 5_000,
  });
  if (!data) return <Loading />;
  return (
    <section className={cn(card, "overflow-hidden")}>
      <div className="flex items-center gap-2 px-5 pt-5 pb-3">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#5FA06F] opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-[#5FA06F]" />
        </span>
        <h2 className="flex-1 text-[14.5px] font-semibold text-(--agenci-ink)">Live</h2>
        <span className="text-[12px] text-(--agenci-ink-3)">Oppdateres hvert 5. sekund · sist {when(new Date(dataUpdatedAt))}</span>
      </div>
      <ol className="divide-y divide-(--agenci-line)">
        {data.map((e) => {
          const Icon = KIND_ICON[e.kind];
          return (
            <li key={e.id}>
              <button
                type="button"
                disabled={!e.organizationId}
                onClick={() => e.organizationId && openOrg(e.organizationId)}
                className="flex w-full items-start gap-3 px-5 py-3 text-left enabled:hover:bg-(--dash-subtle-2)"
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-(--dash-subtle) text-(--agenci-ink-2) dark:bg-white/5">
                  <Icon className="size-3.5" strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium text-(--agenci-ink)">{e.title}</span>
                  {e.detail ? <span className="block truncate text-[12.5px] text-(--agenci-ink-3)">{e.detail}</span> : null}
                </span>
                <span className="shrink-0 text-[12px] text-(--agenci-ink-3) tabular-nums" title={when(e.at)}>
                  {ago(e.at)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ── Bedrifter ────────────────────────────────────────────────────── */

function OrganizationsTab({ openOrg }: { openOrg: (id: string) => void }) {
  const { data } = useAdminOrganizations();
  const [q, setQ] = useState("");
  if (!data) return <Loading />;
  const rows = data.filter((o) =>
    `${o.name} ${o.slug} ${o.billingAccount?.orgNumber ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <section className={cn(card, "overflow-hidden")}>
      <Toolbar count={rows.length} noun="bedrifter" q={q} setQ={setQ} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-[13.5px]">
          <thead className="bg-(--dash-subtle-2) text-left text-[12px] text-(--agenci-ink-2) dark:bg-white/5">
            <tr>
              <th className="h-10 px-5 font-medium">Bedrift</th>
              <th className="px-3 font-medium">Org.nr.</th>
              <th className="px-3 font-medium">Status</th>
              <th className="px-3 font-medium">Plan</th>
              <th className="px-3 text-right font-medium">Medlemmer</th>
              <th className="px-3 text-right font-medium">Agenter</th>
              <th className="px-3 text-right font-medium">Samtaler</th>
              <th className="px-5 font-medium">Opprettet</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} onClick={() => openOrg(o.id)} className="cursor-pointer border-t border-(--agenci-line) hover:bg-(--dash-subtle-2) dark:border-white/5">
                <td className="h-12 px-5">
                  <span className="block font-medium text-(--agenci-ink)">{o.name}</span>
                  <span className="block text-[12px] text-(--agenci-ink-3)">{o.slug}</span>
                </td>
                <td className="px-3 text-(--agenci-ink-2) tabular-nums">{o.billingAccount?.orgNumber ?? "–"}</td>
                <td className="px-3"><Badge status={o.billingStatus} /></td>
                <td className="px-3 text-(--agenci-ink-2)">
                  {o.plan ?? "–"}
                  {o.subscription?.interval === "year" ? " · årlig" : ""}
                </td>
                <td className="px-3 text-right tabular-nums">{o._count.members}</td>
                <td className="px-3 text-right tabular-nums">{o._count.agents}</td>
                <td className="px-3 text-right tabular-nums">{o._count.conversations}</td>
                <td className="px-5 text-(--agenci-ink-2)">{day(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Toolbar({ count, noun, q, setQ }: { count: number; noun: string; q: string; setQ: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 px-5 pt-5 pb-4">
      <p className="flex-1 text-[14.5px] font-semibold text-(--agenci-ink)">
        {num(count)} {noun}
      </p>
      <label className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-(--agenci-ink-3)" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Søk"
          className="h-9 w-56 rounded-full border border-(--agenci-line) bg-transparent pr-3 pl-8 text-[13px] text-(--agenci-ink) outline-none focus:border-(--agenci-ink-3)"
        />
      </label>
    </div>
  );
}

/* ── Brukere ──────────────────────────────────────────────────────── */

function UsersTab({ openOrg }: { openOrg: (id: string) => void }) {
  const { data } = useAdminUsers();
  const verify = useSetEmailVerified();
  const reset = useSendPasswordReset();
  const revoke = useRevokeSessions();
  const [q, setQ] = useState("");
  if (!data) return <Loading />;
  const rows = data.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <section className={cn(card, "overflow-hidden")}>
      <Toolbar count={rows.length} noun="brukere" q={q} setQ={setQ} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-[13.5px]">
          <thead className="bg-(--dash-subtle-2) text-left text-[12px] text-(--agenci-ink-2) dark:bg-white/5">
            <tr>
              <th className="h-10 px-5 font-medium">Bruker</th>
              <th className="px-3 font-medium">Organisasjoner</th>
              <th className="px-3 font-medium">E-post bekreftet</th>
              <th className="px-3 font-medium">2FA</th>
              <th className="px-3 font-medium">Sist aktiv</th>
              <th className="px-3 font-medium">Registrert</th>
              <th className="px-5 font-medium">
                <span className="sr-only">Handlinger</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-(--agenci-line) dark:border-white/5">
                <td className="h-12 px-5">
                  <span className="flex items-center gap-2 font-medium text-(--agenci-ink)">
                    {u.name || "–"}
                    {u.developer ? <Badge status="developer" /> : null}
                  </span>
                  <span className="block text-[12px] text-(--agenci-ink-3)">{u.email}</span>
                </td>
                <td className="px-3">
                  <span className="flex flex-wrap gap-1">
                    {u.members.length
                      ? u.members.map((m) => (
                          <button
                            key={m.organization.id}
                            type="button"
                            onClick={() => openOrg(m.organization.id)}
                            className="rounded-full bg-(--dash-subtle) px-2 py-0.5 text-[12px] text-(--agenci-ink-2) hover:text-(--agenci-ink) dark:bg-white/5"
                          >
                            {m.organization.name} · {m.role}
                          </button>
                        ))
                      : <span className="text-(--agenci-ink-3)">Ingen</span>}
                  </span>
                </td>
                <td className="px-3">
                  <button
                    type="button"
                    disabled={verify.isPending}
                    onClick={() => {
                      const q = u.emailVerified
                        ? `Fjerne bekreftelsen for ${u.email}? Utviklere mister da tilgangen.`
                        : `Markere ${u.email} som bekreftet? Gjør dette bare når du vet at kontoen tilhører riktig person.`;
                      if (window.confirm(q)) verify.mutate({ userId: u.id, verified: !u.emailVerified });
                    }}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors",
                      u.emailVerified ? "bg-[#e9f4ec] text-[#2f6b3c]" : "bg-(--dash-subtle) text-(--agenci-ink-2) hover:text-(--agenci-ink)",
                    )}
                    title={u.emailVerified ? "Trykk for å fjerne" : "Trykk for å markere som bekreftet"}
                  >
                    {u.emailVerified ? "Bekreftet" : "Ikke bekreftet"}
                  </button>
                </td>
                <td className="px-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-[12px]", u.twoFactorEnabled ? "bg-[#e9f4ec] text-[#2f6b3c]" : "text-(--agenci-ink-3)")}>
                    {u.twoFactorEnabled ? "På" : "Av"}
                  </span>
                </td>
                <td className="px-3 text-(--agenci-ink-2)">{u.lastSeenAt ? `${ago(u.lastSeenAt)} siden` : "–"}</td>
                <td className="px-3 text-(--agenci-ink-2)">{day(u.createdAt)}</td>
                <td className="px-5">
                  <span className="flex justify-end gap-1">
                    <button
                      type="button"
                      title="Send lenke for nytt passord på e-post"
                      disabled={reset.isPending}
                      onClick={() => {
                        if (window.confirm(`Sende e-post med lenke for nytt passord til ${u.email}?`)) reset.mutate({ userId: u.id });
                      }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-(--agenci-line) px-2.5 text-[12px] text-(--agenci-ink-2) hover:text-(--agenci-ink)"
                    >
                      <KeyRoundIcon className="size-3.5" /> Nytt passord
                    </button>
                    <button
                      type="button"
                      title="Logg ut på alle enheter"
                      disabled={revoke.isPending}
                      onClick={() => {
                        if (window.confirm(`Logge ut ${u.email} på alle enheter?`)) revoke.mutate({ userId: u.id });
                      }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-(--agenci-line) px-2.5 text-[12px] text-(--agenci-ink-2) hover:text-(--agenci-ink)"
                    >
                      <LogOutIcon className="size-3.5" /> Logg ut
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ── Database ─────────────────────────────────────────────────────── */

function DatabaseTab() {
  const tables = useQuery({ queryKey: ["admin", "tables"], queryFn: () => client.admin.tables() });
  const [table, setTable] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const rows = useQuery({
    queryKey: ["admin", "rows", table, page, q],
    queryFn: () => client.admin.rows({ table: table as string, page, search: q || undefined }),
    enabled: Boolean(table),
    refetchInterval: 10_000,
  });
  const [open, setOpen] = useState<Record<string, string | null> | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className={cn(card, "h-fit overflow-hidden")}>
        <p className="px-4 pt-4 pb-2 text-[12px] font-medium tracking-[0.06em] text-(--agenci-ink-3) uppercase">Tabeller</p>
        {!tables.data ? (
          <Loading />
        ) : (
          <ul className="max-h-[70vh] overflow-y-auto pb-2">
            {tables.data.map((t) => (
              <li key={t.table}>
                <button
                  type="button"
                  onClick={() => {
                    setTable(t.table);
                    setPage(0);
                    setSearch("");
                    setQ("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-1.5 text-left text-[13px] transition-colors",
                    table === t.table ? "bg-(--dash-subtle) font-medium text-(--agenci-ink) dark:bg-white/5" : "text-(--agenci-ink-2) hover:bg-(--dash-subtle-2)",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{t.table}</span>
                  <span className="shrink-0 text-[11.5px] text-(--agenci-ink-3) tabular-nums">{num(t.rows)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className={cn(card, "min-w-0 overflow-hidden")}>
        {!table ? (
          <p className="p-10 text-center text-[14px] text-(--agenci-ink-3)">Velg en tabell til venstre for å se innholdet.</p>
        ) : (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(0);
                setQ(search);
              }}
              className="flex flex-wrap items-center gap-3 px-5 pt-5 pb-4"
            >
              <p className="flex-1 font-mono text-[14px] font-semibold text-(--agenci-ink)">{table}</p>
              <label className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-(--agenci-ink-3)" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Søk i alle kolonner, trykk Enter"
                  className="h-9 w-72 rounded-full border border-(--agenci-line) bg-transparent pr-3 pl-8 text-[13px] text-(--agenci-ink) outline-none focus:border-(--agenci-ink-3)"
                />
              </label>
            </form>
            {!rows.data ? (
              <Loading />
            ) : rows.data.rows.length === 0 ? (
              <p className="border-t border-(--agenci-line) p-10 text-center text-[14px] text-(--agenci-ink-3)">Ingen rader.</p>
            ) : (
              <div className="overflow-x-auto border-t border-(--agenci-line)">
                <table className="w-max min-w-full border-collapse text-[12.5px]">
                  <thead className="bg-(--dash-subtle-2) text-left dark:bg-white/5">
                    <tr>
                      {rows.data.columns.map((c) => (
                        <th key={c.name} className="h-9 px-3 font-medium whitespace-nowrap text-(--agenci-ink-2)">
                          {c.name}
                          <span className="ml-1 font-normal text-(--agenci-ink-3)">{c.secret ? "skjult" : c.type}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {rows.data.rows.map((r, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: rows have no common id column
                      <tr key={i} onClick={() => setOpen(r)} className="cursor-pointer border-t border-(--agenci-line) hover:bg-(--dash-subtle-2) dark:border-white/5">
                        {rows.data.columns.map((c) => (
                          <td key={c.name} className="max-w-[280px] truncate px-3 py-2 text-(--agenci-ink)">
                            {r[c.name] ?? <span className="text-(--agenci-ink-3)">null</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-(--agenci-line) px-5 py-3 text-[12.5px] text-(--agenci-ink-3)">
              <span>Side {page + 1} · 50 rader per side · oppdateres hvert 10. sekund</span>
              <span className="flex gap-2">
                <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-full border border-(--agenci-line) px-3 py-1 disabled:opacity-40">
                  Forrige
                </button>
                <button type="button" disabled={!rows.data?.hasMore} onClick={() => setPage((p) => p + 1)} className="rounded-full border border-(--agenci-line) px-3 py-1 disabled:opacity-40">
                  Neste
                </button>
              </span>
            </div>
          </>
        )}
      </section>

      {open ? (
        <Drawer title={`Rad i ${table}`} onClose={() => setOpen(null)}>
          <dl className="divide-y divide-(--agenci-line)">
            {Object.entries(open).map(([k, v]) => (
              <div key={k} className="px-6 py-3">
                <dt className="text-[12px] text-(--agenci-ink-3)">{k}</dt>
                <dd className="mt-1 font-mono text-[12.5px] break-all whitespace-pre-wrap text-(--agenci-ink)">{v ?? "null"}</dd>
              </div>
            ))}
          </dl>
        </Drawer>
      ) : null}
    </div>
  );
}

/* ── Logg ─────────────────────────────────────────────────────────── */

const ACTION_LABEL: Record<string, string> = {
  view_organization: "Åpnet bedrift",
  view_table: "Så på tabell",
  extend_trial: "Forlenget prøveperiode",
  verify_user: "Bekreftet bruker",
  unverify_user: "Fjernet bekreftelse",
  send_password_reset: "Sendte lenke for nytt passord",
  revoke_sessions: "Logget ut bruker overalt",
};

function AuditTab() {
  const { data } = useAdminAudit();
  if (!data) return <Loading />;
  return (
    <section className={cn(card, "overflow-hidden")}>
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-[14.5px] font-semibold text-(--agenci-ink)">Logg over alt som gjøres i admin</h2>
        <p className="mt-1 text-[12.5px] text-(--agenci-ink-3)">Hvem, hva, på hvem og når. Kan ikke endres eller slettes herfra.</p>
      </div>
      {data.length === 0 ? (
        <p className="border-t border-(--agenci-line) p-10 text-center text-[14px] text-(--agenci-ink-3)">Ingenting logget ennå.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-[13px]">
            <thead className="bg-(--dash-subtle-2) text-left text-[12px] text-(--agenci-ink-2) dark:bg-white/5">
              <tr>
                <th className="h-10 px-5 font-medium">Når</th>
                <th className="px-3 font-medium">Hvem</th>
                <th className="px-3 font-medium">Hva</th>
                <th className="px-3 font-medium">Mål</th>
                <th className="px-5 font-medium">Detaljer</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id} className="border-t border-(--agenci-line) dark:border-white/5">
                  <td className="h-11 px-5 whitespace-nowrap text-(--agenci-ink-2)">{when(a.createdAt)}</td>
                  <td className="px-3">{a.actorEmail}</td>
                  <td className="px-3 font-medium">{ACTION_LABEL[a.action] ?? a.action}</td>
                  <td className="max-w-[200px] truncate px-3 font-mono text-[12px] text-(--agenci-ink-2)">{a.target ?? "–"}</td>
                  <td className="max-w-[320px] truncate px-5 font-mono text-[12px] text-(--agenci-ink-3)">{a.details === "{}" ? "" : a.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ── Org detail (drawer) ──────────────────────────────────────────── */

function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/25" onClick={onClose} onKeyDown={(e) => e.key === "Escape" && onClose()} role="presentation">
      <div
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={() => {}}
        className="flex h-full w-full max-w-[640px] flex-col bg-(--dash-surface) shadow-2xl dark:bg-(--card)"
      >
        <div className="flex items-center gap-3 border-b border-(--agenci-line) px-6 py-4">
          <h2 className="flex-1 truncate text-[16px] font-semibold text-(--agenci-ink)">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Lukk" className="rounded-full p-1.5 hover:bg-(--dash-subtle)">
            <XIcon className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function OrgDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: o } = useAdminOrganization(id);
  const extend = useExtendTrial();
  const [days, setDays] = useState(14);
  const section = "px-6 py-5 border-b border-(--agenci-line)";
  const h = "mb-3 text-[12px] font-medium tracking-[0.06em] text-(--agenci-ink-3) uppercase";
  return (
    <Drawer title={o?.name ?? "Bedrift"} onClose={onClose}>
      {!o ? (
        <Loading />
      ) : (
        <>
          <div className={section}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge status={o.billing.status} />
              {o.billing.plan ? <span className="text-[13px] text-(--agenci-ink-2)">Plan: {o.billing.plan}{o.billing.interval === "year" ? " (årlig)" : ""}</span> : null}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
              <dt className="text-(--agenci-ink-3)">Org.nr.</dt>
              <dd className="tabular-nums">{o.billingAccount?.orgNumber ?? "–"}</dd>
              <dt className="text-(--agenci-ink-3)">Selskap</dt>
              <dd>{o.billingAccount?.companyName ?? "–"}</dd>
              <dt className="text-(--agenci-ink-3)">Opprettet</dt>
              <dd>{day(o.createdAt)}</dd>
              <dt className="text-(--agenci-ink-3)">Prøveperiode til</dt>
              <dd>{day(o.billing.trialEndsAt)}</dd>
              <dt className="text-(--agenci-ink-3)">Betalt til</dt>
              <dd>{day(o.billing.currentPeriodEnd)}</dd>
              <dt className="text-(--agenci-ink-3)">ID</dt>
              <dd className="truncate font-mono text-[12px]">{o.id}</dd>
            </dl>
            {o.billingAccount ? (
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="h-9 w-20 rounded-full border border-(--agenci-line) bg-transparent px-3 text-[13px]"
                />
                <button
                  type="button"
                  disabled={extend.isPending || days < 1}
                  onClick={() => extend.mutate({ organizationId: o.id, days })}
                  className="h-9 rounded-full bg-(--agenci-ink) px-4 text-[13px] font-medium text-white disabled:opacity-50 dark:text-[#0b0c0e]"
                >
                  Forleng prøveperioden med {days} dager
                </button>
              </div>
            ) : null}
          </div>

          <div className={section}>
            <p className={h}>Medlemmer ({o.members.length})</p>
            <ul className="space-y-2 text-[13.5px]">
              {o.members.map((m) => (
                <li key={m.id} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate">{m.user.name || m.user.email} <span className="text-(--agenci-ink-3)">· {m.user.email}</span></span>
                  <span className="rounded-full bg-(--dash-subtle) px-2 py-0.5 text-[11.5px] text-(--agenci-ink-2)">{m.role}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={section}>
            <p className={h}>Agenter ({o.agents.length})</p>
            <ul className="space-y-2 text-[13.5px]">
              {o.agents.map((a) => (
                <li key={a.id} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{a.name}</span>
                    <span className="block truncate font-mono text-[11.5px] text-(--agenci-ink-3)">{a.id} · {a.widgetBrand?.sourceUrl ?? "ingen nettside"}</span>
                  </span>
                  <span className="text-[12px] text-(--agenci-ink-3)">{a._count.documents} kilder · {a._count.conversations} samtaler</span>
                  <span className="rounded-full bg-(--dash-subtle) px-2 py-0.5 text-[11.5px] text-(--agenci-ink-2)">{a.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={section}>
            <p className={h}>Bruk per måned</p>
            {o.usageMonthly.length ? (
              <table className="w-full text-[13px]">
                <tbody>
                  {o.usageMonthly.map((u) => (
                    <tr key={u.id} className="border-t border-(--agenci-line) first:border-0">
                      <td className="py-1.5">{u.period}</td>
                      <td className="py-1.5 text-right tabular-nums">{num(u.messages)} meldinger</td>
                      <td className="py-1.5 text-right text-(--agenci-ink-3) tabular-nums">{num(u.inputTokens + u.outputTokens)} tokens</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-[13px] text-(--agenci-ink-3)">Ingen bruk ennå.</p>
            )}
          </div>

          <div className={section}>
            <p className={h}>Betalinger ({o.billingPayments.length})</p>
            {o.billingPayments.length ? (
              <ul className="space-y-1.5 text-[13px]">
                {o.billingPayments.map((p) => (
                  <li key={p.id} className="flex gap-3">
                    <span className="w-20 tabular-nums">AG-{1000 + p.invoiceNumber}</span>
                    <span className="flex-1 text-(--agenci-ink-2)">{p.plan}{p.interval === "year" ? " · årlig" : ""} · {day(p.createdAt)}</span>
                    <span className="tabular-nums">{kr(p.amount)}</span>
                    <span className="w-14 text-right text-(--agenci-ink-3)">{p.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-(--agenci-ink-3)">Ingen betalinger.</p>
            )}
          </div>

          <div className="px-6 py-5">
            <p className={h}>Siste samtaler</p>
            <ul className="space-y-2 text-[13px]">
              {o.conversations.map((c) => (
                <li key={c.id} className="flex gap-3">
                  <span className="min-w-0 flex-1 truncate">{c.firstMessage || "(ingen melding)"}</span>
                  <span className="shrink-0 text-(--agenci-ink-3)">{c.agent.name} · {c.messageCount} · {c.status} · {ago(c.lastMessageAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default function AdminView({ tab, org }: { tab: AdminTab; org?: string }) {
  const navigate = useNavigate();
  const access = useAdminAccess();
  const setSearch = (next: { tab?: AdminTab; org?: string }) =>
    void navigate({
      to: "/admin",
      search: { tab: next.tab ?? tab, org: "org" in next ? next.org : org },
    });
  const openOrg = (id: string) => setSearch({ org: id });

  if (access.isPending) return <Loading />;
  // One of us, but without 2FA: say how to get in.
  if (access.data?.needsTwoFactor) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-(--dash-bg) px-4">
        <div className={cn(card, "max-w-md p-8 text-center")}>
          <ShieldCheckIcon className="mx-auto size-8 text-(--agenci-ink)" strokeWidth={1.6} />
          <h1 className="mt-4 text-[20px] font-semibold text-(--agenci-ink)">Slå på to-trinns innlogging</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-(--agenci-ink-2)">
            Adminsiden gir tilgang til alle kundene. Derfor krever den to-trinns innlogging. Slå det på under
            Innstillinger → Sikkerhet, og kom tilbake hit.
          </p>
          <Link to="/" className="mt-6 inline-flex h-10 items-center rounded-full bg-(--agenci-ink) px-5 text-[14px] font-medium text-white dark:text-[#0b0c0e]">
            Til dashbordet
          </Link>
        </div>
      </div>
    );
  }
  // Not one of us: show nothing that hints at an admin area.
  if (!access.data?.admin) {
    return (
      <div className="flex min-h-svh items-center justify-center text-[14px] text-(--agenci-ink-3)">Siden finnes ikke.</div>
    );
  }

  return (
    <div className="min-h-svh bg-(--dash-bg)">
      <header className="sticky top-0 z-40 border-b border-(--agenci-line) bg-(--dash-surface)/90 backdrop-blur dark:bg-(--card)/90">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-6 py-3">
          <Link to="/" className="inline-flex h-9 items-center gap-1.5 rounded-full pr-3 pl-2 text-[13px] font-medium text-(--agenci-ink-2) hover:bg-(--dash-subtle) hover:text-(--agenci-ink)">
            <ArrowLeftIcon className="size-4" /> Dashbordet
          </Link>
          <p className="flex items-center gap-2 text-[15px] font-semibold text-(--agenci-ink)">
            <ShieldCheckIcon className="size-4" strokeWidth={1.8} /> Agenci admin
          </p>
          <nav className="ml-auto flex flex-wrap gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSearch({ tab: t.id })}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors",
                  tab === t.id ? "bg-(--agenci-ink) text-white dark:text-[#0b0c0e]" : "text-(--agenci-ink-2) hover:bg-(--dash-subtle) hover:text-(--agenci-ink)",
                )}
              >
                <t.icon className="size-3.5" strokeWidth={1.8} />
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-6 py-6">
        {tab === "overview" ? <OverviewTab openOrg={openOrg} /> : null}
        {tab === "activity" ? <ActivityTab openOrg={openOrg} /> : null}
        {tab === "organizations" ? <OrganizationsTab openOrg={openOrg} /> : null}
        {tab === "users" ? <UsersTab openOrg={openOrg} /> : null}
        {tab === "database" ? <DatabaseTab /> : null}
        {tab === "audit" ? <AuditTab /> : null}
      </main>
      {org ? <OrgDrawer id={org} onClose={() => setSearch({ org: undefined })} /> : null}
    </div>
  );
}
