import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  subscriptions: defineTable({
    organizationId: v.string(),
    status: v.string(),
    trialEndsAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"]),
  widgetSettings: defineTable({
    organizationId: v.string(),
    /** Vises i widget-header (f.eks. «Agenci»). */
    widgetTitle: v.optional(v.string()),
    agentId: v.optional(v.id("agents")),
    greetMessage: v.string(),
    defaultSuggestions: v.object({
      suggestion1: v.optional(v.string()),
      suggestion2: v.optional(v.string()),
      suggestion3: v.optional(v.string()),
    }),
    vapiSettings: v.object({
      assistantId: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
    }),
    appearance: v.optional(
      v.object({
        position: v.optional(
          v.union(
            v.literal("center"),
            v.literal("bottom-right"),
            v.literal("bottom-left"),
            v.literal("custom"),
          ),
        ),
        customX: v.optional(v.number()),
        customY: v.optional(v.number()),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        borderRadius: v.optional(v.number()),
        headerColor: v.optional(v.string()),
        headerTextColor: v.optional(v.string()),
        bubbleUserColor: v.optional(v.string()),
        bubbleUserTextColor: v.optional(v.string()),
        bubbleAssistantColor: v.optional(v.string()),
        bubbleAssistantTextColor: v.optional(v.string()),
        backgroundColor: v.optional(v.string()),
        inputBorderColor: v.optional(v.string()),
        inputBackgroundColor: v.optional(v.string()),
        inputTextColor: v.optional(v.string()),
        inputPlaceholderColor: v.optional(v.string()),
      }),
    ),
  })
  .index("by_organization_id", ["organizationId"]),
  plugins: defineTable({
    organizationId: v.string(),
    service: v.union(v.literal("vapi")),
    secretName: v.string(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_id_and_service", ["organizationId", "service"]),
  conversations: defineTable({
    agentId: v.optional(v.id("agents")),
    threadId: v.string(),
    organizationId: v.string(),
    contactSessionId: v.id("contactSessions"),
    status: v.union(
      v.literal("unresolved"),
      v.literal("escalated"),
      v.literal("resolved")
    ),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_contact_session_id", ["contactSessionId"])
    .index("by_thread_id", ["threadId"])
    .index("by_status_and_organization_id", ["status", "organizationId"])
    .index("by_agent_id", ["agentId"])
    .index("by_agent_id_and_status", ["agentId", "status"]),
  contactSessions: defineTable({
    name: v.string(),
    email: v.string(),
    organizationId: v.string(),
    expiresAt: v.number(),
    metadata: v.optional(v.object({
      userAgent: v.optional(v.string()),
      language: v.optional(v.string()),
      languages: v.optional(v.string()),
      platform: v.optional(v.string()),
      vendor: v.optional(v.string()),
      screenResolution: v.optional(v.string()),
      viewportSize: v.optional(v.string()),
      timezone: v.optional(v.string()),
      timezoneOffset: v.optional(v.number()),
      cookieEnabled: v.optional(v.boolean()),
      referrer: v.optional(v.string()),
      currentUrl: v.optional(v.string()),
    }))
  })
  .index("by_organization_id", ["organizationId"])
  .index("by_expires_at", ["expiresAt"]),
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerk_id: v.string(),
  }).index("by_clerk_id", ["clerk_id"]),
  agents: defineTable({
    organizationId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    slug: v.string(),
    isBuiltIn: v.boolean(),
    modelLabel: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_and_slug", ["organizationId", "slug"]),
  /** Operatør «forventet svar» fra Playground (Chatbase-lignende forbedring av AI-svar). */
  answerTrainingExamples: defineTable({
    organizationId: v.string(),
    conversationId: v.id("conversations"),
    userMessage: v.string(),
    assistantMessage: v.string(),
    expectedResponse: v.string(),
    createdAt: v.number(),
  }).index("by_organization_id", ["organizationId"]),
});
