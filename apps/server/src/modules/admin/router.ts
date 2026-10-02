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
  extendTrial,
  isAdminUser,
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
  return next({ context: { adminUserId: session.user.id, adminEmail: session.user.email } });
});

export const adminRouter = {
  /** Whether to show the admin link at all (never throws). */
  access: base.handler(async ({ context }) => {
    const session = await getSessionFromHeaders(context.headers);
    return { admin: Boolean(session && isAdminUser(session.user)) };
  }),
  overview: adminProcedure.handler(() => overview()),
  organizations: adminProcedure.handler(() => listOrganizations()),
  users: adminProcedure.handler(() => listUsers()),
  organization: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .handler(({ input }) => organizationDetail(input.id)),
  activity: adminProcedure.handler(() => activity()),
  tables: adminProcedure.handler(() => listTables()),
  rows: adminProcedure
    .input(z.object({ table: z.string().min(1).max(64), page: z.number().int().min(0).max(10_000).default(0), search: z.string().max(200).optional() }))
    .handler(({ input }) => tableRows(input.table, input.page, input.search)),
  extendTrial: adminProcedure
    .input(z.object({ organizationId: z.string().min(1), days: z.number().int().min(1).max(365) }))
    .handler(({ input, context }) => {
      console.info("[admin] extendTrial", context.adminEmail, input);
      return extendTrial(input.organizationId, input.days);
    }),
  setEmailVerified: adminProcedure
    .input(z.object({ userId: z.string().min(1), verified: z.boolean() }))
    .handler(({ input, context }) => {
      console.info("[admin] setEmailVerified", context.adminEmail, input);
      return setEmailVerified(input.userId, input.verified);
    }),
};
