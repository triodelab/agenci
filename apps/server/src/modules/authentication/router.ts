import { AuthError, getSession, requireOrg, requireSession } from "@/lib/session";
import { Hono } from "hono";

function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return {
      status: error.statusCode,
      body: { error: error.message, code: error.code },
    } as const;
  }
  console.error("Unexpected auth helper error", error);
  return {
    status: 500 as const,
    body: { error: "Internal server error" },
  };
}

export const AuthenticationRouter = new Hono()
    .get("/me", async (c) => {
        try {
    const session = await requireSession(c.req.raw.headers);
    return c.json({
      user: session.user,
      session: {
        id: session.session.id,
        activeOrganizationId: session.session.activeOrganizationId ?? null,
        activeTeamId: session.session.activeTeamId ?? null,
        expiresAt: session.session.expiresAt,
      },
    });
  } catch (error) {
    const { status, body } = authErrorResponse(error);
    return c.json(body, status);
  }
    })
    .get("/me/org", async (c) => {
        try {
    const org = await requireOrg(c.req.raw.headers);
    return c.json({
      userId: org.userId,
      organizationId: org.organizationId,
      role: org.role,
    });
  } catch (error) {
    const { status, body } = authErrorResponse(error);
    return c.json(body, status);
  }
    })
.get("/session", async (c) => {
    try {
        const session = await getSession(c.req.raw.headers);
        return c.json({ session });
    } catch (error) {
        const { status, body } = authErrorResponse(error);
        return c.json(body, status);
    }
})