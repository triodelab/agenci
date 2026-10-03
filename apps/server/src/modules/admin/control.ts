/**
 * Admin, part 2: analysis across the platform and the actions that change
 * things (plans, members, knowledge, users, organizations). Every action is
 * audited by the router.
 */
import prisma from "@agenci/db";
import { env } from "@agenci/env/server";
import { ORPCError } from "@orpc/server";
import { agentOnboardingEvent, inngest } from "@/inngest/client";
import { deleteFile } from "@/lib/s3-client";
import { type BillingInterval, isPlanId, PLANS, type PlanId } from "@/modules/billing/plans";
import { isTrustedDeveloper } from "@/modules/billing/service";
import { listThreadMessages } from "@/modules/conversations/service";

const DAY = 86_400_000;

/* ── Cost model ─────────────────────────────────────────────────────── */

/** gpt-4o-mini list prices (USD per 1M tokens) and a fixed NOK rate. Estimates only. */
const USD_PER_M_INPUT = 0.15;
const USD_PER_M_OUTPUT = 0.6;
const NOK_PER_USD = 10.8;

export function costNok(inputTokens: number, outputTokens: number) {
  return ((inputTokens / 1e6) * USD_PER_M_INPUT + (outputTokens / 1e6) * USD_PER_M_OUTPUT) * NOK_PER_USD;
}

/** Monthly revenue (øre) of a subscription, yearly counted per month. */
function monthlyRevenue(sub: { plan: string; interval: string; status: string } | null) {
  if (!sub || !isPlanId(sub.plan) || !["active", "charging", "past_due"].includes(sub.status)) return 0;
  const p = PLANS[sub.plan];
  return sub.interval === "year" ? p.yearlyPrice : p.price;
}

/* ── Time series & alerts ───────────────────────────────────────────── */

type DayRow = { day: string; n: bigint };

async function perDay(table: "user" | "organization" | "conversations", days: number) {
  const since = new Date(Date.now() - days * DAY);
  const rows =
    table === "user"
      ? await prisma.$queryRaw<DayRow[]>`SELECT to_char(("createdAt" AT TIME ZONE 'Europe/Oslo')::date, 'YYYY-MM-DD') AS day, count(*) AS n FROM "user" WHERE "createdAt" >= ${since} GROUP BY 1`
      : table === "organization"
        ? await prisma.$queryRaw<DayRow[]>`SELECT to_char(("createdAt" AT TIME ZONE 'Europe/Oslo')::date, 'YYYY-MM-DD') AS day, count(*) AS n FROM organization WHERE "createdAt" >= ${since} GROUP BY 1`
        : await prisma.$queryRaw<DayRow[]>`SELECT to_char(("createdAt" AT TIME ZONE 'Europe/Oslo')::date, 'YYYY-MM-DD') AS day, count(*) AS n FROM conversations WHERE "createdAt" >= ${since} GROUP BY 1`;
  const byDay = new Map(rows.map((r) => [r.day, Number(r.n)]));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * DAY);
    const key = d.toLocaleDateString("sv-SE", { timeZone: "Europe/Oslo" });
    return { day: key, n: byDay.get(key) ?? 0 };
  });
}

export async function timeseries(days = 30) {
  const [users, orgs, conversations] = await Promise.all([
    perDay("user", days),
    perDay("organization", days),
    perDay("conversations", days),
  ]);
  return { users, orgs, conversations };
}

