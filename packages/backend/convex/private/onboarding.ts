import { ConvexError, v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
} from "../_generated/server";
import { internal } from "../_generated/api";
import { getOrgIdOrNull } from "../lib/auth";
import { agentNamespace } from "../lib/knowledgeIngestion";
import rag from "../system/ai/rag";
import { contentHashFromArrayBuffer } from "@convex-dev/rag";

export const getAgentForOrg = internalQuery({
  args: { agentId: v.id("agents"), orgId: v.string() },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent || agent.organizationId !== args.orgId) return null;
    return agent;
  },
});

export const insertWebsiteMarkdown = internalAction({
  args: {
    markdown: v.string(),
    agentId: v.optional(v.id("agents")),
    websiteUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const { markdown } = args;

    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      throw new ConvexError(
        "No organization in session. Select an organization in Clerk.",
      );
    }

    if (args.agentId) {
      const agent = await ctx.runQuery(
        internal.private.onboarding.getAgentForOrg,
        { agentId: args.agentId, orgId },
      );
      if (!agent) throw new ConvexError("Agent not found.");
    }

    const namespace = agentNamespace(orgId, args.agentId);

    try {
      const result = await rag.add(ctx, {
        namespace,
        title: args.websiteUrl,
        text: markdown,
        metadata: {
          websiteUrl: args.websiteUrl,
          agentId: args.agentId ?? null,
        },
      });

      return {
        entryId: result.entryId,
        created: result.created,
        status: result.status,
      };
    } catch (error) {
      throw new ConvexError("Failed to insert website markdown: " + error);
    }
  },
});

export const MIN_MARKDOWN_CHARS = 40;

export const ingestMarkdownFn = internalAction({
  args: {
    orgId: v.string(),
    agentId: v.id("agents"),
    url: v.string(),
    markdown: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.markdown.length < MIN_MARKDOWN_CHARS) {
      throw new ConvexError(
        "For lite tekst hentet fra siden. Prøv en annen URL eller last opp innholdet som fil.",
      );
    }

    let publicUrl: URL;
    try {
      publicUrl = new URL(args.url);
    } catch {
      throw new ConvexError(`Ugyldig URL: "${args.url}"`);
    }
    const title = `${publicUrl.hostname}${publicUrl.pathname}`;
    const textBytes = new TextEncoder().encode(args.markdown);

    let entryId: string;
    let created: boolean;
    try {
      ({ entryId, created } = await rag.add(ctx, {
        namespace: agentNamespace(args.orgId, args.agentId),
        text: args.markdown,
        key: args.url,
        title,
        metadata: {
          uploadedBy: args.orgId,
          filename: title,
          category: null,
          sourceType: "webpage",
          sourceUrl: args.url,
          agentId: args.agentId,
        },
        contentHash: await contentHashFromArrayBuffer(textBytes.buffer),
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isKeyMissing =
        msg.toLowerCase().includes("api key") ||
        msg.toLowerCase().includes("openai");
      throw new ConvexError(
        isKeyMissing
          ? "Mangler OpenAI API-nøkkel på Convex-deploymenten. Sett OPENAI_API_KEY i Convex-dashboardet."
          : `Kunne ikke indeksere siden (embedding feilet): ${msg}`,
      );
    }

    if (!created) {
      console.debug("Markdown entry uendret, hopper over duplikat");
    }

    return { entryId, created, url: args.url, title };
  },
});

export const insertWebsiteBranding = internalMutation({
  args: {
    agentId: v.id("agents"),
    orgId: v.string(),
    websiteUrl: v.string(),
    logoUrl: v.union(v.string(), v.null()),
    colorScheme: v.union(v.string(), v.null()),
    primaryColor: v.union(v.string(), v.null()),
    secondaryColor: v.union(v.string(), v.null()),
    backgroundColor: v.union(v.string(), v.null()),
    textPrimaryColor: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const { orgId } = args;

    const agent = await ctx.db.get(args.agentId);
    if (!agent || agent.organizationId !== orgId) {
      throw new ConvexError("Agent not found.");
    }

    const now = Date.now();
    const existing = await ctx.db
      .query("agentBranding")
      .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId))
      .first();

    if (existing && existing.organizationId !== orgId) {
      throw new ConvexError("Forbidden.");
    }

    const brandingDoc = {
      organizationId: orgId,
      agentId: args.agentId,
      sourceUrl: args.websiteUrl,
      extractedAt: now,
      ...(args.logoUrl !== null ? { logoUrl: args.logoUrl } : {}),
      ...(args.colorScheme !== null ? { colorScheme: args.colorScheme } : {}),
      ...(args.primaryColor !== null
        ? { primaryColor: args.primaryColor }
        : {}),
      ...(args.secondaryColor !== null
        ? { secondaryColor: args.secondaryColor }
        : {}),
      ...(args.backgroundColor !== null
        ? { backgroundColor: args.backgroundColor }
        : {}),
      ...(args.textPrimaryColor !== null
        ? { textPrimaryColor: args.textPrimaryColor }
        : {}),
    };

    if (existing) {
      await ctx.db.patch(existing._id, brandingDoc);
    } else {
      await ctx.db.insert("agentBranding", brandingDoc);
    }
  },
});
