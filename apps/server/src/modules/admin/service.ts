/**
 * Admin (Agenci's own developers only): the whole platform at a glance —
 * every organization, user, agent and payment — and a few safe fixes.
 */
import { auth } from "@agenci/auth";
import prisma from "@agenci/db";
import { env } from "@agenci/env/server";
import { ORPCError } from "@orpc/server";
import { getBillingState, isDeveloperEmail, isTrustedDeveloper } from "@/modules/billing/service";
import { PLANS, isPlanId } from "@/modules/billing/plans";

const DAY = 86_400_000;

type AdminCandidate = { email?: string | null; emailVerified?: boolean | null; twoFactorEnabled?: boolean | null };

/**
 * Developer e-mail, verified by us, AND two-factor login on. A stolen
 * password alone must never open the admin area.
 */
export function isAdminUser(user: AdminCandidate) {
  return isTrustedDeveloper(user) && user.twoFactorEnabled === true;
}

/** One of us, but 2FA not switched on yet (the UI says how to fix it). */
export function needsTwoFactor(user: AdminCandidate) {
  return isTrustedDeveloper(user) && user.twoFactorEnabled !== true;
}

/* ── Audit log ──────────────────────────────────────────────────────── */

export type Actor = { userId: string; email: string };

/** Records an admin action. Never throws: logging must not break the action. */
export async function audit(actor: Actor, action: string, target?: string | null, details: Record<string, unknown> = {}) {
  try {
    await prisma.adminAuditLog.create({
      data: { actorUserId: actor.userId, actorEmail: actor.email, action, target: target ?? null, details: details as object },
    });
  } catch (error) {
    console.error("[admin audit]", action, error);
  }
}

export async function listAudit(limit = 200) {
  const rows = await prisma.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
  return rows.map((r) => ({
    id: r.id,
    actorEmail: r.actorEmail,
    action: r.action,
    target: r.target,
    details: JSON.stringify(r.details),
    createdAt: r.createdAt,
  }));
}

/** Sends the customer the normal «nytt passord» e-mail. We never see or set passwords. */
export async function sendPasswordReset(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) throw new ORPCError("NOT_FOUND", { message: "Brukeren finnes ikke." });
  const base = (env.DASHBOARD_ORIGIN ?? env.CORS_ORIGIN).replace(/\/$/, "");
  await auth.api.requestPasswordReset({ body: { email: user.email, redirectTo: `${base}/nytt-passord` } });
  return { email: user.email };
}

/** Signs a user out everywhere (e.g. a lost laptop). */
export async function revokeSessions(userId: string) {
  const { count } = await prisma.session.deleteMany({ where: { userId } });
  return { revoked: count };
}

