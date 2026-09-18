/**
 * Typed oRPC client for the React dashboard.
 * Same-origin `/rpc` via Vite proxy → Hono (cookies first-party).
 */
import type { AppRouter } from "server/router";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

export type AppRouterClient = RouterClient<AppRouter>;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        console.error("[orpc]", error);
      },
    }),
  });
}

/**
 * Browser: same-origin `/rpc` (Vite proxies to :3003).
 * Non-browser / tests: optional `VITE_SERVER_URL`, else local Hono.
 */
function rpcUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/rpc`;
  }
  const server =
    import.meta.env.VITE_SERVER_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:3003";
  return `${server}/rpc`;
}

const link = new RPCLink({
  url: rpcUrl,
  fetch: (request, init) =>
    globalThis.fetch(request, {
      ...init,
      credentials: "include",
    }),
});

export const client: AppRouterClient = createORPCClient(link);

/** TanStack Query helpers — e.g. `orpc.private.agents.create.mutationOptions()` */
export const orpc = createTanstackQueryUtils(client);
