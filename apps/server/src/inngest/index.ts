import type { InngestFunction } from "inngest";
import { processAgentOnboarding } from "./functions/process-agent-onboarding";
import { uploadDocumentTask } from "@/modules/documents/upload-document-task";

export const inngestFunctions: InngestFunction.Any[] = [
  processAgentOnboarding,
  uploadDocumentTask,
];
