"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark, shadcn } from "@clerk/ui/themes";
import { useTheme } from "next-themes";
import * as React from "react";

/**
 * Clerk må ligge under ThemeProvider slik at vi kan speile lys/mørk modus.
 * Bruker Clerk sitt shadcn-tema (lys) og dark-tema (mørk), pluss variabler som matcher dashboard.
 *
 * @see https://clerk.com/docs/nextjs/guides/customizing-clerk/appearance-prop/themes
 */
export function ClerkThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const appearance = React.useMemo(() => {
    const isDark = mounted && resolvedTheme === "dark";
    /**
     * Bruk nye variabelnavn (juli 2025+): colorForeground / colorMutedForeground / colorInput.
     * Gamle colorText / colorTextSecondary mappes ikke fullt ut til nye komponenter — da blir
     * f.eks. «Manage account» og «Create organization» mørk tekst på mørk bakgrunn.
     *
     * @see https://clerk.com/docs/guides/customizing-clerk/appearance-prop/variables
     */
    return {
      theme: isDark ? dark : shadcn,
      variables: isDark
        ? {
            colorBackground: "#09090b",
            colorForeground: "#fafafa",
            colorMuted: "#27272a",
            colorMutedForeground: "#a1a1aa",
            colorPrimary: "#fafafa",
            colorPrimaryForeground: "#09090b",
            colorNeutral: "#3f3f46",
            colorBorder: "#27272a",
            colorInput: "#121214",
            colorInputForeground: "#fafafa",
            colorRing: "#a1a1aa",
            borderRadius: "0.625rem",
          }
        : {
            colorBackground: "#ffffff",
            colorForeground: "#18181b",
            colorMuted: "#f4f4f5",
            colorMutedForeground: "#71717a",
            colorPrimary: "#0a0a0a",
            colorPrimaryForeground: "#fafafa",
            colorNeutral: "#e4e4e7",
            colorBorder: "#e4e4e7",
            colorInput: "#fafafa",
            colorInputForeground: "#18181b",
            borderRadius: "0.625rem",
          },
    };
  }, [mounted, resolvedTheme]);

  return (
    <ClerkProvider appearance={appearance}>{children}</ClerkProvider>
  );
}
