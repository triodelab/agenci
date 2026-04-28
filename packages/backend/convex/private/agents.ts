import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { getOrgIdOrNull, getUserEmailOrNull } from "../lib/auth";
import { hasActiveSubscriptionAccess } from "../lib/subscriptionAccess";

const BUILT_IN_SLUG = "support";

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
  if (!slug) {
    return "agent";
  }
  if (slug === BUILT_IN_SLUG) {
    return "agent";
  }
  return slug;
}

async function requireSubscription(ctx: MutationCtx): Promise<string> {
  const orgId = await getOrgIdOrNull(ctx);
  if (!orgId) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message:
        "No organization in session. Select an organization in Clerk (JWT template must include orgId).",
    });
  }
  const subscription = await ctx.runQuery(
    internal.system.subscriptions.getByOrganizationId,
    { organizationId: orgId },
  );
  const userEmail = await getUserEmailOrNull(ctx);
  if (!hasActiveSubscriptionAccess(orgId, subscription, { userEmail })) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "Missing subscription",
    });
  }
  return orgId;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      return null;
    }
    const rows = await ctx.db
      .query("agents")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .collect();
    return rows.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message:
          "No organization in session. Select an organization in Clerk (JWT template must include orgId).",
      });
    }
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .collect();
    if (existing.length > 0) {
      return { seeded: false as const };
    }
    const now = Date.now();
    await ctx.db.insert("agents", {
      organizationId: orgId,
      name: "Standard støtte-agent",
      description:
        "Innebygd assistent koblet til kunnskapsbase, med søk, eskalering og avslutning av samtaler.",
      slug: BUILT_IN_SLUG,
      isBuiltIn: true,
      modelLabel: "gpt-4o-mini",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    return { seeded: true as const };
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
    if (!hit) {
      return candidate;
    }
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
    const orgId = await requireSubscription(ctx);
    const base = slugifyName(args.name);
    const slug = await nextAvailableSlug(ctx, orgId, base);
    const now = Date.now();
    await ctx.db.insert("agents", {
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
    return { slug };
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
    const orgId = await requireSubscription(ctx);
    const doc = await ctx.db.get(args.agentId);
    if (!doc || doc.organizationId !== orgId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Agent not found",
      });
    }
    if (doc.isBuiltIn) {
      if (args.name !== undefined) {
        throw new ConvexError({
          code: "BAD_REQUEST",
          message: "Cannot rename built-in agent",
        });
      }
      if (args.isActive === false) {
        throw new ConvexError({
          code: "BAD_REQUEST",
          message: "Cannot deactivate built-in agent",
        });
      }
    }
    if (args.name === undefined && args.description === undefined && args.isActive === undefined) {
      return;
    }
    const now = Date.now();
    const patch: {
      name?: string;
      description?: string;
      isActive?: boolean;
      updatedAt: number;
    } = { updatedAt: now };
    if (args.name !== undefined) {
      patch.name = args.name.trim();
    }
    if (args.description !== undefined) {
      patch.description = args.description.trim() || undefined;
    }
    if (args.isActive !== undefined) {
      patch.isActive = args.isActive;
    }
    await ctx.db.patch(args.agentId, patch);
  },
});

export const remove = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const orgId = await requireSubscription(ctx);
    const doc = await ctx.db.get(args.agentId);
    if (!doc || doc.organizationId !== orgId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Agent not found",
      });
    }
    if (doc.isBuiltIn) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Cannot delete built-in agent",
      });
    }
    await ctx.db.delete(args.agentId);
  },
});
