import { mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { getOrgIdOrNull } from "../lib/auth";

export const saveExample = mutation({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
    assistantMessage: v.string(),
    expectedResponse: v.string(),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.organizationId !== orgId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }

    await ctx.db.insert("answerTrainingExamples", {
      organizationId: orgId,
      conversationId: args.conversationId,
      userMessage: args.userMessage,
      assistantMessage: args.assistantMessage,
      expectedResponse: args.expectedResponse.trim(),
      createdAt: Date.now(),
    });
  },
});
