/**
 * Billing: who may use Agenci, and the money flow with Nexi.
 *
 *   registration (org number, Enhetsregisteret) → 30-day trial (once per org
 *   number, ever) → checkout (Nexi subscription, first month charged) →
 *   monthly charges by our daily job → webhooks confirm or fail them.
 *
 * Entitlement is decided here, server-side only.
 */
import prisma from "@agenci/db";
import { env } from "@agenci/env/server";
import { ORPCError } from "@orpc/server";
import { lookupCompany } from "./brreg";
import { SELLER, sellerOrgLine, sellerVatRegistered } from "./seller";
import {
  bulkCharge,
  createSubscriptionCheckout,
  getPayment,
  NEXI_CHECKOUT_JS,
  nexiConfigured,
} from "./nexi";
import { GRACE_DAYS, isPlanId, type PlanId, PLANS, planAmounts, TRIAL_DAYS, TRIAL_PLAN } from "./plans";

const DAY = 86_400_000;

export type BillingStatus =
  | "developer"
  | "needs_registration"
  | "trialing"
  | "trial_ended"
  | "active"
  | "past_due"
  | "canceled";

export type BillingState = {
  status: BillingStatus;
  /** The plan whose limits apply now (the trial uses Starter's). */
  plan: PlanId | null;
  canUseAI: boolean;
  conversationLimit: number;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  /** Plan that starts at the next charge, when it differs from `plan`. */
  nextPlan: PlanId | null;
  company: { orgNumber: string; name: string } | null;
  testMode: boolean;
};

function addMonth(d: Date) {
  const n = new Date(d);
  n.setMonth(n.getMonth() + 1);
  return n;
}

/** "2026-10" in Norway's calendar. */
export function osloPeriod(now = new Date()) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit" }).formatToParts(now);
  return `${p.find((x) => x.type === "year")?.value}-${p.find((x) => x.type === "month")?.value}`;
}

/** The team building Agenci (DEV_ACCESS_EMAILS). */
export function isDeveloperEmail(email: string | null | undefined) {
  if (!email) return false;
  const list = env.DEV_ACCESS_EMAILS.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

/** An organization with one of the developers as a member: never billed. */
export async function isDeveloperOrganization(organizationId: string) {
  const members = await prisma.member.findMany({
    where: { organizationId },
    select: { user: { select: { email: true } } },
  });
  return members.some((m) => isDeveloperEmail(m.user.email));
}

export async function getBillingState(organizationId: string, now = new Date()): Promise<BillingState> {
  const [account, sub, developer] = await Promise.all([
    prisma.billingAccount.findUnique({ where: { organizationId } }),
    prisma.subscription.findUnique({ where: { organizationId } }),
    isDeveloperOrganization(organizationId),
  ]);
  const base = {
    company: account ? { orgNumber: account.orgNumber, name: account.companyName } : null,
    trialEndsAt: account?.trialEndsAt?.toISOString() ?? null,
    currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
    nextPlan: null as PlanId | null,
    testMode: env.NEXI_MODE !== "live",
  };

  if (developer) {
    return { ...base, status: "developer", plan: "business", canUseAI: true, conversationLimit: PLANS.business.conversations };
  }

  const paidUntil = sub?.currentPeriodEnd?.getTime() ?? 0;
  const inGrace =
    sub?.status === "past_due" && sub.pastDueSince && now.getTime() - sub.pastDueSince.getTime() < GRACE_DAYS * DAY;
  if (sub && isPlanId(sub.plan) && (((sub.status === "active" || sub.status === "charging") && paidUntil > now.getTime() - DAY) || inGrace)) {
    const plan = sub.plan;
    return {
      ...base,
      status: sub.status === "past_due" ? "past_due" : "active",
      plan,
      canUseAI: true,
      conversationLimit: PLANS[plan].conversations,
    };
  }
  if (!account) {
    return { ...base, status: "needs_registration", plan: null, canUseAI: false, conversationLimit: 0 };
  }
  if (account.trialEndsAt && account.trialEndsAt > now) {
    return { ...base, status: "trialing", plan: TRIAL_PLAN, canUseAI: true, conversationLimit: PLANS[TRIAL_PLAN].conversations };
  }
  return {
    ...base,
    status: sub?.status === "canceled" ? "canceled" : "trial_ended",
    plan: null,
    canUseAI: false,
    conversationLimit: 0,
  };
}

/* ── Registration ───────────────────────────────────────────────────── */

export async function registerCompany(organizationId: string, orgNumberInput: string) {
  const found = await lookupCompany(orgNumberInput);
  if (!found.ok) throw new ORPCError("BAD_REQUEST", { message: found.message });

  const existing = await prisma.billingAccount.findUnique({ where: { organizationId } });
  if (existing) {
    throw new ORPCError("CONFLICT", { message: "Organisasjonen er allerede registrert med et organisasjonsnummer." });
  }
  const taken = await prisma.billingAccount.findUnique({ where: { orgNumber: found.orgNumber } });
  if (taken) {
    throw new ORPCError("CONFLICT", {
      message: "Dette organisasjonsnummeret er allerede registrert. Ta kontakt på post@triodelab.no hvis du mener det er feil.",
    });
  }

  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const claim = await tx.trialClaim.findUnique({ where: { orgNumber: found.orgNumber } });
    if (!claim) await tx.trialClaim.create({ data: { orgNumber: found.orgNumber, organizationId } });
    const account = await tx.billingAccount.create({
      data: {
        organizationId,
        orgNumber: found.orgNumber,
        companyName: found.name,
        trialStartedAt: claim ? null : now,
        trialEndsAt: claim ? null : new Date(now.getTime() + TRIAL_DAYS * DAY),
      },
    });
    return { companyName: account.companyName, trial: !claim, trialEndsAt: account.trialEndsAt?.toISOString() ?? null };
  });
}

