import type { QueryCtx } from "../_generated/server";
import { startOfCurrentMonthUtc } from "./subscriptionAccess";

/**
 * Teller antall samtaler opprettet i inneværende kalendermåned for en organisasjon.
 *
 * Bruker `by_organization_id`-indeksen med descending sort på `_creationTime`,
 * og stopper så snart vi treffer en rad eldre enn månedsstart. Henter `limit + 1`
 * for å kunne signalisere overskridelse uten ekstra DB-runde.
 */
export async function countConversationsThisMonth(
  ctx: QueryCtx,
  organizationId: string,
  limit: number,
): Promise<{ count: number; capped: boolean }> {
  const startOfMonth = startOfCurrentMonthUtc();

  const rows = await ctx.db
    .query("conversations")
    .withIndex("by_organization_id", (q) =>
      q.eq("organizationId", organizationId),
    )
    .order("desc")
    .take(limit + 1);

  let inMonth = 0;
  for (const row of rows) {
    if (row._creationTime < startOfMonth) break;
    inMonth += 1;
  }

  const capped = inMonth > limit;
  return { count: capped ? limit : inMonth, capped };
}
