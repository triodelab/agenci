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
  /** visitor, the AI agent, or a person from the team */
  author: z.enum(["visitor", "agent", "team"]),
  authorName: z.string().nullable(),
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

/** Conversations started this calendar month (Europe/Oslo), per day. */
export const ConversationUsageResponseSchema = z.object({
  /** e.g. "2026-09" */
  month: z.string(),
  /** Index 0 is the 1st of the month; only days so far are included. */
  days: z.array(z.number().int().nonnegative()),
  total: z.number().int().nonnegative(),
  previousTotal: z.number().int().nonnegative(),
});

export const ReplyToConversationSchema = z.object({
  agentId: z.string().min(1),
  threadId: z.string().min(1),
  text: z.string().trim().min(1, "Skriv et svar").max(4000),
});

export const ReplyToConversationResponseSchema = z.object({
  ok: z.literal(true),
});
