/**
 * Public/widget API — anonymous site visitors, scoped by contact session
 * (docs/task.md Phase 4). No Better Auth cookie involved.
 */
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { createPrismaClient } from "@agenci/db";
import { base, contactProcedure } from "@/routers/procedures";
import {
  deleteConversationThreads,
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
import { brandToWidgetAppearance } from "./brand-appearance";
import {
  ContactSessionIdResponseSchema,
  CreateContactSessionSchema,
  GetWidgetSettingsSchema,
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
    .handler(async ({ input }) => {
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

const publicChatRouter = {
  send: contactProcedure
    .input(SendPublicChatMessageSchema)
    .output(SendPublicChatMessageResponseSchema)
    .handler(async ({ input, context }) => {
      const { organizationId, id: contactSessionId } = context.contactSession;
      const threadId = input.threadId ?? crypto.randomUUID();
      // Index row first: also stops a visitor from writing into someone
      // else's thread, and reopens a resolved conversation.
      await recordVisitorMessage({
        threadId,
        organizationId,
        agentId: input.agentId,
        contactSessionId,
        text: input.message,
      });
      const result = await sendChatMessage({
        organizationId,
        agentId: input.agentId,
        message: input.message,
        threadId,
        memoryResourceId: `${organizationId}:contact:${contactSessionId}`,
      });
      await recordAgentReply(threadId, result.message);
      return result;
    }),
};

export const widgetPublicRouter = {
  organizations: organizationsRouter,
  contactSessions: contactSessionsRouter,
  widgetSettings: widgetSettingsRouter,
  chat: publicChatRouter,
};