/** Things that need someone to look at them. */
export async function alerts(now = new Date()) {
  const [failedAgents, failedDocs, pastDue, trialsEnding, waiting, failedPayments] = await Promise.all([
    prisma.agent.findMany({
      where: { status: "FAILED" },
      select: { id: true, name: true, organization: { select: { id: true, name: true } } },
      take: 20,
    }),
    prisma.document.findMany({
      where: { status: "FAILED" },
      select: { id: true, documentName: true, organization: { select: { id: true, name: true } } },
      take: 20,
    }),
    prisma.subscription.findMany({
      where: { status: "past_due" },
      select: { pastDueSince: true, organization: { select: { id: true, name: true } } },
    }),
    prisma.billingAccount.findMany({
      where: { trialEndsAt: { gt: now, lte: new Date(now.getTime() + 3 * DAY) } },
      select: { trialEndsAt: true, organization: { select: { id: true, name: true } } },
    }),
    prisma.conversation.findMany({
      where: { status: "escalated", lastMessageRole: "user", lastMessageAt: { lte: new Date(now.getTime() - 2 * 3_600_000) } },
      select: { id: true, firstMessage: true, lastMessageAt: true, organization: { select: { id: true, name: true } } },
      orderBy: { lastMessageAt: "asc" },
      take: 20,
    }),
    prisma.billingPayment.findMany({
      where: { status: "failed", createdAt: { gte: new Date(now.getTime() - 30 * DAY) } },
      select: { id: true, amount: true, createdAt: true, organization: { select: { id: true, name: true } } },
      take: 20,
    }),
  ]);
  return {
    failedAgents: failedAgents.map((a) => ({ id: a.id, title: a.name, org: a.organization })),
    failedDocs: failedDocs.map((d) => ({ id: d.id, title: d.documentName ?? "Kilde", org: d.organization })),
    pastDue: pastDue.map((s) => ({ since: s.pastDueSince, org: s.organization })),
    trialsEnding: trialsEnding.map((t) => ({ endsAt: t.trialEndsAt, org: t.organization })),
    waiting: waiting.map((c) => ({ id: c.id, title: c.firstMessage ?? "", at: c.lastMessageAt, org: c.organization })),
    failedPayments: failedPayments.map((p) => ({ id: p.id, amount: p.amount, at: p.createdAt, org: p.organization })),
  };
}

/* ── Lists across all organizations ─────────────────────────────────── */

export async function listConversations(input: { organizationId?: string; status?: string; q?: string; page: number }) {
  const take = 50;
  const where = {
    messageCount: { gt: 0 },
    ...(input.organizationId ? { organizationId: input.organizationId } : {}),
    ...(input.status ? { status: input.status as "unresolved" | "escalated" | "resolved" } : {}),
    ...(input.q
      ? {
          OR: [
            { firstMessage: { contains: input.q, mode: "insensitive" as const } },
            { lastMessage: { contains: input.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      skip: input.page * take,
      take,
      select: {
        id: true,
        status: true,
        firstMessage: true,
        lastMessage: true,
        messageCount: true,
        lastMessageAt: true,
        createdAt: true,
        organization: { select: { id: true, name: true } },
        agent: { select: { name: true } },
        contactSession: { select: { name: true, email: true } },
      },
    }),
    prisma.conversation.count({ where }),
  ]);
  return { rows: rows.map((r) => ({ ...r, status: String(r.status) })), total, page: input.page, pageSize: take };
}

/** One conversation with every message (from the agent's memory). */
export async function conversationTranscript(id: string) {
  const c = await prisma.conversation.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      messageCount: true,
      createdAt: true,
      lastMessageAt: true,
      organization: { select: { id: true, name: true } },
      agent: { select: { id: true, name: true } },
      contactSession: { select: { name: true, email: true, createdAt: true } },
    },
  });
  if (!c) throw new ORPCError("NOT_FOUND", { message: "Samtalen finnes ikke." });
  const messages = await listThreadMessages(id).catch(() => []);
  return {
    ...c,
    status: String(c.status),
    messages: messages.map((m) => ({
      id: m.id,
      author: m.author,
      authorName: m.authorName,
      text: m.text,
      products: m.products.length,
      createdAt: m.createdAt,
    })),
  };
}

export async function listAgents() {
  const agents = await prisma.agent.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      organization: { select: { id: true, name: true } },
      widgetBrand: { select: { sourceUrl: true } },
      _count: { select: { documents: true, conversations: true } },
    },
  });
  return agents.map((a) => ({ ...a, status: String(a.status) }));
}

export async function billingReport() {
  const [subs, payments] = await Promise.all([
    prisma.subscription.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        plan: true,
        interval: true,
        status: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        nexiSubscriptionId: true,
        organization: { select: { id: true, name: true } },
      },
    }),
    prisma.billingPayment.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        invoiceNumber: true,
        plan: true,
        interval: true,
        amount: true,
        status: true,
        createdAt: true,
        organization: { select: { id: true, name: true } },
      },
    }),
  ]);
  const mrrByPlan: Record<string, number> = {};
  for (const s of subs) {
    const r = monthlyRevenue(s);
    if (r) mrrByPlan[s.plan] = (mrrByPlan[s.plan] ?? 0) + r;
  }
  const paidLast30 = payments
    .filter((p) => p.status === "paid" && p.createdAt.getTime() > Date.now() - 30 * DAY)
    .reduce((s, p) => s + p.amount, 0);
  return {
    subscriptions: subs.map((s) => ({ ...s, comped: !s.nexiSubscriptionId, nexiSubscriptionId: undefined })),
    payments,
    mrrByPlan,
    paidLast30,
  };
}

