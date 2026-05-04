import { UserJSON } from "@clerk/backend";
import { ConvexError, v, Validator } from "convex/values";
import { internalMutation, query, QueryCtx, mutation } from "./_generated/server";
import { getOrgIdOrNull } from "./lib/auth";

/** Synk innlogget Clerk-bruker til `users` (tabellen har ikke organizationId). */
export const add = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const clerkId = identity.subject;
    const existing = await userByClerkId(ctx, clerkId);
    if (existing !== null) {
      return existing._id;
    }

    const name =
      (typeof identity.name === "string" && identity.name.length > 0
        ? identity.name
        : null) ??
      (typeof identity.email === "string" && identity.email.length > 0
        ? identity.email
        : null) ??
      "Bruker";
    const email =
      typeof identity.email === "string" ? identity.email : "";

    return await ctx.db.insert("users", {
      name,
      email,
      clerk_id: clerkId,
    });
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const getExportData = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const orgId = await getOrgIdOrNull(ctx);

    const conversations = orgId
      ? await ctx.db
          .query("conversations")
          .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
          .collect()
      : [];

    const agents = orgId
      ? await ctx.db
          .query("agents")
          .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
          .collect()
      : [];

    return {
      exportedAt: Date.now(),
      user: { name: user.name, email: user.email },
      organizationId: orgId,
      conversations: conversations.map((c) => ({
        id: c._id,
        status: c.status,
        createdAt: c._creationTime,
      })),
      agents: agents.map((a) => ({
        id: a._id,
        name: a.name,
        slug: a.slug,
        createdAt: a.createdAt,
      })),
    };
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      clerk_id: data.id,
      email: data.email_addresses[0]?.email_address ?? "",
    };

    const user = await userByClerkId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByClerkId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    }
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByClerkId(ctx, identity.subject);
}

async function userByClerkId(ctx: QueryCtx, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerk_id", clerkId))
    .unique();
}