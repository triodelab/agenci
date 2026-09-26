import { z } from "zod";

// ─── Organizations ─────────────────────────────────────────────────────────

export const ValidateOrganizationSchema = z.object({
  organizationId: z.string().min(1),
});

export const ValidateOrganizationResponseSchema = z.object({
  valid: z.boolean(),
  reason: z.string().nullable(),
  organizationName: z.string().nullable(),
});

// ─── Contact sessions ───────────────────────────────────────────────────────

export const CreateContactSessionSchema = z.object({
  organizationId: z.string().min(1),
  agentId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  anonymous: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const ContactSessionIdResponseSchema = z.object({
  contactSessionId: z.string(),
  expiresAt: z.string(),
});

export const ValidateContactSessionSchema = z.object({
  contactSessionId: z.string().min(1),
});

export const ValidateContactSessionResponseSchema = z.object({
  valid: z.boolean(),
});

export const UpdateContactSessionIdentitySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// ─── Widget settings ────────────────────────────────────────────────────────

export const GetWidgetSettingsSchema = z.object({
  organizationId: z.string().min(1),
  agentId: z.string().min(1).optional(),
});

// ─── Widget customization (dashboard → widget) ──────────────────────────────

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Ugyldig farge");

/** Partial `WidgetAppearance` (packages/ui). */
export const WidgetAppearanceSchema = z.object({
  position: z.enum(["center", "bottom-right", "bottom-left", "custom"]).optional(),
  customX: z.number().int().min(0).max(400).optional(),
  customY: z.number().int().min(0).max(400).optional(),
  width: z.number().int().min(300).max(560).optional(),
  height: z.number().int().min(420).max(820).optional(),
  borderRadius: z.number().int().min(0).max(32).optional(),
  headerColor: hex.optional(),
  headerTextColor: hex.optional(),
  bubbleUserColor: hex.optional(),
  bubbleUserTextColor: hex.optional(),
  bubbleAssistantColor: hex.optional(),
  bubbleAssistantTextColor: hex.optional(),
  backgroundColor: hex.optional(),
  inputBorderColor: hex.optional(),
  inputBackgroundColor: hex.optional(),
  inputTextColor: hex.optional(),
  inputPlaceholderColor: hex.optional(),
  bubbleButtonColor: hex.optional(),
  bubbleButtonIconColor: hex.optional(),
  bubbleButtonSize: z.number().int().min(44).max(80).optional(),
  fontFamily: z.string().trim().max(80).optional(),
});

/** Models the customer can pick for their agent (all via the OpenAI key). */
export const AGENT_MODELS = [
  "openai/gpt-4o-mini",
  "openai/gpt-4.1-mini",
  "openai/gpt-4o",
  "openai/gpt-4.1",
] as const;

/** How the agent behaves. Layered on top of the fixed safety rules. */
export const AgentBehaviorSchema = z.object({
  model: z.enum(AGENT_MODELS).optional(),
  tone: z.enum(["vennlig", "profesjonell", "uformell", "presis"]).optional(),
  length: z.enum(["kort", "balansert", "utfyllende"]).optional(),
  formality: z.enum(["du", "de"]).optional(),
  language: z.enum(["bokmal", "nynorsk", "kundens"]).optional(),
  emoji: z.boolean().optional(),
  rules: z
    .array(
      z.object({
        id: z.string().min(1).max(40),
        text: z.string().trim().min(1).max(240),
        enabled: z.boolean(),
      }),
    )
    .max(20)
    .optional(),
  avoidTopics: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  escalation: z
    .object({
      onHumanRequest: z.boolean().optional(),
      onComplaint: z.boolean().optional(),
      onUncertain: z.boolean().optional(),
      contact: z.string().trim().max(160).optional(),
    })
    .optional(),
});
export type AgentBehavior = z.infer<typeof AgentBehaviorSchema>;

/** Stored in `agent_widget_brands.settings`; every field optional. */
export const WidgetCustomizationSchema = z.object({
  behavior: AgentBehaviorSchema.optional(),
  title: z.string().trim().max(60).nullable().optional(),
  greeting: z.string().trim().max(300).nullable().optional(),
  suggestions: z.array(z.string().trim().max(90)).max(3).optional(),
  hideBranding: z.boolean().optional(),
  appearance: WidgetAppearanceSchema.optional(),
});
export type WidgetCustomization = z.infer<typeof WidgetCustomizationSchema>;

export const WidgetSettingsResponseSchema = z.object({
  agentId: z.string().nullable(),
  agentName: z.string().nullable(),
  /** Header title — null falls back to "Agenci" in the widget. */
  widgetTitle: z.string().nullable(),
  /** First assistant message — null falls back to the widget's default. */
  greeting: z.string().nullable(),
  faviconUrl: z.string().nullable(),
  /** Partial `WidgetAppearance`: onboarding branding + saved customization. */
  appearance: WidgetAppearanceSchema.partial().nullable(),
  hideBranding: z.boolean(),
  bookingEnabled: z.boolean(),
  vapiSettings: z
    .object({
      assistantId: z.string().nullable(),
      phoneNumber: z.string().nullable(),
    })
    .nullable(),
  defaultSuggestions: z.object({
    suggestion1: z.string().nullable(),
    suggestion2: z.string().nullable(),
    suggestion3: z.string().nullable(),
  }),
});

// ─── Chat (public) ──────────────────────────────────────────────────────────

export const SendPublicChatMessageSchema = z.object({
  agentId: z.string().min(1),
  message: z.string().min(1, "Melding er påkrevd"),
  threadId: z.string().min(1).optional(),
});

export const SendPublicChatMessageResponseSchema = z.object({
  threadId: z.string(),
  message: z.string(),
});
