"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import {
  BellIcon,
  SidebarIcon,
  AlertCircleIcon,
  MessageCircleIcon,
  SparklesIcon,
  RocketIcon,
  ShareIcon,
  XIcon,
  ArrowRightIcon,
  GemIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense, Component, type ReactNode, useState, useEffect, useCallback } from "react";
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

// ── Error boundary ────────────────────────────────────────────────────────────

class QueryErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) return this.props.fallback ?? null;
    return this.props.children;
  }
}

// ── Plan badge ────────────────────────────────────────────────────────────────

const PLAN_LABEL: Record<string, string> = { starter: "Starter", pro: "Pro", business: "Business" };
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
  return (
    <span className={cn(
      "hidden sm:inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
      isTrialing ? "bg-muted text-muted-foreground" : (PLAN_COLOR[planKey] ?? PLAN_COLOR.starter),
    )}>
      {isTrialing ? "Prøve" : (PLAN_LABEL[planKey] ?? planKey)}
    </span>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTimeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "nå";
  if (minutes < 60) return `${minutes}m siden`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}t siden`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d siden`;
  return new Date(ms).toLocaleDateString("no-NO", { day: "numeric", month: "short" });
}

const TIP_ICONS = {
  welcome: SparklesIcon,
  tip: RocketIcon,
  knowledge: GemIcon,
  upgrade: GemIcon,
  share: ShareIcon,
} as const;

type Tip = {
  id: string;
  icon: keyof typeof TIP_ICONS;
  title: string;
  body: string;
  url: string | null;
};

type ConvNotification = {
  _id: string;
  _creationTime: number;
  status: string;
  agentId: string | null;
  contactName: string;
  contactEmail: string | null;
  agentName: string | null;
};

// ── Notification panel ────────────────────────────────────────────────────────

function NotificationsPopover() {
  const data = useQuery(api.private.dashboard.getNotifications);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem("agenci:dismissed-tips");
      if (raw) setDismissed(new Set(JSON.parse(raw) as string[]));
    } catch {}
  }, []);

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem("agenci:dismissed-tips", JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  const conversations: ConvNotification[] = data?.conversations ?? [];
  const visibleTips: Tip[] = (data?.tips ?? []).filter((t) => !dismissed.has(t.id));

  const escalatedCount = conversations.filter((n) => n.status === "escalated").length;
  const totalBadge = escalatedCount > 0 ? escalatedCount : conversations.length;
  const hasConvBadge = conversations.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Varsler"
        >
          <BellIcon className="size-4" strokeWidth={1.75} />
          {hasConvBadge && (
            <span className={cn(
              "absolute -top-0.5 -right-0.5 flex min-w-[14px] h-3.5 items-center justify-center rounded-full px-0.5 text-[8px] font-bold text-white",
              escalatedCount > 0 ? "bg-red-500" : "bg-blue-500",
            )}>
              {totalBadge > 9 ? "9+" : totalBadge}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="dashboard-app-shell w-[420px] p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <p className="text-[13px] font-semibold text-foreground">Varsler</p>
          {conversations.length > 0 && (
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              escalatedCount > 0
                ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
            )}>
              {escalatedCount > 0 ? `${escalatedCount} eskalert` : `${conversations.length} aktive`}
            </span>
          )}
        </div>

        <div className="max-h-[480px] overflow-y-auto">

          {/* ── Conversations ── */}
          {conversations.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Samtaler
              </p>
              {conversations.map((n) => (
                <ConvNotificationRow key={n._id} n={n} />
              ))}
            </div>
          )}

          {/* ── Tips & news ── */}
          {visibleTips.length > 0 && (
            <div className={cn(conversations.length > 0 && "border-t border-border/40")}>
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Tips & nyheter
              </p>
              {visibleTips.map((tip) => (
                <TipRow key={tip.id} tip={tip} onDismiss={dismiss} />
              ))}
            </div>
          )}

          {/* ── Empty state ── */}
          {conversations.length === 0 && visibleTips.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border/50 bg-muted/30">
                <BellIcon className="size-[1.125rem] text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] font-medium text-foreground">Alt er i orden</p>
              <p className="text-[12px] text-muted-foreground">Ingen aktive varsler akkurat nå.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {conversations.length > 0 && (
          <div className="border-t border-border/60 px-4 py-2.5">
            <Link
              href="/agents"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Se alle samtaler <ArrowRightIcon className="size-3" />
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function ConvNotificationRow({ n }: { n: ConvNotification }) {
  const isEscalated = n.status === "escalated";
  const href = n.agentId
    ? `/agents/${n.agentId}/conversations/${n._id}`
    : "/agents";

  return (
    <Link
      href={href}
      className="group flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
    >
      <div className={cn(
        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
        isEscalated
          ? "bg-red-100 dark:bg-red-950/40"
          : "bg-blue-100 dark:bg-blue-950/40",
      )}>
        {isEscalated
          ? <AlertCircleIcon className="size-3.5 text-red-600 dark:text-red-400" strokeWidth={2} />
          : <MessageCircleIcon className="size-3.5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
        }
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-[12px] font-semibold text-foreground truncate">
            {isEscalated ? "Trenger din hjelp" : "Ny samtale"}
          </p>
          {isEscalated && (
            <span className="shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-600 dark:bg-red-950/40 dark:text-red-400">
              Eskalert
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground truncate">
          {n.contactName}
          {n.contactEmail ? ` · ${n.contactEmail}` : ""}
          {n.agentName ? ` · ${n.agentName}` : ""}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground/60">{formatTimeAgo(n._creationTime)}</p>
      </div>

      <ArrowRightIcon className="mt-1 size-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function TipRow({ tip, onDismiss }: { tip: Tip; onDismiss: (id: string) => void }) {
  const Icon = TIP_ICONS[tip.icon];
  const content = (
    <div className="group flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-foreground">{tip.title}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{tip.body}</p>
        {tip.url && (
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-foreground/70 group-hover:text-foreground transition-colors">
            Gå dit <ArrowRightIcon className="size-2.5" />
          </span>
        )}
      </div>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDismiss(tip.id); }}
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 hover:bg-muted hover:text-muted-foreground transition-colors"
        aria-label="Lukk"
      >
        <XIcon className="size-3" />
      </button>
    </div>
  );

  if (tip.url) {
    return <Link href={tip.url}>{content}</Link>;
  }
  return content;
}

// ── Top nav ───────────────────────────────────────────────────────────────────

export function DashboardTopNav() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="dash-topnav flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-background px-4 lg:px-5">
      {/* Left: mobile-only toggle + logo; desktop shows plan badge only */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="flex lg:hidden size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Toggle sidebar"
        >
          <SidebarIcon className="size-4" strokeWidth={1.75} />
        </button>

        <Link href="/dashboard" className="flex lg:hidden items-center gap-2 shrink-0">
          <LogoIcon className="size-7 rounded-lg brightness-0 dark:invert" />
          <span className="font-semibold text-[15px] tracking-tight text-foreground hidden sm:block">
            Agenci
          </span>
        </Link>

        <QueryErrorBoundary>
          <Suspense fallback={null}>
            <PlanBadge />
          </Suspense>
        </QueryErrorBoundary>
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

        <QueryErrorBoundary fallback={
          <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 text-muted-foreground">
            <BellIcon className="size-4" strokeWidth={1.75} />
          </div>
        }>
          <NotificationsPopover />
        </QueryErrorBoundary>

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
