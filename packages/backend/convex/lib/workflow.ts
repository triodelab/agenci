import { WorkflowManager } from "@convex-dev/workflow";
import { components, internal } from "../_generated/api";
import { ConvexError, v } from "convex/values";
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

    // Step 1: Extract brand color and font from URL (no external API key needed)
    const themeResult = (await step.runAction(
      internal.private.themeColor.extractThemeColor,
      { url },
      { name: "extract theme color", retry: true },
    )) as { color: string | null; fontFamily: string | null };

    const primaryColor = themeResult.color ?? null;
    const fontFamily = themeResult.fontFamily ?? null;

    // Step 2: Save branding record
    await step.runMutation(
      internal.private.onboarding.insertWebsiteBranding,
      {
        agentId,
        orgId,
        websiteUrl: url,
        logoUrl: null,
        colorScheme: null,
        primaryColor,
        secondaryColor: null,
        backgroundColor: null,
        textPrimaryColor: null,
      },
      { name: "save branding" },
    );

    // Step 3: Apply primary color and font to widget appearance
    await step.runMutation(
      internal.private.widgetSettings.applyBrandColor,
      {
        agentId,
        orgId,
        primaryColor,
        fontFamily,
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
