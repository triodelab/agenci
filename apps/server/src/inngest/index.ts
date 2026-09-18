import type { InngestFunction } from "inngest";
import { messageRespond } from "./functions/message-respond";
import { processAgentOnboarding } from "./functions/process-agent-onboarding";
import { uploadDocumentTask } from "@/modules/documents/upload-document-task";

export const inngestFunctions: InngestFunction.Any[] = [
  processAgentOnboarding,
  messageRespond,
  uploadDocumentTask,
];
