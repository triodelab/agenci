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
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins/organization";
import { twoFactor } from "better-auth/plugins/two-factor";
import { sendInvitationViaResend } from "./invitation-email";
import { sendPasswordResetViaResend } from "./password-reset-email";
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
      /**
       * «Glemt passord»: e-mails a one-time link (1 hour). The link goes via
       * /api/auth/reset-password/:token, which sends the user on to the
       * dashboard's /nytt-passord page. Every other session is signed out.
       */
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      async sendResetPassword({ user, url }) {
        if (!env.RESEND_API_KEY) {
          // Only print the link locally; in production it would land in logs.
          if (isProd) console.warn("[better-auth] password reset requested, but RESEND_API_KEY is not set");
          else console.info("[better-auth] password reset (no RESEND_API_KEY, not e-mailed)", { email: user.email, url });
          return;
        }
        await sendPasswordResetViaResend({
          apiKey: env.RESEND_API_KEY,
          from: env.RESEND_FROM_EMAIL,
          to: user.email,
          name: user.name,
          link: url,
        });
      },
    },

    /**
     * Self-serve account deletion (Innstillinger → Sikkerhet). The client
     * sends the password, which Better Auth verifies. Refused while the user
     * is the only owner of an organization, so no team is left without an
     * owner — they delete the organization or hand it over first.
     */
    user: {
      deleteUser: {
        enabled: true,
        async beforeDelete(user) {
          const owned = await prisma.member.findMany({
            where: { userId: user.id, role: "owner" },
            select: { organizationId: true, organization: { select: { name: true } } },
          });
          for (const m of owned) {
            const owners = await prisma.member.count({
              where: { organizationId: m.organizationId, role: "owner" },
            });
            if (owners <= 1) {
              throw new APIError("BAD_REQUEST", {
                message: `Du er eneste eier av ${m.organization.name}. Slett organisasjonen eller gjør noen andre til eier først.`,
              });
            }
          }
        },
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    // Public URL of the auth API (Hono). For local Next rewrites, keep this as the server origin.
    baseURL: env.BETTER_AUTH_URL,

    /**
     * Brute-force protection. Limits per client IP (Caddy passes the real
     * visitor IP from Cloudflare in X-Forwarded-For; see deploy/Caddyfile).
     */
    rateLimit: {
      enabled: isProd,
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60 * 60, max: 5 },
        "/request-password-reset": { window: 60 * 60, max: 5 },
        "/reset-password": { window: 60 * 60, max: 10 },
        "/two-factor/verify-totp": { window: 60, max: 5 },
        "/two-factor/verify-backup-code": { window: 60, max: 5 },
        "/change-password": { window: 60 * 60, max: 10 },
      },
    },

    advanced: {
      database: {
        joins: true,
      },
      ipAddress: {
        ipAddressHeaders: ["x-forwarded-for"],
      },
      /**
       * Cookie policy. Dashboard and API share one origin (app.agenci.no, Caddy
       * proxies /api), and agenci.no is the same site, so SameSite=Lax works
       * everywhere and blocks cross-site request forgery.
       */
      defaultCookieAttributes: isProd
        ? {
            sameSite: "lax" as const,
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
      // Two-step login with an authenticator app. Required for the admin area.
      twoFactor({ issuer: "Agenci" }),
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
         * Team invitation e-mail. Sent through Resend when RESEND_API_KEY is
         * set; otherwise (local dev) the accept link is logged so it can be
         * shared by hand. The dashboard also shows the link after inviting.
         */
        async sendInvitationEmail(data) {
          const base =
            env.DASHBOARD_ORIGIN ?? env.CORS_ORIGIN ?? "http://localhost:3004";
          const inviteLink = `${base.replace(/\/$/, "")}/accept-invitation/${data.id}`;
          if (!env.RESEND_API_KEY) {
            console.info("[better-auth] invitation (no RESEND_API_KEY, not e-mailed)", {
              email: data.email,
              organization: data.organization.name,
              role: data.role,
              inviteLink,
            });
            return;
          }
          await sendInvitationViaResend({
            apiKey: env.RESEND_API_KEY,
            from: env.RESEND_FROM_EMAIL,
            to: data.email,
            organization: data.organization.name,
            inviter: data.inviter.user.name || data.inviter.user.email,
            role: data.role,
            link: inviteLink,
          });
        },
      }),
    ],
  });
}

export const auth = createAuth();

/** Inferable auth type for session helpers (Task 1.3). */
export type Auth = typeof auth;
