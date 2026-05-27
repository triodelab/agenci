import { inngest } from "@/inngest/client";
import { processWebsiteOnboarding } from "@/modules/files/inngest/website-onboarding";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processWebsiteOnboarding],
});
