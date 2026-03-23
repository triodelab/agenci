import { ConvexError, v } from "convex/values";
import { query } from "../_generated/server";
import { getOrgIdOrNull } from "../lib/auth";

export const getOneByConversationId = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);

    if (!orgId) {
      return null;
    }

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }

    if (conversation.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid organization id",
      });
    }

    const contactSession = await ctx.db.get(conversation.contactSessionId);

    return contactSession;
  },
});
