import { ConvexError, v } from "convex/values";
import { internalAction, internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { getOrgIdOrNull, getUserEmailOrNull } from "../lib/auth";
import { getMaxAgents } from "../lib/subscriptionAccess";
import { agentNamespace } from "../lib/knowledgeIngestion";
import rag from "../system/ai/rag";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

function slugifyName(name: string): string {
  const lower = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a");
  const slug = lower
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) return "agent";
  return slug;
}


export const list = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) return null;
    const rows = await ctx.db
      .query("agents")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .collect();
    return rows.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const getOne = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) return null;
    const agent = await ctx.db.get(args.agentId);
    if (!agent || agent.organizationId !== orgId) return null;
    return agent;
  },
});

/** Returns all agents with their open conversation count (for home page cards). */
export const listWithCounts = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) return null;

    const agents = await ctx.db
      .query("agents")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .collect();

    const agentsWithCounts = await Promise.all(
      agents.map(async (agent) => {
        const openConvs = await ctx.db
          .query("conversations")
          .withIndex("by_agent_id", (q) => q.eq("agentId", agent._id))
          .filter((q) =>
            q.and(
              q.eq(q.field("organizationId"), orgId),
              q.neq(q.field("status"), "resolved"),
            ),
          )
          .take(100);

        return {
          ...agent,
          openConversationCount: openConvs.length,
        };
      }),
    );

    return agentsWithCounts.sort((a, b) => a.createdAt - b.createdAt);
  },
});

/** Kept for API compatibility — no longer auto-creates any agent. */
export const seedDefaults = mutation({
  args: {},
  handler: async () => {
    return { seeded: false as const };
  },
});

async function nextAvailableSlug(
  ctx: import("../_generated/server").MutationCtx,
  organizationId: string,
  base: string,
): Promise<string> {
  let candidate = base;
  let n = 2;
  for (;;) {
    const hit = await ctx.db
      .query("agents")
      .withIndex("by_organization_and_slug", (q) =>
        q.eq("organizationId", organizationId).eq("slug", candidate),
      )
      .unique();
    if (!hit) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      const claims = identity ? JSON.stringify(identity) : "no identity";
      console.error("[agents:create] orgId missing. JWT claims:", claims);
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: `Ingen organisasjon i sesjonen. JWT claims: ${claims}`,
      });
    }

    const [existing, subscription, email] = await Promise.all([
      ctx.db
        .query("agents")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
        .collect(),
      ctx.db
        .query("subscriptions")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
        .unique(),
      getUserEmailOrNull(ctx),
    ]);

    const maxAgents = getMaxAgents(orgId, subscription, { userEmail: email });

    if (existing.length >= maxAgents) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: `Du har nådd maks ${maxAgents} agenter på din plan. Oppgrader for å opprette flere.`,
      });
    }

    const base = slugifyName(args.name);
    const slug = await nextAvailableSlug(ctx, orgId, base);
    const now = Date.now();
    const agentId = await ctx.db.insert("agents", {
      organizationId: orgId,
      name: args.name.trim(),
      description: args.description?.trim() || undefined,
      slug,
      isBuiltIn: false,
      modelLabel: undefined,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    return { slug, agentId };
  },
});

export const update = mutation({
  args: {
    agentId: v.id("agents"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "No organization in session." });
    }
    const doc = await ctx.db.get(args.agentId);
    if (!doc || doc.organizationId !== orgId) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Agent not found" });
    }
    if (args.name === undefined && args.description === undefined && args.isActive === undefined) {
      return;
    }
    const now = Date.now();
    const patch: { name?: string; description?: string; isActive?: boolean; updatedAt: number } = {
      updatedAt: now,
    };
    if (args.name !== undefined) patch.name = args.name.trim();
    if (args.description !== undefined) patch.description = args.description.trim() || undefined;
    if (args.isActive !== undefined) patch.isActive = args.isActive;
    await ctx.db.patch(args.agentId, patch);
  },
});

