"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import {
  BotIcon,
  CreditCardIcon,
  GlobeIcon,
  HomeIcon,
  InboxIcon,
  LibraryBigIcon,
  Mic,
  PaletteIcon,
  PlugIcon,
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
  useSidebar,
} from "@workspace/ui/components/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

const customerSupportItems = [
  { title: "Oversikt", url: "/dashboard", icon: HomeIcon },
  { title: "Konversasjoner", url: "/conversations", icon: InboxIcon },
  { title: "Kunnskapsbase", url: "/files", icon: LibraryBigIcon },
];

const configurationItems = [
  { title: "Widget-tilpasning", url: "/customization", icon: PaletteIcon },
  { title: "Integrasjoner", url: "/integrations", icon: PlugIcon },
  { title: "Stemmeassistent", url: "/plugins/vapi", icon: Mic },
];

const accountItems = [
  { title: "Plan og faktura", url: "/billing", icon: CreditCardIcon },
  { title: "Agenter", url: "/agents", icon: BotIcon },
];

function navButtonClass(active: boolean) {
  return cn(
    "relative h-9 w-full min-w-0 rounded-lg px-3 text-[13px] font-medium transition-colors duration-150",
    // Samme fylte primær som øvrige dashboard-knapper (lys: svart, mørk: lys flate)
    active
      ? [
          "!border-transparent !bg-primary !text-primary-foreground shadow-sm",
          "hover:!bg-primary/90 hover:!text-primary-foreground",
          "data-[active=true]:!bg-primary data-[active=true]:!text-primary-foreground",
          "[&_svg]:!text-primary-foreground",
        ]
      : [
          "border-transparent text-sidebar-foreground/85",
          "hover:bg-muted/80 hover:text-foreground",
          "[&_svg]:opacity-90",
        ],
  );
}

function SidebarThemeToggle() {
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  const triggerClassName = cn(
    "shrink-0 rounded-lg border border-sidebar-border/90 bg-card/80 p-1.5 shadow-sm",
    "hover:bg-sidebar-accent/80 hover:opacity-100",
  );

  const toggle = (
    <ModeToggle
      contentClassName="dashboard-app-shell min-w-[10rem]"
      triggerClassName={triggerClassName}
    />
  );

  if (!collapsed) {
    return (
      <div className="flex w-full min-w-0 items-center justify-between gap-2">
        <span className="truncate text-[13px] font-medium text-sidebar-foreground group-data-[collapsible=icon]:sr-only">
          Tema
        </span>
        {toggle}
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex w-full justify-center">{toggle}</span>
      </TooltipTrigger>
      <TooltipContent side="right" align="center">
        Tema (lys / mørk / system)
      </TooltipContent>
    </Tooltip>
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
      )}
      collapsible="icon"
    >
      <SidebarHeader className="gap-3 border-sidebar-border/80 border-b px-3 pb-4 pt-4">
        <Link
          className={cn(
            "group/brand flex items-center gap-3 rounded-xl px-2 py-2 transition-colors",
            "hover:bg-sidebar-accent",
            "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
          )}
          href="/dashboard"
        >
          <LogoIcon className="size-10 shrink-0 rounded-xl object-contain shadow-sm ring-1 ring-border/15 dark:brightness-0 dark:invert" />
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

      <SidebarContent className="gap-4 px-2 py-4">
        <SidebarGroup className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-muted/25 pb-2 dark:bg-muted/10">
          <SidebarGroupLabel className="mb-2 px-3 pt-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.14em]">
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

        <SidebarGroup className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-muted/25 pb-2 dark:bg-muted/10">
          <SidebarGroupLabel className="mb-2 px-3 pt-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.14em]">
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

        <SidebarGroup className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-muted/25 pb-2 dark:bg-muted/10">
          <SidebarGroupLabel className="mb-2 px-3 pt-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.14em]">
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

      <SidebarFooter className="border-sidebar-border/80 border-t bg-muted/15 px-2 py-3 dark:bg-muted/5 [&_[data-sidebar=menu-button]]:px-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex w-full items-center px-1 py-0.5">
              <SidebarThemeToggle />
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={navButtonClass(false)}
              tooltip="Åpne markedsføringssiden (du forblir innlogget)"
            >
              <Link href="/?from=marketing">
                <GlobeIcon
                  className="size-[15px] opacity-95"
                  strokeWidth={1.75}
                />
                <span>Til forsiden</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
