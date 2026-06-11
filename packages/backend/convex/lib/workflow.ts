import { WorkflowManager } from "@convex-dev/workflow";
import { components, internal } from "../_generated/api";
import { ConvexError, v } from "convex/values";
import type { ScrapedBranding } from "./firecrawl";
import { internalQuery, mutation } from "../_generated/server";
import { getOrgIdOrNull } from "./auth";

const getAgentForOrg = internalQuery({
  args: { agentId: v.id("agents"), orgId: v.string() },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    return agent?.organizationId === args.orgId ? agent : null;
  },
});

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

export const MIN_MARKDOWN_CHARS = 40;

export const supportAgentOnboarding = workflow.define({
  args: {
    agentId: v.id("agents"),
    orgId: v.string(),
    url: v.string(),
  },
  handler: async (step, args) => {
    const { agentId, url, orgId } = args;

    // Step 1: Scrape the URL
    const scrapeResult = (await step.runAction(
      internal.lib.firecrawl.scrapeWebsiteUrlFn,
      { url },
      { name: "scrape website", retry: true },
    )) as { markdown: string | null; branding: ScrapedBranding };

    // Step 2: Ingest markdown into RAG (best-effort — don't block branding if content is too short)
    const { markdown, branding } = scrapeResult;

    if (markdown && markdown.length >= 40) {
      await step.runAction(
        internal.private.onboarding.ingestMarkdownFn,
        { orgId, agentId, url: url, markdown },
        { name: "ingest markdown", retry: true },
      );
    }

    // Step 3: Save branding and apply to widget appearance
    const b = branding;
    const brandingData = {
      logoUrl: typeof b?.logoUrl === "string" ? b.logoUrl : null,
      colorScheme: b?.colorScheme ?? null,
      primaryColor: b?.primaryColor ?? null,
      secondaryColor: b?.secondaryColor ?? null,
      backgroundColor: b?.backgroundColor ?? null,
      textPrimaryColor: b?.textPrimaryColor ?? null,
    };
    await step.runMutation(
      internal.private.onboarding.insertWebsiteBranding,
      {
        agentId,
        orgId: args.orgId,
        websiteUrl: url,
        ...brandingData,
      },
      { name: "save branding" },
    );

    // Apply primary color and font to widget appearance so the onboarding preview updates
    await step.runMutation(
      internal.private.widgetSettings.applyBrandColor,
      {
        agentId,
        orgId: args.orgId,
        primaryColor: brandingData.primaryColor,
        fontFamily: null,
      },
      { name: "apply brand color" },
    );
  },
});

export const kickoffAgentOnboarding = mutation({
  args: {
    url: v.string(),
    agentId: v.id("agents"),
  },
  handler: async (ctx, args): Promise<string> => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      throw new ConvexError(
        "No organization in session. Select an organization in Clerk.",
      );
    }

    const agent = await ctx.db.get(args.agentId);
    if (!agent || agent.organizationId !== orgId) {
      throw new ConvexError("No agent found for this organization.");
    }

    const workflowId = await workflow.start(
      ctx,
      internal.lib.workflow.supportAgentOnboarding,
      { orgId, agentId: agent._id, url: args.url },
    );

    return workflowId;
  },
});
