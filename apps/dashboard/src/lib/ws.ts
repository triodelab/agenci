/**
 * Dashboard WebSocket helper.
 * Prefers Vite-proxied `/ws` (Cookie auth). Falls back to ticket if needed.
 */
import type { WsClientMessage, WsServerMessage } from "server/ws";

export type DashboardWsHandlers = {
  onMessage?: (msg: WsServerMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: Event) => void;
};

function wsUrlWithTicket(ticket: string): string {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws?ticket=${encodeURIComponent(ticket)}`;
}

async function fetchTicket(): Promise<string> {
  const res = await fetch("/api/ws/ticket", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`WS ticket failed (${res.status})`);
  }
  const data = (await res.json()) as { ticket: string };
  return data.ticket;
}

export type DashboardWebSocket = {
  send: (msg: WsClientMessage) => void;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  close: () => void;
};

export function connectDashboardWs(
  handlers: DashboardWsHandlers = {},
): DashboardWebSocket {
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

  const send = (msg: WsClientMessage) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(msg));
    }
  };

  const connect = async () => {
    if (closed) return;
    try {
      const ticket = await fetchTicket();
      socket = new WebSocket(wsUrlWithTicket(ticket));

      socket.onopen = () => {
        attempt = 0;
        handlers.onOpen?.();
        pingTimer = setInterval(() => send({ type: "ping" }), 20_000);
      };

      socket.onmessage = (ev) => {
        try {
          handlers.onMessage?.(JSON.parse(String(ev.data)) as WsServerMessage);
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
      console.error("[dashboard-ws] connect failed", err);
      if (!closed) {
        const delay = Math.min(30_000, 1000 * 2 ** attempt);
        attempt += 1;
        reconnectTimer = setTimeout(() => {
          void connect();
        }, delay);
      }
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
