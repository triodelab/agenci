/**
 * Task 2.1 — Mount oRPC RPCHandler at `/rpc/*`.
 */
import { appRouter, type ApiContext } from "../routers";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import type { Env, Hono } from "hono";

const handler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error("[orpc]", error);
    }),
  ],
});

function buildContext(request: Request): ApiContext {
  return {
    headers: request.headers,
  };
}

async function handleRpc(request: Request) {
  return handler.handle(request, {
    prefix: "/rpc",
    context: buildContext(request),
  });
}

export function registerOrpc<E extends Env>(app: Hono<E>) {
  app.all("/rpc", async (c) => {
    const { matched, response } = await handleRpc(c.req.raw);
    if (matched && response) {
      return c.newResponse(response.body, response);
    }
    return c.json({ error: "RPC route not found" }, 404);
  });

  app.all("/rpc/*", async (c) => {
    const { matched, response } = await handleRpc(c.req.raw);
    if (matched && response) {
      return c.newResponse(response.body, response);
    }
    return c.json({ error: "RPC route not found" }, 404);
  });
}