/* ── Checkout ───────────────────────────────────────────────────────── */

function publicUrls() {
  const dashboard = (env.DASHBOARD_ORIGIN ?? env.CORS_ORIGIN).replace(/\/$/, "");
  return {
    checkoutUrl: `${dashboard}/betaling`,
    // Webhooks reach the API through the dashboard's origin (Caddy proxies /api).
    publicUrl: env.BETTER_AUTH_URL.replace(/\/$/, ""),
    termsUrl: "https://www.agenci.no/vilkar",
  };
}

function requireNexi() {
  if (!nexiConfigured()) {
    throw new ORPCError("PRECONDITION_FAILED", { message: "Betaling er ikke satt opp ennå." });
  }
}

/**
 * Who may open the payment page: anyone once Nexi is live; while it is in
 * test mode only the developers (test cards would otherwise unlock a plan).
 */
function isTestPayer(email: string | null | undefined) {
  if (!email) return false;
  const list = env.TEST_PAYER_EMAILS.split(",").map((e) => e.trim().toLowerCase());
  return list.includes(email.toLowerCase());
}

/** Live: everyone. Test mode: the developers and the listed test payers. */
export function canPay(email: string | null | undefined) {
  return env.NEXI_MODE === "live" || isDeveloperEmail(email) || isTestPayer(email);
}

function requirePayer(email: string | null | undefined) {
  if (!canPay(email)) {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "Betaling åpner snart. Dere kan bruke prøveperioden fullt ut i mellomtiden.",
    });
  }
}

/** Starts the embedded checkout for a plan: first month charged at once. */
export async function startCheckout(organizationId: string, plan: PlanId, email?: string | null) {
  requireNexi();
  requirePayer(email);
  const account = await prisma.billingAccount.findUnique({ where: { organizationId } });
  if (!account) {
    throw new ORPCError("PRECONDITION_FAILED", { message: "Registrer bedriften med organisasjonsnummer først." });
  }
  const sub = await prisma.subscription.findUnique({ where: { organizationId } });
  if (sub && (sub.status === "active" || sub.status === "charging") && !sub.cancelAtPeriodEnd) {
    throw new ORPCError("CONFLICT", { message: "Dere har allerede et aktivt abonnement. Bytt plan i stedet." });
  }
  const urls = publicUrls();
  const { paymentId } = await createSubscriptionCheckout({
    plan,
    reference: `${organizationId}:${plan}:${Date.now()}`,
    email,
    ...urls,
  });
  await prisma.subscription.upsert({
    where: { organizationId },
    create: { organizationId, plan, status: "pending", nexiPaymentId: paymentId },
    update: { plan, nexiPaymentId: paymentId, ...(sub?.status === "active" ? {} : { status: "pending" }) },
  });
  return { paymentId, checkoutKey: env.NEXI_CHECKOUT_KEY as string, scriptUrl: NEXI_CHECKOUT_JS };
}

