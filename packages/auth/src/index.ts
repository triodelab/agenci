/**
 * Task 1.1 — Better Auth server instance for Agenci.
 *
 * Changes vs previous scaffold:
 * - Agenci AC roles (not demo `project:*`) via `./permissions`
 * - `trustedOrigins` includes web (CORS_ORIGIN) + optional widget origin
 * - Cookie attrs: localhost-friendly in development; cross-site secure in production
 * - Teams remain enabled (locked decision)
 */
import { createPrismaClient } from "@agenci/db";
import { env } from "@agenci/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins/organization";
import { ac, admin, member, owner } from "./permissions";

/**
 * Browser `Origin` headers never carry a trailing slash — strip it so a `.env`
 * value like `http://localhost:3004/` still matches.
 */
function stripTrailingSlash(origin: string): string {
  return origin.replace(/\/$/, "");
}

/** Build the allow-list of browser origins that may call `/api/auth/*` with cookies. */
export function resolveTrustedOrigins(): string[] {
  const origins = new Set<string>([stripTrailingSlash(env.CORS_ORIGIN)]);
  if (env.DASHBOARD_ORIGIN) {
    origins.add(stripTrailingSlash(env.DASHBOARD_ORIGIN));
  }
  if (env.WIDGET_ORIGIN) {
    origins.add(stripTrailingSlash(env.WIDGET_ORIGIN));
  }
  return [...origins];
}

export function createAuth() {
  const prisma = createPrismaClient();
  const isProd = env.NODE_ENV === "production";

  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    // Task 1.1 Step 3 — web + Solid dashboard + widget
    trustedOrigins: resolveTrustedOrigins(),

    emailAndPassword: {
      enabled: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    // Public URL of the auth API (Hono). For local Next rewrites, keep this as the server origin.
    baseURL: env.BETTER_AUTH_URL,

    advanced: {
      database: {
        joins: true,
      },
      /**
       * Task 1.1 Step 4 — cookie policy
       * - production: cross-site ready (web + API on different hosts) → SameSite=None; Secure
       * - development: same-site via Next rewrite / Vite proxy → SameSite=Lax; Secure=false on HTTP
       */
      defaultCookieAttributes: isProd
        ? {
            sameSite: "none" as const,
            secure: true,
            httpOnly: true,
          }
        : {
            sameSite: "lax" as const,
            secure: false,
            httpOnly: true,
          },
    },

    plugins: [
      organization({
        ac,
        roles: {
          owner,
          admin,
          member,
        },
        // Locked decision: keep Better Auth teams
        teams: {
          enabled: true,
          maximumTeams: 10,
          allowRemovingAllTeams: false,
        },
        /**
         * Task 1.4 — invitation email.
         * No mail provider in local yet: log the accept URL so the Solid UI / console can share it.
         */
        async sendInvitationEmail(data) {
          const base =
            env.DASHBOARD_ORIGIN ?? env.CORS_ORIGIN ?? "http://localhost:3004";
          const inviteLink = `${base.replace(/\/$/, "")}/accept-invitation/${data.id}`;
          console.info("[better-auth] invitation email (dev stub)", {
            email: data.email,
            organization: data.organization.name,
            role: data.role,
            inviteLink,
          });
        },
      }),
    ],
  });
}

export const auth = createAuth();

/** Inferable auth type for session helpers (Task 1.3). */
export type Auth = typeof auth;
