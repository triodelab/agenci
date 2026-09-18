/**
 * Task 2.3 — WebSocket gateway at `/ws`.
 *
 * Auth (first match wins):
 * 1. `?ticket=` short-lived ticket from POST /api/ws/ticket
 * 2. Better Auth session cookie on the upgrade request (same-origin proxy)
 * 3. `?contactSessionId=` / `X-Contact-Session-Id` (widget; DB validation in Phase 4)
 *
 * Protocol: see `../lib/ws-protocol.ts` + docs/task.md Task 2.3.
 */
import {
  CONTACT_SESSION_HEADER,
  parseChannel,
  type WsClientMessage,
  type WsServerMessage,
} from "../lib/ws-protocol";
import { auth } from "@agenci/auth";
import { upgradeWebSocket } from "@hono/node-server";
import type { Env, Hono } from "hono";
import type { WSContext } from "hono/ws";
import { consumeWsTicket, type WsPrincipal } from "../lib/ws-tickets";

const HEARTBEAT_MS = 25_000;
const WS_OPEN = 1;

function send(socket: WSContext, message: WsServerMessage) {
  if (socket.readyState === WS_OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function headerContactSessionId(headers: Headers): string | null {
  const raw = headers.get(CONTACT_SESSION_HEADER);
  if (raw?.trim()) {
    return raw.trim();
  }
  return null;
}

async function resolvePrincipal(request: Request): Promise<WsPrincipal | null> {
  const url = new URL(request.url);
  const ticket = url.searchParams.get("ticket")?.trim();
  if (ticket) {
    return consumeWsTicket(ticket);
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (session?.user) {
    return {
      kind: "session",
      userId: session.user.id,
      organizationId: session.session.activeOrganizationId ?? null,
    };
  }

  const contactSessionId =
    url.searchParams.get("contactSessionId")?.trim() ||
    headerContactSessionId(request.headers);
  if (contactSessionId) {
    // Phase 4: validate against ContactSession table + expiry.
    // Skeleton: accept any non-empty unguessable-looking id for protocol smoke tests.
    if (contactSessionId.length < 8) {
      return null;
    }
    return { kind: "contact", contactSessionId };
  }

  return null;
}

function canSubscribe(principal: WsPrincipal, channel: string): boolean {
  const parsed = parseChannel(channel);
  if (parsed.kind === "unknown" || !parsed.id) {
    return false;
  }

  if (parsed.kind === "org_inbox") {
    // Staff only; org id must match active organization.
    return (
      principal.kind === "session" &&
      principal.organizationId !== null &&
      principal.organizationId === parsed.id
    );
  }

  // conversation:* — authenticated session or contact session (fine-grained checks later).
  return principal.kind === "session" || principal.kind === "contact";
}

export function registerWebsocket<E extends Env>(app: Hono<E>) {
  app.get(
    "/ws",
    upgradeWebSocket(async (c) => {
      const principal = await resolvePrincipal(c.req.raw);
      const subscriptions = new Set<string>();
      let heartbeat: ReturnType<typeof setInterval> | undefined;

      const cleanup = () => {
        if (heartbeat) {
          clearInterval(heartbeat);
          heartbeat = undefined;
        }
        subscriptions.clear();
      };

      return {
        onOpen(_event, socket) {
          if (!principal) {
            send(socket, {
              type: "error",
              code: "UNAUTHORIZED",
              message:
                "WebSocket auth required (ticket, session, or contact session)",
            });
            socket.close(4401, "Unauthorized");
            return;
          }

          send(socket, {
            type: "hello",
            auth: principal.kind === "session" ? "session" : "contact",
            ...(principal.kind === "session"
              ? {
                  userId: principal.userId,
                  organizationId: principal.organizationId,
                }
              : {}),
          });

          heartbeat = setInterval(() => {
            send(socket, { type: "pong", ts: Date.now() });
          }, HEARTBEAT_MS);
        },
        onClose: cleanup,
        onError: cleanup,
        onMessage(event, socket) {
          if (!principal) {
            return;
          }

          let msg: WsClientMessage;
          try {
            msg = JSON.parse(String(event.data)) as WsClientMessage;
          } catch {
            send(socket, {
              type: "error",
              code: "BAD_JSON",
              message: "Invalid JSON",
            });
            return;
          }

          if (msg.type === "ping") {
            send(socket, { type: "pong", ts: Date.now() });
            return;
          }

          if (msg.type === "subscribe") {
            if (!canSubscribe(principal, msg.channel)) {
              send(socket, {
                type: "error",
                code: "FORBIDDEN_CHANNEL",
                message: `Not allowed to subscribe to ${msg.channel}`,
              });
              return;
            }
            subscriptions.add(msg.channel);
            send(socket, { type: "subscribed", channel: msg.channel });
            return;
          }

          if (msg.type === "unsubscribe") {
            subscriptions.delete(msg.channel);
            send(socket, { type: "unsubscribed", channel: msg.channel });
            return;
          }

          send(socket, {
            type: "error",
            code: "UNKNOWN_TYPE",
            message: "Unknown message type",
          });
        },
      };
    }),
  );
}