/** Lets the customer swap the card on the subscription (expired card etc.). */
export async function startCardUpdate(organizationId: string, email?: string | null) {
  requireNexi();
  requirePayer(email);
  const sub = await prisma.subscription.findUnique({ where: { organizationId } });
  if (!sub?.nexiSubscriptionId || !isPlanId(sub.plan)) {
    throw new ORPCError("PRECONDITION_FAILED", { message: "Det finnes ikke noe abonnement å oppdatere." });
  }
  const { paymentId } = await createSubscriptionCheckout({
    plan: sub.plan,
    reference: `${organizationId}:${sub.plan}:card:${Date.now()}`,
    subscriptionId: sub.nexiSubscriptionId,
    email,
    ...publicUrls(),
  });
  return { paymentId, checkoutKey: env.NEXI_CHECKOUT_KEY as string, scriptUrl: NEXI_CHECKOUT_JS };
}

/** Net and VAT inside a charged total (VAT only when VAT-registered). */
function splitVat(total: number) {
  if (!sellerVatRegistered()) return { netAmount: total, vatAmount: 0 };
  const net = Math.round(total / 1.25);
  return { netAmount: net, vatAmount: total - net };
}

/** Everything an invoice shows for one payment (this organization only). */
export async function getInvoice(organizationId: string, paymentId: string) {
  const p = await prisma.billingPayment.findFirst({ where: { id: paymentId, organizationId } });
  if (!p) throw new ORPCError("NOT_FOUND", { message: "Fakturaen finnes ikke." });
  const [account, org] = await Promise.all([
    prisma.billingAccount.findUnique({ where: { organizationId } }),
    prisma.organization.findUnique({ where: { id: organizationId }, select: { name: true } }),
  ]);
  const plan = isPlanId(p.plan) ? PLANS[p.plan] : null;
  return {
    number: `AG-${1000 + p.invoiceNumber}`,
    issuedAt: p.createdAt.toISOString(),
    status: p.status,
    periodStart: p.periodStart.toISOString(),
    periodEnd: p.periodEnd.toISOString(),
    seller: { ...SELLER, orgLine: sellerOrgLine(), vatRegistered: sellerVatRegistered() },
    buyer: {
      name: account?.companyName ?? org?.name ?? "",
      orgNumber: account?.orgNumber ?? null,
    },
    line: { description: `Agenci ${plan?.name ?? p.plan} – abonnement 1 måned`, conversations: plan?.conversations ?? null },
    netAmount: p.netAmount || p.amount,
    vatAmount: p.vatAmount,
    amount: p.amount,
    currency: p.currency,
  };
}

/** "<orgId>:<plan>:<…>" — the order reference we set on every payment. */
function parseReference(reference: string | undefined) {
  const [organizationId, plan] = (reference ?? "").split(":");
  return organizationId && plan && isPlanId(plan) ? { organizationId, plan } : null;
}

/**
 * Applies a charged payment: the first month (activates the subscription) or
 * a renewal (extends it). Idempotent per payment — webhooks may repeat, and
 * the checkout page confirms too.
 */