/** AI usage, estimated cost and revenue per organization for one month. */
export async function usageReport(period?: string) {
  const month = period ?? new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Oslo" }).slice(0, 7);
  const [usage, orgs, months] = await Promise.all([
    prisma.usageMonthly.findMany({ where: { period: month } }),
    prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        subscription: { select: { plan: true, interval: true, status: true } },
        _count: { select: { conversations: true } },
      },
    }),
    prisma.$queryRaw<{ period: string }[]>`SELECT DISTINCT period FROM usage_monthly ORDER BY period DESC LIMIT 12`,
  ]);
  const byOrg = new Map(usage.map((u) => [u.organizationId, u]));
  const rows = orgs
    .map((o) => {
      const u = byOrg.get(o.id);
      const cost = u ? costNok(u.inputTokens, u.outputTokens) : 0;
      const revenue = monthlyRevenue(o.subscription) / 100;
      return {
        organizationId: o.id,
        name: o.name,
        plan: o.subscription?.plan ?? null,
        messages: u?.messages ?? 0,
        inputTokens: u?.inputTokens ?? 0,
        outputTokens: u?.outputTokens ?? 0,
        costNok: Math.round(cost * 10_000) / 10_000,
        revenueNok: revenue,
        marginNok: Math.round((revenue - cost) * 100) / 100,
      };
    })
    .sort((a, b) => b.costNok - a.costNok);
  const totals = rows.reduce(
    (t, r) => ({
      messages: t.messages + r.messages,
      tokens: t.tokens + r.inputTokens + r.outputTokens,
      costNok: t.costNok + r.costNok,
      revenueNok: t.revenueNok + r.revenueNok,
    }),
    { messages: 0, tokens: 0, costNok: 0, revenueNok: 0 },
  );
  return { period: month, periods: months.map((m) => m.period), rows, totals, note: "Kostnaden er et anslag fra gpt-4o-mini-priser og fast dollarkurs." };
}

/** Org detail extras: daily conversations and the knowledge sources. */
export async function organizationInsights(organizationId: string, days = 30) {
  const since = new Date(Date.now() - days * DAY);
  const [rows, documents, statusCounts] = await Promise.all([
    prisma.$queryRaw<DayRow[]>`SELECT to_char(("createdAt" AT TIME ZONE 'Europe/Oslo')::date, 'YYYY-MM-DD') AS day, count(*) AS n FROM conversations WHERE "organizationId" = ${organizationId} AND "createdAt" >= ${since} GROUP BY 1`,
    prisma.document.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      select: { id: true, documentName: true, type: true, status: true, createdAt: true, updatedAt: true, agent: { select: { name: true } } },
    }),
    prisma.conversation.groupBy({ by: ["status"], where: { organizationId }, _count: { _all: true } }),
  ]);
  const byDay = new Map(rows.map((r) => [r.day, Number(r.n)]));
  const series = Array.from({ length: days }, (_, i) => {
    const key = new Date(Date.now() - (days - 1 - i) * DAY).toLocaleDateString("sv-SE", { timeZone: "Europe/Oslo" });
    return { day: key, n: byDay.get(key) ?? 0 };
  });
  return {
    series,
    documents: documents.map((d) => ({ ...d, type: String(d.type), status: String(d.status) })),
    statusCounts: Object.fromEntries(statusCounts.map((s) => [String(s.status), s._count._all])) as Record<string, number>,
  };
}

/* ── System ─────────────────────────────────────────────────────────── */

const startedAt = new Date();

export async function systemInfo() {
  const [dbSize, tables, sessions] = await Promise.all([
    prisma.$queryRaw<{ size: bigint }[]>`SELECT pg_database_size(current_database()) AS size`,
    prisma.$queryRaw<{ table: string; bytes: bigint }[]>`
      SELECT c.relname AS table, pg_total_relation_size(c.oid)::bigint AS bytes
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' ORDER BY bytes DESC LIMIT 8`,
    prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
  ]);
  const mem = process.memoryUsage();
  return {
    startedAt,
    uptimeSeconds: Math.round(process.uptime()),
    runtime: `Bun ${typeof Bun !== "undefined" ? Bun.version : "?"}`,
    memoryMb: Math.round(mem.rss / 1024 / 1024),
    dbBytes: Number(dbSize[0]?.size ?? 0),
    biggestTables: tables.map((t) => ({ table: t.table, bytes: Number(t.bytes) })),
    activeSessions: sessions,
    // Settings that matter, never secrets.
    config: {
      nodeEnv: env.NODE_ENV,
      nexiMode: env.NEXI_MODE,
      nexiConfigured: Boolean(env.NEXI_SECRET_KEY && env.NEXI_CHECKOUT_KEY),
      billingEnforced: env.BILLING_ENFORCE === "1",
      vatRegistered: env.SELLER_VAT_REGISTERED === "1",
      emailConfigured: Boolean(env.RESEND_API_KEY),
      emailFrom: env.RESEND_FROM_EMAIL,
      openaiConfigured: Boolean(env.OPENAI_API_KEY),
      developers: env.DEV_ACCESS_EMAILS.split(",").map((e) => e.trim()).filter(Boolean),
      testPayers: env.TEST_PAYER_EMAILS.split(",").map((e) => e.trim()).filter(Boolean),
    },
  };
}

