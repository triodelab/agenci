/**
 * Admin RPC. Every call checks the signed-in user is one of Agenci's own
 * developers (allow-listed e-mail AND verified by us); everyone else gets
 * NOT_FOUND, so the admin area doesn't reveal that it exists.
 */
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { getSessionFromHeaders } from "@/lib/session";
import { base } from "@/routers/procedures";
import {
  activity,
  audit,
  extendTrial,
  isAdminUser,
  listAudit,
  needsTwoFactor,
  revokeSessions,
  sendPasswordReset,
  listOrganizations,
  listUsers,
  organizationDetail,
  overview,
  setEmailVerified,
  listTables,
  tableRows,
} from "./service";
import * as control from "./control";
import { INTERVALS, PLAN_IDS, type PlanId } from "@/modules/billing/plans";

const Id = z.string().min(1).max(64);
const PlanSchema = z.enum(PLAN_IDS as [PlanId, ...PlanId[]]);

const adminProcedure = base.use(async ({ context, next }) => {
  const session = await getSessionFromHeaders(context.headers);
  if (!session || !isAdminUser(session.user)) throw new ORPCError("NOT_FOUND");
  return next({ context: { actor: { userId: session.user.id, email: session.user.email } } });
});

export const adminRouter = {
  /** Whether to show the admin link at all (never throws). */
  access: base.handler(async ({ context }) => {
    const session = await getSessionFromHeaders(context.headers);
    return {
      admin: Boolean(session && isAdminUser(session.user)),
      /** Only ever true for our own (verified) developers. */
      needsTwoFactor: Boolean(session && needsTwoFactor(session.user)),
    };
  }),
  overview: adminProcedure.handler(() => overview()),
  organizations: adminProcedure.handler(() => listOrganizations()),
  users: adminProcedure.handler(() => listUsers()),
  organization: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      await audit(context.actor, "view_organization", input.id);
      return organizationDetail(input.id);
    }),
  audit: adminProcedure.handler(() => listAudit()),
  sendPasswordReset: adminProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      const res = await sendPasswordReset(input.userId);
      await audit(context.actor, "send_password_reset", input.userId, { email: res.email });
      return res;
    }),
  revokeSessions: adminProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      const res = await revokeSessions(input.userId);
      await audit(context.actor, "revoke_sessions", input.userId, res);
      return res;
    }),
  activity: adminProcedure.handler(() => activity()),
  tables: adminProcedure.handler(() => listTables()),
  rows: adminProcedure
    .input(z.object({ table: z.string().min(1).max(64), page: z.number().int().min(0).max(10_000).default(0), search: z.string().max(200).optional() }))
    .handler(async ({ input, context }) => {
      // Page turns of the same table aren't logged again.
      if (input.page === 0) await audit(context.actor, "view_table", input.table, { search: input.search ?? null });
      return tableRows(input.table, input.page, input.search);
    }),
  /* ── Analysis ── */
  timeseries: adminProcedure
    .input(z.object({ days: z.number().int().min(7).max(365).default(30) }))
    .handler(({ input }) => control.timeseries(input.days)),
  alerts: adminProcedure.handler(() => control.alerts()),
  conversations: adminProcedure
    .input(z.object({ organizationId: Id.optional(), status: z.enum(["unresolved", "escalated", "resolved"]).optional(), q: z.string().max(200).optional(), page: z.number().int().min(0).max(10_000).default(0) }))
    .handler(({ input }) => control.listConversations(input)),
  conversation: adminProcedure
    .input(z.object({ id: z.string().min(1).max(128) }))
    .handler(async ({ input, context }) => {
      await audit(context.actor, "view_conversation", input.id);
      return control.conversationTranscript(input.id);
    }),
  agents: adminProcedure.handler(() => control.listAgents()),
  billing: adminProcedure.handler(() => control.billingReport()),
  usage: adminProcedure
    .input(z.object({ period: z.string().regex(/^\d{4}-\d{2}$/).optional() }))
    .handler(({ input }) => control.usageReport(input.period)),
  insights: adminProcedure.input(z.object({ id: Id })).handler(({ input }) => control.organizationInsights(input.id)),
  system: adminProcedure.handler(() => control.systemInfo()),
  user: adminProcedure.input(z.object({ id: Id })).handler(async ({ input, context }) => {
    await audit(context.actor, "view_user", input.id);
    return control.userDetail(input.id);
  }),

  /* ── Actions (all audited) ── */
  setPlan: adminProcedure
    .input(z.object({ organizationId: Id, plan: PlanSchema, interval: z.enum(INTERVALS), months: z.number().int().min(1).max(36) }))
    .handler(async ({ input, context }) => {
      const res = await control.setPlan(input.organizationId, input.plan, input.interval, input.months);
      await audit(context.actor, "set_plan", input.organizationId, { ...input, ...res });
      return res;
    }),
  cancelSubscription: adminProcedure
    .input(z.object({ organizationId: Id, immediately: z.boolean() }))
    .handler(async ({ input, context }) => {
      const res = await control.cancelSubscription(input.organizationId, input.immediately);
      await audit(context.actor, "cancel_subscription", input.organizationId, { immediately: input.immediately });
      return res;
    }),
  endTrial: adminProcedure.input(z.object({ organizationId: Id })).handler(async ({ input, context }) => {
    const res = await control.endTrial(input.organizationId);
    await audit(context.actor, "end_trial", input.organizationId);
    return res;
  }),
  releaseOrgNumber: adminProcedure.input(z.object({ organizationId: Id })).handler(async ({ input, context }) => {
    const res = await control.releaseOrgNumber(input.organizationId);
    await audit(context.actor, "release_org_number", input.organizationId, res);
    return res;
  }),
  deleteOrganization: adminProcedure
    .input(z.object({ organizationId: Id, confirmName: z.string().min(1).max(200) }))
    .handler(async ({ input, context }) => {
      const res = await control.deleteOrganization(input.organizationId, input.confirmName);
      await audit(context.actor, "delete_organization", input.organizationId, res);
      return res;
    }),
  changeMemberRole: adminProcedure
    .input(z.object({ memberId: Id, role: z.enum(["owner", "admin", "member"]) }))
    .handler(async ({ input, context }) => {
      const res = await control.changeMemberRole(input.memberId, input.role);
      await audit(context.actor, "change_member_role", res.organizationId, input);
      return res;
    }),
  removeMember: adminProcedure.input(z.object({ memberId: Id })).handler(async ({ input, context }) => {
    const res = await control.removeMember(input.memberId);
    await audit(context.actor, "remove_member", res.organizationId, input);
    return res;
  }),
  deleteDocument: adminProcedure.input(z.object({ documentId: Id })).handler(async ({ input, context }) => {
    const res = await control.deleteDocument(input.documentId);
    await audit(context.actor, "delete_document", res.organizationId, { documentId: input.documentId, name: res.name });
    return res;
  }),
  recrawlDocument: adminProcedure.input(z.object({ documentId: Id })).handler(async ({ input, context }) => {
    const res = await control.recrawlDocument(input.documentId);
    await audit(context.actor, "recrawl_document", res.organizationId, { documentId: input.documentId, url: res.url });
    return res;
  }),
  deleteUser: adminProcedure.input(z.object({ userId: Id })).handler(async ({ input, context }) => {
    const res = await control.deleteUser(input.userId, context.actor.userId);
    await audit(context.actor, "delete_user", input.userId, res);
    return res;
  }),
  extendTrial: adminProcedure
    .input(z.object({ organizationId: z.string().min(1), days: z.number().int().min(1).max(365) }))
    .handler(async ({ input, context }) => {
      const res = await extendTrial(input.organizationId, input.days);
      await audit(context.actor, "extend_trial", input.organizationId, { days: input.days, ...res });
      return res;
    }),
  setEmailVerified: adminProcedure
    .input(z.object({ userId: z.string().min(1), verified: z.boolean() }))
    .handler(async ({ input, context }) => {
      const res = await setEmailVerified(input.userId, input.verified);
      await audit(context.actor, input.verified ? "verify_user" : "unverify_user", input.userId);
      return res;
    }),
};
