"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import {
  BotIcon,
  CreditCardIcon,
  HomeIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LibraryBigIcon,
  Mic,
  PaletteIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoIcon } from "@/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import { cn } from "@workspace/ui/lib/utils";

const customerSupportItems = [
  { title: "Oversikt", url: "/dashboard", icon: HomeIcon },
  { title: "Konversasjoner", url: "/conversations", icon: InboxIcon },
  { title: "Kunnskapsbase", url: "/files", icon: LibraryBigIcon },
];

const configurationItems = [
  { title: "Widget-tilpasning", url: "/customization", icon: PaletteIcon },
  { title: "Integrasjoner", url: "/integrations", icon: LayoutDashboardIcon },
  { title: "Stemmeassistent", url: "/plugins/vapi", icon: Mic },
];

const accountItems = [
  { title: "Plan og faktura", url: "/billing", icon: CreditCardIcon },
  { title: "Agenter", url: "/agents", icon: BotIcon },
];

function navButtonClass(active: boolean) {
  return cn(
    "relative h-9 w-full rounded-lg text-[13px] font-medium transition-colors duration-150",
    active
      ? "bg-primary text-primary-foreground"
      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
  );
}

export const DashboardSidebar = () => {
  const pathname = usePathname();

  const isActive = (url: string) => {
    if (url === "/") return pathname === "/";
    if (url === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(url);
  };

  return (
    <Sidebar
      className={cn(
        "group z-20 border-sidebar-border border-r bg-sidebar",
        "dark:supports-[backdrop-filter]:bg-sidebar/98 dark:supports-[backdrop-filter]:backdrop-blur-sm",
      )}
      collapsible="icon"
    >
      <SidebarHeader className="gap-3 border-sidebar-border/80 border-b px-3 pb-4 pt-4">
        <Link
          className={cn(
            "group/brand flex items-center gap-3 rounded-xl px-2 py-2 transition-colors",
            "hover:bg-sidebar-accent/80",
            "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
          )}
          href="/dashboard"
        >
          <LogoIcon className="size-10 shrink-0 rounded-xl object-contain shadow-sm ring-1 ring-border/15" />
          <span className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
            <span className="block truncate font-semibold text-[15px] text-sidebar-foreground tracking-tight">
              Agenci
            </span>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              Arbeidsflate
            </span>
          </span>
        </Link>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-11 rounded-xl" size="lg">
              <OrganizationSwitcher
                hidePersonal
                skipInvitationScreen
                appearance={{
                  elements: {
                    rootBox: "w-full! h-10!",
                    avatarBox: "size-4! rounded-md!",
                    organizationSwitcherTrigger:
                      "w-full! justify-start! rounded-lg! border border-sidebar-border/90 bg-card/80 px-2.5! shadow-sm! hover:bg-sidebar-accent/80! group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-2!",
                    organizationPreview:
                      "group-data-[collapsible=icon]:justify-center! gap-2!",
                    organizationPreviewTextContainer:
                      "group-data-[collapsible=icon]:hidden! text-[13px]! font-medium! text-sidebar-foreground!",
                    organizationSwitcherTriggerIcon:
                      "group-data-[collapsible=icon]:hidden! ml-auto! size-4! text-sidebar-foreground/55!",
                  },
                }}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-4 px-2.5 py-4">
        <SidebarGroup className="rounded-xl border border-sidebar-border/70 bg-muted/25 p-2 dark:bg-muted/10">
          <SidebarGroupLabel className="mb-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.14em]">
            Kundestøtte
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {customerSupportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={navButtonClass(isActive(item.url))}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon
                        className="size-[15px] opacity-95"
                        strokeWidth={1.75}
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="rounded-xl border border-sidebar-border/70 bg-muted/25 p-2 dark:bg-muted/10">
          <SidebarGroupLabel className="mb-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.14em]">
            Tilpasning
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {configurationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={navButtonClass(isActive(item.url))}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon
                        className="size-[15px] opacity-95"
                        strokeWidth={1.75}
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="rounded-xl border border-sidebar-border/70 bg-muted/25 p-2 dark:bg-muted/10">
          <SidebarGroupLabel className="mb-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.14em]">
            Konto
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={navButtonClass(isActive(item.url))}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon
                        className="size-[15px] opacity-95"
                        strokeWidth={1.75}
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border/80 border-t bg-muted/15 px-2 py-3 dark:bg-muted/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <UserButton
              showName
              appearance={{
                elements: {
                  rootBox: "w-full! h-10!",
                  userButtonTrigger:
                    "w-full! rounded-xl! border border-sidebar-border/70 bg-card/60 p-2! shadow-sm hover:bg-sidebar-accent/90! group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-2!",
                  userButtonBox:
                    "w-full! flex-row-reverse! justify-end! gap-2! group-data-[collapsible=icon]:justify-center! text-[13px] text-sidebar-foreground!",
                  userButtonOuterIdentifier:
                    "pl-0! group-data-[collapsible=icon]:hidden! text-sidebar-foreground/85!",
                  avatarBox: "size-4! rounded-md!",
                },
              }}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
