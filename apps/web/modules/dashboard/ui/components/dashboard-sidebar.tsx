"use client";

import {
  ArrowLeftIcon,
  BotIcon,
  CreditCardIcon,
  HomeIcon,
  InboxIcon,
  LibraryBigIcon,
  Mic,
  PaletteIcon,
  PlugIcon,
  ZapIcon,
  ChevronLeftIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

// ─── Nav items ────────────────────────────────────────────────────────────────

function agentNavItems(agentId: string) {
  return [
    { title: "Oversikt", url: `/agents/${agentId}`, icon: HomeIcon, badge: false, exact: true },
    { title: "Samtaler", url: `/agents/${agentId}/conversations`, icon: InboxIcon, badge: true, exact: false },
    { title: "Kunnskapsbase", url: `/agents/${agentId}/files`, icon: LibraryBigIcon, badge: false, exact: false },
    { title: "Widget-tilpasning", url: `/agents/${agentId}/customization`, icon: PaletteIcon, badge: false, exact: false },
    { title: "Integrasjoner", url: `/agents/${agentId}/integrations`, icon: PlugIcon, badge: false, exact: false },
    { title: "Stemmeassistent", url: `/agents/${agentId}/plugins/vapi`, icon: Mic, badge: false, exact: false },
    { title: "Plan og faktura", url: `/agents/${agentId}/billing`, icon: CreditCardIcon, badge: false, exact: false },
  ] as const;
}

const globalNavItems = [
  { title: "Agenter", url: "/agents", icon: BotIcon, badge: false, exact: true },
  { title: "Innstillinger", url: "/settings", icon: SettingsIcon, badge: false, exact: true },
] as const;

// ─── NavItem ─────────────────────────────────────────────────────────────────

type AnyNavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge: boolean;
  exact: boolean;
};

function NavItem({
  item,
  active,
  collapsed,
  badge,
}: {
  item: AnyNavItem;
  active: boolean;
  collapsed: boolean;
  badge?: number;
}) {
  const showBadge = item.badge && (badge ?? 0) > 0;

  const button = (
    <SidebarMenuButton
      asChild
      isActive={active}
      className={cn(
        "h-9 w-full rounded-lg px-3 text-[13px] font-medium transition-all duration-150",
        active
          ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background [&_svg]:text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:text-muted-foreground",
      )}
      tooltip={item.title}
    >
      <Link href={item.url} className="flex items-center gap-2.5">
        <item.icon className="size-4 shrink-0" strokeWidth={active ? 2 : 1.75} />
        <span className="group-data-[collapsible=icon]:hidden min-w-0 flex-1 truncate">
          {item.title}
        </span>
        {showBadge && !collapsed && (
          <span
            className={cn(
              "group-data-[collapsible=icon]:hidden ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none",
              active
                ? "bg-background/20 text-background"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
            )}
          >
            {(badge ?? 0) > 99 ? "99+" : badge}
          </span>
        )}
      </Link>
    </SidebarMenuButton>
  );

  if (collapsed) {
    return (
      <SidebarMenuItem>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" align="center" className="dashboard-app-shell">
            {showBadge ? `${item.title} (${badge})` : item.title}
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    );
  }

  return <SidebarMenuItem>{button}</SidebarMenuItem>;
}

// ─── UpgradeCard ─────────────────────────────────────────────────────────────

function UpgradeCard({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return null;
  return (
    <div className="mx-2 mb-1 overflow-hidden rounded-xl border border-border/60 bg-muted/40 p-4">
      <div className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-card mb-3 shrink-0">
        <ZapIcon className="size-3.5 text-foreground" strokeWidth={2} />
      </div>
      <p className="text-[13px] font-semibold text-foreground leading-snug">Prøv Pro gratis</p>
      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
        14 dager gratis — AI-agent, kunnskapsbase og tilpasning
      </p>
      <Link
        href="/billing"
        className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Start prøveperiode <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

// ─── DashboardSidebar ─────────────────────────────────────────────────────────

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const params = useParams();
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  const agentId =
    typeof params?.agentId === "string" ? (params.agentId as Id<"agents">) : undefined;

  const overview = useQuery(api.private.dashboard.getOverview);
  const agentOverview = useQuery(
    api.private.dashboard.getAgentOverview,
    agentId ? { agentId } : "skip",
  );
  const agent = useQuery(
    api.private.agents.getOne,
    agentId ? { agentId } : "skip",
  );

  const orgInboxCount =
    overview
      ? (overview.conversations.unresolved.count ?? 0) +
        (overview.conversations.escalated.count ?? 0)
      : undefined;

  const agentInboxCount = agentOverview
    ? (agentOverview.conversations.unresolved ?? 0) +
      (agentOverview.conversations.escalated ?? 0)
    : undefined;

  const isActive = (url: string, exact: boolean) =>
    exact ? pathname === url : pathname.startsWith(url);

  return (
    <Sidebar
      className="group z-20 border-r border-sidebar-border bg-sidebar"
      collapsible="icon"
    >
      <SidebarContent className="px-2 pt-4 pb-2 gap-0">
        {agentId ? (
          <>
            {/* Back to all agents */}
            <SidebarGroup className="px-0 py-0 mb-2">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            className="h-9 w-full rounded-lg px-3 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Link href="/agents">
                              <ChevronLeftIcon className="size-4 shrink-0" strokeWidth={1.75} />
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="dashboard-app-shell">
                          Alle agenter
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        className="h-9 w-full rounded-lg px-3 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Link href="/agents" className="flex items-center gap-2">
                          <ChevronLeftIcon className="size-4 shrink-0" strokeWidth={1.75} />
                          <span className="group-data-[collapsible=icon]:hidden truncate">
                            Alle agenter
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Agent name label */}
            {!collapsed && agent && (
              <div className="mb-1.5 px-3">
                <p className="truncate text-[12px] font-semibold text-foreground/70">
                  {agent.name}
                </p>
              </div>
            )}

            {/* Per-agent nav */}
            <SidebarGroup className="px-0 py-0">
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {agentNavItems(agentId).map((item) => (
                    <NavItem
                      key={item.url}
                      item={item}
                      active={isActive(item.url, item.exact)}
                      collapsed={collapsed}
                      badge={item.badge ? agentInboxCount : undefined}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          <>
            {/* Global nav */}
            <SidebarGroup className="px-0 py-0">
              <SidebarGroupLabel className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 group-data-[collapsible=icon]:hidden">
                Oversikt
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {globalNavItems.map((item) => (
                    <NavItem
                      key={item.url}
                      item={item}
                      active={isActive(item.url, item.exact)}
                      collapsed={collapsed}
                      badge={item.badge ? orgInboxCount : undefined}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-0 pb-2">
        <UpgradeCard collapsed={collapsed} />
        <div className="mx-2 mb-1">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/?from=marketing"
                  className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ArrowLeftIcon className="size-4" strokeWidth={1.75} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" align="center" className="dashboard-app-shell">
                Tilbake til nettsiden
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/?from=marketing"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeftIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
              Tilbake til nettsiden
            </Link>
          )}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
