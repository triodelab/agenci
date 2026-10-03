import { useState } from "react";
import { adminApi, useAdmin } from "../admin-queries";
import { useAdminNav } from "./nav";
import { Badge, Card, CsvButton, DataTable, day, kr, krOre, Loading, num, PageHeader, Stat, when } from "./parts";

export function BillingPage() {
  const nav = useAdminNav();
  const { data } = useAdmin(["billing"], () => adminApi.billing());
  const mrr = data ? Object.values(data.mrrByPlan).reduce((s, n) => s + n, 0) : 0;
  return (
    <>
      <PageHeader
        title="Betaling"
        description="Abonnementer, inntekt og alle trekk. Beløp eks. mva."
        actions={
          data ? (
            <CsvButton
              name="betalinger"
              rows={data.payments.map((p) => ({ faktura: `AG-${1000 + p.invoiceNumber}`, bedrift: p.organization.name, plan: p.plan, intervall: p.interval, belop_kr: p.amount / 100, status: p.status, dato: p.createdAt }))}
            />
          ) : null
        }
      />
      {!data ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Inntekt per måned (MRR)" value={krOre(mrr)} hint={`ARR ${krOre(mrr * 12)}`} />
            <Stat label="Innbetalt siste 30 dager" value={krOre(data.paidLast30)} />
            <Stat label="Betalende abonnementer" value={num(data.subscriptions.filter((s) => ["active", "charging", "past_due"].includes(s.status) && !s.comped).length)} hint={`${data.subscriptions.filter((s) => s.comped && s.status === "active").length} gitt gratis av oss`} />
            <Stat label="Betaling feilet" value={num(data.subscriptions.filter((s) => s.status === "past_due").length)} tone={data.subscriptions.some((s) => s.status === "past_due") ? "bad" : "good"} />
          </div>
          <Card title="Inntekt per plan">
            <div className="grid gap-3 sm:grid-cols-3">
              {(["starter", "pro", "business"] as const).map((p) => (
                <div key={p} className="rounded-[12px] bg-(--dash-subtle-2) px-4 py-3 dark:bg-white/5">
                  <p className="text-[12px] text-(--agenci-ink-3) capitalize">{p}</p>
                  <p className="mt-1 text-[18px] font-semibold tabular-nums">{krOre(data.mrrByPlan[p] ?? 0)}<span className="text-[12px] font-normal text-(--agenci-ink-3)"> / mnd</span></p>
                </div>
              ))}
            </div>
          </Card>
          <Card title={`Abonnementer (${data.subscriptions.length})`} pad={false}>
            <DataTable
              rows={data.subscriptions}
              onRow={(s) => nav.openOrg(s.organization.id)}
              columns={[
                { key: "org", label: "Bedrift", sort: (s) => s.organization.name, render: (s) => <span className="font-medium">{s.organization.name}</span> },
                { key: "plan", label: "Plan", sort: (s) => s.plan, render: (s) => `${s.plan}${s.interval === "year" ? " · årlig" : ""}` },
                { key: "status", label: "Status", sort: (s) => s.status, render: (s) => <Badge status={s.status} /> },
                { key: "kind", label: "Type", render: (s) => <span className="text-(--agenci-ink-2)">{s.comped ? "Gitt av oss" : "Kort"}</span> },
                { key: "end", label: "Betalt til", sort: (s) => (s.currentPeriodEnd ? new Date(s.currentPeriodEnd).getTime() : 0), render: (s) => <span className="text-(--agenci-ink-2)">{day(s.currentPeriodEnd)}{s.cancelAtPeriodEnd ? " · sies opp" : ""}</span> },
              ]}
            />
          </Card>
          <Card title="Alle trekk" pad={false}>
            <DataTable
              rows={data.payments}
              onRow={(p) => nav.openOrg(p.organization.id)}
              empty="Ingen betalinger ennå."
              columns={[
                { key: "nr", label: "Faktura", render: (p) => <span className="tabular-nums">AG-{1000 + p.invoiceNumber}</span> },
                { key: "org", label: "Bedrift", render: (p) => p.organization.name },
                { key: "plan", label: "Plan", render: (p) => `${p.plan}${p.interval === "year" ? " · årlig" : ""}` },
                { key: "amount", label: "Beløp", align: "right", sort: (p) => p.amount, render: (p) => krOre(p.amount) },
                { key: "status", label: "Status", render: (p) => <Badge status={p.status} /> },
                { key: "at", label: "Dato", sort: (p) => new Date(p.createdAt).getTime(), render: (p) => <span className="text-(--agenci-ink-2)">{when(p.createdAt)}</span> },
              ]}
            />
          </Card>
        </div>
      )}
    </>
  );
}

