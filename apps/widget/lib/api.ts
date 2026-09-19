/**
 * Task 2.2 — Typed oRPC client for the customer widget.
 * Sends `X-Contact-Session-Id` on every public call when provided.
 */
import type { AppRouter } from "server/router";
import { CONTACT_SESSION_HEADER } from "server/ws";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";

export type WidgetApiOptions = {
  /** Unguessable contact-session id (Phase 4 ContactSession). */
  getContactSessionId?: () => string | null | undefined;
  /** Override Hono origin (defaults to NEXT_PUBLIC_SERVER_URL). */
  serverUrl?: string;
};

function resolveServerUrl(override?: string): string {
  if (override) return override.replace(/\/$/, "");
  return (
    process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "") ||
    "http://localhost:3003"
  );
}

export function createWidgetApi(
  options: WidgetApiOptions = {},
): RouterClient<AppRouter> {
  const link = new RPCLink({
    url: `${resolveServerUrl(options.serverUrl)}/rpc`,
    headers: () => {
      const id = options.getContactSessionId?.();
      if (!id) return {};
      return { [CONTACT_SESSION_HEADER]: id };
    },
    fetch: (request, init) =>
      globalThis.fetch(request, {
        ...init,
        credentials: "include",
      }),
  });

  return createORPCClient(link);
}

/** Default singleton — set contact session via `setWidgetContactSessionId`. */
let contactSessionId: string | null = null;

export function setWidgetContactSessionId(id: string | null) {
  contactSessionId = id;
}

export const api: RouterClient<AppRouter> = createWidgetApi({
  getContactSessionId: () => contactSessionId,
});
