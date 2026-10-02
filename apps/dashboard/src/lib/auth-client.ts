/**
 * Better Auth client for the React dashboard.
 * Calls same-origin `/api/auth/*` (Vite proxies to Hono — see vite.config.ts).
 */
import { ac, admin, member, owner } from "@agenci/auth/permissions";
import { createAuthClient } from "better-auth/react";
import { organizationClient, twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3004",
  plugins: [
    // Sign-in with 2FA on stops halfway; the code is asked for on /to-trinn.
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/to-trinn";
      },
    }),
    organizationClient({
      ac,
      roles: { owner, admin, member },
    }),
  ],
});

export type Session = typeof authClient.$Infer.Session;
