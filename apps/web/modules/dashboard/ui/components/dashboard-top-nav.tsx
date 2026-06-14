"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import {
  BellIcon,
  SidebarIcon,
  AlertCircleIcon,
  CalendarClockIcon,
  SparklesIcon,
  RocketIcon,
  ShareIcon,
  XIcon,
  ArrowRightIcon,
  GemIcon,
  CheckCircle2Icon,
} from "lucide-react";
import Link from "next/link";
import { Suspense, Component, type ReactNode, useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { AgenciNavWordmark } from "@/components/logo";
import { useSidebar } from "@workspace/ui/components/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { useTheme } from "next-themes";
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

type BookingNotification = {
  _id: string;
  createdAt: number;
  customerName: string;
  serviceName: string;
  dateString: string;
  timeString: string;
  agentId: string | null;
  agentName: string | null;
};

// ── Avatar helpers ─────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => (n[0] ?? "").toUpperCase()).join("");
}

const AVATAR_PALETTE = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#14B8A6", "#6366F1"] as const;
function getAvatarColor(seed: string): string {
  const hash = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length] ?? "#3B82F6";
}

function formatBookingDate(dateString: string): string {
  const d = new Date(dateString + "T12:00:00");
  return d.toLocaleDateString("no-NO", { weekday: "short", day: "numeric", month: "short" });
}

// ── Notification panel ────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
      {label}
    </p>
  );
}

