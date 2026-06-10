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
     * shadcn/dark-tema + variabler gir fortsatt ofte feil tekst på popover-handlinger
     * (hvit på hvit i lys modus, nesten svart på svart i mørk). Vi overstyrer eksplisitt.
     */
    const popoverAction = isDark
      ? "!text-zinc-50 [&_svg]:!text-zinc-300 hover:!bg-white/10"
      : "!text-zinc-900 [&_svg]:!text-zinc-600 hover:!bg-zinc-100";

    const previewManage = isDark
      ? "!text-zinc-200 [&_svg]:!text-zinc-300 hover:!text-zinc-50"
      : "!text-zinc-800 [&_svg]:!text-zinc-600 hover:!text-zinc-950";

    /**
     * Organization Profile: underfaner (Billing → Statements/Payments, Members → Invitations)
     * bruker ofte `tabButton` / `segmentedControlButton`. Uten overstyr blir inaktiv tekst nesten usynlig.
     */
    const profileTabInactive = isDark
      ? "!inline-flex !items-center !px-3 !py-2 !font-medium !text-zinc-300 !opacity-100 hover:!text-zinc-100 [&[aria-selected='true']]:!font-semibold [&[aria-selected='true']]:!text-zinc-50 [&[data-state='active']]:!font-semibold [&[data-state='active']]:!text-zinc-50"
      : "!inline-flex !items-center !px-3 !py-2 !font-medium !text-zinc-700 !opacity-100 hover:!text-zinc-900 [&[aria-selected='true']]:!font-semibold [&[aria-selected='true']]:!text-zinc-950 [&[data-state='active']]:!font-semibold [&[data-state='active']]:!text-zinc-950";

    const navbarProfile = isDark
      ? "!text-zinc-300 !opacity-100 hover:!bg-white/10 hover:!text-zinc-100 [&[data-active='true']]:!text-zinc-50 [&[aria-current='page']]:!text-zinc-50"
      : "!text-zinc-700 !opacity-100 hover:!bg-muted hover:!text-zinc-900 [&[data-active='true']]:!text-zinc-950 [&[aria-current='page']]:!text-zinc-950";

    const segmentedProfile = isDark
      ? "!font-medium !text-zinc-300 !opacity-100 [&[data-state='checked']]:!text-zinc-50 [&[data-state='checked']]:!font-semibold"
      : "!font-medium !text-zinc-700 !opacity-100 [&[data-state='checked']]:!text-zinc-950 [&[data-state='checked']]:!font-semibold";

    /**
     * «Upload»-knappen i Setup-your-organization og lignende logo-felter blir
     * nesten usynlig med standard Clerk-styling. Tving fram tydelig kontrast.
     */
    const fileUploadButton = isDark
      ? "!inline-flex !items-center !justify-center !px-3 !py-1.5 !rounded-md !text-[13px] !font-semibold !text-zinc-50 !bg-zinc-800 hover:!bg-zinc-700 !border !border-zinc-700 !opacity-100"
      : "!inline-flex !items-center !justify-center !px-3 !py-1.5 !rounded-md !text-[13px] !font-semibold !text-zinc-900 !bg-zinc-100 hover:!bg-zinc-200 !border !border-zinc-300 !opacity-100";

    /**
     * Bruk nye variabelnavn (juli 2025+): colorForeground / colorMutedForeground / colorInput.
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
      elements: {
        userButtonPopoverCard: "border border-border/60 bg-card text-card-foreground shadow-xl",
        userButtonPopoverMain: "gap-0",
        userButtonPopoverActionButton: popoverAction,
        userButtonPopoverActionButton__manageAccount: popoverAction,
        userButtonPopoverActionButton__signOut: popoverAction,
        userButtonPopoverActionButton__addAccount: popoverAction,
        userButtonPopoverActionButton__signOutAll: popoverAction,
        userButtonPopoverActionButtonIcon: isDark
          ? "!text-zinc-300"
          : "!text-zinc-600",
        userButtonPopoverActionButtonIcon__manageAccount: isDark
          ? "!text-zinc-300"
          : "!text-zinc-600",
        userButtonPopoverActionButtonIcon__signOut: isDark
          ? "!text-zinc-300"
          : "!text-zinc-600",
        organizationSwitcherPopoverCard:
          "border border-border/60 bg-card text-card-foreground shadow-xl",
        organizationSwitcherPopoverMain: "gap-0",
        organizationSwitcherPopoverActionButton: popoverAction,
        organizationSwitcherPopoverActionButton__createOrganization: popoverAction,
        organizationSwitcherPopoverActionButton__manageOrganization: popoverAction,
        organizationSwitcherPopoverActionButton__switchOrganization: popoverAction,
        organizationSwitcherPopoverActionButtonIcon: isDark
          ? "!text-zinc-300"
          : "!text-zinc-600",
        organizationSwitcherPopoverActionButtonIcon__createOrganization: isDark
          ? "!text-zinc-300"
          : "!text-zinc-600",
        organizationSwitcherPopoverActionButtonIcon__manageOrganization: isDark
          ? "!text-zinc-300"
          : "!text-zinc-600",
        organizationSwitcherPopoverActionButtonIconBox: isDark
          ? "!text-zinc-300"
          : "!text-zinc-600",
        organizationSwitcherPopoverActionButtonIconBox__createOrganization: isDark
          ? "!text-zinc-300"
          : "!text-zinc-600",
        organizationSwitcherPopoverActionButtonIconBox__manageOrganization: isDark
          ? "!text-zinc-300"
          : "!text-zinc-600",
        organizationSwitcherPreviewButton: previewManage,
        organizationSwitcherPreviewButton__organization: previewManage,
        organizationSwitcherPreviewButton__personal: previewManage,
        organizationListCreateOrganizationActionButton: popoverAction,
        fileDropAreaButtonPrimary: fileUploadButton,
        avatarImageActionsUpload: fileUploadButton,
        formFieldInputShowPasswordButton: isDark ? "!text-zinc-300" : "!text-zinc-600",
      },
      organizationProfile: {
        elements: {
          navbarButton: navbarProfile,
          navbarButtonIcon: isDark ? "!text-zinc-400 !opacity-100" : "!text-zinc-500 !opacity-100",
          tabButton: profileTabInactive,
          tabListContainer:
            "!flex !flex-wrap items-end gap-x-8 gap-y-2 border-b border-border/60",
          segmentedControlRoot: "bg-muted/50 p-0.5",
          segmentedControlButton: segmentedProfile,
        },
      },
    };
  }, [mounted, resolvedTheme]);

  return (
    <ClerkProvider appearance={appearance}>{children}</ClerkProvider>
  );
}