export async function overview(now = new Date()) {
  const dayAgo = new Date(now.getTime() - DAY);
  const weekAgo = new Date(now.getTime() - 7 * DAY);
  const inAWeek = new Date(now.getTime() + 7 * DAY);
  const [
    users,
    usersWeek,
    orgs,
    agents,
    agentsFailed,
    conversations,
    conversationsDay,
    conversationsWeek,
    escalated,
    subs,
    trials,
    trialsEnding,
    failedPayments,
    usage,
    recentUsers,
    recentConversations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.organization.count(),
    prisma.agent.count(),
    prisma.agent.count({ where: { status: "FAILED" } }),
    prisma.conversation.count(),
    prisma.conversation.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.conversation.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.conversation.count({ where: { status: "escalated" } }),
    prisma.subscription.findMany({ select: { plan: true, status: true, interval: true } }),
    prisma.billingAccount.count({ where: { trialEndsAt: { gt: now } } }),
    prisma.billingAccount.count({ where: { trialEndsAt: { gt: now, lte: inAWeek } } }),
    prisma.billingPayment.count({ where: { status: "failed" } }),
    prisma.usageMonthly.aggregate({
      where: { period: now.toISOString().slice(0, 7) },
      _sum: { messages: true, inputTokens: true, outputTokens: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.conversation.findMany({
      orderBy: { lastMessageAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        firstMessage: true,
        messageCount: true,
        lastMessageAt: true,
        organization: { select: { id: true, name: true } },
        agent: { select: { name: true } },
      },
    }),
  ]);

  const paying = subs.filter((s) => (s.status === "active" || s.status === "charging" || s.status === "past_due") && isPlanId(s.plan));
  // Monthly recurring revenue in øre (yearly plans counted per month).
  const mrr = paying.reduce((sum, s) => {
    const p = PLANS[s.plan as keyof typeof PLANS];
    return sum + (s.interval === "year" ? p.yearlyPrice : p.price);
  }, 0);

  return {
    users,
    usersWeek,
    orgs,
    agents,
    agentsFailed,
    conversations,
    conversationsDay,
    conversationsWeek,
    escalated,
    paying: paying.length,
    pastDue: subs.filter((s) => s.status === "past_due").length,
    trials,
    trialsEnding,
    failedPayments,
    mrr,
    usage: {
      messages: usage._sum.messages ?? 0,
      inputTokens: usage._sum.inputTokens ?? 0,
      outputTokens: usage._sum.outputTokens ?? 0,
    },
    recentUsers,
    // Plain strings: Prisma enums don't belong in the RPC types.
    recentConversations: recentConversations.map((c) => ({ ...c, status: String(c.status) })),
  };
}

export async function listOrganizations() {
  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      billingAccount: { select: { orgNumber: true, companyName: true, trialEndsAt: true } },
      subscription: { select: { plan: true, status: true, interval: true, currentPeriodEnd: true } },
      _count: { select: { members: true, agents: true, conversations: true } },
    },
  });
  const states = await Promise.all(orgs.map((o) => getBillingState(o.id)));
  return orgs.map((o, i) => ({
    ...o,
    billingStatus: states[i]?.status ?? "needs_registration",
    plan: states[i]?.plan ?? null,
  }));
}

export async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      twoFactorEnabled: true,
      createdAt: true,
      members: { select: { role: true, organization: { select: { id: true, name: true } } } },
      sessions: { orderBy: { updatedAt: "desc" }, take: 1, select: { updatedAt: true } },
    },
  });
  return users.map(({ sessions, ...u }) => ({
    ...u,
    developer: isDeveloperEmail(u.email),
    lastSeenAt: sessions[0]?.updatedAt ?? null,
  }));
}

export async function organizationDetail(id: string) {
  const org = await prisma.organization.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      billingAccount: true,
      subscription: true,
      members: {
        select: { id: true, role: true, createdAt: true, user: { select: { id: true, name: true, email: true } } },
      },
      agents: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          widgetBrand: { select: { sourceUrl: true } },
          _count: { select: { documents: true, conversations: true } },
        },
      },
      billingPayments: {
        orderBy: { createdAt: "desc" },
        take: 24,
        select: { id: true, invoiceNumber: true, plan: true, interval: true, amount: true, status: true, createdAt: true },
      },
      usageMonthly: { orderBy: { period: "desc" }, take: 6 },
      conversations: {
        orderBy: { lastMessageAt: "desc" },
        take: 15,
        select: { id: true, status: true, firstMessage: true, messageCount: true, lastMessageAt: true, agent: { select: { name: true } } },
      },
    },
  });
  if (!org) throw new ORPCError("NOT_FOUND", { message: "Organisasjonen finnes ikke." });
  return {
    ...org,
    agents: org.agents.map((a) => ({ ...a, status: String(a.status) })),
    conversations: org.conversations.map((c) => ({ ...c, status: String(c.status) })),
    billing: await getBillingState(id),
  };
}

/* ── Safe fixes ─────────────────────────────────────────────────────── */