function NotificationsPopover() {
  const data = useQuery(api.private.dashboard.getNotifications);
  const [open, setOpen] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem("agenci:seen-notifs");
      if (raw) setSeenIds(new Set(JSON.parse(raw) as string[]));
      const rawD = localStorage.getItem("agenci:dismissed-tips");
      if (rawD) setDismissed(new Set(JSON.parse(rawD) as string[]));
    } catch {}
  }, []);

  const markAllSeen = useCallback(() => {
    const ids = [
      ...(data?.conversations ?? []).map((c) => c._id),
      ...(data?.bookings ?? []).map((b) => b._id),
    ];
    setSeenIds((prev) => {
      const next = new Set([...prev, ...ids]);
      try { localStorage.setItem("agenci:seen-notifs", JSON.stringify([...next])); } catch {}
      return next;
    });
  }, [data]);

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem("agenci:dismissed-tips", JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  const conversations: ConvNotification[] = data?.conversations ?? [];
  const bookings: BookingNotification[] = data?.bookings ?? [];
  const visibleTips: Tip[] = (data?.tips ?? []).filter((t) => !dismissed.has(t.id));

  const escalated = conversations.filter((c) => c.status === "escalated");
  const unresolved = conversations.filter((c) => c.status === "unresolved");

  const unseenConvs = conversations.filter((c) => !seenIds.has(c._id)).length;
  const unseenBookings = bookings.filter((b) => !seenIds.has(b._id)).length;
  const unseenCount = unseenConvs + unseenBookings;
  const hasAny = conversations.length > 0 || bookings.length > 0;

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) markAllSeen(); }}>
      <PopoverTrigger asChild>
        <button
          className="relative flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Varsler"
        >
          <BellIcon className="size-4" strokeWidth={1.75} />
          {unseenCount > 0 && (
            <span className={cn(
              "absolute -top-0.5 -right-0.5 flex min-w-[14px] h-3.5 items-center justify-center rounded-full px-0.5 text-[8px] font-bold text-white",
              escalated.length > 0 ? "bg-red-500" : unseenBookings > 0 ? "bg-amber-500" : "bg-blue-500",
            )}>
              {unseenCount > 9 ? "9+" : unseenCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="dashboard-app-shell w-[400px] p-0 shadow-xl" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-foreground">Varsler</p>
            {escalated.length > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/40 dark:text-red-400">
                {escalated.length} eskalert
              </span>
            )}
            {bookings.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                {bookings.length} bestilling{bookings.length > 1 ? "er" : ""}
              </span>
            )}
          </div>
          {hasAny && (
            <Link
              href="/agents"
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Se alle →
            </Link>
          )}
        </div>

        <div className="max-h-[520px] overflow-y-auto">
          {/* Escalated */}
          {escalated.length > 0 && (
            <div>
              <SectionLabel label="Krever handling" />
              {escalated.map((n) => <ConvNotificationRow key={n._id} n={n} />)}
            </div>
          )}

          {/* Pending bookings */}
          {bookings.length > 0 && (
            <div className={cn(escalated.length > 0 && "border-t border-border/40")}>
              <SectionLabel label="Nye bestillinger" />
              {bookings.map((b) => <BookingNotificationRow key={b._id} b={b} />)}
            </div>
          )}

          {/* Unresolved */}
          {unresolved.length > 0 && (
            <div className={cn((escalated.length > 0 || bookings.length > 0) && "border-t border-border/40")}>
              <SectionLabel label="Åpne samtaler" />
              {unresolved.map((n) => <ConvNotificationRow key={n._id} n={n} />)}
            </div>
          )}

          {/* Tips */}
          {visibleTips.length > 0 && (
            <div className={cn(hasAny && "border-t border-border/40")}>
              <SectionLabel label="Tips & nyheter" />
              {visibleTips.map((tip) => <TipRow key={tip.id} tip={tip} onDismiss={dismiss} />)}
            </div>
          )}

          {/* Empty */}
          {!hasAny && visibleTips.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2.5 px-4 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/40 border border-border/50">
                <CheckCircle2Icon className="size-5 text-muted-foreground/40" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-foreground">Alt er i orden</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground/70">Ingen aktive varsler akkurat nå.</p>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ConvNotificationRow({ n }: { n: ConvNotification }) {
  const isEscalated = n.status === "escalated";
  const href = n.agentId ? `/agents/${n.agentId}/conversations/${n._id}` : "/agents";
  const initials = getInitials(n.contactName || "?");
  const avatarColor = getAvatarColor(n.contactName || "?");

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 px-4 py-3 transition-colors",
        isEscalated
          ? "border-l-[3px] border-red-500 bg-red-50/60 hover:bg-red-50 dark:bg-red-950/10 dark:hover:bg-red-950/20"
          : "border-l-[3px] border-transparent hover:bg-muted/50",
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className="flex size-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ backgroundColor: avatarColor }}
        >
          {initials || "?"}
        </div>
        {isEscalated && (
          <div className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-background">
            <AlertCircleIcon className="size-2 text-white" strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={cn(
            "text-[12px] font-semibold truncate",
            isEscalated ? "text-red-700 dark:text-red-400" : "text-foreground",
          )}>
            {n.contactName || "Anonym"}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground/50">
            {formatTimeAgo(n._creationTime)}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">
          {isEscalated ? "Trenger din hjelp" : "Ny samtale"}
          {n.agentName ? ` · ${n.agentName}` : ""}
        </p>
      </div>
    </Link>
  );
}

function BookingNotificationRow({ b }: { b: BookingNotification }) {
  const href = b.agentId ? `/agents/${b.agentId}/bookings` : "/agents";

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 border-l-[3px] border-amber-400 bg-amber-50/60 px-4 py-3 transition-colors hover:bg-amber-50 dark:bg-amber-950/10 dark:hover:bg-amber-950/20"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
        <CalendarClockIcon className="size-3.5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[12px] font-semibold truncate text-amber-800 dark:text-amber-300">
            {b.customerName}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground/50">
            {formatTimeAgo(b.createdAt)}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">
          {b.serviceName} · {formatBookingDate(b.dateString)} kl. {b.timeString}
        </p>
      </div>
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

  if (tip.url) return <Link href={tip.url}>{content}</Link>;
  return content;
}

// ── Top nav ───────────────────────────────────────────────────────────────────

export function DashboardTopNav() {
  const { toggleSidebar } = useSidebar();
  const { resolvedTheme } = useTheme();
  const wordmarkSurface = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <header className="dash-topnav flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-background px-4 lg:px-5">
      {/* Left: toggle + wordmark + plan badge */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Toggle sidebar"
        >
          <SidebarIcon className="size-4" strokeWidth={1.75} />
        </button>

        <Link href="/agents" className="flex items-center shrink-0">
          <AgenciNavWordmark surface={wordmarkSurface} />
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
