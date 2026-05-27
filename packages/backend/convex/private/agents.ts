import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getOrgIdOrNull, getUserEmailOrNull } from "../lib/auth";
import { getMaxAgents } from "../lib/subscriptionAccess";

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
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message:
          "Ingen organisasjon funnet i sesjonen. Logg ut og inn igjen, eller kontakt support hvis problemet vedvarer.",
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
  },
});
