import { cn } from "@workspace/ui/lib/utils";
import { ArrowLeftIcon, ExternalLinkIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { adminApi, useAdmin, useAdminAction } from "../admin-queries";
import { useAdminNav } from "./nav";
import { ACTION_LABEL } from "./pages-system";
import {
  ago,
  Badge,
  BarChart,
  btn,
  btnDanger,
  btnInk,
  Card,
  CsvButton,
  DataTable,
  day,
  Empty,
  KeyValues,
  krOre,
  Loading,
  num,
  PageHeader,
  SearchBox,
  Stat,
  useConfirm,
  when,
} from "./parts";

const STATUS_FILTERS = [
  ["all", "Alle"],
  ["trialing", "Prøveperiode"],
  ["active", "Betaler"],
  ["past_due", "Betaling feilet"],
  ["trial_ended", "Prøve utløpt"],
  ["developer", "Utvikler"],
  ["needs_registration", "Ikke registrert"],
] as const;

export function OrganizationsPage() {
  const nav = useAdminNav();
  const { data } = useAdmin(["organizations"], () => adminApi.organizations());
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  if (nav.search.org) return <OrganizationPage id={nav.search.org} />;

  const rows = (data ?? []).filter(
    (o) =>
      (status === "all" || o.billingStatus === status) &&
      `${o.name} ${o.slug} ${o.billingAccount?.orgNumber ?? ""} ${o.billingAccount?.companyName ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="Bedrifter"
        description={data ? `${num(data.length)} organisasjoner i Agenci` : undefined}
        actions={
          <>
            <SearchBox value={q} onChange={setQ} placeholder="Navn, slug eller org.nr." />
            <CsvButton
              name="bedrifter"
              rows={rows.map((o) => ({
                navn: o.name,
                orgnr: o.billingAccount?.orgNumber ?? "",
                status: o.billingStatus,
                plan: o.plan ?? "",
                medlemmer: o._count.members,
                agenter: o._count.agents,
                samtaler: o._count.conversations,
                opprettet: o.createdAt,
              }))}
            />
          </>
        }
      />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map(([v, l]) => {
          const n = v === "all" ? (data?.length ?? 0) : (data ?? []).filter((o) => o.billingStatus === v).length;
          return (
            <button
              key={v}
              type="button"
              onClick={() => setStatus(v)}
              className={cn(
                "h-8 rounded-full px-3 text-[12.5px] font-medium transition-colors",
                status === v ? "bg-(--agenci-ink) text-white dark:text-[#0b0c0e]" : "bg-(--dash-subtle) text-(--agenci-ink-2) hover:text-(--agenci-ink) dark:bg-white/5",
              )}
            >
              {l} <span className="opacity-60">{n}</span>
            </button>
          );
        })}
      </div>
      <Card pad={false}>
        {!data ? (
          <Loading />
        ) : (
          <DataTable
            rows={rows}
            onRow={(o) => nav.openOrg(o.id)}
            initialSort={{ key: "created", dir: -1 }}
            columns={[
              {
                key: "name",
                label: "Bedrift",
                sort: (o) => o.name.toLowerCase(),
                render: (o) => (
                  <span className="block min-w-[180px]">
                    <span className="block font-medium text-(--agenci-ink)">{o.name}</span>
                    <span className="block text-[12px] text-(--agenci-ink-3)">{o.billingAccount?.orgNumber ? `Org.nr. ${o.billingAccount.orgNumber}` : o.slug}</span>
                  </span>
                ),
              },
              { key: "status", label: "Status", sort: (o) => o.billingStatus, render: (o) => <Badge status={o.billingStatus} /> },
              { key: "plan", label: "Plan", sort: (o) => o.plan ?? "", render: (o) => <span className="text-(--agenci-ink-2)">{o.plan ?? "–"}{o.subscription?.interval === "year" ? " · årlig" : ""}</span> },
              { key: "members", label: "Medlemmer", align: "right", sort: (o) => o._count.members, render: (o) => o._count.members },
              { key: "agents", label: "Agenter", align: "right", sort: (o) => o._count.agents, render: (o) => o._count.agents },
              { key: "convs", label: "Samtaler", align: "right", sort: (o) => o._count.conversations, render: (o) => num(o._count.conversations) },
              { key: "trial", label: "Prøve til", sort: (o) => o.billingAccount?.trialEndsAt ? new Date(o.billingAccount.trialEndsAt).getTime() : 0, render: (o) => <span className="text-(--agenci-ink-2)">{day(o.billingAccount?.trialEndsAt)}</span> },
              { key: "created", label: "Opprettet", sort: (o) => new Date(o.createdAt).getTime(), render: (o) => <span className="text-(--agenci-ink-2)">{day(o.createdAt)}</span> },
            ]}
          />
        )}
      </Card>
    </>
  );
}

const ORG_TABS = [
  ["overview", "Oversikt"],
  ["members", "Medlemmer"],
  ["agents", "Agenter og kunnskap"],
  ["conversations", "Samtaler"],
  ["billing", "Betaling"],
  ["log", "Logg"],
] as const;
type OrgTab = (typeof ORG_TABS)[number][0];

function OrganizationPage({ id }: { id: string }) {
  const nav = useAdminNav();
  const { data: o, isError } = useAdmin(["organization", id], () => adminApi.organization({ id }));
  const insights = useAdmin(["insights", id], () => adminApi.insights({ id }));
  const [tab, setTab] = useState<OrgTab>("overview");
  const { confirm, dialog } = useConfirm();
  const deleteOrg = useAdminAction(
    (i: { organizationId: string; confirmName: string }) => adminApi.deleteOrganization(i),
    (r) => `${r.name} er slettet.`,
  );

  if (isError) return <Empty>Fant ikke organisasjonen.</Empty>;
  if (!o) return <Loading />;

  const usageNow = o.usageMonthly[0];
  return (
    <>
      {dialog}
      <button type="button" onClick={() => nav.go({ org: undefined })} className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-(--agenci-ink-2) hover:text-(--agenci-ink)">
        <ArrowLeftIcon className="size-4" /> Alle bedrifter
      </button>
      <PageHeader
        title={o.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge status={o.billing.status} />
            {o.billing.plan ? <span>{o.billing.plan}{o.billing.interval === "year" ? " · årlig" : ""}</span> : null}
            {o.billingAccount ? <span>· Org.nr. {o.billingAccount.orgNumber}</span> : null}
            <span>· Opprettet {day(o.createdAt)}</span>
          </span>
        }
        actions={
          <button
            type="button"
            className={btnDanger}
            onClick={() =>
              confirm({
                title: `Slette ${o.name}?`,
                body: "Alt slettes for godt: medlemskap, agenter, kunnskap, samtaler, filer og betalingshistorikk. Brukerkontoene beholdes. Dette kan ikke angres.",
                confirmLabel: "Slett for godt",
                danger: true,
                typeToConfirm: o.name,
                onConfirm: () => deleteOrg.mutateAsync({ organizationId: o.id, confirmName: o.name }).then(() => nav.go({ org: undefined })),
              })
            }
          >
            <Trash2Icon className="size-3.5" /> Slett bedriften
          </button>
        }
      />

      <nav className="mb-5 flex flex-wrap gap-1 border-b border-(--agenci-line)">
        {ORG_TABS.map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setTab(v)}
            className={cn("-mb-px border-b-2 px-3 py-2 text-[13px] font-medium transition-colors", tab === v ? "border-(--agenci-ink) text-(--agenci-ink)" : "border-transparent text-(--agenci-ink-3) hover:text-(--agenci-ink)")}
          >
            {l}
          </button>
        ))}
      </nav>

      {tab === "overview" ? (
        <div className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Samtaler siste 30 dager" value={num(insights.data?.series.reduce((s, d) => s + d.n, 0) ?? 0)} hint={o.billing.conversationLimit ? `Plangrense ${num(o.billing.conversationLimit)} / mnd` : "Ingen aktiv plan"} />
            <Stat label="Uavklart · til teamet · løst" value={`${insights.data?.statusCounts.unresolved ?? 0} · ${insights.data?.statusCounts.escalated ?? 0} · ${insights.data?.statusCounts.resolved ?? 0}`} />
            <Stat label="AI-meldinger denne måneden" value={num(usageNow?.messages ?? 0)} hint={`${num((usageNow?.inputTokens ?? 0) + (usageNow?.outputTokens ?? 0))} tokens`} />
            <Stat label="Medlemmer · agenter" value={`${o.members.length} · ${o.agents.length}`} />
          </div>
          <Card title="Samtaler per dag, siste 30 dager">{insights.data ? <BarChart data={insights.data.series} label="Samtaler" /> : <Loading h={160} />}</Card>
          <Card title="Detaljer">
            <KeyValues
              rows={[
                ["ID", <span key="id" className="font-mono text-[12px]">{o.id}</span>],
                ["Slug", o.slug],
                ["Selskap", o.billingAccount?.companyName ?? "–"],
                ["Org.nr.", o.billingAccount?.orgNumber ?? "–"],
                ["Prøveperiode", o.billingAccount?.trialEndsAt ? `til ${day(o.billingAccount.trialEndsAt)}` : "Ingen"],
                ["Betalt til", day(o.billing.currentPeriodEnd)],
                ["Bruk siste 6 mnd", o.usageMonthly.map((u) => `${u.period}: ${num(u.messages)}`).join(" · ") || "–"],
              ]}
            />
          </Card>
        </div>
      ) : null}

      {tab === "members" ? <MembersTab org={o} confirm={confirm} /> : null}
      {tab === "agents" ? <AgentsTab org={o} documents={insights.data?.documents} confirm={confirm} /> : null}
      {tab === "conversations" ? (
        <Card pad={false}>
          <DataTable
            rows={o.conversations}
            onRow={(c) => nav.openConv(c.id)}
            empty="Ingen samtaler ennå."
            columns={[
              { key: "msg", label: "Første melding", render: (c) => <span className="block max-w-[420px] truncate">{c.firstMessage || "(ingen)"}</span> },
              { key: "agent", label: "Agent", render: (c) => c.agent.name },
              { key: "status", label: "Status", render: (c) => <Badge status={c.status} /> },
              { key: "n", label: "Meldinger", align: "right", render: (c) => c.messageCount },
              { key: "at", label: "Sist", render: (c) => <span className="text-(--agenci-ink-2)">{ago(c.lastMessageAt)}</span> },
            ]}
          />
          <div className="border-t border-(--agenci-line) px-5 py-3">
            <button type="button" className={btn} onClick={() => nav.go({ tab: "conversations", org: undefined })}>
              Se alle samtaler med filter
            </button>
          </div>
        </Card>
      ) : null}
      {tab === "billing" ? <BillingTab org={o} confirm={confirm} /> : null}
      {tab === "log" ? <OrgLog id={o.id} /> : null}
    </>
  );

}

type Org = Awaited<ReturnType<typeof adminApi.organization>>;
type Confirm = ReturnType<typeof useConfirm>["confirm"];

function MembersTab({ org, confirm }: { org: Org; confirm: Confirm }) {
  const nav = useAdminNav();
  const setRole = useAdminAction((i: { memberId: string; role: "owner" | "admin" | "member" }) => adminApi.changeMemberRole(i), "Rollen er endret.");
  const remove = useAdminAction((i: { memberId: string }) => adminApi.removeMember(i), "Medlemmet er fjernet.");
  return (
    <Card pad={false}>
      <DataTable
        rows={org.members}
        empty="Ingen medlemmer."
        columns={[
          {
            key: "user",
            label: "Bruker",
            render: (m) => (
              <button type="button" onClick={() => nav.openUser(m.user.id)} className="text-left hover:underline">
                <span className="block font-medium text-(--agenci-ink)">{m.user.name || m.user.email}</span>
                <span className="block text-[12px] text-(--agenci-ink-3)">{m.user.email}</span>
              </button>
            ),
          },
          {
            key: "role",
            label: "Rolle",
            render: (m) => (
              <select
                value={m.role}
                onChange={(e) => setRole.mutate({ memberId: m.id, role: e.target.value as "owner" | "admin" | "member" })}
                className="h-8 rounded-full border border-(--agenci-line) bg-transparent px-2.5 text-[12.5px]"
              >
                <option value="owner">Eier</option>
                <option value="admin">Admin</option>
                <option value="member">Medlem</option>
              </select>
            ),
          },
          { key: "since", label: "Med siden", render: (m) => <span className="text-(--agenci-ink-2)">{day(m.createdAt)}</span> },
          {
            key: "x",
            label: "",
            align: "right",
            render: (m) => (
              <button
                type="button"
                className={btnDanger}
                onClick={() =>
                  confirm({
                    title: `Fjerne ${m.user.email}?`,
                    body: `Brukeren mister tilgangen til ${org.name}. Kontoen beholdes.`,
                    confirmLabel: "Fjern",
                    danger: true,
                    onConfirm: () => remove.mutate({ memberId: m.id }),
                  })
                }
              >
                Fjern
              </button>
            ),
          },
        ]}
      />
    </Card>
  );
}

type Doc = Awaited<ReturnType<typeof adminApi.insights>>["documents"][number];

function AgentsTab({ org, documents, confirm }: { org: Org; documents?: Doc[]; confirm: Confirm }) {
  const recrawl = useAdminAction((i: { documentId: string }) => adminApi.recrawlDocument(i), "Nettsiden leses inn på nytt.");
  const del = useAdminAction((i: { documentId: string }) => adminApi.deleteDocument(i), "Kilden er slettet.");
  return (
    <div className="flex flex-col gap-5">
      <Card title={`Agenter (${org.agents.length})`} pad={false}>
        <DataTable
          rows={org.agents}
          empty="Ingen agenter."
          columns={[
            {
              key: "name",
              label: "Agent",
              render: (a) => (
                <span className="block">
                  <span className="block font-medium">{a.name}</span>
                  <span className="block font-mono text-[11.5px] text-(--agenci-ink-3)">{a.id}</span>
                </span>
              ),
            },
            {
              key: "site",
              label: "Nettside",
              render: (a) =>
                a.widgetBrand?.sourceUrl ? (
                  <a href={a.widgetBrand.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-(--agenci-ink-2) hover:underline">
                    {a.widgetBrand.sourceUrl.replace(/^https?:\/\//, "")} <ExternalLinkIcon className="size-3" />
                  </a>
                ) : (
                  "–"
                ),
            },
            { key: "status", label: "Status", render: (a) => <Badge status={a.status} /> },
            { key: "docs", label: "Kilder", align: "right", render: (a) => a._count.documents },
            { key: "convs", label: "Samtaler", align: "right", render: (a) => a._count.conversations },
          ]}
        />
      </Card>
      <Card title={`Kunnskapskilder (${documents?.length ?? "…"})`} pad={false}>
        {!documents ? (
          <Loading h={120} />
        ) : (
          <DataTable
            rows={documents}
            empty="Ingen kilder."
            columns={[
              { key: "name", label: "Kilde", render: (d) => <span className="block max-w-[360px] truncate">{d.documentName ?? "(uten navn)"}</span> },
              { key: "type", label: "Type", render: (d) => <span className="text-(--agenci-ink-2)">{d.type === "WEBPAGE" ? "Nettside" : "Fil"}</span> },
              { key: "agent", label: "Agent", render: (d) => d.agent?.name ?? "–" },
              { key: "status", label: "Status", render: (d) => <Badge status={d.status} /> },
              { key: "at", label: "Oppdatert", render: (d) => <span className="text-(--agenci-ink-2)">{when(d.updatedAt)}</span> },
              {
                key: "x",
                label: "",
                align: "right",
                render: (d) => (
                  <span className="inline-flex gap-1.5">
                    {d.type === "WEBPAGE" ? (
                      <button type="button" className={btn} disabled={recrawl.isPending} onClick={() => recrawl.mutate({ documentId: d.id })}>
                        <RotateCcwIcon className="size-3.5" /> Les på nytt
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className={btnDanger}
                      onClick={() =>
                        confirm({
                          title: "Slette kilden?",
                          body: `«${d.documentName ?? "Kilden"}» og alt agenten har lært fra den slettes. Agenten slutter å svare ut fra den.`,
                          confirmLabel: "Slett",
                          danger: true,
                          onConfirm: () => del.mutate({ documentId: d.id }),
                        })
                      }
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  </span>
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}

function BillingTab({ org, confirm }: { org: Org; confirm: Confirm }) {
  const [plan, setPlan] = useState<"starter" | "pro" | "business">("pro");
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [months, setMonths] = useState(1);
  const [days, setDays] = useState(14);
  const give = useAdminAction(
    (i: { organizationId: string; plan: "starter" | "pro" | "business"; interval: "month" | "year"; months: number }) => adminApi.setPlan(i),
    (r) => (r.mode === "comp" ? "Planen er gitt." : "Planen endres ved neste trekk."),
  );
  const cancel = useAdminAction((i: { organizationId: string; immediately: boolean }) => adminApi.cancelSubscription(i), "Abonnementet er oppdatert.");
  const extend = useAdminAction((i: { organizationId: string; days: number }) => adminApi.extendTrial(i), "Prøveperioden er forlenget.");
  const end = useAdminAction((i: { organizationId: string }) => adminApi.endTrial(i), "Prøveperioden er avsluttet.");
  const release = useAdminAction((i: { organizationId: string }) => adminApi.releaseOrgNumber(i), (r) => `Org.nr. ${r.orgNumber} er frigjort.`);
  const sub = org.subscription;
  const field = "h-8 rounded-full border border-(--agenci-line) bg-transparent px-2.5 text-[12.5px]";

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="Abonnement">
        <KeyValues
          rows={[
            ["Status", <Badge key="s" status={org.billing.status} />],
            ["Plan", sub ? `${sub.plan}${sub.interval === "year" ? " · årlig" : " · månedlig"}` : "Ingen"],
            ["Kort hos Nexi", sub?.nexiSubscriptionId ? "Ja" : "Nei (gitt av oss eller ingen)"],
            ["Betalt til", day(sub?.currentPeriodEnd)],
            ["Sies opp", sub?.cancelAtPeriodEnd ? "Ja, ved periodens slutt" : "Nei"],
          ]}
        />
        <div className="mt-5 border-t border-(--agenci-line) pt-4">
          <p className="mb-2 text-[12.5px] font-medium text-(--agenci-ink)">Gi eller endre plan</p>
          <div className="flex flex-wrap items-center gap-2">
            <select value={plan} onChange={(e) => setPlan(e.target.value as typeof plan)} className={field}>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
            </select>
            <select value={interval} onChange={(e) => setInterval(e.target.value as typeof interval)} className={field}>
              <option value="month">Månedlig</option>
              <option value="year">Årlig</option>
            </select>
            <input type="number" min={1} max={36} value={months} onChange={(e) => setMonths(Number(e.target.value))} className={`${field} w-16`} />
            <span className="text-[12.5px] text-(--agenci-ink-3)">mnd gratis</span>
            <button
              type="button"
              className={btnInk}
              onClick={() =>
                confirm({
                  title: `Gi ${org.name} ${plan}?`,
                  body: sub?.nexiSubscriptionId
                    ? "Bedriften betaler med kort. Ny plan gjelder fra neste trekk."
                    : `Bedriften får ${plan} gratis i ${months} måned(er). Etterpå stopper den, med mindre de betaler.`,
                  confirmLabel: "Gi plan",
                  onConfirm: () => give.mutate({ organizationId: org.id, plan, interval, months }),
                })
              }
            >
              Lagre
            </button>
          </div>
        </div>
        {sub && ["active", "charging", "past_due"].includes(sub.status) ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={() => cancel.mutate({ organizationId: org.id, immediately: false })}>
              Si opp ved periodens slutt
            </button>
            <button
              type="button"
              className={btnDanger}
              onClick={() =>
                confirm({
                  title: "Stoppe abonnementet nå?",
                  body: "Agentene slutter å svare med en gang. Ingenting refunderes automatisk.",
                  confirmLabel: "Stopp nå",
                  danger: true,
                  onConfirm: () => cancel.mutate({ organizationId: org.id, immediately: true }),
                })
              }
            >
              Stopp nå
            </button>
          </div>
        ) : null}
      </Card>

      <Card title="Prøveperiode og org.nr.">
        <KeyValues
          rows={[
            ["Org.nr.", org.billingAccount?.orgNumber ?? "Ikke registrert"],
            ["Selskap", org.billingAccount?.companyName ?? "–"],
            ["Prøve startet", day(org.billingAccount?.trialStartedAt)],
            ["Prøve slutter", day(org.billingAccount?.trialEndsAt)],
          ]}
        />
        {org.billingAccount ? (
          <>
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-(--agenci-line) pt-4">
              <input type="number" min={1} max={365} value={days} onChange={(e) => setDays(Number(e.target.value))} className={`${field} w-16`} />
              <span className="text-[12.5px] text-(--agenci-ink-3)">dager</span>
              <button type="button" className={btnInk} onClick={() => extend.mutate({ organizationId: org.id, days })}>
                Forleng prøveperioden
              </button>
              <button type="button" className={btn} onClick={() => end.mutate({ organizationId: org.id })}>
                Avslutt prøveperioden nå
              </button>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className={btnDanger}
                onClick={() =>
                  confirm({
                    title: "Frigjøre org.nr.?",
                    body: `Org.nr. ${org.billingAccount?.orgNumber} løsnes fra ${org.name}, og prøveperioden nullstilles. Nummeret kan da registreres på nytt. Bedriften må registrere org.nr. igjen for å bruke Agenci.`,
                    confirmLabel: "Frigjør",
                    danger: true,
                    onConfirm: () => release.mutate({ organizationId: org.id }),
                  })
                }
              >
                Frigjør org.nr. og nullstill prøveperioden
              </button>
            </div>
          </>
        ) : null}
      </Card>

      <Card title={`Betalinger (${org.billingPayments.length})`} pad={false} className="lg:col-span-2">
        <DataTable
          rows={org.billingPayments}
          empty="Ingen betalinger."
          columns={[
            { key: "nr", label: "Faktura", render: (p) => <span className="tabular-nums">AG-{1000 + p.invoiceNumber}</span> },
            { key: "plan", label: "Plan", render: (p) => `${p.plan}${p.interval === "year" ? " · årlig" : ""}` },
            { key: "amount", label: "Beløp", align: "right", render: (p) => krOre(p.amount) },
            { key: "status", label: "Status", render: (p) => <Badge status={p.status} /> },
            { key: "at", label: "Dato", render: (p) => <span className="text-(--agenci-ink-2)">{when(p.createdAt)}</span> },
          ]}
        />
      </Card>
    </div>
  );
}

function OrgLog({ id }: { id: string }) {
  const { data } = useAdmin(["audit"], () => adminApi.audit());
  const rows = (data ?? []).filter((a) => a.target === id);
  return (
    <Card pad={false}>
      {!data ? (
        <Loading />
      ) : (
        <DataTable
          rows={rows}
          empty="Ingen admin-handlinger på denne bedriften ennå."
          columns={[
            { key: "at", label: "Når", render: (a) => when(a.createdAt) },
            { key: "who", label: "Hvem", render: (a) => a.actorEmail },
            { key: "what", label: "Hva", render: (a) => ACTION_LABEL[a.action] ?? a.action },
            { key: "d", label: "Detaljer", render: (a) => <span className="block max-w-[360px] truncate font-mono text-[11.5px] text-(--agenci-ink-3)">{a.details === "{}" ? "" : a.details}</span> },
          ]}
        />
      )}
    </Card>
  );
}