/** Adds days to the trial (from today if it already ended). */
export async function extendTrial(organizationId: string, days: number) {
  const account = await prisma.billingAccount.findUnique({ where: { organizationId } });
  if (!account) throw new ORPCError("PRECONDITION_FAILED", { message: "Organisasjonen har ikke registrert org.nr." });
  const now = new Date();
  const from = account.trialEndsAt && account.trialEndsAt > now ? account.trialEndsAt : now;
  const trialEndsAt = new Date(from.getTime() + days * DAY);
  await prisma.billingAccount.update({
    where: { organizationId },
    data: { trialEndsAt, trialStartedAt: account.trialStartedAt ?? now },
  });
  return { trialEndsAt: trialEndsAt.toISOString() };
}

/** Marks a user's e-mail as checked by us (needed for admin access). */
export async function setEmailVerified(userId: string, verified: boolean) {
  await prisma.user.update({ where: { id: userId }, data: { emailVerified: verified } });
  return { ok: true };
}

/* ── Database browser (read-only) ───────────────────────────────────── */

/** Never shown, whatever the table: passwords, tokens, keys. */
const SECRET_COLUMN = /password|token|secret|apikey|api_key|^value$|privatekey|hash/i;

type Column = { name: string; type: string };

async function publicTables() {
  const rows = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name`;
  return rows.map((r) => r.table_name);
}

async function columnsOf(table: string): Promise<Column[]> {
  const rows = await prisma.$queryRaw<{ column_name: string; data_type: string; udt_name: string }[]>`
    SELECT column_name, data_type, udt_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${table}
    ORDER BY ordinal_position`;
  return rows.map((r) => ({ name: r.column_name, type: r.data_type === "USER-DEFINED" ? r.udt_name : r.data_type }));
}

/** Every table with its (estimated) row count, biggest first. */
export async function listTables() {
  const rows = await prisma.$queryRaw<{ table: string; rows: bigint; bytes: bigint }[]>`
    SELECT c.relname AS table, GREATEST(c.reltuples, 0)::bigint AS rows, pg_total_relation_size(c.oid)::bigint AS bytes
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY rows DESC, c.relname`;
  return rows.map((r) => ({ table: r.table, rows: Number(r.rows), bytes: Number(r.bytes) }));
}

const quote = (ident: string) => `"${ident.replaceAll('"', '""')}"`;

/** One page of a table, newest first when it has a date column. Secrets redacted. */
export async function tableRows(table: string, page: number, search?: string) {
  const tables = await publicTables();
  if (!tables.includes(table)) throw new ORPCError("NOT_FOUND", { message: "Tabellen finnes ikke." });
  const columns = await columnsOf(table);
  const shown = columns.filter((c) => !SECRET_COLUMN.test(c.name));
  const select = columns
    .map((c) =>
      SECRET_COLUMN.test(c.name)
        ? `'••••' AS ${quote(c.name)}`
        : c.type === "vector"
          ? `'[vektor]' AS ${quote(c.name)}`
          : `${quote(c.name)}::text AS ${quote(c.name)}`,
    )
    .join(", ");
  const order = ["createdAt", "created_at", "updatedAt", "lastMessageAt"].find((n) => columns.some((c) => c.name === n));
  const limit = 50;
  const offset = Math.max(0, page) * limit;
  // Search across the text of every non-secret column.
  const where = search?.trim()
    ? `WHERE concat_ws(' ', ${shown.filter((c) => c.type !== "vector").map((c) => `${quote(c.name)}::text`).join(", ")}) ILIKE $1`
    : "";
  const sql = `SELECT ${select} FROM ${quote(table)} ${where} ${order ? `ORDER BY ${quote(order)} DESC NULLS LAST` : ""} LIMIT ${limit + 1} OFFSET ${offset}`;
  const params = search?.trim() ? [`%${search.trim()}%`] : [];
  const rows = await prisma.$queryRawUnsafe<Record<string, string | null>[]>(sql, ...params);
  return {
    table,
    columns: columns.map((c) => ({ ...c, secret: SECRET_COLUMN.test(c.name) })),
    rows: rows.slice(0, limit),
    page,
    hasMore: rows.length > limit,
  };
}

/* ── Live activity ──────────────────────────────────────────────────── */

export type ActivityEvent = {
  id: string;
  kind: "user" | "organization" | "agent" | "conversation" | "message" | "document" | "payment";
  at: Date;
  title: string;
  detail: string | null;
  organizationId: string | null;
};

/** The latest things that happened anywhere, newest first. */
export async function activity(limit = 60): Promise<ActivityEvent[]> {
  const take = 25;
  const [users, orgs, agents, convs, docs, payments] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take, select: { id: true, name: true, email: true, createdAt: true } }),
    prisma.organization.findMany({ orderBy: { createdAt: "desc" }, take, select: { id: true, name: true, createdAt: true } }),
    prisma.agent.findMany({
      orderBy: { createdAt: "desc" },
      take,
      select: { id: true, name: true, status: true, createdAt: true, organizationId: true, organization: { select: { name: true } } },
    }),
    prisma.conversation.findMany({
      orderBy: { lastMessageAt: "desc" },
      take,
      select: {
        id: true,
        createdAt: true,
        lastMessageAt: true,
        lastMessage: true,
        lastMessageRole: true,
        messageCount: true,
        firstMessage: true,
        status: true,
        organizationId: true,
        organization: { select: { name: true } },
        agent: { select: { name: true } },
      },
    }),
    prisma.document.findMany({
      orderBy: { updatedAt: "desc" },
      take,
      select: { id: true, documentName: true, type: true, status: true, updatedAt: true, organizationId: true, organization: { select: { name: true } } },
    }),
    prisma.billingPayment.findMany({
      orderBy: { updatedAt: "desc" },
      take,
      select: { id: true, amount: true, status: true, plan: true, interval: true, updatedAt: true, organizationId: true, organization: { select: { name: true } } },
    }),
  ]);
  const events: ActivityEvent[] = [
    ...users.map((u) => ({ id: `u-${u.id}`, kind: "user" as const, at: u.createdAt, title: `Ny bruker: ${u.name || u.email}`, detail: u.email, organizationId: null })),
    ...orgs.map((o) => ({ id: `o-${o.id}`, kind: "organization" as const, at: o.createdAt, title: `Ny organisasjon: ${o.name}`, detail: null, organizationId: o.id })),
    ...agents.map((a) => ({ id: `a-${a.id}`, kind: "agent" as const, at: a.createdAt, title: `Agent opprettet: ${a.name}`, detail: `${a.organization.name} · ${String(a.status)}`, organizationId: a.organizationId })),
    ...convs.map((c) => ({
      id: `c-${c.id}-${c.lastMessageAt.getTime()}`,
      kind: (c.messageCount > 1 ? "message" : "conversation") as ActivityEvent["kind"],
      at: c.lastMessageAt,
      title:
        c.messageCount > 1
          ? `${c.lastMessageRole === "assistant" ? "Agenten svarte" : c.lastMessageRole === "team" ? "Teamet svarte" : "Ny melding"} · ${c.agent.name}`
          : `Ny samtale · ${c.agent.name}`,
      detail: `${c.organization.name} · ${(c.lastMessage ?? c.firstMessage ?? "").slice(0, 140)}`,
      organizationId: c.organizationId,
    })),
    ...docs.map((d) => ({
      id: `d-${d.id}-${d.updatedAt.getTime()}`,
      kind: "document" as const,
      at: d.updatedAt,
      title: `Kunnskap ${String(d.status).toLowerCase()}: ${d.documentName ?? String(d.type).toLowerCase()}`,
      detail: d.organization.name,
      organizationId: d.organizationId,
    })),
    ...payments.map((p) => ({
      id: `p-${p.id}-${p.updatedAt.getTime()}`,
      kind: "payment" as const,
      at: p.updatedAt,
      title: `Betaling ${p.status === "paid" ? "mottatt" : p.status === "failed" ? "feilet" : "startet"}: ${Math.round(p.amount / 100)} kr`,
      detail: `${p.organization.name} · ${p.plan} ${p.interval === "year" ? "årlig" : "månedlig"}`,
      organizationId: p.organizationId,
    })),
  ];
  return events.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}
