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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ClerkThemeProvider>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <ScrollToHash />
          {children}
        </ConvexProviderWithClerk>
      </ClerkThemeProvider>
    </ThemeProvider>
  );
}
