/**
 * Root oRPC router — `public` (unauthed) + `private` (org-scoped).
 */
import { z } from "zod";
import { base, privateProcedure, requireOrgMiddleware } from "./procedures";
import { agentsRouter } from "@/modules/agents/router";
import { documentsRouter } from "@/modules/documents/router";
import { knowledgeRouter } from "@/modules/knowledge/router";
import { widgetCustomizationRouter } from "@/modules/widget/customization-router";
import { chatRouter } from "@/modules/chat/router";
import { conversationsRouter } from "@/modules/conversations/router";
import { widgetPublicRouter } from "@/modules/widget/router";

const health = base
  .output(z.object({ ok: z.literal(true) }))
  .handler(async () => ({ ok: true as const }));

export const publicRouter = {
  health,
  ...widgetPublicRouter,
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
  conversations: conversationsRouter,
  knowledge: knowledgeRouter,
  widgetCustomization: widgetCustomizationRouter,
};

export const appRouter = {
  public: publicRouter,
  private: privateRouter,
};

export type AppRouter = typeof appRouter;