/* ── Users ──────────────────────────────────────────────────────────── */

export async function userDetail(id: string) {
  const u = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      twoFactorEnabled: true,
      createdAt: true,
      updatedAt: true,
      members: { select: { id: true, role: true, createdAt: true, organization: { select: { id: true, name: true } } } },
      sessions: {
        orderBy: { updatedAt: "desc" },
        select: { id: true, ipAddress: true, userAgent: true, createdAt: true, updatedAt: true, expiresAt: true },
      },
      accounts: { select: { providerId: true, createdAt: true } },
    },
  });
  if (!u) throw new ORPCError("NOT_FOUND", { message: "Brukeren finnes ikke." });
  const audit = await prisma.adminAuditLog.findMany({
    where: { target: id },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, actorEmail: true, action: true, createdAt: true },
  });
  return { ...u, developer: isTrustedDeveloper(u), audit };
}

export async function deleteUser(id: string, actorUserId: string) {
  if (id === actorUserId) throw new ORPCError("BAD_REQUEST", { message: "Du kan ikke slette din egen konto herfra." });
  const user = await prisma.user.findUnique({ where: { id }, select: { email: true } });
  if (!user) throw new ORPCError("NOT_FOUND", { message: "Brukeren finnes ikke." });
  await prisma.user.delete({ where: { id } });
  return { email: user.email };
}

/* ── Organizations ──────────────────────────────────────────────────── */

/** Deletes an organization and everything in it, including AI memory and files. */
export async function deleteOrganization(id: string, confirmName: string) {
  const org = await prisma.organization.findUnique({
    where: { id },
    select: { name: true, agents: { select: { id: true } }, documents: { select: { s3Key: true, markdownKey: true } } },
  });
  if (!org) throw new ORPCError("NOT_FOUND", { message: "Organisasjonen finnes ikke." });
  if (confirmName.trim() !== org.name.trim()) {
    throw new ORPCError("BAD_REQUEST", { message: "Navnet stemmer ikke. Skriv navnet nøyaktig for å bekrefte." });
  }
  for (const d of org.documents) {
    for (const key of [d.s3Key, d.markdownKey]) if (key) await deleteFile(key).catch(() => undefined);
  }
  const agentIds = org.agents.map((a) => a.id);
  await prisma.$transaction([
    prisma.$executeRaw`DELETE FROM embeddings WHERE metadata->>'agentId' = ANY(${agentIds})`,
    prisma.$executeRaw`DELETE FROM mastra_messages WHERE thread_id IN (SELECT id FROM mastra_threads WHERE "resourceId" LIKE ${`${id}:%`})`,
    prisma.$executeRaw`DELETE FROM mastra_threads WHERE "resourceId" LIKE ${`${id}:%`}`,
    prisma.organization.delete({ where: { id } }),
  ]);
  return { name: org.name, agents: agentIds.length };
}

/** Give or change a plan by hand (no payment): a "comp" period of N months. */
export async function setPlan(organizationId: string, plan: PlanId, interval: BillingInterval, months: number) {
  const sub = await prisma.subscription.findUnique({ where: { organizationId } });
  const paying = sub?.nexiSubscriptionId && ["active", "charging", "past_due"].includes(sub.status);
  if (paying) {
    // A real card subscription: change what the next charge is for.
    await prisma.subscription.update({ where: { organizationId }, data: { plan, interval, cancelAtPeriodEnd: false } });
    return { mode: "next_charge" as const };
  }
  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + months);
  await prisma.subscription.upsert({
    where: { organizationId },
    create: { organizationId, plan, interval, status: "active", currentPeriodStart: now, currentPeriodEnd: end },
    update: { plan, interval, status: "active", currentPeriodStart: now, currentPeriodEnd: end, cancelAtPeriodEnd: false, pastDueSince: null },
  });
  return { mode: "comp" as const, until: end.toISOString() };
}

