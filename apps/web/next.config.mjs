import path from "node:path";
import { fileURLToPath } from "node:url";

import { withSentryConfig } from "@sentry/nextjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Repo root (agenci/) — anbefalt for Bun-monorepo slik at tracing og chunks resolver riktig */
const monorepoRoot = path.join(__dirname, "../..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@agenci/auth", "server"],
  devIndicators: false,
  outputFileTracingRoot: monorepoRoot,
  /**
   * The legacy Convex dashboard under app/(dashboard) is dead code (middleware
   * redirects it to apps/dashboard) and does not typecheck. Skip the type step
   * in `next build` until it is removed; run `bun run typecheck` separately.
   */
  typescript: { ignoreBuildErrors: true },
  /**
   * Proxy Better Auth / oRPC / WS ticket to Fastify so cookies stay first-party
   * on the Next origin (localhost:3000 → server :3003).
   */
  async rewrites() {
    const server =
      process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "") ||
      "http://localhost:3003";
    return [
      {
        source: "/api/auth/:path*",
        destination: `${server}/api/auth/:path*`,
      },
      {
        source: "/api/me",
        destination: `${server}/api/me`,
      },
      {
        source: "/api/me/org",
        destination: `${server}/api/me/org`,
      },
      {
        source: "/api/ws/ticket",
        destination: `${server}/api/ws/ticket`,
      },
      {
        source: "/rpc",
        destination: `${server}/rpc`,
      },
      {
        source: "/rpc/:path*",
        destination: `${server}/rpc/:path*`,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://www.npmjs.com/package/@sentry/webpack-plugin#options

org: "enra-doo-o7",
project: "echo-tutorial",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
tunnelRoute: "/monitoring",

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});