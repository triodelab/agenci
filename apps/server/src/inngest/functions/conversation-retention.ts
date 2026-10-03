import type { InngestFunction } from "inngest";
import { purgeOldConversations } from "@/modules/conversations/service";
import { inngest } from "../client";

/** Every night (Oslo): delete conversations older than the retention period. */
export const conversationRetention: InngestFunction.Any = inngest.createFunction(
  { id: "conversation-retention", retries: 2, triggers: [{ cron: "TZ=Europe/Oslo 30 3 * * *" }] },
  async ({ step }) => step.run("purge-old-conversations", () => purgeOldConversations()),
);
