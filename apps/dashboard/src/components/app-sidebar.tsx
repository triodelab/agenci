import {
  ArrowLeftIcon,
  BotIcon,
  CalendarCheckIcon,
  CalendarIcon,
  ChevronLeftIcon,
  CreditCardIcon,
  HomeIcon,
  InboxIcon,
  LibraryBigIcon,
  Mic,
  PaletteIcon,
  PlugIcon,
  SettingsIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import { useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import { useAgentQuery } from "@/features/agents/queries/agents-queries";
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
  SidebarProvider,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";

const WEB_APP_URL =
  import.meta.env.VITE_WEB_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

// ─── URL helpers ─────────────────────────────────────────────────────────────

function orgBase(orgSlug: string) {
  return `/org/${orgSlug}`;
}

function agentBase(orgSlug: string, agentId: string) {
  return `${orgBase(orgSlug)}/agents/${agentId}`;
}

function agentNavItems(orgSlug: string, agentId: string) {
  const base = agentBase(orgSlug, agentId);
  return [
    { title: "Oversikt", url: base, icon: HomeIcon, badge: false, exact: true },
    {
      title: "Samtaler",
      url: `${base}/conversations`,
      icon: InboxIcon,
      badge: true,
      exact: false,
    },
    {
      title: "Kunnskapsbase",
      url: `${base}/files`,
      icon: LibraryBigIcon,
      badge: false,
      exact: false,
    },
    {
      title: "Widget-tilpasning",
      url: `${base}/customization`,
      icon: PaletteIcon,
      badge: false,
      exact: false,
    },
    {
      title: "Integrasjoner",
      url: `${base}/integrations`,
      icon: PlugIcon,
      badge: false,
      exact: false,
    },
    {
      title: "Bestillinger",
      url: `${base}/bookings`,
      icon: CalendarIcon,
      badge: false,
      exact: true,
    },
    {
      title: "Bestilling-innst.",
      url: `${base}/bookings/settings`,
      icon: CalendarCheckIcon,
      badge: false,
      exact: false,
    },
    {
      title: "Stemmeassistent",
      url: `${base}/plugins/vapi`,
      icon: Mic,
      badge: false,
      exact: false,
    },
    {
      title: "Plan og faktura",
      url: `${base}/billing`,
      icon: CreditCardIcon,
      badge: false,
      exact: false,
    },
  ] as const;
}

function globalNavItems(orgSlug: string) {
  const base = orgBase(orgSlug);
  return [
    {
      title: "Agenter",
      url: `${base}/agents`,
      icon: BotIcon,
      badge: false,
      exact: true,
    },
    {
      title: "Innstillinger",
      url: `${base}/settings`,
      icon: SettingsIcon,
      badge: false,
      exact: false,
    },
    {
      title: "Medlemmer",
      url: "/org/organization",
      icon: UsersIcon,
      badge: false,
      exact: true,
    },
  ] as const;
}

function agentIdFromPath(pathname: string, orgSlug: string): string | undefined {
  const prefix = `${orgBase(orgSlug)}/agents/`;
  if (!pathname.startsWith(prefix)) return undefined;
  const rest = pathname.slice(prefix.length);
  const segment = rest.split("/")[0];
  if (!segment || segment === "create") return undefined;
  return segment;
}

/** Client nav for paths not yet in the generated route tree (agent sub-routes). */
function DashboardNavLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        void navigate({ href: to });
      }}
    >
      {children}
    </a>
  );
}

// ─── NavItem ─────────────────────────────────────────────────────────────────

