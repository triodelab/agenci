"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { BellIcon, SidebarIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { LogoIcon } from "@/components/logo";
import { useSidebar } from "@workspace/ui/components/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";

const PLAN_LABEL: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  business: "Business",
};

const PLAN_COLOR: Record<string, string> = {
  starter: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400",
  pro: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400",
  business: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
};

function PlanBadge() {
  const sub = useQuery(api.private.subscription.getOwn);
  if (!sub) return null;

  const isTrialing = sub.status === "trialing";
  const isActive = sub.status === "active";

  if (!isActive && !isTrialing) return null;

  const planKey = sub.planKey ?? "starter";
  const label = PLAN_LABEL[planKey] ?? planKey;
  const colorClass = PLAN_COLOR[planKey] ?? PLAN_COLOR.starter;

  return (
    <span
      className={cn(
        "hidden sm:inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        isTrialing
          ? "bg-muted text-muted-foreground"
          : colorClass,
      )}
    >
      {isTrialing ? "Prøve" : label}
    </span>
  );
}

function NotificationItem({
  notification,
}: {
  notification: {
    _id: string;
    _creationTime: number;
    status: string;
    agentId: string | null;
    contactName: string;
    agentName: string | null;
  };
}) {
  const isEscalated = notification.status === "escalated";
  const timeAgo = formatTimeAgo(notification._creationTime);
  const href = notification.agentId
    ? `/agents/${notification.agentId}/conversations`
    : "/agents";

  return (
    <Link
      href={href}
      className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
    >
      <div
        className={cn(
          "mt-0.5 size-2 shrink-0 rounded-full",
          isEscalated ? "bg-red-500" : "bg-blue-500",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-foreground truncate">
          {isEscalated ? "Eskalert samtale" : "Ny samtale"}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {notification.contactName}
          {notification.agentName ? ` · ${notification.agentName}` : ""}
        </p>
      </div>
      <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo}</span>
    </Link>
  );
}

function formatTimeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "nå";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}t`;
  return `${Math.floor(hours / 24)}d`;
}

function NotificationsPopover() {
  const notifications = useQuery(api.private.dashboard.getNotifications);
  const hasNew = (notifications?.length ?? 0) > 0;
  const escalatedCount = notifications?.filter((n) => n.status === "escalated").length ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Varsler"
        >
          <BellIcon className="size-4" strokeWidth={1.75} />
          {hasNew && (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white",
                escalatedCount > 0 ? "bg-red-500" : "bg-blue-500",
              )}
            >
              {escalatedCount > 0 ? escalatedCount : notifications!.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="dashboard-app-shell w-80 p-0"
        sideOffset={8}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <p className="text-[13px] font-semibold text-foreground">Varsler</p>
          {hasNew && (
            <span className="text-[10px] font-medium text-muted-foreground">
              {notifications!.length} aktive
            </span>
          )}
        </div>

        {!notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-xl border border-border/50 bg-muted/30">
              <BellIcon className="size-[1.125rem] text-muted-foreground/50" strokeWidth={1.5} />
            </div>
            <p className="text-[13px] font-medium text-foreground">Ingen varsler</p>
            <p className="text-[12px] text-muted-foreground">
              Nye samtaler og eskaleringer vises her.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40 max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <NotificationItem key={n._id} notification={n} />
            ))}
          </div>
        )}

        {hasNew && (
          <div className="border-t border-border/60 px-4 py-2.5">
            <Link
              href="/agents"
              className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Se alle samtaler →
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function DashboardTopNav() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="dash-topnav flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-card px-4 lg:px-5">
      {/* Left: toggle + logo + plan badge */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Toggle sidebar"
        >
          <SidebarIcon className="size-4" strokeWidth={1.75} />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <LogoIcon className="size-7 rounded-lg brightness-0 dark:invert" />
          <span className="font-semibold text-[15px] tracking-tight text-foreground hidden sm:block">
            Agenci
          </span>
        </Link>

        <Suspense fallback={null}>
          <PlanBadge />
        </Suspense>
      </div>

      {/* Right: theme, org, bell, user */}
      <div className="flex items-center gap-2 shrink-0">
        <ModeToggle
          contentClassName="dashboard-app-shell"
          triggerClassName="size-8 rounded-lg border border-border/70 bg-transparent hover:bg-muted transition-colors flex items-center justify-center"
        />

        <Suspense fallback={<div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />}>
          <OrganizationSwitcher
            hidePersonal
            skipInvitationScreen
            appearance={{
              elements: {
                rootBox: "h-8!",
                avatarBox: "size-4! rounded-md!",
                organizationSwitcherTrigger:
                  "h-8! rounded-lg! border border-border/70 bg-transparent px-2! text-[12px]! font-medium! hover:bg-muted! shadow-none!",
                organizationPreviewTextContainer: "text-[12px]! font-medium! text-foreground!",
                organizationSwitcherTriggerIcon: "ml-1! size-3.5! text-muted-foreground!",
              },
            }}
          />
        </Suspense>

        <NotificationsPopover />

        <Suspense fallback={<div className="size-8 animate-pulse rounded-lg bg-muted" />}>
          <UserButton
            appearance={{
              elements: {
                rootBox: "h-8!",
                userButtonTrigger: "h-8! rounded-lg! border border-border/70 bg-transparent p-1! hover:bg-muted!",
                avatarBox: "size-6! rounded-md!",
              },
            }}
          />
        </Suspense>
      </div>
    </header>
  );
}
