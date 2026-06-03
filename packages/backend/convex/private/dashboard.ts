import { query, QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { getOrgIdOrNull } from "../lib/auth";
import rag from "../system/ai/rag";
import { Id } from "../_generated/dataModel";
import { getPlanConversationLimit } from "../lib/subscriptionAccess";
import { countConversationsThisMonth } from "../lib/conversationUsage";

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
      .first();

    const vapiPlugin = await ctx.db
      .query("plugins")
      .withIndex("by_organization_id_and_service", (q) =>
        q.eq("organizationId", orgId).eq("service", "vapi"),
      )
      .unique();

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();
    const monthlyConversationLimit = getPlanConversationLimit(subscription);
    const monthlyConversations = await countConversationsThisMonth(
      ctx,
      orgId,
      monthlyConversationLimit,
    );
    const isActiveSub =
      subscription?.status === "active" || subscription?.status === "trialing";
    const currentPlanKey = isActiveSub ? (subscription?.planKey ?? "free") : "free";

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
      usage: {
        conversationsThisMonth: monthlyConversations.count,
        conversationsLimit: monthlyConversationLimit,
        conversationsCapped: monthlyConversations.capped,
        planKey: currentPlanKey,
      },
    };
  },
});

/** Full notification feed: conversation alerts + system tips. */
export const getNotifications = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) return { conversations: [], tips: [] };

    // ── Conversation notifications ──────────────────────────────────────────
    const [escalated, unresolved, pendingBookings, allAgents, anyConv, subscription] = await Promise.all([
      ctx.db
        .query("conversations")
        .withIndex("by_status_and_organization_id", (q) =>
          q.eq("status", "escalated").eq("organizationId", orgId),
        )
        .order("desc")
        .take(8),
      ctx.db
        .query("conversations")
        .withIndex("by_status_and_organization_id", (q) =>
          q.eq("status", "unresolved").eq("organizationId", orgId),
        )
        .order("desc")
        .take(8),
      ctx.db
        .query("bookings")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
        .filter((q) => q.eq(q.field("status"), "pending"))
        .order("desc")
        .take(5),
      ctx.db
        .query("agents")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
        .take(10),
      ctx.db
        .query("conversations")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
        .first(),
      ctx.db
        .query("subscriptions")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
        .unique(),
    ]);

    const allConvs = [...escalated, ...unresolved];
    const hydratedConvs = await Promise.all(
      allConvs.map(async (conv) => {
        const session = await ctx.db.get(conv.contactSessionId);
        // Filter out anonymous and deleted sessions
        if (!session || session.email.includes(".local")) return null;
        let agentName: string | null = null;
        if (conv.agentId) {
          const agent = await ctx.db.get(conv.agentId);
          agentName = agent?.name ?? null;
        }
        return {
          _id: conv._id as string,
          _creationTime: conv._creationTime,
          status: conv.status,
          agentId: conv.agentId ? (conv.agentId as string) : null,
          contactName: session.name,
          contactEmail: session.email,
          agentName,
        };
      }),
    );
    const conversations = hydratedConvs.filter(
      (c): c is NonNullable<typeof c> => c !== null,
    );

    // Hydrate pending bookings
    const bookings = await Promise.all(
      pendingBookings.map(async (b) => {
        let agentName: string | null = null;
        if (b.agentId) {
          const agent = await ctx.db.get(b.agentId);
          agentName = agent?.name ?? null;
        }
        return {
          _id: b._id as string,
          createdAt: b.createdAt,
          customerName: b.customerName,
          serviceName: b.serviceName,
          dateString: b.dateString,
          timeString: b.timeString,
          agentId: b.agentId ? (b.agentId as string) : null,
          agentName,
        };
      }),
    );

    // ── System tips (computed, dismissed client-side) ───────────────────────
    type Tip = {
      id: string;
      icon: "welcome" | "tip" | "knowledge" | "upgrade" | "share";
      title: string;
      body: string;
      url: string | null;
    };
    const tips: Tip[] = [];

    const activeAgents = allAgents.filter((a) => a.isActive);
    const hasNoAgents = allAgents.length === 0;
    const hasNoConversations = !anyConv;
    const isOnFreePlan =
      !subscription ||
      subscription.status === "canceled" ||
      subscription.status === "free";

    // Welcome — always show (dismissed client-side)
    tips.push({
      id: "welcome-v1",
      icon: "welcome",
      title: "Velkommen til Agenci! 👋",
      body: "Vi er glad for at du er her. Lag din første AI-agent for å komme i gang.",
      url: hasNoAgents ? "/agents" : null,
    });

    if (hasNoAgents) {
      tips.push({
        id: "onboard-create-agent",
        icon: "tip",
        title: "Lag din første AI-agent",
        body: "Sett opp en agent på under 2 minutter — gi den et navn og last opp relevant innhold.",
        url: "/agents",
      });
    } else if (hasNoConversations) {
      tips.push({
        id: "onboard-share-widget",
        icon: "share",
        title: "Del chatten med kundene dine",
        body: `${activeAgents[0]?.name ?? "Agenten din"} er klar — del widget-koden på nettsiden din.`,
        url: activeAgents[0] ? `/agents/${activeAgents[0]._id}/customization` : "/agents",
      });
    }

    if (isOnFreePlan && allAgents.length > 0) {
      tips.push({
        id: "upgrade-tip-v1",
        icon: "upgrade",
        title: "Lås opp alle funksjoner",
        body: "Oppgrader til Starter eller Pro for kunnskapsbase, tilpasning og mer.",
        url: "/billing",
      });
    }

    return {
      conversations: conversations
        .sort((a, b) => b._creationTime - a._creationTime)
        .slice(0, 8),
      bookings,
      tips,
    };
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
