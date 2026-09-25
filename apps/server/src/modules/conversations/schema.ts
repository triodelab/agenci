import { z } from "zod";

export const ConversationStatusSchema = z.enum([
  "unresolved",
  "escalated",
  "resolved",
]);
export type ConversationStatus = z.infer<typeof ConversationStatusSchema>;

const ContactSchema = z.object({
  contactSessionId: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  anonymous: z.boolean(),
  language: z.string().nullable(),
  timezone: z.string().nullable(),
  userAgent: z.string().nullable(),
  referrer: z.string().nullable(),
  currentUrl: z.string().nullable(),
  expiresAt: z.string(),
});

const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  text: z.string(),
  createdAt: z.string(),
});

export const ConversationSummarySchema = z.object({
  threadId: z.string(),
  status: ConversationStatusSchema,
  contact: ContactSchema,
  /** First visitor message — used as the conversation's headline. */
  firstMessage: z.string().nullable(),
  lastMessage: MessageSchema.nullable(),
  messageCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ListConversationsSchema = z.object({
  agentId: z.string().min(1),
});

export const ListConversationsResponseSchema = z.object({
  conversations: z.array(ConversationSummarySchema),
});

export const GetConversationSchema = z.object({
  agentId: z.string().min(1),
  threadId: z.string().min(1),
});

export const GetConversationResponseSchema = z.object({
  conversation: ConversationSummarySchema.extend({
    agentName: z.string(),
    messages: z.array(MessageSchema),
  }).nullable(),
});

export const SetConversationStatusSchema = z.object({
  agentId: z.string().min(1),
  threadId: z.string().min(1),
  status: ConversationStatusSchema,
});

export const SetConversationStatusResponseSchema = z.object({
  status: ConversationStatusSchema,
});
