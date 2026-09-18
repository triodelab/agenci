/**
 * Initial oRPC context — filled by the oRPC plugin from each request.
 * `requireOrgMiddleware` injects org/user fields for private procedures.
 */
import type { OrgContext } from "@/lib/session";

export type ApiContext = {
  /** Incoming request headers (cookies, X-Contact-Session-Id, etc.). */
  headers: Headers;
};

/** Context after `requireOrgMiddleware` — available on private procedures. */
export type AuthedApiContext = ApiContext & {
  userId: OrgContext["userId"];
  organizationId: OrgContext["organizationId"];
  role: OrgContext["role"];
  user: OrgContext["user"];
  session: OrgContext["session"];
};
