/**
 * Mount Inngest at `/api/inngest`.
 */
import type { Env, Hono } from "hono";
import { serve } from "inngest/hono";
import { inngest } from "../inngest/client";
import { inngestFunctions } from "../inngest";

const handler = serve({
  client: inngest,
  functions: inngestFunctions,
  servePath: "/api/inngest",
});

export function registerInngest<E extends Env>(app: Hono<E>) {
  app.on(["GET", "POST", "PUT"], "/api/inngest", (c) => handler(c));
}
