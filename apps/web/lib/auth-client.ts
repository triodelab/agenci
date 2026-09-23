/**
 * Task 1.2 Step 1 — Better Auth React client (apps/web).
 *
 * Points at same-origin `/api/auth/*`, which Next rewrites to Hono
 * (`NEXT_PUBLIC_SERVER_URL`). That keeps session cookies first-party on the
 * dashboard origin during local HTTP development.
 */
import { ac, admin, member, owner } from "@agenci/auth/permissions";
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

/**
 * Prefer empty baseURL so requests stay on the Next origin (rewrite → Hono).
 * Override with NEXT_PUBLIC_SERVER_URL only when calling the API host directly.
 */
const baseURL =
  typeof window !== "undefined"
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    // Must mirror server roles/AC from Task 1.1
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
    }),
  ],
});

export type AuthClient = typeof authClient;
