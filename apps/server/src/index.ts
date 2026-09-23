/**
 * Hono entry — Better Auth, session smoke routes, oRPC (2.1), WebSocket (2.3).
 */
import { auth, resolveTrustedOrigins } from "@agenci/auth";
import { CONTACT_SESSION_HEADER } from "./lib/ws-protocol";
import { env } from "@agenci/env/server";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { WebSocketServer } from "ws";
import {
  getSession,
} from "./lib/session";
import { issueWsTicket } from "./lib/ws-tickets";
import { registerOrpc } from "./plugins/orpc";
import { registerWebsocket } from "./plugins/websocket";
import { registerInngest } from "./plugins/inngest";
import { AuthenticationRouter } from "./modules/authentication/router";
import { type HonoBindings, type HonoVariables, MastraServer } from '@mastra/hono'
import { mastra } from "./mastra";
import { hydrateCompletedCustomerAgents } from "./mastra/register-customer-agent";

const trustedOrigins = resolveTrustedOrigins();

const app = new Hono<{ Bindings: HonoBindings; Variables: HonoVariables }>();
const server = new MastraServer({ app, mastra })

await server.init();
void hydrateCompletedCustomerAgents();

app.use("*", logger());

app.use("*", async (c, next) => {
  // upgradeWebSocket mutates upgrade headers — skip CORS on `/ws`.
  if (c.req.path === "/ws") {
    return next();
  }
  return cors({
    origin: trustedOrigins,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      CONTACT_SESSION_HEADER,
      "X-Contact-Session-Id",
    ],
    credentials: true,
    maxAge: 86400,
  })(c, next);
});


app.on(["GET", "POST"], "/api/auth/*", async (c) => {
  try {
    return await auth.handler(c.req.raw);
  } catch (error) {
    console.error("Authentication Error:", error);
    return c.json(
      { error: "Internal authentication error", code: "AUTH_FAILURE" },
      500,
    );
  }
});

/**
 * Task 2.3 — Issue a one-time WS ticket (Better Auth cookie or contact-session header).
 * Frontends on a different origin call this via same-origin rewrite/proxy, then open `ws://…/ws?ticket=`.
 */
app.post("/api/ws/ticket", async (c) => {
  const session = await getSession(c.req.raw.headers);
  if (session?.user) {
    const issued = issueWsTicket({
      kind: "session",
      userId: session.user.id,
      organizationId: session.session.activeOrganizationId ?? null,
    });
    return c.json(issued);
  }

  const contactSessionId = c.req.header(CONTACT_SESSION_HEADER)?.trim() ?? "";
  if (contactSessionId.length >= 8) {
    const issued = issueWsTicket({
      kind: "contact",
      contactSessionId,
    });
    return c.json(issued);
  }

  return c.json({ error: "Not authenticated", code: "UNAUTHENTICATED" }, 401);
});

app.get("/", (c) => c.text("OK"));

// Session smoke routes live under `/api/*`, not `/api/auth/*` (Better Auth owns that prefix).
app.route("/api", AuthenticationRouter);
registerOrpc(app);
registerWebsocket(app);
registerInngest(app);

const wss = new WebSocketServer({ noServer: true });

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
    hostname: "0.0.0.0",
    websocket: { server: wss },
    overrideGlobalObjects: false,
  },
  (info) => {
    console.log(`Server running on http://${info.address}:${info.port}`);
    console.log(`Inngest serve: http://${info.address}:${info.port}/api/inngest`);
  },
);
