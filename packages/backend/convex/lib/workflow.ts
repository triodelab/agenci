import { WorkflowManager } from "@convex-dev/workflow";
import { components, internal } from "../_generated/api";
import { v } from "convex/values";
import type { ScrapedBranding } from "./firecrawl";

export const workflow = new WorkflowManager((components as any).workflow, {
  workpoolOptions: {
    maxParallelism: 10,
    defaultRetryBehavior: {
      maxAttempts: 3,
      initialBackoffMs: 60_000,
      base: 2,
    },
  },
});

const internalApi = internal as any;

export const supportAgentOnboarding = workflow.define({
  args: {
    agentId: v.id("agents"),
    orgId: v.string(),
    url: v.string(),
  },
  handler: async (step, args) => {
    const { agentId, orgId, url } = args;

    // Step 1: Scrape the URL
    const scrapeResult = (await step.runAction(
      internalApi.lib.firecrawl.scrapeWebsiteUrlFn,
      { url },
      { name: "scrape website", retry: true },
    )) as { markdown: string | null; branding: ScrapedBranding };

    // Step 2: Ingest markdown into RAG (skip if no content returned)
    if (scrapeResult.markdown && scrapeResult.markdown.length >= 40) {
      await step.runAction(
        internalApi.lib.firecrawl.ingestMarkdownFn,
        { orgId, agentId, url, markdown: scrapeResult.markdown },
        { name: "ingest markdown", retry: true },
      );
    }

    // Step 3: Save branding and apply to widget appearance
    await step.runMutation(
      internalApi.system.onboarding.saveBrandingMutation,
      { orgId, agentId, url, branding: scrapeResult.branding },
      { name: "save branding" },
    );
  },
});
