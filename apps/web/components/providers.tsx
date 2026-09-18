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

const convexUrl = parseConvexDeploymentUrl(process.env.NEXT_PUBLIC_CONVEX_URL);
const convex = new ConvexReactClient(convexUrl);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {/* Task 1.2: no Clerk — session comes from Better Auth client hooks */}
      <ConvexProvider client={convex}>
        <ScrollToHash />
        {children}
      </ConvexProvider>
    </ThemeProvider>
  );
}