export function UsagePage() {
  const nav = useAdminNav();
  const [period, setPeriod] = useState<string | undefined>();
  const { data } = useAdmin(["usage", period], () => adminApi.usage({ period }));
  const margin = data ? data.totals.revenueNok - data.totals.costNok : 0;
  return (
    <>
      <PageHeader
        title="Bruk og kostnad"
        description={data?.note}
        actions={
          data ? (
            <>
              <select
                value={data.period}
                onChange={(e) => setPeriod(e.target.value)}
                className="h-8 rounded-full border border-(--agenci-line) bg-(--dash-surface) px-3 text-[12.5px] dark:bg-transparent"
              >
                {[...new Set([data.period, ...data.periods])].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <CsvButton name={`bruk-${data.period}`} rows={data.rows.map((r) => ({ bedrift: r.name, plan: r.plan ?? "", meldinger: r.messages, tokens_inn: r.inputTokens, tokens_ut: r.outputTokens, kostnad_kr: r.costNok, inntekt_kr: r.revenueNok, margin_kr: r.marginNok }))} />
            </>
          ) : null
        }
      />
      {!data ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="AI-meldinger" value={num(data.totals.messages)} />
            <Stat label="Tokens" value={num(data.totals.tokens)} />
            <Stat label="AI-kostnad (anslag)" value={kr(data.totals.costNok, 2)} />
            <Stat label="Inntekt − AI-kostnad" value={kr(margin, 2)} tone={margin > 0.5 ? "good" : margin < -0.5 ? "bad" : undefined} hint={`Inntekt ${kr(data.totals.revenueNok)} denne måneden`} />
          </div>
          <Card title={`Per bedrift · ${data.period}`} pad={false}>
            <DataTable
              rows={data.rows}
              onRow={(r) => nav.openOrg(r.organizationId)}
              initialSort={{ key: "cost", dir: -1 }}
              columns={[
                { key: "name", label: "Bedrift", sort: (r) => r.name.toLowerCase(), render: (r) => <span className="font-medium">{r.name}</span> },
                { key: "plan", label: "Plan", render: (r) => <span className="text-(--agenci-ink-2)">{r.plan ?? "–"}</span> },
                { key: "msgs", label: "Meldinger", align: "right", sort: (r) => r.messages, render: (r) => num(r.messages) },
                { key: "tokens", label: "Tokens", align: "right", sort: (r) => r.inputTokens + r.outputTokens, render: (r) => num(r.inputTokens + r.outputTokens) },
                { key: "cost", label: "Kostnad", align: "right", sort: (r) => r.costNok, render: (r) => kr(r.costNok, 2) },
                { key: "rev", label: "Inntekt", align: "right", sort: (r) => r.revenueNok, render: (r) => kr(r.revenueNok) },
                { key: "margin", label: "Margin", align: "right", sort: (r) => r.marginNok, render: (r) => <span className={r.marginNok < 0 ? "text-[#b23a2e]" : ""}>{kr(r.marginNok, 2)}</span> },
              ]}
            />
          </Card>
        </div>
      )}
    </>
  );
}
