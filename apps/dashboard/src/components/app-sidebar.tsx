import { useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
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
import {
  ArrowLeftIcon,
  BotIcon,
  CalendarCheckIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  CreditCardIcon,
  HomeIcon,
  InboxIcon,
  LibraryBigIcon,
  Mic,
  PaletteIcon,
  PanelLeftIcon,
  PlugIcon,
  PlusIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import { useAgentQuery } from "@/features/agents/queries/agents-queries";
import { authClient } from "@/lib/auth-client";

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
      action: { url: `${base}/agents/create`, label: "Ny agent" },
    },
    // "Innstillinger" comes back when there is an org settings page
    // (`/settings` has no route yet and led to a 404).
    {
      title: "Medlemmer",
      url: "/org/organization",
      icon: UsersIcon,
      badge: false,
      exact: true,
    },
  ] as const;
}

function agentIdFromPath(
  pathname: string,
  orgSlug: string,
): string | undefined {
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
  "aria-label": ariaLabel,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  const navigate = useNavigate();
  return (
    <a
      href={to}
      aria-label={ariaLabel}
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

// ─── Shared row styling ──────────────────────────────────────────────────────

const rowBase =
  "h-10 w-full gap-3 rounded-[11px] px-3 text-[15px] tracking-[-0.012em] transition-colors duration-150 [&>svg]:size-5 [&_svg]:size-5";
const rowIdle =
  "font-normal text-(--agenci-ink) hover:bg-white/55 hover:text-(--agenci-ink) dark:hover:bg-white/[0.05] [&_svg]:text-(--agenci-ink)";
const rowActive =
  "dash-nav-active font-normal data-[active=true]:font-normal text-(--agenci-ink) hover:text-(--agenci-ink) [&_svg]:text-(--agenci-ink)";

// ─── NavItem ─────────────────────────────────────────────────────────────────

type NavItemConfig = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge: boolean;
  exact: boolean;
  action?: { url: string; label: string };
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
      className={cn(rowBase, active ? rowActive : rowIdle)}
      tooltip={item.title}
    >
      <DashboardNavLink to={item.url} className="flex items-center gap-3">
        <item.icon className="size-5 shrink-0" strokeWidth={1.5} />
        <span className="group-data-[collapsible=icon]:hidden min-w-0 flex-1 truncate">
          {item.title}
        </span>
        {showBadge && !collapsed && (
          <span
            className={cn(
              "group-data-[collapsible=icon]:hidden ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums leading-none",
              active
                ? "bg-white text-(--agenci-accent) dark:bg-white/10"
                : "bg-(--agenci-accent-soft) text-(--agenci-accent)",
            )}
          >
            {(badge ?? 0) > 99 ? "99+" : badge}
          </span>
        )}
      </DashboardNavLink>
    </SidebarMenuButton>
  );

  const action = item.action ? (
    <SidebarMenuAction
      asChild
      showOnHover={!active}
      className="top-2 right-2 size-6 rounded-[7px] border border-(--agenci-line) bg-white text-(--agenci-ink-2) shadow-[0_1px_2px_rgb(16_24_20/0.06)] hover:bg-white hover:text-(--agenci-accent) dark:bg-white/10"
    >
      <DashboardNavLink to={item.action.url} aria-label={item.action.label}>
        <PlusIcon className="size-3.5" strokeWidth={2} />
      </DashboardNavLink>
    </SidebarMenuAction>
  ) : null;

  if (collapsed) {
    return (
      <SidebarMenuItem>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent
            side="right"
            align="center"
            className="dashboard-app-shell"
          >
            {showBadge ? `${item.title} (${badge})` : item.title}
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      {button}
      {action}
    </SidebarMenuItem>
  );
}

// ─── Brand header ────────────────────────────────────────────────────────────

function SidebarBrand({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <SidebarHeader className="px-4 pt-5 pb-4 group-data-[collapsible=icon]:px-2">
      <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
        <div className="flex min-w-0 items-center gap-2.5 group-data-[collapsible=icon]:hidden">
          <img
            src="/AgenciLogo.png"
            alt=""
            className="size-8 shrink-0 rounded-lg dark:invert"
          />
          <span className="truncate text-[19px] font-medium tracking-[-0.03em] text-(--agenci-ink)">
            Agenci
          </span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Åpne sidebar" : "Lukk sidebar"}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-(--agenci-ink-2) transition-colors hover:bg-black/[0.04] hover:text-(--agenci-ink) dark:hover:bg-white/[0.05]"
        >
          <PanelLeftIcon className="size-5" strokeWidth={1.5} />
        </button>
      </div>
    </SidebarHeader>
  );
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
    <div className="mx-1 mb-2 rounded-[14px] border border-white/60 bg-white/30 p-3.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.8),0_1px_2px_rgb(16_24_20/0.04)] backdrop-blur-md dark:border-white/[0.06] dark:bg-white/[0.03]">
      <div className="mb-2.5 flex size-8 items-center justify-center rounded-lg bg-(--agenci-accent-soft) text-(--agenci-accent)">
        <ZapIcon className="size-3.5" strokeWidth={2} />
      </div>
      <p className="text-[13px] font-semibold leading-snug text-(--agenci-ink)">
        Oppgrader plan
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-(--agenci-ink-2)">
        Lås opp AI-agenter, kunnskapsbase og tilpasning
      </p>
      <DashboardNavLink
        to={billingUrl}
        className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-full bg-(--agenci-accent) px-3.5 text-[12px] font-medium text-white transition-colors hover:bg-(--agenci-accent-hover) active:scale-[0.97] dark:text-[#0b0c0e]"
      >
        Se planer <span aria-hidden>→</span>
      </DashboardNavLink>
    </div>
  );
}

// ─── Signed-in user ──────────────────────────────────────────────────────────

function initialsOf(name: string | undefined, email: string | undefined) {
  const source = name?.trim() || email?.trim() || "";
  const parts = source.split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1
      ? `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`
      : source.slice(0, 2);
  return letters.toUpperCase() || "?";
}

function SidebarUser() {
  const { data } = authClient.useSession();
  const user = data?.user;
  if (!user) return null;

  return (
    <div className="mt-2 flex items-center gap-3 border-t border-black/[0.06] px-2 pt-4 pb-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 dark:border-white/[0.06]">
      {user.image ? (
        <img
          src={user.image}
          alt=""
          className="size-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--agenci-accent-soft) text-[13px] font-medium text-(--agenci-accent)"
        >
          {initialsOf(user.name, user.email)}
        </span>
      )}
      <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
        <p className="truncate text-[15px] leading-tight tracking-[-0.012em] text-(--agenci-ink)">
          {user.name || user.email}
        </p>
        <p className="mt-0.5 truncate text-[13px] leading-tight text-(--agenci-ink-2)">
          {user.email}
        </p>
      </div>
      <ChevronsUpDownIcon
        aria-hidden
        className="size-4 shrink-0 text-(--agenci-ink-3) group-data-[collapsible=icon]:hidden"
        strokeWidth={1.5}
      />
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

  const backToAgents = (
    <DashboardNavLink
      to={`${orgBase(orgSlug)}/agents`}
      className="flex items-center gap-3"
    >
      <ChevronLeftIcon className="size-5 shrink-0" strokeWidth={1.5} />
      <span className="group-data-[collapsible=icon]:hidden truncate">
        Alle agenter
      </span>
    </DashboardNavLink>
  );

  return (
    <>
      <SidebarContent className="gap-0 px-2 pt-1 pb-2">
        {agentId ? (
          <>
            <SidebarGroup className="mb-3 px-0 py-0">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            className={cn(rowBase, rowIdle)}
                          >
                            {backToAgents}
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="dashboard-app-shell"
                        >
                          Alle agenter
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        className={cn(rowBase, rowIdle)}
                      >
                        {backToAgents}
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="px-0 py-0">
              {agentName ? (
                <SidebarGroupLabel className="h-7 px-2.5 text-[13px] font-normal tracking-normal text-(--agenci-ink-3) normal-case">
                  <span className="truncate">{agentName}</span>
                </SidebarGroupLabel>
              ) : null}
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
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
            <SidebarGroupLabel className="h-7 px-2.5 text-[13px] font-normal tracking-normal text-(--agenci-ink-3) normal-case">
              Oversikt
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
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

      <SidebarFooter className="gap-0 px-2 pt-0 pb-3">
        <PlanCard collapsed={collapsed} orgSlug={orgSlug} />
        <SidebarMenu>
          <SidebarMenuItem>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild className={cn(rowBase, rowIdle)}>
                    <a href={`${WEB_APP_URL}/?from=marketing`}>
                      <ArrowLeftIcon className="size-5" strokeWidth={1.5} />
                    </a>
                  </SidebarMenuButton>
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
              <SidebarMenuButton asChild className={cn(rowBase, rowIdle)}>
                <a
                  href={`${WEB_APP_URL}/?from=marketing`}
                  className="flex items-center gap-3"
                >
                  <ArrowLeftIcon
                    className="size-5 shrink-0"
                    strokeWidth={1.5}
                  />
                  <span className="truncate">Tilbake til nettsiden</span>
                </a>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarUser />
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
      className="!relative !inset-auto !h-full border-r-0 bg-transparent dash-sidebar-scope"
      collapsible="icon"
    >
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={collapsed ? "Åpne sidebar" : "Lukk sidebar"}
        className="absolute top-0 right-0 z-10 h-full w-1.5 cursor-col-resize opacity-0 transition-opacity hover:bg-(--agenci-line) hover:opacity-100"
      />
      <SidebarBrand collapsed={collapsed} onToggle={toggleSidebar} />
      <SidebarNav collapsed={collapsed} orgSlug={orgSlug} pathname={pathname} />
    </Sidebar>
  );
}

// ─── Breadcrumbs (top of the content panel) ──────────────────────────────────

type Crumb = { label: string; to?: string };

function useCrumbs(pathname: string, orgSlug: string | undefined): Crumb[] {
  const agentId = orgSlug ? agentIdFromPath(pathname, orgSlug) : undefined;
  const { data: agentData } = useAgentQuery(agentId);
  if (!orgSlug) return [];

  const base = orgBase(orgSlug);
  const agentsUrl = `${base}/agents`;

  if (pathname.startsWith(`${base}/settings`)) {
    return [{ label: "Innstillinger" }];
  }
  if (!pathname.startsWith(agentsUrl)) return [];
  if (pathname === agentsUrl) return [{ label: "Agenter" }];
  if (pathname === `${agentsUrl}/create`) {
    return [{ label: "Agenter", to: agentsUrl }, { label: "Ny agent" }];
  }
  if (!agentId) return [{ label: "Agenter", to: agentsUrl }];

  const agentUrl = agentBase(orgSlug, agentId);
  const agentLabel = agentData?.agent?.name ?? "Agent";
  const crumbs: Crumb[] = [{ label: "Agenter", to: agentsUrl }];

  const section = agentNavItems(orgSlug, agentId)
    .filter((item) => item.url !== agentUrl && pathname.startsWith(item.url))
    .sort((a, b) => b.url.length - a.url.length)[0];

  if (!section) {
    crumbs.push({ label: agentLabel });
    return crumbs;
  }

  crumbs.push({ label: agentLabel, to: agentUrl });
  const deeper = pathname.length > section.url.length + 1;
  if (deeper) {
    crumbs.push({ label: section.title, to: section.url });
    crumbs.push({ label: "Samtale" });
  } else {
    crumbs.push({ label: section.title });
  }
  return crumbs;
}

function DashboardBreadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { orgSlug } = useParams({ strict: false }) as { orgSlug?: string };
  const crumbs = useCrumbs(pathname, orgSlug);
  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Brødsmuler"
      className="flex h-14 shrink-0 items-center gap-2 border-b border-(--agenci-line) px-5 text-[15px] tracking-[-0.012em] md:px-8"
    >
      {crumbs.map((crumb, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span
            key={`${crumb.label}-${i}`}
            className="flex min-w-0 items-center gap-2"
          >
            {crumb.to && !last ? (
              <DashboardNavLink
                to={crumb.to}
                className="truncate text-(--agenci-ink-2) transition-colors hover:text-(--agenci-ink)"
              >
                {crumb.label}
              </DashboardNavLink>
            ) : (
              <span
                className={cn(
                  "truncate",
                  last ? "text-(--agenci-ink)" : "text-(--agenci-ink-2)",
                )}
                aria-current={last ? "page" : undefined}
              >
                {crumb.label}
              </span>
            )}
            {!last ? (
              <ChevronRightIcon
                aria-hidden
                className="size-4 shrink-0 text-(--agenci-ink-3)"
                strokeWidth={1.5}
              />
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}

// ─── AppSidebar (layout shell) ───────────────────────────────────────────────

export default function AppSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      className="dashboard-app-shell dash-shell-root flex h-svh min-h-0 max-h-svh w-full"
      style={
        {
          "--sidebar-width": "16.5rem",
          "--sidebar-width-icon": "3.75rem",
        } as React.CSSProperties
      }
    >
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <DashboardSidebarPanel />
        <div className="app-dashboard-main app-dashboard-canvas flex min-h-0 flex-1 flex-col overflow-hidden">
          <DashboardBreadcrumbs />
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