export async function cancelSubscription(organizationId: string, immediately: boolean) {
  const sub = await prisma.subscription.findUnique({ where: { organizationId } });
  if (!sub) throw new ORPCError("NOT_FOUND", { message: "Ingen abonnement." });
  await prisma.subscription.update({
    where: { organizationId },
    data: immediately ? { status: "canceled", currentPeriodEnd: new Date(), cancelAtPeriodEnd: false } : { cancelAtPeriodEnd: true },
  });
  return { ok: true };
}

export async function endTrial(organizationId: string) {
  await prisma.billingAccount.update({ where: { organizationId }, data: { trialEndsAt: new Date() } });
  return { ok: true };
}

/** Frees the org number (and its trial) so it can be registered again. */
export async function releaseOrgNumber(organizationId: string) {
  const account = await prisma.billingAccount.findUnique({ where: { organizationId } });
  if (!account) throw new ORPCError("NOT_FOUND", { message: "Organisasjonen har ikke registrert org.nr." });
  await prisma.$transaction([
    prisma.billingAccount.delete({ where: { organizationId } }),
    prisma.trialClaim.deleteMany({ where: { orgNumber: account.orgNumber } }),
  ]);
  return { orgNumber: account.orgNumber };
}

/* ── Members ────────────────────────────────────────────────────────── */

export async function changeMemberRole(memberId: string, role: "owner" | "admin" | "member") {
  const m = await prisma.member.findUnique({ where: { id: memberId } });
  if (!m) throw new ORPCError("NOT_FOUND", { message: "Medlemmet finnes ikke." });
  if (m.role === "owner" && role !== "owner") {
    const owners = await prisma.member.count({ where: { organizationId: m.organizationId, role: "owner" } });
    if (owners <= 1) throw new ORPCError("BAD_REQUEST", { message: "Organisasjonen må ha minst én eier." });
  }
  await prisma.member.update({ where: { id: memberId }, data: { role } });
  return { organizationId: m.organizationId };
}

export async function removeMember(memberId: string) {
  const m = await prisma.member.findUnique({ where: { id: memberId } });
  if (!m) throw new ORPCError("NOT_FOUND", { message: "Medlemmet finnes ikke." });
  if (m.role === "owner") {
    const owners = await prisma.member.count({ where: { organizationId: m.organizationId, role: "owner" } });
    if (owners <= 1) throw new ORPCError("BAD_REQUEST", { message: "Kan ikke fjerne eneste eier." });
  }
  await prisma.member.delete({ where: { id: memberId } });
  return { organizationId: m.organizationId };
}

/* ── Knowledge ──────────────────────────────────────────────────────── */

export async function deleteDocument(documentId: string) {
  const d = await prisma.document.findUnique({ where: { id: documentId } });
  if (!d) throw new ORPCError("NOT_FOUND", { message: "Kilden finnes ikke." });
  for (const key of [d.s3Key, d.markdownKey]) if (key) await deleteFile(key).catch(() => undefined);
  await prisma.$executeRaw`DELETE FROM embeddings WHERE metadata->>'documentId' = ${d.id}`.catch(() => 0);
  await prisma.document.delete({ where: { id: documentId } });
  return { organizationId: d.organizationId, name: d.documentName };
}

/** Reads a web page source again (fresh crawl, old chunks removed first). */
export async function recrawlDocument(documentId: string) {
  const d = await prisma.document.findUnique({ where: { id: documentId } });
  if (!d) throw new ORPCError("NOT_FOUND", { message: "Kilden finnes ikke." });
  if (String(d.type) !== "WEBPAGE" || !d.documentName || !d.agentId) {
    throw new ORPCError("BAD_REQUEST", { message: "Bare nettsider kan leses inn på nytt." });
  }
  await prisma.$executeRaw`DELETE FROM embeddings WHERE metadata->>'documentId' = ${d.id}`.catch(() => 0);
  await prisma.document.update({ where: { id: d.id }, data: { status: "PENDING" } });
  await inngest.send(
    agentOnboardingEvent.create({
      url: d.documentName,
      agentId: d.agentId,
      organizationId: d.organizationId,
      userId: d.ownerId,
      documentId: d.id,
    }),
  );
  return { organizationId: d.organizationId, url: d.documentName };
}
