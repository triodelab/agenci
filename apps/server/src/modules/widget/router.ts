/**
 * Public/widget API — anonymous site visitors, scoped by contact session
 * (docs/task.md Phase 4). No Better Auth cookie involved.
 */
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { createPrismaClient } from "@agenci/db";
import { base, contactProcedure } from "@/routers/procedures";
import { clientIp, DAY, HOUR, MINUTE, rateLimit } from "@/lib/rate-limit";
import {
  appendThreadMessage,
  deleteConversationThreads,
  listThreadMessages,
  recordAgentReply,
  recordVisitorMessage,
} from "@/modules/conversations/service";
import {
  createContactSession,
  deleteContactSession,
  getContactSessionById,
  updateContactSessionIdentity,
} from "@/lib/contact-session";
import { sendChatMessage } from "@/modules/chat/send-chat-message";
import { checkChatAllowed } from "@/modules/billing/service";
import { brandToWidgetAppearance } from "./brand-appearance";
import {
  ContactSessionIdResponseSchema,
  CreateContactSessionSchema,
  GetWidgetSettingsSchema,
  PublicChatHistoryResponseSchema,
  PublicChatHistorySchema,
  SendPublicChatMessageResponseSchema,
  SendPublicChatMessageSchema,
  UpdateContactSessionIdentitySchema,
  ValidateContactSessionResponseSchema,
  ValidateContactSessionSchema,
  ValidateOrganizationResponseSchema,
  ValidateOrganizationSchema,
  WidgetSettingsResponseSchema,
  type WidgetCustomization,
  WidgetCustomizationSchema,
} from "./schema";

const prisma = createPrismaClient();

const OkResponseSchema = z.object({ ok: z.literal(true) });

/** Saved customization, ignoring anything that no longer validates. */
export function parseCustomization(raw: unknown): WidgetCustomization {
  const parsed = WidgetCustomizationSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : {};
}

const organizationsRouter = {
  validate: base
    .input(ValidateOrganizationSchema)
    .output(ValidateOrganizationResponseSchema)
    .handler(async ({ input }) => {
      const org = await prisma.organization.findUnique({
        where: { id: input.organizationId },
        select: { name: true },
      });

      if (!org) {
        return {
          valid: false,
          reason: "Organisasjonen ble ikke funnet",
          organizationName: null,
        };
      }

      return { valid: true, reason: null, organizationName: org.name };
    }),
};

const contactSessionsRouter = {
  create: base
    .input(CreateContactSessionSchema)
    .output(ContactSessionIdResponseSchema)
    .handler(async ({ input, context }) => {
      // New chat sessions per visitor IP (stops scripted session spam).
      rateLimit(`session:${clientIp(context.headers)}`, 20, HOUR);
      const org = await prisma.organization.findUnique({
        where: { id: input.organizationId },
        select: { id: true },
      });
      if (!org) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organisasjonen ble ikke funnet",
        });
      }

      const session = await createContactSession(input);
      return {
        contactSessionId: session.id,
        expiresAt: session.expiresAt.toISOString(),
      };
    }),

  validate: base
    .input(ValidateContactSessionSchema)
    .output(ValidateContactSessionResponseSchema)
    .handler(async ({ input }) => {
      try {
        await getContactSessionById(input.contactSessionId);
        return { valid: true };
      } catch {
        return { valid: false };
      }
    }),

  updateIdentity: contactProcedure
    .input(UpdateContactSessionIdentitySchema)
    .output(OkResponseSchema)
    .handler(async ({ input, context }) => {
      rateLimit(`identity:${context.contactSession.id}`, 10, HOUR);
      await updateContactSessionIdentity({
        id: context.contactSession.id,
        name: input.name,
        email: input.email,
      });
      return { ok: true as const };
    }),

  deleteMySession: contactProcedure.output(OkResponseSchema).handler(async ({ context }) => {
    // The visitor's conversations go too (rows cascade; threads by id).
    const conversations = await prisma.conversation.findMany({
      where: { contactSessionId: context.contactSession.id },
      select: { id: true },
    });
    await deleteConversationThreads(conversations.map((c) => c.id));
    await deleteContactSession(context.contactSession.id);
    return { ok: true as const };
  }),
};

