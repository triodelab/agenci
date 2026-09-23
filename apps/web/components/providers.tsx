/**
 * Task 1.2 — Root providers.
 *
 * ClerkThemeProvider + ConvexProviderWithClerk removed.
 * Convex stays as a plain provider until Phase 5/8 API cutover (data still on Convex).
 * Auth identity is Better Auth only (cookies via /api/auth rewrite).
 */
"use client";

import * as React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollToHash } from "@/components/scroll-to-hash";
import { parseConvexDeploymentUrl } from "@/lib/convex-url";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
const convex = convexUrl
  ? new ConvexReactClient(parseConvexDeploymentUrl(convexUrl))
  : null;

export function Providers({ children }: { children: React.ReactNode }) {
  const content = (
    <>
      <ScrollToHash />
      {children}
    </>
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {/* Dashboard routes use Convex when configured; marketing can render standalone. */}
      {convex ? <ConvexProvider client={convex}>{content}</ConvexProvider> : content}
    </ThemeProvider>
  );
}
