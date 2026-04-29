"use client";

import Bowser from "bowser";
import { useUser } from "@clerk/nextjs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { getCountryFromTimezone } from "@/lib/country-utils";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { useQuery } from "convex/react";
import {
  CalendarIcon,
  ChevronRightIcon,
  ClockIcon,
  GlobeIcon,
  MailIcon,
  MonitorIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { ContactAvatar } from "./contact-avatar";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG = {
  unresolved: { label: "Åpen",         cls: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" },
  escalated:  { label: "Eskalert",     cls: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400" },
  resolved:   { label: "Løst",         cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" },
} as const;

// ─── Small info row ───────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof MailIcon;
  label: string;
  value: React.ReactNode;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-border/50 bg-muted/40 text-muted-foreground">
        <Icon className="size-3" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 leading-none">
          {label}
        </p>
        {href ? (
          <a
            href={href}
            className="mt-0.5 block truncate text-[12px] text-foreground hover:underline underline-offset-2"
          >
            {value}
          </a>
        ) : (
          <p className="mt-0.5 truncate text-[12px] text-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function PanelCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm", className)}>
      <div className="border-b border-border/50 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">{title}</p>
      </div>
      <div className="divide-y divide-border/40 px-4">{children}</div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export const ContactPanel = () => {
  const params = useParams();
  const conversationId = params.conversationId as Id<"conversations"> | undefined;
  const { user } = useUser();

  const detail = useQuery(
    api.private.conversations.getOne,
    conversationId ? { conversationId } : "skip",
  );

  const parseUserAgent = useMemo(() => {
    return (userAgent?: string) => {
      if (!userAgent) return { browser: "—", os: "—", device: "—" };
      const browser = Bowser.getParser(userAgent);
      const r = browser.getResult();
      return {
        browser: [r.browser.name, r.browser.version].filter(Boolean).join(" ") || "—",
        os:      [r.os.name, r.os.version].filter(Boolean).join(" ") || "—",
        device:  r.platform.type || "desktop",
      };
    };
  }, []);

  const uaInfo = useMemo(
    () => parseUserAgent(detail?.contactSession?.metadata?.userAgent),
    [detail?.contactSession?.metadata?.userAgent, parseUserAgent],
  );

  const countryInfo = useMemo(
    () => getCountryFromTimezone(detail?.contactSession?.metadata?.timezone),
    [detail?.contactSession?.metadata?.timezone],
  );

  if (!conversationId) return null;

  if (detail === undefined) {
    return (
      <aside className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </aside>
    );
  }

  if (!detail || !detail.contactSession) {
    return (
      <aside className="flex h-full min-h-0 flex-col p-4 text-[13px] text-muted-foreground">
        <div className="rounded-2xl border border-border/60 bg-card px-4 py-5 text-[13px] text-muted-foreground">
          {!detail ? "Fant ikke samtalen." : "Ingen kontakt koblet til denne samtalen."}
        </div>
      </aside>
    );
  }

  const contact = detail.contactSession;
  const { label: statusLabel, cls: statusCls } = STATUS_CFG[detail.status];
  const assignedName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Ikke tildelt";
  const startedAt = new Date(detail._creationTime);
  const displayName = contact.name?.trim() || "Uten navn";

  return (
    <aside
      aria-label="Samtaledetaljer"
      className="flex h-full min-h-0 w-full flex-col overflow-hidden"
    >
      <h2 className="sr-only">Samtaledetaljer</h2>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">

        {/* ── Contact header card ── */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="flex items-center gap-3 p-4">
            <ContactAvatar name={displayName} size={44} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-foreground leading-tight">{displayName}</p>
              {contact.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="mt-0.5 block truncate text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {contact.email}
                </a>
              ) : (
                <p className="mt-0.5 text-[12px] text-muted-foreground">Ingen e-post</p>
              )}
            </div>
          </div>
          {contact.email && (
            <div className="border-t border-border/50 px-4 pb-4 pt-3">
              <Button asChild className="h-8 w-full gap-2 rounded-xl text-[12px]" size="sm" variant="outline">
                <Link href={`mailto:${contact.email}`}>
                  <MailIcon className="size-3.5" />
                  Send e-post
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* ── Status card ── */}
        <PanelCard title="Status">
          <div className="flex items-center justify-between gap-3 py-3">
            <span className="text-[12px] text-muted-foreground">Samtalestatus</span>
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide", statusCls)}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 py-3">
            <span className="text-[12px] text-muted-foreground">Tildelt</span>
            <span className="text-[12px] font-medium text-foreground truncate max-w-[60%] text-right">{assignedName}</span>
          </div>
          <div className="flex items-center justify-between gap-3 py-3">
            <span className="text-[12px] text-muted-foreground">Startet</span>
            <span className="text-[12px] font-medium text-foreground" suppressHydrationWarning>
              {format(startedAt, "d. MMM yyyy, HH:mm", { locale: nb })}
            </span>
          </div>
        </PanelCard>

        {/* ── Session metadata card ── */}
        {contact.metadata && (
          <PanelCard title="Økt">
            {countryInfo && (
              <InfoRow icon={GlobeIcon} label="Land" value={countryInfo.name} />
            )}
            {contact.metadata.language && (
              <InfoRow icon={GlobeIcon} label="Språk" value={contact.metadata.language} />
            )}
            {contact.metadata.timezone && (
              <InfoRow icon={ClockIcon} label="Tidssone" value={contact.metadata.timezone} />
            )}
            {contact.metadata.referrer && (
              <InfoRow
                icon={ChevronRightIcon}
                label="Kom fra"
                value={contact.metadata.referrer as string}
              />
            )}
          </PanelCard>
        )}

        {/* ── Technical details (collapsible) ── */}
        {contact.metadata && (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <Accordion collapsible type="single">
              <AccordionItem className="border-0" value="tech">
                <AccordionTrigger className="px-4 py-3 text-left hover:no-underline hover:bg-muted/20 rounded-2xl transition-colors [&[data-state=open]]:rounded-b-none">
                  <div className="flex items-center gap-2">
                    <MonitorIcon className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                      Teknisk
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                  <div className="divide-y divide-border/40 border-t border-border/50 px-4">
                    <InfoRow icon={MonitorIcon} label="Nettleser" value={uaInfo.browser} />
                    <InfoRow icon={MonitorIcon} label="OS" value={uaInfo.os} />
                    <InfoRow icon={MonitorIcon} label="Enhet" value={uaInfo.device} />
                    {contact.metadata.screenResolution && (
                      <InfoRow icon={MonitorIcon} label="Skjerm" value={contact.metadata.screenResolution} />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>
    </aside>
  );
};
