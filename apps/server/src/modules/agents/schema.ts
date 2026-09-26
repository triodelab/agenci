import { z } from "zod";

export const CreateAgentsSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  description: z.string().min(1, "Beskrivelse er påkrevd"),
  url: z.url().optional(),
});

export type CreateAgentsSchemaType = z.infer<typeof CreateAgentsSchema>;

export const CreateAgentsResponseSchema = z.object({
  message: z.string(),
  success: z.boolean(),
  agent: z.object({ id: z.string(), name: z.string() }).optional(),
});

export type CreateAgentsResponseSchemaType = z.infer<
  typeof CreateAgentsResponseSchema
>;

export const AgentSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]),
  createdAt: z.string(),
});

export type AgentSummary = z.infer<typeof AgentSummarySchema>;

export const AgentListItemSchema = AgentSummarySchema.extend({
  /** Onboarding website + branding, for the agent card. */
  websiteUrl: z.string().nullable(),
  logoUrl: z.string().nullable(),
  brandColor: z.string().nullable(),
  sourceCount: z.number(),
  failedSourceCount: z.number(),
  conversationCount: z.number(),
  lastActivityAt: z.string().nullable(),
  /** New conversations per day for the last 14 days, oldest first. */
  activity: z.array(z.number()),
});

export const ListAgentsResponseSchema = z.object({
  agents: z.array(AgentListItemSchema),
});

export const UpdateAgentSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Navn er påkrevd").max(80),
  description: z.string().trim().max(500),
});

export const DeleteAgentSchema = z.object({ id: z.string().min(1) });

export const DeleteAgentResponseSchema = z.object({
  success: z.boolean(),
  deleted: z.object({ sources: z.number(), conversations: z.number() }),
});

export const GetAgentSchema = z.object({
  id: z.string().min(1),
});

export const GetAgentResponseSchema = z.object({
  agent: AgentSummarySchema.nullable(),
});

export const ListDocumentsSchema = z.object({
  agentId: z.string().min(1),
});

export const DocumentSummarySchema = z.object({
  id: z.string(),
  type: z.enum(["DOCUMENT", "WEBPAGE", "MEDIA"]),
  status: z.enum(["PENDING", "PROCESSING", "INDEXING", "COMPLETED", "FAILED"]),
  webpageUrl: z.string().nullable(),
  documentName: z.string().nullable(),
  mediaName: z.string().nullable(),
  createdAt: z.string(),
});

export const ListDocumentsResponseSchema = z.object({
  documents: z.array(DocumentSummarySchema),
});

export const AddWebpageSchema = z.object({
  agentId: z.string().min(1),
  url: z.url("Ugyldig URL"),
});

export const AddWebpageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
