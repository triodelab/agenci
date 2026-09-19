/**
 * Task 2.2 — Typed oRPC client for the Next dashboard (web).
 * Uses same-origin `/rpc` rewrite → Hono so Better Auth cookies stay first-party.
 */
import type { AppRouter } from "server/router";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";

function rpcUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/rpc`;
  }
  // SSR: hit Fastify directly (or via absolute public URL)
  const server =
    process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "") ||
    "http://localhost:3003";
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

export const api: RouterClient<AppRouter> = createORPCClient(link);
