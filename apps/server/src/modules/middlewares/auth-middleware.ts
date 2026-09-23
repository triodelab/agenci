import { requireSessionFromHeaders } from "@/lib/session";
import { createMiddleware } from "hono/factory";

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await requireSessionFromHeaders(c.req.raw.headers);

  if (!session) {
    c.set("session", null);
    return next();
  }

  c.set("session", session);
  await next();
});
