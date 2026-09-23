import { eventType, Inngest } from "inngest";
import { z } from "zod";
import { env } from "@agenci/env/server";

const isDev =
  env.INNGEST_DEV === "1" ||
  (env.INNGEST_DEV !== "0" && env.NODE_ENV !== "production");

if (isDev && process.env.INNGEST_DEV !== "1") {
  process.env.INNGEST_DEV = "1";
}

export const inngest = new Inngest({
  id: "agenci-server",
  isDev,
  ...(env.INNGEST_BASE_URL ? { baseUrl: env.INNGEST_BASE_URL } : {}),
});

export const agentOnboardingEvent = eventType("agent-onboarding/process", {
  schema: z.object({
    url: z.string().min(1),
    agentId: z.string().min(1),
    organizationId: z.string().min(1),
    userId: z.string().min(1),
    documentId: z.string().min(1),
  }),
});

export const messageRespondEvent = eventType("message/respond", {
  schema: z.object({
    organizationId: z.string().min(1),
    agentId: z.string().min(1),
    conversationId: z.string().min(1),
    messageId: z.string().min(1),
    message: z.string().min(1),
    vertical: z.enum(["ECOMMERCE", "HEALTHCARE"]),
  }),
});

export const uploadDocumentEvent = eventType("document/upload", {
  schema: z.object({
    agentId: z.string().min(1),
    organizationId: z.string().min(1),
    userId: z.string().min(1),
    documentId: z.string().min(1),
    s3Key: z.string().min(1),
    fileName: z.string().min(1),
  }),
});