export async function applyChargedPayment(paymentId: string) {
  const { payment } = await getPayment(paymentId);
  const ref = parseReference(payment.orderDetails?.reference);
  const charged = payment.summary?.chargedAmount ?? 0;
  if (!ref) return { applied: false as const, reason: "unknown reference" };
  if (charged <= 0) return { applied: false as const, reason: "not charged" };

  const already = await prisma.billingPayment.findUnique({ where: { nexiPaymentId: paymentId } });
  if (already?.status === "paid") return { applied: true as const, organizationId: ref.organizationId };

  const sub = await prisma.subscription.findUnique({ where: { organizationId: ref.organizationId } });
  const now = new Date();
  const renewing = Boolean(sub?.currentPeriodEnd && sub.status !== "pending" && sub.status !== "canceled");
  const periodStart = renewing && sub?.currentPeriodEnd && sub.currentPeriodEnd > now ? sub.currentPeriodEnd : now;
  const periodEnd = addMonth(periodStart);

  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { organizationId: ref.organizationId },
      create: {
        organizationId: ref.organizationId,
        plan: ref.plan,
        status: "active",
        nexiSubscriptionId: payment.subscription?.id ?? null,
        nexiPaymentId: paymentId,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
      update: {
        plan: ref.plan,
        status: "active",
        pastDueSince: null,
        ...(payment.subscription?.id ? { nexiSubscriptionId: payment.subscription.id } : {}),
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
    }),
    prisma.billingPayment.upsert({
      where: { nexiPaymentId: paymentId },
      create: {
        organizationId: ref.organizationId,
        nexiPaymentId: paymentId,
        plan: ref.plan,
        amount: charged,
        ...splitVat(charged),
        status: "paid",
        periodStart,
        periodEnd,
      },
      update: { status: "paid", amount: charged, ...splitVat(charged), periodStart, periodEnd },
    }),
  ]);
  return { applied: true as const, organizationId: ref.organizationId };
}

/** The checkout page calls this after Nexi reports the payment complete. */
export async function confirmCheckout(organizationId: string, paymentId: string) {
  requireNexi();
  const { payment } = await getPayment(paymentId);
  const ref = parseReference(payment.orderDetails?.reference);
  if (!ref || ref.organizationId !== organizationId) {
    throw new ORPCError("FORBIDDEN", { message: "Betalingen tilhører ikke denne organisasjonen." });
  }
  // A card update charges nothing; the subscription just keeps running.
  if ((payment.summary?.chargedAmount ?? 0) === 0 && payment.subscription?.id) {
    await prisma.subscription.update({
      where: { organizationId },
      data: { nexiSubscriptionId: payment.subscription.id, status: "active", pastDueSince: null },
    });
    return { ok: true };
  }
  const res = await applyChargedPayment(paymentId);
  return { ok: res.applied };
}

/** A charge failed (webhook): keep the plan running through the grace period. */
export async function markChargeFailed(paymentId: string) {
  const { payment } = await getPayment(paymentId).catch(() => ({ payment: null }));
  const ref = parseReference(payment?.orderDetails?.reference);
  if (!ref) return;
  await prisma.subscription.updateMany({
    where: { organizationId: ref.organizationId, status: { in: ["active", "charging"] } },
    data: { status: "past_due", pastDueSince: new Date() },
  });
}

/* ── Plan changes ───────────────────────────────────────────────────── */

export async function changePlan(organizationId: string, plan: PlanId) {
  const sub = await prisma.subscription.findUnique({ where: { organizationId } });
  if (!sub || !["active", "charging", "past_due"].includes(sub.status)) {
    throw new ORPCError("PRECONDITION_FAILED", { message: "Velg en plan og betal først." });
  }
  // Takes effect from the next monthly charge.
  await prisma.subscription.update({ where: { organizationId }, data: { plan, cancelAtPeriodEnd: false } });
}

export async function setCancelAtPeriodEnd(organizationId: string, cancel: boolean) {
  const n = await prisma.subscription.updateMany({
    where: { organizationId, status: { in: ["active", "charging", "past_due"] } },
    data: { cancelAtPeriodEnd: cancel },
  });
  if (n.count === 0) throw new ORPCError("PRECONDITION_FAILED", { message: "Det finnes ikke noe aktivt abonnement." });
}

export async function listPayments(organizationId: string) {
  return prisma.billingPayment.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: { id: true, invoiceNumber: true, plan: true, amount: true, currency: true, status: true, periodStart: true, periodEnd: true, createdAt: true },
  });
}

/* ── The daily job ──────────────────────────────────────────────────── */

/**
 * Renews what is due today, ends what was cancelled, and gives up on
 * payments that stayed failed past the grace period.
 */
