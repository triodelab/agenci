import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowRightIcon,
  Building2Icon,
  CheckIcon,
  CreditCardIcon,
  FileTextIcon,
  MessageCircleIcon,
  XIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  billingKeys,
  useBillingPayments,
  useBillingStatus,
  useUsageQuery,
} from "@/features/billing/billing-queries";
import { client } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { UsageChart } from "../components/usage-chart";

/** Same plans, words and lists as agenci.no/priser. */
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 499,
    limit: 500,
    blurb: "For små bedrifter som er lei av å svare på de samme spørsmålene.",
    featured: false,
    bullets: [
      ["1 AI-agent", true],
      ["Timebestilling i chatten", true],
      ["Chat-widget på nettsiden", true],
      ["2 teammedlemmer", true],
      ["Grunnleggende analyser", true],
      ["Fjern «Powered by Agenci»", false],
      ["E-poststøtte", false],
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 1499,
    limit: 2000,
    blurb: "For bedrifter med mye trafikk og et team som deler på kundeservicen.",
    featured: true,
    bullets: [
      ["3 AI-agenter", true],
      ["Timebestilling i chatten", true],
      ["Chat-widget på nettsiden", true],
      ["5 teammedlemmer", true],
      ["Full analyse og rapporter", true],
      ["Fjern «Powered by Agenci»", true],
      ["Prioritert e-poststøtte", true],
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 3999,
    limit: 10000,
    blurb: "Flere nettsider, flere agenter, og alt samlet på ett sted.",
    featured: false,
    bullets: [
      ["10 AI-agenter", true],
      ["Timebestilling i chatten", true],
      ["Alle integrasjoner", true],
      ["Ubegrenset teammedlemmer", true],
      ["Full analyse + CSV-eksport", true],
      ["Fjern «Powered by Agenci»", true],
      ["Dedikert support", true],
    ],
  },
] as const satisfies readonly {
  id: string;
  name: string;
  price: number;
  limit: number;
  blurb: string;
  featured: boolean;
  bullets: readonly (readonly [string, boolean])[];
}[];
type PlanId = (typeof PLANS)[number]["id"];

const card =
  "rounded-[20px] border border-(--dash-edge)/80 bg-(--dash-surface) shadow-[0_1px_3px_rgb(5_6_7/0.06),0_14px_34px_-16px_rgb(5_6_7/0.18)] dark:border-white/5 dark:bg-(--card)";
const ghostBtn =
  "inline-flex h-9 items-center gap-1.5 rounded-full border border-(--agenci-line) bg-(--dash-surface) px-3.5 text-[13px] font-medium text-(--agenci-ink) transition-colors hover:bg-(--dash-subtle) disabled:opacity-50 dark:bg-transparent";
const inkBtn =
  "inline-flex h-9 items-center gap-1.5 rounded-full bg-(--agenci-ink) px-4 text-[13px] font-medium text-white transition-colors hover:bg-(--agenci-accent-hover) disabled:opacity-50 dark:text-[#0b0c0e]";

const kr = (n: number) => new Intl.NumberFormat("nb-NO").format(n);
const date = (iso: string | Date | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) =>
  iso ? new Date(iso).toLocaleDateString("nb-NO", opts) : "";
const daysLeft = (iso: string | null | undefined) =>
  iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)) : 0;
const orgNr = (n: string) => n.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");

const PAYMENT_STATUS: Record<string, { label: string; cls: string }> = {
  paid: { label: "Betalt", cls: "text-(--dash-good) border-[#5FA06F]/40" },
  pending: { label: "Venter", cls: "text-(--agenci-ink-2) border-(--agenci-line)" },
  failed: { label: "Feilet", cls: "text-(--dash-bad) border-(--dash-bad)/40" },
};

function Pill({ children, tone = "good" }: { children: React.ReactNode; tone?: "good" | "warn" | "bad" | "muted" }) {
  const tones = {
    good: "border-[#5FA06F]/40 text-(--dash-good)",
    warn: "border-[#D9743A]/40 text-[#b25f2c]",
    bad: "border-(--dash-bad)/40 text-(--dash-bad)",
    muted: "border-(--agenci-line) text-(--agenci-ink-2)",
  } as const;
  const dot = { good: "bg-[#5FA06F]", warn: "bg-[#D9743A]", bad: "bg-(--dash-bad)", muted: "bg-(--agenci-ink-3)" } as const;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-medium", tones[tone])}>
      <span className={cn("size-1.5 rounded-full", dot[tone])} />
      {children}
    </span>
  );
}