export const remove = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "No organization in session." });
    }
    const doc = await ctx.db.get(args.agentId);
    if (!doc || doc.organizationId !== orgId) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Agent not found" });
    }
    await ctx.db.delete(args.agentId);
    await ctx.scheduler.runAfter(0, internal.private.agents.cleanupDeletedAgent, {
      agentId: args.agentId,
      orgId,
    });
  },
});

export const cleanupDeletedAgent = internalAction({
  args: { agentId: v.id("agents"), orgId: v.string() },
  handler: async (ctx, args) => {
    const { agentId, orgId } = args;

    // 1. Delete conversations
    await ctx.runMutation(internal.private.agents.deleteAgentConversations, { agentId });

    // 2. Delete widgetSettings
    await ctx.runMutation(internal.private.agents.deleteAgentWidgetSettings, { agentId });

    // 3. Delete agentBranding
    await ctx.runMutation(internal.private.agents.deleteAgentBranding, { agentId });

    // 4. Delete booking data
    await ctx.runMutation(internal.private.agents.deleteAgentBookingData, { agentId });

    // 5. Delete websiteSources + runs + pages
    const sources = await ctx.runQuery(internal.private.agents.listAgentWebsiteSources, { agentId, orgId });
    for (const sourceId of sources) {
      await ctx.runMutation(internal.private.agents.deleteWebsiteSourceCascade, { sourceId });
    }

    // 6. Delete RAG namespace entries
    const namespace = agentNamespace(orgId, agentId);
    const ns = await rag.getNamespace(ctx, { namespace });
    if (ns) {
      let cursor: string | null = null;
      do {
        const result = await rag.list(ctx, {
          namespaceId: ns.namespaceId,
          paginationOpts: { numItems: 50, cursor },
        });
        for (const entry of result.page) {
          await rag.deleteAsync(ctx, { entryId: entry._id as string });
        }
        cursor = result.isDone ? null : result.continueCursor;
      } while (cursor);
    }
  },
});

export const listAgentWebsiteSources = internalQuery({
  args: { agentId: v.id("agents"), orgId: v.string() },
  handler: async (ctx, args): Promise<Id<"websiteSources">[]> => {
    const sources = await ctx.db
      .query("websiteSources")
      .withIndex("by_organization_id_and_agent_id", (q) =>
        q.eq("organizationId", args.orgId).eq("agentId", args.agentId),
      )
      .collect();
    return sources.map((s) => s._id);
  },
});

export const deleteWebsiteSourceCascade = internalMutation({
  args: { sourceId: v.id("websiteSources") },
  handler: async (ctx, args) => {
    const runs = await ctx.db
      .query("websiteRuns")
      .withIndex("by_website_source_id", (q) => q.eq("websiteSourceId", args.sourceId))
      .collect();
    for (const run of runs) await ctx.db.delete(run._id);

    const pages = await ctx.db
      .query("websitePages")
      .withIndex("by_website_source_id", (q) => q.eq("websiteSourceId", args.sourceId))
      .collect();
    for (const page of pages) await ctx.db.delete(page._id);

    await ctx.db.delete(args.sourceId);
  },
});

export const deleteAgentConversations = internalMutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId))
      .collect();
    for (const c of conversations) await ctx.db.delete(c._id);
  },
});

export const deleteAgentWidgetSettings = internalMutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId))
      .collect();
    for (const s of settings) await ctx.db.delete(s._id);
  },
});

export const deleteAgentBranding = internalMutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const brandings = await ctx.db
      .query("agentBranding")
      .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId))
      .collect();
    for (const b of brandings) await ctx.db.delete(b._id);
  },
});

export const deleteAgentBookingData = internalMutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const services = await ctx.db
      .query("bookingServices")
      .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId))
      .collect();
    for (const s of services) await ctx.db.delete(s._id);

    const availability = await ctx.db
      .query("bookingAvailability")
      .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId))
      .collect();
    for (const a of availability) await ctx.db.delete(a._id);

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId))
      .collect();
    for (const b of bookings) await ctx.db.delete(b._id);
  },
});
