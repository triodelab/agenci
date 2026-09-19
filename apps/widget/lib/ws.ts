/**
 * Task 2.3 — Widget WebSocket helper.
 * Auth via contact-session id (query) or ticket from POST /api/ws/ticket.
 */
import type { WsClientMessage, WsServerMessage } from "server/ws";
import { CONTACT_SESSION_HEADER } from "server/ws";

export type WidgetWsHandlers = {
  onMessage?: (msg: WsServerMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: Event) => void;
};

function serverHttpBase(): string {
  return (
    process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "") ||
    "http://localhost:3003"
  );
}

function serverWsBase(): string {
  return serverHttpBase().replace(/^http/, "ws");
}

async function fetchContactTicket(contactSessionId: string): Promise<string> {
  const res = await fetch(`${serverHttpBase()}/api/ws/ticket`, {
    method: "POST",
    headers: { [CONTACT_SESSION_HEADER]: contactSessionId },
  });
  if (!res.ok) {
    throw new Error(`WS ticket failed (${res.status})`);
  }
  const data = (await res.json()) as { ticket: string };
  return data.ticket;
}

export type WidgetWebSocket = {
  send: (msg: WsClientMessage) => void;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  close: () => void;
};

export function connectWidgetWs(
  contactSessionId: string,
  handlers: WidgetWsHandlers = {},
): WidgetWebSocket {
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
      const ticket = await fetchContactTicket(contactSessionId);
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
          // ignore
        }
      };

      socket.onerror = (err) => handlers.onError?.(err);

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
      console.error("[widget-ws] connect failed", err);
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
