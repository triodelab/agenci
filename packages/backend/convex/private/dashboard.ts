import { query, QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { getOrgIdOrNull } from "../lib/auth";
import rag from "../system/ai/rag";
import { Id } from "../_generated/dataModel";

const CONV_COUNT_CAP = 500;

async function conversationCountByStatus(
  ctx: QueryCtx,
  organizationId: string,
  status: "unresolved" | "escalated" | "resolved",
): Promise<{ count: number; capped: boolean }> {
  const rows = await ctx.db
    .query("conversations")
    .withIndex("by_status_and_organization_id", (q) =>
      q.eq("status", status).eq("organizationId", organizationId),
    )
    .take(CONV_COUNT_CAP + 1);
  const capped = rows.length > CONV_COUNT_CAP;
  return { count: capped ? CONV_COUNT_CAP : rows.length, capped };
}

async function agentConversationCountByStatus(
  ctx: QueryCtx,
  agentId: Id<"agents">,
  organizationId: string,
  status: "unresolved" | "escalated" | "resolved",
): Promise<number> {
  const rows = await ctx.db
    .query("conversations")
    .withIndex("by_agent_id_and_status", (q) =>
      q.eq("agentId", agentId).eq("status", status),
    )
    .filter((q) => q.eq(q.field("organizationId"), organizationId))
    .take(CONV_COUNT_CAP + 1);
  return Math.min(rows.length, CONV_COUNT_CAP);
}

/** Org-wide overview (sidebar badge + agents home usage). */
export const getOverview = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) return null;

    const [unresolved, escalated, resolved] = await Promise.all([
      conversationCountByStatus(ctx, orgId, "unresolved"),
      conversationCountByStatus(ctx, orgId, "escalated"),
      conversationCountByStatus(ctx, orgId, "resolved"),
    ]);

    let knowledgeCount = 0;
    let knowledgeHasMore = false;
    let knowledgeLastIndexedAt: number | null = null;
    let knowledgeApproxKb = 0;
    const namespace = await rag.getNamespace(ctx, { namespace: orgId });
    if (namespace) {
      const list = await rag.list(ctx, {
        namespaceId: namespace.namespaceId,
        paginationOpts: { numItems: 250, cursor: null },
      });
      knowledgeCount = list.page.length;
      knowledgeHasMore = !list.isDone;
      for (const entry of list.page) {
        const e = entry as { replacedAt?: number; text?: string };
        if (typeof e.replacedAt === "number") {
          knowledgeLastIndexedAt =
            knowledgeLastIndexedAt === null
              ? e.replacedAt
              : Math.max(knowledgeLastIndexedAt, e.replacedAt);
        }
        if (typeof e.text === "string" && e.text.length > 0) {
          knowledgeApproxKb += Math.ceil(new TextEncoder().encode(e.text).length / 1024);
        }
      }
      if (knowledgeApproxKb === 0 && knowledgeCount > 0) {
        knowledgeApproxKb = Math.max(1, Math.ceil(knowledgeCount * 4));
      }
    }

    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();

    const vapiPlugin = await ctx.db
      .query("plugins")
      .withIndex("by_organization_id_and_service", (q) =>
        q.eq("organizationId", orgId).eq("service", "vapi"),
      )
      .unique();

    return {
      conversations: { unresolved, escalated, resolved },
      knowledge: {
        count: knowledgeCount,
        hasMore: knowledgeHasMore,
        lastIndexedAt: knowledgeLastIndexedAt,
        approxIndexedKb: knowledgeApproxKb,
      },
      hasWidgetSettings: Boolean(widgetSettings),
      vapiConnected: Boolean(vapiPlugin),
    };
  },
});

/** Recent notifications (escalated + new conversations) for the bell popover. */
export const getNotifications = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) return [];

    const [escalated, unresolved] = await Promise.all([
      ctx.db
        .query("conversations")
        .withIndex("by_status_and_organization_id", (q) =>
          q.eq("status", "escalated").eq("organizationId", orgId),
        )
        .order("desc")
        .take(5),
      ctx.db
        .query("conversations")
        .withIndex("by_status_and_organization_id", (q) =>
          q.eq("status", "unresolved").eq("organizationId", orgId),
        )
        .order("desc")
        .take(5),
    ]);

    const all = [...escalated, ...unresolved];
    const enriched = await Promise.all(
      all.map(async (conv) => {
        const session = await ctx.db.get(conv.contactSessionId);
        let agentName: string | null = null;
        if (conv.agentId) {
          const agent = await ctx.db.get(conv.agentId);
          agentName = agent?.name ?? null;
        }
        return {
          _id: conv._id,
          _creationTime: conv._creationTime,
          status: conv.status,
          agentId: conv.agentId ?? null,
          contactName: session?.name ?? "Ukjent",
          agentName,
        };
      }),
    );

    return enriched
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 10);
  },
});

/** Per-agent overview for the agent detail page. */
export const getAgentOverview = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) return null;

    const agent = await ctx.db.get(args.agentId);
    if (!agent || agent.organizationId !== orgId) return null;

    const [unresolved, escalated, resolved] = await Promise.all([
      agentConversationCountByStatus(ctx, args.agentId, orgId, "unresolved"),
      agentConversationCountByStatus(ctx, args.agentId, orgId, "escalated"),
      agentConversationCountByStatus(ctx, args.agentId, orgId, "resolved"),
    ]);

    // Per-agent RAG namespace
    const namespace = `${orgId}:${args.agentId}`;
    const ns = await rag.getNamespace(ctx, { namespace });
    let fileCount = 0;
    let lastIndexedAt: number | null = null;
    if (ns) {
      const list = await rag.list(ctx, {
        namespaceId: ns.namespaceId,
        paginationOpts: { numItems: 250, cursor: null },
      });
      fileCount = list.page.length;
      for (const entry of list.page) {
        const e = entry as { replacedAt?: number };
        if (typeof e.replacedAt === "number") {
          lastIndexedAt =
            lastIndexedAt === null ? e.replacedAt : Math.max(lastIndexedAt, e.replacedAt);
        }
      }
    }

    return {
      conversations: {
        unresolved,
        escalated,
        resolved,
        total: unresolved + escalated + resolved,
      },
      fileCount,
      lastIndexedAt,
    };
  },
});
