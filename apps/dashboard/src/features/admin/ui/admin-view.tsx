import { Link } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import {
  ActivityIcon,
  ArrowLeftIcon,
  BarChart3Icon,
  BotIcon,
  Building2Icon,
  CreditCardIcon,
  DatabaseIcon,
  LayoutDashboardIcon,
  MessagesSquareIcon,
  ScrollTextIcon,
  SearchIcon,
  ServerIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { adminApi, useAdmin, useAdminAccess } from "../admin-queries";
import { type AdminTab, useAdminNav } from "./nav";
import { AgentsPage, ConversationsPage, TranscriptDrawer } from "./pages-conversations";
import { BillingPage, UsagePage } from "./pages-money";
import { OrganizationsPage } from "./pages-orgs";
import { ActivityPage, OverviewPage } from "./pages-overview";
import { UserDrawer, UsersPage } from "./pages-people";
import { AuditPage, DatabasePage, SystemPage } from "./pages-system";
import { cardCls, Loading } from "./parts";

const NAV: { group: string; items: { id: AdminTab; label: string; icon: typeof ActivityIcon }[] }[] = [
  {
    group: "Overvåking",
    items: [
      { id: "overview", label: "Oversikt", icon: LayoutDashboardIcon },
      { id: "activity", label: "Live", icon: ActivityIcon },
    ],
  },
  {
    group: "Kunder",
    items: [
      { id: "organizations", label: "Bedrifter", icon: Building2Icon },
      { id: "users", label: "Brukere", icon: UsersIcon },
      { id: "conversations", label: "Samtaler", icon: MessagesSquareIcon },
      { id: "agents", label: "Agenter", icon: BotIcon },
    ],
  },
  {
    group: "Penger",
    items: [
      { id: "billing", label: "Betaling", icon: CreditCardIcon },
      { id: "usage", label: "Bruk og kostnad", icon: BarChart3Icon },
    ],
  },
  {
    group: "Plattform",
    items: [
      { id: "system", label: "System", icon: ServerIcon },
      { id: "database", label: "Database", icon: DatabaseIcon },
      { id: "audit", label: "Logg", icon: ScrollTextIcon },
    ],
  },
];

/** ⌘K: jump to any organization or user. */
function QuickSearch() {
  const nav = useAdminNav();
  const orgs = useAdmin(["organizations"], () => adminApi.organizations());
  const users = useAdmin(["users"], () => adminApi.users());
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const o = (orgs.data ?? [])
      .filter((x) => `${x.name} ${x.slug} ${x.billingAccount?.orgNumber ?? ""}`.toLowerCase().includes(s))
      .slice(0, 6)
      .map((x) => ({ key: `o${x.id}`, label: x.name, sub: x.billingAccount?.orgNumber ? `Bedrift · org.nr. ${x.billingAccount.orgNumber}` : "Bedrift", go: () => nav.openOrg(x.id) }));
    const u = (users.data ?? [])
      .filter((x) => `${x.name} ${x.email}`.toLowerCase().includes(s))
      .slice(0, 6)
      .map((x) => ({ key: `u${x.id}`, label: x.name || x.email, sub: `Bruker · ${x.email}`, go: () => nav.openUser(x.id) }));
    return [...o, ...u];
  }, [q, orgs.data, users.data, nav]);

  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-(--agenci-ink-3)" />
      <input
        ref={input}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Søk bedrift eller bruker"
        className="h-9 w-full rounded-[10px] border border-(--agenci-line) bg-(--dash-surface) pr-10 pl-8 text-[13px] outline-none focus:border-(--agenci-ink-3) dark:bg-transparent"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-(--agenci-line) px-1 text-[10.5px] text-(--agenci-ink-3)">⌘K</kbd>
      {open && results.length ? (
        <ul className={cn(cardCls, "absolute top-11 right-0 left-0 z-50 max-h-80 overflow-y-auto py-1")}>
          {results.map((r) => (
            <li key={r.key}>
              <button
                type="button"
                onMouseDown={() => {
                  r.go();
                  setQ("");
                }}
                className="block w-full px-3 py-2 text-left hover:bg-(--dash-subtle-2)"
              >
                <span className="block truncate text-[13px] font-medium text-(--agenci-ink)">{r.label}</span>
                <span className="block truncate text-[11.5px] text-(--agenci-ink-3)">{r.sub}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function AdminView() {
  const nav = useAdminNav();
  const access = useAdminAccess();
  const { data: session } = authClient.useSession();
  const { tab, user, conv } = nav.search;

  if (access.isPending) return <Loading h={400} />;
  if (access.data?.needsTwoFactor) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-(--dash-bg) px-4">
        <div className={cn(cardCls, "max-w-md p-8 text-center")}>
          <ShieldCheckIcon className="mx-auto size-8 text-(--agenci-ink)" strokeWidth={1.6} />
          <h1 className="mt-4 text-[20px] font-semibold text-(--agenci-ink)">Slå på to-trinns innlogging</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-(--agenci-ink-2)">
            Adminsiden gir tilgang til alle kundene, derfor krever den to-trinns innlogging. Slå det på under Innstillinger → Sikkerhet.
          </p>
          <Link to="/" className="mt-6 inline-flex h-10 items-center rounded-full bg-(--agenci-ink) px-5 text-[14px] font-medium text-white dark:text-[#0b0c0e]">
            Til dashbordet
          </Link>
        </div>
      </div>
    );
  }
  // Not one of us: nothing that hints at an admin area.
  if (!access.data?.admin) {
    return <div className="flex min-h-svh items-center justify-center text-[14px] text-(--agenci-ink-3)">Siden finnes ikke.</div>;
  }

  return (
    <div className="min-h-svh bg-(--dash-bg) lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b border-(--agenci-line) bg-(--dash-surface) lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:border-r lg:border-b-0 dark:bg-(--card)">
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
          <span className="flex size-8 items-center justify-center rounded-[10px] bg-(--agenci-ink) text-white dark:text-[#0b0c0e]">
            <ShieldCheckIcon className="size-4" strokeWidth={1.8} />
          </span>
          <span className="min-w-0">
            <span className="block text-[14px] leading-tight font-semibold text-(--agenci-ink)">Agenci admin</span>
            <span className="block truncate text-[11.5px] text-(--agenci-ink-3)">{session?.user.email}</span>
          </span>
        </div>
        <div className="px-3 pb-3">
          <QuickSearch />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:flex-1 lg:overflow-y-auto">
          {NAV.map((g) => (
            <div key={g.group} className="flex shrink-0 gap-1 lg:mb-4 lg:block">
              <p className="hidden px-2 pb-1 text-[11px] font-medium tracking-[0.06em] text-(--agenci-ink-3) uppercase lg:block">{g.group}</p>
              {g.items.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => nav.tab(it.id)}
                  className={cn(
                    "flex h-9 shrink-0 items-center gap-2.5 rounded-[10px] px-2.5 text-[13.5px] whitespace-nowrap transition-colors lg:w-full",
                    tab === it.id ? "bg-(--dash-subtle) font-medium text-(--agenci-ink) dark:bg-white/5" : "text-(--agenci-ink-2) hover:bg-(--dash-subtle-2) hover:text-(--agenci-ink)",
                  )}
                >
                  <it.icon className="size-4" strokeWidth={1.7} />
                  {it.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="hidden border-t border-(--agenci-line) p-3 lg:block">
          <Link to="/" className="flex h-9 items-center gap-2 rounded-[10px] px-2.5 text-[13px] text-(--agenci-ink-2) hover:bg-(--dash-subtle-2) hover:text-(--agenci-ink)">
            <ArrowLeftIcon className="size-4" /> Til dashbordet
          </Link>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-[1280px]">
          {tab === "overview" ? <OverviewPage /> : null}
          {tab === "activity" ? <ActivityPage /> : null}
          {tab === "organizations" ? <OrganizationsPage /> : null}
          {tab === "users" ? <UsersPage /> : null}
          {tab === "conversations" ? <ConversationsPage /> : null}
          {tab === "agents" ? <AgentsPage /> : null}
          {tab === "billing" ? <BillingPage /> : null}
          {tab === "usage" ? <UsagePage /> : null}
          {tab === "system" ? <SystemPage /> : null}
          {tab === "database" ? <DatabasePage /> : null}
          {tab === "audit" ? <AuditPage /> : null}
        </div>
      </main>

      {user ? <UserDrawer id={user} onClose={() => nav.go({ user: undefined })} /> : null}
      {conv ? <TranscriptDrawer id={conv} onClose={() => nav.go({ conv: undefined })} /> : null}
    </div>
  );
}
