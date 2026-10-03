import { cn } from "@workspace/ui/lib/utils";
import {
  AlertTriangleIcon,
  Building2Icon,
  CreditCardIcon,
  FileTextIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import { adminApi, useAdmin } from "../admin-queries";
import { useAdminNav } from "./nav";
import { ago, BarChart, Card, Empty, krOre, Loading, num, PageHeader, Stat, when } from "./parts";

export function OverviewPage() {
  const nav = useAdminNav();
  const o = useAdmin(["overview"], () => adminApi.overview(), { refetchInterval: 30_000 });
  const ts = useAdmin(["timeseries", 30], () => adminApi.timeseries({ days: 30 }), { refetchInterval: 60_000 });
  const al = useAdmin(["alerts"], () => adminApi.alerts(), { refetchInterval: 30_000 });
  const d = o.data;

  const alertRows = al.data
    ? [
        ...al.data.waiting.map((a) => ({ key: `w${a.id}`, tone: "bad", text: `Kunde venter på svar i ${ago(a.at)}`, sub: `${a.org.name} · ${a.title}`, org: a.org.id })),
        ...al.data.pastDue.map((a) => ({ key: `p${a.org.id}`, tone: "bad", text: "Betaling feilet", sub: `${a.org.name} · siden ${when(a.since)}`, org: a.org.id })),
        ...al.data.failedPayments.map((a) => ({ key: `fp${a.id}`, tone: "bad", text: `Trekk på ${krOre(a.amount)} feilet`, sub: `${a.org.name} · ${when(a.at)}`, org: a.org.id })),
        ...al.data.failedAgents.map((a) => ({ key: `a${a.id}`, tone: "warn", text: `Agent feilet: ${a.title}`, sub: a.org.name, org: a.org.id })),
        ...al.data.failedDocs.map((a) => ({ key: `d${a.id}`, tone: "warn", text: `Kunnskap feilet: ${a.title}`, sub: a.org.name, org: a.org.id })),
        ...al.data.trialsEnding.map((a) => ({ key: `t${a.org.id}`, tone: "info", text: `Prøveperioden slutter ${when(a.endsAt)}`, sub: a.org.name, org: a.org.id })),
      ]
    : [];

  return (
    <>
      <PageHeader title="Oversikt" description="Hele Agenci akkurat nå. Oppdateres av seg selv." />
      {!d ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Inntekt per måned (MRR)" value={krOre(d.mrr)} hint={`${d.paying} betalende · ${d.pastDue} med feilet betaling`} tone={d.pastDue ? "warn" : undefined} />
            <Stat label="Bedrifter" value={num(d.orgs)} hint={`${d.trials} i prøveperiode · ${d.trialsEnding} slutter innen 7 dager`} />
            <Stat label="Brukere" value={num(d.users)} hint={`${d.usersWeek} nye siste 7 dager`} />
            <Stat label="Samtaler totalt" value={num(d.conversations)} hint={`${d.conversationsDay} siste døgn · ${d.conversationsWeek} siste 7 dager`} />
            <Stat label="Agenter" value={num(d.agents)} hint={d.agentsFailed ? `${d.agentsFailed} feilet` : "Ingen feilet"} tone={d.agentsFailed ? "bad" : undefined} />
            <Stat label="Hos teamet nå" value={num(d.escalated)} hint="Samtaler sendt til et menneske" tone={d.escalated ? "warn" : undefined} />
            <Stat label="AI-meldinger denne måneden" value={num(d.usage.messages)} hint={`${num(d.usage.inputTokens + d.usage.outputTokens)} tokens`} />
            <Stat label="Feilede betalinger" value={num(d.failedPayments)} tone={d.failedPayments ? "bad" : "good"} />
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Card title="Samtaler per dag">{ts.data ? <BarChart data={ts.data.conversations} label="Samtaler" /> : <Loading h={160} />}</Card>
            <Card
              title={
                <span className="flex items-center gap-2">
                  <AlertTriangleIcon className="size-4" /> Trenger oppmerksomhet
                  {alertRows.length ? <span className="rounded-full bg-[#fbeceb] px-2 text-[11.5px] text-[#b23a2e]">{alertRows.length}</span> : null}
                </span>
              }
              pad={false}
            >
              {!al.data ? (
                <Loading h={160} />
              ) : alertRows.length === 0 ? (
                <Empty>Alt ser bra ut. Ingenting venter.</Empty>
              ) : (
                <ul className="max-h-[260px] divide-y divide-(--agenci-line)/70 overflow-y-auto">
                  {alertRows.map((a) => (
                    <li key={a.key}>
                      <button type="button" onClick={() => nav.openOrg(a.org)} className="flex w-full items-start gap-3 px-5 py-2.5 text-left hover:bg-(--dash-subtle-2)">
                        <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", a.tone === "bad" ? "bg-[#d0473c]" : a.tone === "warn" ? "bg-[#e49a62]" : "bg-[#6b8fd6]")} />
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium text-(--agenci-ink)">{a.text}</span>
                          <span className="block truncate text-[12px] text-(--agenci-ink-3)">{a.sub}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Card title="Nye brukere per dag">{ts.data ? <BarChart data={ts.data.users} label="Nye brukere" height={110} /> : <Loading h={130} />}</Card>
            <Card title="Nye bedrifter per dag">{ts.data ? <BarChart data={ts.data.orgs} label="Nye bedrifter" height={110} /> : <Loading h={130} />}</Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="Siste samtaler" pad={false} action={<button type="button" className="text-[12.5px] text-(--agenci-ink-2) hover:underline" onClick={() => nav.tab("conversations")}>Se alle</button>}>
              <ul className="divide-y divide-(--agenci-line)/70">
                {d.recentConversations.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => nav.openConv(c.id)} className="flex w-full items-start gap-3 px-5 py-2.5 text-left hover:bg-(--dash-subtle-2)">
                      <MessageCircleIcon className="mt-0.5 size-4 shrink-0 text-(--agenci-ink-3)" strokeWidth={1.7} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-(--agenci-ink)">{c.firstMessage || "(ingen melding)"}</span>
                        <span className="block truncate text-[12px] text-(--agenci-ink-3)">
                          {c.organization.name} · {c.agent.name} · {c.messageCount} meldinger
                        </span>
                      </span>
                      <span className="shrink-0 text-[12px] text-(--agenci-ink-3) tabular-nums">{ago(c.lastMessageAt)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Nye brukere" pad={false} action={<button type="button" className="text-[12.5px] text-(--agenci-ink-2) hover:underline" onClick={() => nav.tab("users")}>Se alle</button>}>
              <ul className="divide-y divide-(--agenci-line)/70">
                {d.recentUsers.map((u) => (
                  <li key={u.id}>
                    <button type="button" onClick={() => nav.openUser(u.id)} className="flex w-full items-center gap-3 px-5 py-2.5 text-left hover:bg-(--dash-subtle-2)">
                      <UserIcon className="size-4 shrink-0 text-(--agenci-ink-3)" strokeWidth={1.7} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-(--agenci-ink)">{u.name || u.email}</span>
                        <span className="block truncate text-[12px] text-(--agenci-ink-3)">{u.email}</span>
                      </span>
                      <span className="shrink-0 text-[12px] text-(--agenci-ink-3)">{ago(u.createdAt)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          <p className="text-center text-[12px] text-(--agenci-ink-3)">Alle beløp i kroner, eks. mva.</p>
        </div>
      )}
    </>
  );
}

const KIND_ICON = {
  user: UserIcon,
  organization: Building2Icon,
  agent: ShieldCheckIcon,
  conversation: MessageCircleIcon,
  message: MessageCircleIcon,
  document: FileTextIcon,
  payment: CreditCardIcon,
} as const;

export function ActivityPage() {
  const nav = useAdminNav();
  const { data, dataUpdatedAt } = useAdmin(["activity"], () => adminApi.activity(), { refetchInterval: 5_000 });
  return (
    <>
      <PageHeader
        title="Live"
        description={
          <span className="inline-flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#5FA06F] opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-[#5FA06F]" />
            </span>
            Alt som skjer, oppdatert hvert 5. sekund · sist {dataUpdatedAt ? when(new Date(dataUpdatedAt)) : "–"}
          </span>
        }
      />
      <Card pad={false}>
        {!data ? (
          <Loading />
        ) : (
          <ol className="divide-y divide-(--agenci-line)/70">
            {data.map((e) => {
              const Icon = KIND_ICON[e.kind];
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    disabled={!e.organizationId}
                    onClick={() => e.organizationId && nav.openOrg(e.organizationId)}
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
        )}
      </Card>
    </>
  );
}
