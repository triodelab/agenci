import { z } from "zod";

export const uploadDocumentInput = z.object({
  file: z.instanceof(File),
  agentId: z.string(),
});

export const uploadDocumentOutput = z.object({
  url: z.string(),
});