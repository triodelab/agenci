/**
 * Short-lived WS tickets for cross-origin browser connects
 * (Next :3000/:3001 → Hono :3003) where SameSite cookies are not sent on WS.
 *
 * Same-origin proxies (Vite dashboard `/ws`) can still auth via Cookie.
 */
import { randomBytes } from "node:crypto";

export type WsPrincipal =
  | {
      kind: "session";
      userId: string;
      organizationId: string | null;
    }
  | {
      kind: "contact";
      contactSessionId: string;
    };

type TicketRow = {
  principal: WsPrincipal;
  expiresAt: number;
};

const tickets = new Map<string, TicketRow>();
const TTL_MS = 60_000;

function prune() {
  const now = Date.now();
  for (const [id, row] of tickets) {
    if (row.expiresAt <= now) {
      tickets.delete(id);
    }
  }
}

export function issueWsTicket(principal: WsPrincipal): {
  ticket: string;
  expiresAt: number;
} {
  prune();
  const ticket = randomBytes(24).toString("base64url");
  const expiresAt = Date.now() + TTL_MS;
  tickets.set(ticket, { principal, expiresAt });
  return { ticket, expiresAt };
}

/** Consume a ticket (one-time). Returns null if missing/expired. */
export function consumeWsTicket(ticket: string): WsPrincipal | null {
  prune();
  const row = tickets.get(ticket);
  if (!row) {
    return null;
  }
  tickets.delete(ticket);
  if (row.expiresAt <= Date.now()) {
    return null;
  }
  return row.principal;
}
