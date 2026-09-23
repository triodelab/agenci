import { z } from "zod";

export const SendChatMessageSchema = z.object({
  agentId: z.string().min(1),
  message: z.string().min(1, "Melding er påkrevd"),
  /** Omit on the first turn — the server returns the thread to reuse. */
  threadId: z.string().min(1).optional(),
});

export type SendChatMessageSchemaType = z.infer<typeof SendChatMessageSchema>;

export const SendChatMessageResponseSchema = z.object({
  threadId: z.string(),
  message: z.string(),
});

export type SendChatMessageResponseSchemaType = z.infer<
  typeof SendChatMessageResponseSchema
>;
