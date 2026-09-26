/**
 * Better Auth client for the React dashboard.
 * Calls same-origin `/api/auth/*` (Vite proxies to Hono — see vite.config.ts).
 */
import { ac, admin, member, owner } from "@agenci/auth/permissions";
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3004",
  plugins: [
    organizationClient({
      ac,
      roles: { owner, admin, member },
    }),
  ],
});

export type Session = typeof authClient.$Infer.Session;
