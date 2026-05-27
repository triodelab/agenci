"use client";

import * as React from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ClerkThemeProvider } from "@/components/clerk-theme-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollToHash } from "@/components/scroll-to-hash";
import { parseConvexDeploymentUrl } from "@/lib/convex-url";

const convexUrl = parseConvexDeploymentUrl(process.env.NEXT_PUBLIC_CONVEX_URL);
const convex = new ConvexReactClient(convexUrl);

// Clerk caches JWT template tokens for ~60s. After org creation, the cached
// token lacks orgId, so Convex queries return null. skipCache: true forces
// a fresh token on every auth refresh, ensuring orgId is always present.
function useAuthSkipCache() {
  const auth = useAuth();
  const getToken = React.useCallback(
    (options?: Parameters<typeof auth.getToken>[0]) =>
      auth.getToken({ ...options, skipCache: true }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [auth.getToken],
  );
  return { ...auth, getToken };
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ClerkThemeProvider>
        <ConvexProviderWithClerk client={convex} useAuth={useAuthSkipCache}>
          <ScrollToHash />
          {children}
        </ConvexProviderWithClerk>
      </ClerkThemeProvider>
    </ThemeProvider>
  );
}
