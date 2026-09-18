/**
 * Task 2.3 — WebSocket client helper for staff (web).
 *
 * Flow: POST /api/ws/ticket (cookie) → connect ws to Hono `/ws?ticket=`.
 * Reconnect with backoff; client ping keeps the channel warm.
 */
import type { WsClientMessage, WsServerMessage } from "backend/ws";

export type AgenciWsHandlers = {
  onMessage?: (msg: WsServerMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: Event) => void;
};

function serverHttpBase(): string {
  if (typeof window !== "undefined") {
    // Prefer same-origin rewrite for ticket; WS still goes to Hono host.
    return "";
  }
  return (
    process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "") ||
    "http://localhost:3003"
  );
}

function serverWsBase(): string {
  const http =
    process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "") ||
    "http://localhost:3003";
  return http.replace(/^http/, "ws");
}

async function fetchTicket(): Promise<string> {
  const res = await fetch(`${serverHttpBase()}/api/ws/ticket`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`WS ticket failed (${res.status})`);
  }
  const data = (await res.json()) as { ticket: string };
  return data.ticket;
}

export type AgenciWebSocket = {
  send: (msg: WsClientMessage) => void;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  close: () => void;
};

export function connectDashboardWs(
  handlers: AgenciWsHandlers = {},
): AgenciWebSocket {
  let socket: WebSocket | null = null;
  let closed = false;
  let attempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let pingTimer: ReturnType<typeof setInterval> | undefined;

  const clearTimers = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (pingTimer) clearInterval(pingTimer);
    reconnectTimer = undefined;
    pingTimer = undefined;
  };

  const connect = async () => {
    if (closed) return;
    try {
      const ticket = await fetchTicket();
      const url = `${serverWsBase()}/ws?ticket=${encodeURIComponent(ticket)}`;
      socket = new WebSocket(url);

      socket.onopen = () => {
        attempt = 0;
        handlers.onOpen?.();
        pingTimer = setInterval(() => {
          send({ type: "ping" });
        }, 20_000);
      };

      socket.onmessage = (ev) => {
        try {
          const msg = JSON.parse(String(ev.data)) as WsServerMessage;
          handlers.onMessage?.(msg);
        } catch {
          // ignore malformed
        }
      };

      socket.onerror = (err) => {
        handlers.onError?.(err);
      };

      socket.onclose = () => {
        clearTimers();
        handlers.onClose?.();
        if (!closed) {
          const delay = Math.min(30_000, 1000 * 2 ** attempt);
          attempt += 1;
          reconnectTimer = setTimeout(() => {
            void connect();
          }, delay);
        }
      };
    } catch (err) {
      console.error("[ws] connect failed", err);
      if (!closed) {
        const delay = Math.min(30_000, 1000 * 2 ** attempt);
        attempt += 1;
        reconnectTimer = setTimeout(() => {
          void connect();
        }, delay);
      }
    }
  };

  const send = (msg: WsClientMessage) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(msg));
    }
  };

  void connect();

  return {
    send,
    subscribe: (channel) => send({ type: "subscribe", channel }),
    unsubscribe: (channel) => send({ type: "unsubscribe", channel }),
    close: () => {
      closed = true;
      clearTimers();
      socket?.close();
      socket = null;
    },
  };
}
