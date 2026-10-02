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