export default function BillingView() {
  const { data: usage } = useUsageQuery();
  const { data: org } = authClient.useActiveOrganization();
  const { data: billing } = useBillingStatus();
  const { data: payments } = useBillingPayments();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);

  const status = billing?.status;
  const developer = status === "developer";
  const trialing = status === "trialing";
  const subscribed = status === "active" || status === "past_due";
  const canPay = billing?.canPay ?? false;
  const planId = (billing?.plan ?? "starter") as PlanId;
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[0];
  const limit = billing?.conversationLimit || plan.limit;
  const used = usage?.total ?? 0;
  const trialDays = billing?.trialDays ?? 30;
  const left = daysLeft(billing?.trialEndsAt);
  const trend = useMemo(() => {
    if (!usage || !usage.previousTotal) return null;
    return Math.round(((usage.total - usage.previousTotal) / usage.previousTotal) * 100);
  }, [usage]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: billingKeys.status });
    await queryClient.invalidateQueries({ queryKey: billingKeys.payments });
  };
  const act = async (key: string, fn: () => Promise<unknown>, done?: string) => {
    setBusy(key);
    try {
      await fn();
      if (done) toast.success(done);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setBusy(null);
    }
  };
  const goToCheckout = (start: () => Promise<{ paymentId: string }>, key: string) =>
    act(key, async () => {
      const { paymentId } = await start();
      await navigate({ to: "/betaling", search: { paymentId } });
    });
  const choose = (id: PlanId) =>
    subscribed
      ? act(`plan-${id}`, () => client.private.billing.changePlan({ plan: id }), "Planen byttes ved neste trekk.")
      : goToCheckout(() => client.private.billing.startCheckout({ plan: id }), `plan-${id}`);

  // What the plan card says, per state.
  const summary = developer
    ? { title: "Utviklertilgang", pill: <Pill>Aktiv</Pill>, line: "Full tilgang for Agenci-teamet. Denne organisasjonen faktureres aldri.", price: 0 }
    : trialing
      ? {
          title: `Prøveperiode`,
          pill: <Pill>Aktiv</Pill>,
          line: `Alt i ${plan.name} til ${date(billing?.trialEndsAt)}. Ingen kort, og ingenting trekkes automatisk.`,
          price: 0,
        }
      : status === "active"
        ? {
            title: plan.name,
            pill: billing?.cancelAtPeriodEnd ? <Pill tone="warn">Avsluttes</Pill> : <Pill>Aktiv</Pill>,
            line: billing?.cancelAtPeriodEnd
              ? `Avsluttes ${date(billing?.currentPeriodEnd)}. Agentene svarer til da.`
              : `Neste trekk ${date(billing?.currentPeriodEnd)}.`,
            price: plan.price,
          }
        : status === "past_due"
          ? { title: plan.name, pill: <Pill tone="bad">Betaling feilet</Pill>, line: "Oppdater kortet innen en uke, ellers stopper agentene å svare.", price: plan.price }
          : { title: "Ingen aktiv plan", pill: <Pill tone="muted">Inaktiv</Pill>, line: "Agentene svarer ikke kundene før dere velger en plan.", price: 0 };

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <header className="flex flex-wrap items-end gap-x-6 gap-y-3 px-1">
        <div className="min-w-0">
          <h1 className="[font-family:var(--font-agenci-title)] text-[26px] leading-[1.15] font-medium tracking-[-0.03em] text-(--agenci-ink)">
            Plan og faktura
          </h1>
          <p className="mt-1.5 text-[13.5px] text-(--agenci-ink-2)">Abonnement, bruk og fakturaer for {org?.name ?? "organisasjonen"}.</p>
        </div>
        {billing?.testMode ? (
          <span className="ml-auto rounded-full border border-[#ecd9a4] bg-[#fdf8e8] px-3 py-1 text-[12px] font-medium text-[#6b5413]">
            Testmodus – ingen ekte betalinger
          </span>
        ) : null}
      </header>

      {/* ── Your plan ─────────────────────────────────────────────── */}
      <section className={cn(card, "grid overflow-hidden lg:grid-cols-[1.4fr_1fr]")}>
        <div className="flex flex-col gap-5 p-6 md:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[12px] font-medium tracking-[0.08em] text-(--agenci-ink-3) uppercase">Din plan</span>
            {summary.pill}
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="[font-family:var(--font-agenci-title)] text-[38px] leading-none font-medium tracking-[-0.04em] text-(--agenci-ink)">
              {summary.title}
            </h2>
            <p className="text-(--agenci-ink)">
              <span className="[font-family:var(--font-agenci-title)] text-[34px] leading-none font-medium tracking-[-0.04em] tabular-nums">
                {kr(summary.price)}
              </span>
              <span className="ml-1.5 text-[13px] text-(--agenci-ink-3)">kr / mnd</span>
            </p>
          </div>
          <p className="max-w-[52ch] text-[14px] leading-relaxed text-(--agenci-ink-2)">{summary.line}</p>

          {trialing ? (
            <div>
              <div className="h-1.5 overflow-hidden rounded-full bg-(--chart-track)">
                <div
                  className="h-full rounded-full bg-(--agenci-ink) transition-[width] duration-500"
                  style={{ width: `${Math.min(100, ((trialDays - left) / trialDays) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-[12.5px] text-(--agenci-ink-3)">
                {left} av {trialDays} dager igjen
              </p>
            </div>
          ) : null}

          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            {status === "past_due" ? (
              <button type="button" className={inkBtn} disabled={busy === "card"} onClick={() => void goToCheckout(() => client.private.billing.startCardUpdate(), "card")}>
                Oppdater kort
              </button>
            ) : null}
            {!subscribed && !developer && canPay ? (
              <a href="#planer" className={inkBtn}>
                Velg plan <ArrowRightIcon className="size-3.5" strokeWidth={2} />
              </a>
            ) : null}
            {!subscribed && !developer && !canPay ? (
              <span className="text-[13px] text-(--agenci-ink-3)">Betaling åpner snart.</span>
            ) : null}
            {subscribed ? (
              <button
                type="button"
                className={ghostBtn}
                disabled={busy === "cancel"}
                onClick={() =>
                  void act(
                    "cancel",
                    () => client.private.billing.setCancel({ cancel: !billing?.cancelAtPeriodEnd }),
                    billing?.cancelAtPeriodEnd ? "Abonnementet fortsetter." : "Abonnementet avsluttes ved periodens slutt.",
                  )
                }
              >
                {billing?.cancelAtPeriodEnd ? "Fortsett abonnementet" : "Si opp"}
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col divide-y divide-(--agenci-line) border-t border-(--agenci-line) bg-(--dash-subtle-2)/60 lg:border-t-0 lg:border-l dark:divide-white/5 dark:border-white/5 dark:bg-white/[0.02]">
          <div className="flex items-start gap-3 p-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-(--dash-surface) text-(--agenci-ink-2) shadow-[0_1px_2px_rgb(5_6_7/0.08)] dark:bg-white/10">
              <Building2Icon className="size-4" strokeWidth={1.6} />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] text-(--agenci-ink-3)">Fakturamottaker</p>
              <p className="truncate text-[14px] font-medium text-(--agenci-ink)">{billing?.company?.name ?? org?.name ?? "–"}</p>
              <p className="text-[12.5px] text-(--agenci-ink-3)">
                {billing?.company ? `Org.nr. ${orgNr(billing.company.orgNumber)}` : "Ikke registrert"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-(--dash-surface) text-(--agenci-ink-2) shadow-[0_1px_2px_rgb(5_6_7/0.08)] dark:bg-white/10">
              <CreditCardIcon className="size-4" strokeWidth={1.6} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-(--agenci-ink-3)">Betalingsmåte</p>
              <p className="text-[14px] font-medium text-(--agenci-ink)">{subscribed ? "Kort hos Nexi" : "Ingen kort"}</p>
              <p className="text-[12.5px] text-(--agenci-ink-3)">
                {subscribed ? "Trekkes automatisk hver måned." : "Legges inn når dere velger plan."}
              </p>
            </div>
            {subscribed ? (
              <button type="button" className={ghostBtn} disabled={busy === "card"} onClick={() => void goToCheckout(() => client.private.billing.startCardUpdate(), "card")}>
                Bytt kort
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── Usage (unchanged chart) ────────────────────────────────── */}
      <section className={cn(card, "p-6")}>
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-(--agenci-ink)">
              Samtaler denne måneden
              {trend !== null ? (
                <span
                  className={cn(
                    "rounded-full border px-2 py-px text-[11.5px] font-medium",
                    trend >= 0 ? "border-[#5FA06F]/40 text-(--dash-good)" : "border-(--agenci-line) text-(--agenci-ink-2)",
                  )}
                >
                  {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)} %
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-[13px] text-(--agenci-ink-2)">
              {limit ? `${Math.round((used / limit) * 100)} % av samtalene i planen er brukt.` : ""}
            </p>
          </div>
          <span className="flex items-center gap-4 text-[12px] text-(--agenci-ink-3)">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded-full bg-(--agenci-ink)" /> Så langt
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 border-t border-dashed border-(--chart-axis)" /> Med samme tempo
            </span>
          </span>
        </div>
        <p className="mt-4 text-(--agenci-ink)">
          <span className="[font-family:var(--font-agenci-title)] text-[30px] leading-none font-medium tracking-[-0.03em] tabular-nums">{used}</span>
          <span className="ml-1.5 text-[13px] text-(--agenci-ink-3)">av {kr(limit)}</span>
        </p>
        <div className="mt-4">
          {usage ? <UsageChart days={usage.days} limit={limit} /> : <div className="h-[206px] animate-pulse rounded-[12px] bg-(--dash-subtle)" />}
        </div>
      </section>

      {/* ── Plans (as on agenci.no/priser) ─────────────────────────── */}
      <section id="planer" className="scroll-mt-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2 px-1">
          <div>
            <h2 className="text-[17px] font-semibold text-(--agenci-ink)">Planer</h2>
            <p className="mt-1 text-[13px] text-(--agenci-ink-2)">
              Priser eks. mva. Faktureres månedlig, ingen binding. Oppsigelse gjelder ut perioden som er betalt.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => {
            const current = subscribed && p.id === planId;
            const next = billing?.nextPlan === p.id;
            const dark = p.featured;
            return (
              <article
                key={p.id}
                className={cn(
                  "relative flex flex-col rounded-[22px] border p-6 transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5",
                  dark
                    ? "border-transparent bg-[linear-gradient(160deg,#23272c_0%,#16191c_60%,#0e1012_100%)] text-white shadow-[0_30px_60px_-32px_rgb(5_6_7/0.75)]"
                    : "border-(--dash-edge)/80 bg-(--dash-surface) text-(--agenci-ink) hover:shadow-[0_24px_48px_-32px_rgb(5_6_7/0.35)] dark:border-white/5 dark:bg-(--card)",
                  current && !dark && "border-(--agenci-ink)",
                )}
              >
                {p.featured ? (
                  <span className="absolute top-5 right-5 rounded-full bg-white/15 px-2.5 py-1 text-[11.5px] font-medium text-white backdrop-blur">
                    Mest populær
                  </span>
                ) : null}
                <h3 className="[font-family:var(--font-agenci-title)] text-[22px] font-medium tracking-[-0.03em]">{p.name}</h3>
                <p className={cn("mt-2.5 min-h-[44px] text-[13.5px] leading-relaxed", dark ? "text-white/65" : "text-(--agenci-ink-2)")}>
                  {p.blurb}
                </p>
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="[font-family:var(--font-agenci-title)] text-[44px] leading-none font-medium tracking-[-0.045em] tabular-nums">
                    {kr(p.price)}
                  </span>
                  <span className={cn("text-[13.5px]", dark ? "text-white/60" : "text-(--agenci-ink-3)")}>kr / mnd</span>
                </p>
                <p className={cn("mt-2 text-[12.5px]", dark ? "text-white/55" : "text-(--agenci-ink-3)")}>Faktureres månedlig</p>
                <p
                  className={cn(
                    "mt-5 flex items-center gap-2 rounded-[12px] px-3 py-2.5 text-[13px] font-medium",
                    dark ? "bg-white/10" : "bg-(--dash-subtle) dark:bg-white/5",
                  )}
                >
                  <MessageCircleIcon className="size-4" strokeWidth={1.7} />
                  {kr(p.limit)} samtaler / mnd
                </p>

                {current ? (
                  <span className={cn("mt-5 flex h-11 items-center justify-center rounded-full border text-[13.5px] font-medium", dark ? "border-white/25" : "border-(--agenci-line)")}>
                    Din plan
                  </span>
                ) : next ? (
                  <span className="mt-5 flex h-11 items-center justify-center rounded-full border border-(--agenci-line) text-[13.5px] font-medium">
                    Fra neste trekk
                  </span>
                ) : developer || !canPay ? (
                  <span
                    className={cn(
                      "mt-5 flex h-11 items-center justify-center rounded-full text-[13px]",
                      dark ? "bg-white/10 text-white/70" : "bg-(--dash-subtle) text-(--agenci-ink-3)",
                    )}
                  >
                    {developer ? "Inkludert i utviklertilgang" : "Betaling åpner snart"}
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={busy === `plan-${p.id}`}
                    onClick={() => void choose(p.id)}
                    className={cn(
                      "mt-5 inline-flex h-11 items-center justify-center gap-1.5 rounded-full text-[14px] font-medium transition-[background-color,opacity] disabled:opacity-50",
                      dark ? "bg-white text-[#111214] hover:bg-white/90" : "bg-(--agenci-ink) text-white hover:bg-(--agenci-accent-hover) dark:text-[#0b0c0e]",
                    )}
                  >
                    {subscribed ? `Bytt til ${p.name}` : `Velg ${p.name}`} <ArrowRightIcon className="size-4" strokeWidth={1.8} />
                  </button>
                )}

                <ul className="mt-6 flex flex-col gap-2.5">
                  {p.bullets.map(([text, included]) => (
                    <li
                      key={text}
                      className={cn(
                        "flex items-center gap-2.5 text-[13.5px]",
                        included ? "" : dark ? "text-white/40" : "text-(--agenci-ink-3)",
                      )}
                    >
                      {included ? (
                        <CheckIcon className="size-4 shrink-0" strokeWidth={2} />
                      ) : (
                        <XIcon className="size-4 shrink-0 opacity-70" strokeWidth={2} />
                      )}
                      <span className={included ? "" : "line-through decoration-1"}>{text}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Invoices ──────────────────────────────────────────────── */}
      <section className={cn(card, "overflow-hidden")}>
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          <h2 className="flex-1 text-[15px] font-semibold text-(--agenci-ink)">Fakturaer</h2>
          {payments?.length ? <span className="text-[12.5px] text-(--agenci-ink-3)">{payments.length} totalt</span> : null}
        </div>
        {payments?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse">
              <thead className="bg-(--dash-subtle-2) dark:bg-white/5">
                <tr className="text-left text-[12.5px] text-(--agenci-ink-2)">
                  <th className="h-10 px-6 font-medium">Faktura</th>
                  <th className="h-10 px-3 font-medium">Dato</th>
                  <th className="h-10 px-3 font-medium">Periode</th>
                  <th className="h-10 px-3 font-medium">Plan</th>
                  <th className="h-10 px-3 font-medium text-right">Beløp</th>
                  <th className="h-10 px-3 font-medium">Status</th>
                  <th className="h-10 px-6 font-medium">
                    <span className="sr-only">Vis</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const s = PAYMENT_STATUS[p.status] ?? PAYMENT_STATUS.pending;
                  return (
                    <tr key={p.id} className="border-t border-(--agenci-line) text-[13.5px] text-(--agenci-ink) dark:border-white/5">
                      <td className="h-14 px-6 font-medium tabular-nums">AG-{1000 + p.invoiceNumber}</td>
                      <td className="px-3 text-(--agenci-ink-2)">{date(p.createdAt, { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td className="px-3 text-(--agenci-ink-2)">
                        {date(p.periodStart, { day: "numeric", month: "short" })} – {date(p.periodEnd, { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-3">{PLANS.find((x) => x.id === p.plan)?.name ?? p.plan}</td>
                      <td className="px-3 text-right tabular-nums">{kr(p.amount / 100)} kr</td>
                      <td className="px-3">
                        <span className={cn("inline-flex rounded-full border px-2 py-px text-[12px] font-medium", s?.cls)}>{s?.label}</span>
                      </td>
                      <td className="px-6 text-right">
                        <Link to="/faktura/$invoiceId" params={{ invoiceId: p.id }} className={ghostBtn}>
                          <FileTextIcon className="size-3.5" strokeWidth={1.7} /> Vis
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-t border-(--agenci-line) px-6 py-14 text-center dark:border-white/5">
            <span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-(--dash-subtle) text-(--agenci-ink-2) dark:bg-white/10">
              <FileTextIcon className="size-4.5" strokeWidth={1.6} />
            </span>
            <p className="text-[14px] font-medium text-(--agenci-ink)">Ingen fakturaer ennå</p>
            <p className="mt-1 text-[13px] text-(--agenci-ink-3)">Hver månedlige betaling gir en faktura her, klar til å laste ned.</p>
          </div>
        )}
      </section>
    </div>
  );
}
