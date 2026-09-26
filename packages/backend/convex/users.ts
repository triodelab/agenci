import { ConvexError } from "convex/values";
import { query, QueryCtx, mutation } from "./_generated/server";
import { getOrgIdOrNull } from "./lib/auth";

/** Synk innlogget bruker til `users` (tabellen har ikke organizationId). */
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

    const authSubject = identity.subject;
    const existing = await userByAuthSubject(ctx, authSubject);
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
      auth_subject: authSubject,
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
  return await userByAuthSubject(ctx, identity.subject);
}

async function userByAuthSubject(ctx: QueryCtx, authSubject: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_auth_subject", (q) => q.eq("auth_subject", authSubject))
    .unique();
}