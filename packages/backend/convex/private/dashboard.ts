import { query, QueryCtx } from "../_generated/server";
import { getOrgIdOrNull } from "../lib/auth";
import rag from "../system/ai/rag";

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

/** Felles oversikt for dashboard: status på kundesamtaler, grovt antall kilder, modul-status */
export const getOverview = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      return null;
    }

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
        const e = entry as {
          replacedAt?: number;
          text?: string;
        };
        if (typeof e.replacedAt === "number") {
          knowledgeLastIndexedAt =
            knowledgeLastIndexedAt === null
              ? e.replacedAt
              : Math.max(knowledgeLastIndexedAt, e.replacedAt);
        }
        if (typeof e.text === "string" && e.text.length > 0) {
          knowledgeApproxKb += Math.ceil(
            new TextEncoder().encode(e.text).length / 1024,
          );
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