export async function runDailyBilling(now = new Date()) {
  const due = await prisma.subscription.findMany({
    where: { status: { in: ["active", "past_due"] }, currentPeriodEnd: { lte: now } },
  });
  const toCharge: { subscriptionId: string; plan: PlanId; reference: string; organizationId: string }[] = [];
  let ended = 0;
  for (const s of due) {
    const graceOver = s.status === "past_due" && s.pastDueSince && now.getTime() - s.pastDueSince.getTime() >= GRACE_DAYS * DAY;
    if (s.cancelAtPeriodEnd || graceOver || !s.nexiSubscriptionId || !isPlanId(s.plan)) {
      await prisma.subscription.update({ where: { id: s.id }, data: { status: "canceled" } });
      ended += 1;
      continue;
    }
    toCharge.push({
      subscriptionId: s.nexiSubscriptionId,
      plan: s.plan,
      organizationId: s.organizationId,
      reference: `${s.organizationId}:${s.plan}:${osloPeriod(s.currentPeriodEnd ?? now)}`,
    });
  }
  if (toCharge.length && nexiConfigured()) {
    const day = now.toISOString().slice(0, 10);
    await bulkCharge({
      // One per day: a re-run of the job the same day can't charge twice.
      externalBulkChargeId: `agenci-${day}`,
      publicUrl: publicUrls().publicUrl,
      charges: toCharge,
    });
    await prisma.subscription.updateMany({
      where: { organizationId: { in: toCharge.map((c) => c.organizationId) }, status: "active" },
      data: { status: "charging" },
    });
  }
  return { charged: toCharge.length, ended };
}

/* ── Usage & limits ─────────────────────────────────────────────────── */

/** Adds one chat turn's tokens to this month's usage (cost tracking). */
export async function recordUsage(
  organizationId: string,
  model: string,
  usage: { inputTokens?: number; outputTokens?: number } | undefined,
) {
  const input = Math.max(0, Math.round(usage?.inputTokens ?? 0));
  const output = Math.max(0, Math.round(usage?.outputTokens ?? 0));
  const period = osloPeriod();
  await prisma.$executeRaw`
    INSERT INTO usage_monthly ("id", "organizationId", "period", "messages", "inputTokens", "outputTokens", "byModel", "updatedAt")
    VALUES (${`${organizationId}:${period}`}, ${organizationId}, ${period}, 1, ${input}, ${output},
            jsonb_build_object(${model}::text, jsonb_build_object('in', ${input}::int, 'out', ${output}::int)), now())
    ON CONFLICT ("organizationId", "period") DO UPDATE SET
      "messages" = usage_monthly."messages" + 1,
      "inputTokens" = usage_monthly."inputTokens" + ${input},
      "outputTokens" = usage_monthly."outputTokens" + ${output},
      "byModel" = usage_monthly."byModel" || jsonb_build_object(${model}::text, jsonb_build_object(
        'in', COALESCE((usage_monthly."byModel"->${model}::text->>'in')::int, 0) + ${input}::int,
        'out', COALESCE((usage_monthly."byModel"->${model}::text->>'out')::int, 0) + ${output}::int)),
      "updatedAt" = now()`;
}

/** Conversations started this month (Norway's calendar). */
export async function conversationsThisMonth(organizationId: string, now = new Date()) {
  const [y, m] = osloPeriod(now).split("-").map(Number);
  // Midnight on the 1st in Oslo, as a UTC instant (CET +1 / CEST +2).
  const utcMidnight = Date.UTC(y as number, (m as number) - 1, 1);
  const p = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(utcMidnight));
  const offsetHours = Number(p.find((x) => x.type === "hour")?.value ?? 1);
  const start = new Date(utcMidnight - offsetHours * 3_600_000);
  return prisma.conversation.count({ where: { organizationId, createdAt: { gte: start } } });
}

export type ChatGate = { allowed: true } | { allowed: false; reason: "inactive" | "limit" };

/**
 * May this organization's widget start/continue an AI conversation?
 * Only enforced with BILLING_ENFORCE=1 (so existing customers aren't locked
 * out before billing is live). Existing conversations may always finish.
 */
export async function checkChatAllowed(organizationId: string, isNewConversation: boolean): Promise<ChatGate> {
  if (env.BILLING_ENFORCE !== "1") return { allowed: true };
  const state = await getBillingState(organizationId);
  if (!state.canUseAI) return { allowed: false, reason: "inactive" };
  if (isNewConversation && (await conversationsThisMonth(organizationId)) >= state.conversationLimit) {
    return { allowed: false, reason: "limit" };
  }
  return { allowed: true };
}

export { planAmounts, PLANS };
