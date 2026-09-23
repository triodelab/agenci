/**
 * Root oRPC router — `public` (unauthed) + `private` (org-scoped).
 */
import { z } from "zod";
import { base, privateProcedure, requireOrgMiddleware } from "./procedures";
import { agentsRouter } from "@/modules/agents/router";
import { documentsRouter } from "@/modules/documents/router";
import { chatRouter } from "@/modules/chat/router";

const health = base
  .output(z.object({ ok: z.literal(true) }))
  .handler(async () => ({ ok: true as const }));

export const publicRouter = {
  health,
};

export { privateProcedure, requireOrgMiddleware };

/** Placeholder until Phase 5 private domain routers. */
export const privateRouter = {
  /** Smoke: confirms cookie session + active org reach private RPC. */
  me: privateProcedure
    .output(
      z.object({
        userId: z.string(),
        organizationId: z.string(),
        role: z.string().nullable(),
      }),
    )
    .handler(async ({ context }) => ({
      userId: context.userId,
      organizationId: context.organizationId,
      role: context.role,
    })),
  agents: agentsRouter,
  documents: documentsRouter,
  chat: chatRouter,
};

export const appRouter = {
  public: publicRouter,
  private: privateRouter,
};

export type AppRouter = typeof appRouter;
