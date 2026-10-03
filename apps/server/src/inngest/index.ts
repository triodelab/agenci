import type { InngestFunction } from "inngest";
import { processAgentOnboarding } from "./functions/process-agent-onboarding";
import { dailyBilling } from "./functions/daily-billing";
import { conversationRetention } from "./functions/conversation-retention";
import { uploadDocumentTask } from "@/modules/documents/upload-document-task";

export const inngestFunctions: InngestFunction.Any[] = [
  processAgentOnboarding,
  uploadDocumentTask,
  dailyBilling,
  conversationRetention,
];
