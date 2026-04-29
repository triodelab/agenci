import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { getOrgIdOrNull } from "../lib/auth";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { MessageDoc } from "@convex-dev/agent";
import { paginationOptsValidator, PaginationResult } from "convex/server";
import { Doc, Id } from "../_generated/dataModel";

export const updateStatus = mutation({
  args: {
    conversationId: v.id("conversations"),
    status: v.union(
      v.literal("unresolved"),
      v.literal("escalated"),
      v.literal("resolved"),
    ),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Organization not found" });
    }
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Conversation not found" });
    }
    if (conversation.organizationId !== orgId) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Invalid Organization ID" });
    }
    await ctx.db.patch(args.conversationId, { status: args.status });
  },
});

export const getOne = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) return null;
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Conversation not found" });
    }
    if (conversation.organizationId !== orgId) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Invalid Organization ID" });
    }
    const contactSession = await ctx.db.get(conversation.contactSessionId);
    if (!contactSession) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Contact Session not found" });
    }
    return { ...conversation, contactSession };
  },
});

export const getMany = query({
  args: {
    paginationOpts: paginationOptsValidator,
    agentId: v.optional(v.id("agents")),
    status: v.optional(
      v.union(
        v.literal("inbox"),
        v.literal("all"),
        v.literal("unresolved"),
        v.literal("escalated"),
        v.literal("resolved"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const mode = args.status ?? "inbox";
    const agentId = args.agentId;

    let conversations: PaginationResult<Doc<"conversations">>;

    if (agentId) {
      if (mode === "all") {
        conversations = await ctx.db
          .query("conversations")
          .withIndex("by_agent_id", (q) => q.eq("agentId", agentId))
          .filter((q) => q.eq(q.field("organizationId"), orgId))
          .order("desc")
          .paginate(args.paginationOpts);
      } else if (mode === "inbox") {
        conversations = await ctx.db
          .query("conversations")
          .withIndex("by_agent_id", (q) => q.eq("agentId", agentId))
          .filter((q) =>
            q.and(
              q.eq(q.field("organizationId"), orgId),
              q.neq(q.field("status"), "resolved"),
            ),
          )
          .order("desc")
          .paginate(args.paginationOpts);
      } else {
        // narrowed: "unresolved" | "escalated" | "resolved"
        const status = mode as "unresolved" | "escalated" | "resolved";
        conversations = await ctx.db
          .query("conversations")
          .withIndex("by_agent_id_and_status", (q) =>
            q.eq("agentId", agentId).eq("status", status),
          )
          .filter((q) => q.eq(q.field("organizationId"), orgId))
          .order("desc")
          .paginate(args.paginationOpts);
      }
    } else {
      // Org-wide (backward compat for old routes)
      if (mode === "all") {
        conversations = await ctx.db
          .query("conversations")
          .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
          .order("desc")
          .paginate(args.paginationOpts);
      } else if (mode === "inbox") {
        conversations = await ctx.db
          .query("conversations")
          .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
          .filter((q) => q.neq(q.field("status"), "resolved"))
          .order("desc")
          .paginate(args.paginationOpts);
      } else {
        const status = mode as "unresolved" | "escalated" | "resolved";
        conversations = await ctx.db
          .query("conversations")
          .withIndex("by_status_and_organization_id", (q) =>
            q.eq("status", status).eq("organizationId", orgId),
          )
          .order("desc")
          .paginate(args.paginationOpts);
      }
    }

    const conversationsWithAdditionalData = await Promise.all(
      conversations.page.map(async (conversation) => {
        let lastMessage: MessageDoc | null = null;
        const contactSession = await ctx.db.get(conversation.contactSessionId);
        if (!contactSession) return null;

        const messages = await supportAgent.listMessages(ctx, {
          threadId: conversation.threadId,
          paginationOpts: { numItems: 1, cursor: null },
        });
        if (messages.page.length > 0) {
          lastMessage = messages.page[0] ?? null;
        }

        return { ...conversation, lastMessage, contactSession };
      }),
    );

    const validConversations = conversationsWithAdditionalData.filter(
      (conv): conv is NonNullable<typeof conv> => conv !== null,
    );

    return { ...conversations, page: validConversations };
  },
});