type NavItemConfig = {
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
  item: NavItemConfig;
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
      <DashboardNavLink to={item.url} className="flex items-center gap-2.5">
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
      </DashboardNavLink>
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

// ─── PlanCard ────────────────────────────────────────────────────────────────
// Subscription data will come from oRPC when private billing router lands.

function PlanCard({
  collapsed,
  orgSlug,
}: {
  collapsed: boolean;
  orgSlug: string;
}) {
  if (collapsed) return null;

  const billingUrl = `${orgBase(orgSlug)}/billing`;

  return (
    <div className="mx-2 mb-1 overflow-hidden rounded-xl border border-border/60 bg-muted/40 p-4">
      <div className="mb-3 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card">
        <ZapIcon className="size-3.5 text-foreground" strokeWidth={2} />
      </div>
      <p className="text-[13px] font-semibold leading-snug text-foreground">
        Oppgrader plan
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        Lås opp AI-agenter, kunnskapsbase og tilpasning
      </p>
      <DashboardNavLink
        to={billingUrl}
        className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Se planer <span aria-hidden>→</span>
      </DashboardNavLink>
    </div>
  );
}

// ─── SidebarNav ──────────────────────────────────────────────────────────────

function SidebarNav({
  collapsed,
  orgSlug,
  pathname,
}: {
  collapsed: boolean;
  orgSlug: string;
  pathname: string;
}) {
  const agentId = agentIdFromPath(pathname, orgSlug);
  const { data: agentData } = useAgentQuery(agentId);
  const agentName = agentData?.agent?.name;

  const isActive = (url: string, exact: boolean) =>
    exact ? pathname === url : pathname.startsWith(url);

  return (
    <>
      <SidebarContent className="gap-0 px-2 pt-3 pb-2">
        {agentId ? (
          <>
            <SidebarGroup className="mb-2 px-0 py-0">
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
                            <DashboardNavLink to={`${orgBase(orgSlug)}/agents`}>
                              <ChevronLeftIcon
                                className="size-4 shrink-0"
                                strokeWidth={1.75}
                              />
                            </DashboardNavLink>
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
                        <DashboardNavLink
                          to={`${orgBase(orgSlug)}/agents`}
                          className="flex items-center gap-2"
                        >
                          <ChevronLeftIcon
                            className="size-4 shrink-0"
                            strokeWidth={1.75}
                          />
                          <span className="group-data-[collapsible=icon]:hidden truncate">
                            Alle agenter
                          </span>
                        </DashboardNavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {!collapsed && agentName ? (
              <div className="mb-1.5 px-3">
                <p className="truncate text-[12px] font-semibold text-foreground/70">
                  {agentName}
                </p>
              </div>
            ) : null}

            <SidebarGroup className="px-0 py-0">
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {agentNavItems(orgSlug, agentId).map((item) => (
                    <NavItem
                      key={item.url}
                      item={item}
                      active={isActive(item.url, item.exact)}
                      collapsed={collapsed}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          <SidebarGroup className="px-0 py-0">
            <SidebarGroupLabel className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 group-data-[collapsible=icon]:hidden">
              Oversikt
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {globalNavItems(orgSlug).map((item) => (
                  <NavItem
                    key={item.url}
                    item={item}
                    active={isActive(item.url, item.exact)}
                    collapsed={collapsed}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-0 pb-2">
        <PlanCard collapsed={collapsed} orgSlug={orgSlug} />
        <div className="mx-2 mb-1">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={`${WEB_APP_URL}/?from=marketing`}
                  className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ArrowLeftIcon className="size-4" strokeWidth={1.75} />
                </a>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="center"
                className="dashboard-app-shell"
              >
                Tilbake til nettsiden
              </TooltipContent>
            </Tooltip>
          ) : (
            <a
              href={`${WEB_APP_URL}/?from=marketing`}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeftIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
              Tilbake til nettsiden
            </a>
          )}
        </div>
      </SidebarFooter>
    </>
  );
}

function DashboardSidebarPanel() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { orgSlug } = useParams({ strict: false }) as { orgSlug?: string };
  const { state, isMobile, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  if (!orgSlug) return null;

  return (
    <Sidebar
      className="!relative !inset-auto !h-full bg-sidebar dash-sidebar-scope"
      collapsible="icon"
    >
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={collapsed ? "Åpne sidebar" : "Lukk sidebar"}
        className="absolute top-0 right-0 z-10 h-full w-1.5 cursor-col-resize opacity-0 transition-opacity hover:bg-border/60 hover:opacity-100"
      />
      <SidebarNav collapsed={collapsed} orgSlug={orgSlug} pathname={pathname} />
    </Sidebar>
  );
}

// ─── AppSidebar (layout shell) ───────────────────────────────────────────────

export default function AppSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="dashboard-app-shell flex h-svh min-h-0 max-h-svh w-full">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <DashboardSidebarPanel />
        <div className="app-dashboard-main app-dashboard-canvas flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