const widgetSettingsRouter = {
  /**
   * Appearance comes from the branding extracted at onboarding. Manual
   * overrides (dashboard customization, Task 5.1) and booking/vapi
   * (Task 4.3) are not wired yet.
   */
  getByOrganizationId: base
    .input(GetWidgetSettingsSchema)
    .output(WidgetSettingsResponseSchema)
    .handler(async ({ input }) => {
      const agent = await prisma.agent.findFirst({
        where: {
          organizationId: input.organizationId,
          ...(input.agentId ? { id: input.agentId } : { status: "COMPLETED" }),
        },
        select: {
          id: true,
          name: true,
          widgetBrand: {
            select: {
              logoUrl: true,
              colorScheme: true,
              primaryColor: true,
              accentColor: true,
              backgroundColor: true,
              textPrimaryColor: true,
              textSecondaryColor: true,
              fontFamilyPrimary: true,
              settings: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      // Saved customization wins over the onboarding-extracted branding.
      const custom = parseCustomization(agent?.widgetBrand?.settings);
      const suggestions = custom.suggestions?.filter(Boolean) ?? [];
      return {
        agentId: agent?.id ?? null,
        agentName: agent?.name ?? null,
        widgetTitle: custom.title?.trim() || null,
        greeting: custom.greeting?.trim() || null,
        faviconUrl: agent?.widgetBrand?.logoUrl?.trim() || null,
        appearance: {
          ...(brandToWidgetAppearance(agent?.widgetBrand) ?? {}),
          ...(custom.appearance ?? {}),
        },
        hideBranding: custom.hideBranding ?? false,
        bookingEnabled: false,
        vapiSettings: null,
        defaultSuggestions: {
          suggestion1: suggestions[0] ?? null,
          suggestion2: suggestions[1] ?? null,
          suggestion3: suggestions[2] ?? null,
        },
      };
    }),
};

/**
 * Visitor ↔ agent ↔ team. Every message goes into the `conversations` index
 * (inbox) and the Mastra thread with the same id (full history):
 *
 *   widget chat.send ─► recordVisitorMessage ─┬─ status "escalated" ─► saved
 *                                             │   to the thread, no AI reply
 *                                             │   (team answers from the inbox)
 *                                             └─ otherwise ─► Mastra agent
 *                                                 (searchTool → pgvector) ─►
 *                                                 reply ─► recordAgentReply
 *
 * The widget polls `chat.history` while the team has the chat, so replies
 * from `conversations.reply` (dashboard) show up without a reload.
 */
const publicChatRouter = {
  send: contactProcedure
    .input(SendPublicChatMessageSchema)
    .output(SendPublicChatMessageResponseSchema)
    .handler(async ({ input, context }) => {
      const { organizationId, id: contactSessionId } = context.contactSession;
      // Every message costs an AI call: cap per visitor and per IP.
      rateLimit(`chat-min:${contactSessionId}`, 15, MINUTE);
      rateLimit(`chat-day:${contactSessionId}`, 300, DAY);
      rateLimit(`chat-ip:${clientIp(context.headers)}`, 40, MINUTE);
      const threadId = input.threadId ?? crypto.randomUUID();
      const memoryResourceId = `${organizationId}:contact:${contactSessionId}`;
      // Trial over, no plan, or this month's conversations used up: no AI
      // reply. The message still reaches the inbox so the team can answer.
      const isNew = !(await prisma.conversation.findUnique({ where: { id: threadId }, select: { id: true } }));
      const gate = await checkChatAllowed(organizationId, isNew);
      // Index row first: also stops a visitor from writing into someone
      // else's thread, and reopens a resolved conversation.
      const status = await recordVisitorMessage({
        threadId,
        organizationId,
        agentId: input.agentId,
        contactSessionId,
        text: input.message,
      });

      if (!gate.allowed) {
        const notice = "Chatten er ikke tilgjengelig akkurat nå. Meldingen din er sendt til teamet, og de svarer deg så snart de kan.";
        await appendThreadMessage({ threadId, resourceId: memoryResourceId, role: "user", text: input.message });
        await appendThreadMessage({ threadId, resourceId: memoryResourceId, role: "assistant", text: notice });
        await recordAgentReply(threadId, notice);
        return { threadId, message: notice, products: [], status };
      }

      if (status === "escalated") {
        await appendThreadMessage({
          threadId,
          resourceId: memoryResourceId,
          role: "user",
          text: input.message,
        });
        return { threadId, message: null, status };
      }

      const result = await sendChatMessage({
        organizationId,
        agentId: input.agentId,
        message: input.message,
        threadId,
        memoryResourceId,
      });
      await recordAgentReply(threadId, result.message);
      // The agent may have escalated or resolved during this turn.
      const after = await prisma.conversation.findUnique({
        where: { id: threadId },
        select: { status: true },
      });
      return {
        threadId,
        message: result.message,
        products: result.products,
        status: after?.status ?? "unresolved",
      };
    }),

  /** The visitor's own conversation: restores the chat after a reload and
   * delivers replies from the team. */
  history: contactProcedure
    .input(PublicChatHistorySchema)
    .output(PublicChatHistoryResponseSchema)
    .handler(async ({ input, context }) => {
      const row = await prisma.conversation.findFirst({
        where: {
          id: input.threadId,
          contactSessionId: context.contactSession.id,
        },
        select: { status: true },
      });
      if (!row) return { status: null, messages: [] };
      return {
        status: row.status,
        messages: await listThreadMessages(input.threadId),
      };
    }),
};

export const widgetPublicRouter = {
  organizations: organizationsRouter,
  contactSessions: contactSessionsRouter,
  widgetSettings: widgetSettingsRouter,
  chat: publicChatRouter,
};
