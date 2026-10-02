import type { InngestFunction } from "inngest";
import { runDailyBilling } from "@/modules/billing/service";
import { inngest } from "../client";

/** Every morning (Oslo): renew due subscriptions, end cancelled ones. */
export const dailyBilling: InngestFunction.Any = inngest.createFunction(
  { id: "daily-billing", retries: 2, triggers: [{ cron: "TZ=Europe/Oslo 0 6 * * *" }] },
  async ({ step }) => step.run("run-daily-billing", () => runDailyBilling()),
);
