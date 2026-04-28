import { internalQuery, mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { getOrgIdOrNull } from "../lib/auth";

const TRAINING_SNIPPET_MAX = 12;

/** Brukes av søkeverktøyet til å gi modellen godkjente svar fra operatører. */
export const listRecentForAgent = internalQuery({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("answerTrainingExamples")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .order("desc")
      .take(TRAINING_SNIPPET_MAX);

    if (rows.length === 0) {
      return "";
    }

    return rows
      .map(
        (e) =>
          `Kundespørsmål (referanse): ${e.userMessage.slice(0, 500)}${e.userMessage.length > 500 ? "…" : ""}\nGodkjent svar å sikte mot i lik situasjon: ${e.expectedResponse.slice(0, 1_200)}${e.expectedResponse.length > 1_200 ? "…" : ""}`,
      )
      .join("\n\n---\n\n");
  },
});

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
