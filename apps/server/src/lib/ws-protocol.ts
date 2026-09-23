/**
 * Task 2.3 — WebSocket client/server protocol (shared shapes).
 *
 * Channels:
 * - `conversation:{id}` — live messages for one conversation
 * - `org:{id}:inbox` — org inbox updates (staff only)
 *
 * Server → client events (payloads grow in later phases):
 * - `message.created` | `message.updated`
 * - `conversation.updated` | `conversation.created`
 * - `ping` / `pong` heartbeat
 */

export const WS_CHANNELS = {
  conversation: (id: string) => `conversation:${id}` as const,
  orgInbox: (orgId: string) => `org:${orgId}:inbox` as const,
} as const;

export type WsChannel =
  | `conversation:${string}`
  | `org:${string}:inbox`;

export type WsClientMessage =
  | { type: "subscribe"; channel: string }
  | { type: "unsubscribe"; channel: string }
  | { type: "ping" };

export type WsServerEventName =
  | "message.created"
  | "message.updated"
  | "conversation.created"
  | "conversation.updated";

export type WsServerMessage =
  | {
      type: "hello";
      auth: "session" | "contact";
      userId?: string;
      organizationId?: string | null;
    }
  | { type: "pong"; ts: number }
  | { type: "subscribed"; channel: string }
  | { type: "unsubscribed"; channel: string }
  | { type: "error"; code: string; message: string }
  | {
      type: "event";
      channel: string;
      event: WsServerEventName;
      payload: Record<string, unknown>;
    };

/** Contact-session header used by the widget public API / WS. */
export const CONTACT_SESSION_HEADER = "x-contact-session-id";

export function parseChannel(channel: string): {
  kind: "conversation" | "org_inbox" | "unknown";
  id: string | null;
} {
  const conv = /^conversation:(.+)$/.exec(channel);
  if (conv?.[1]) {
    return { kind: "conversation", id: conv[1] };
  }
  const inbox = /^org:([^:]+):inbox$/.exec(channel);
  if (inbox?.[1]) {
    return { kind: "org_inbox", id: inbox[1] };
  }
  return { kind: "unknown", id: null };
}
