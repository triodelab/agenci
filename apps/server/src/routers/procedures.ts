/**
 * Shared oRPC builders — keep separate from `router.ts` so domain modules
 * can import `privateProcedure` without circular deps on `appRouter`.
 */
import { ORPCError, os } from "@orpc/server";
import { AuthError, requireOrgFromHeaders } from "@/lib/session";
import {
  ContactSessionError,
  getContactSessionFromHeaders,
} from "@/lib/contact-session";
import type { ApiContext } from "./context";

export const base = os.$context<ApiContext>();

/**
 * Require Better Auth session + active organization.
 * Injects `userId`, `organizationId`, `role`, `user`, `session` into context.
 */
export const requireOrgMiddleware = base.middleware(
  async ({ context, next }) => {
    try {
      const org = await requireOrgFromHeaders(context.headers);
      return next({
        context: {
          userId: org.userId,
          organizationId: org.organizationId,
          role: org.role,
          user: org.user,
          session: org.session,
        },
      });
    } catch (error) {
      if (error instanceof AuthError) {
        throw new ORPCError(
          error.code === "UNAUTHENTICATED" ? "UNAUTHORIZED" : "FORBIDDEN",
          { message: error.message },
        );
      }
      throw error;
    }
  },
);

/** Base builder for org-scoped private procedures. */
export const privateProcedure = base.use(requireOrgMiddleware);

/**
 * Require a valid widget contact-session (`x-contact-session-id` header).
 * Injects `contactSession` into context for public/widget procedures.
 */
export const requireContactSessionMiddleware = base.middleware(
  async ({ context, next }) => {
    try {
      const contactSession = await getContactSessionFromHeaders(
        context.headers,
      );
      return next({ context: { contactSession } });
    } catch (error) {
      if (error instanceof ContactSessionError) {
        throw new ORPCError("UNAUTHORIZED", { message: error.message });
      }
      throw error;
    }
  },
);

/** Base builder for widget/public procedures scoped to a contact session. */
export const contactProcedure = base.use(requireContactSessionMiddleware);
