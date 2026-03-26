"use client";

import Bowser from "bowser";
import { useUser } from "@clerk/nextjs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { getCountryFlagUrl, getCountryFromTimezone } from "@/lib/country-utils";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { useQuery } from "convex/react";
import {
  ClockIcon,
  FileTextIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  MonitorIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import {
  LegacyCollapsibleSection,
  LegacyDetailRow,
} from "./legacy-ui";

type InfoItem = {
  label: string;
  value: string | React.ReactNode;
  className?: string;
};

type InfoSection = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: InfoItem[];
};

type StatusDot = "amber" | "orange" | "slate" | null;

function statusLabel(
  status: "unresolved" | "escalated" | "resolved",
): {
  status: string;
  priority: string;
  statusDot: StatusDot;
  priorityDot: StatusDot;
} {
  switch (status) {
    case "unresolved":
      return {
        status: "Åpen",
        priority: "—",
        statusDot: null,
        priorityDot: null,
      };
    case "escalated":
      return {
        status: "Under arbeid",
        priority: "Haster",
        statusDot: "amber",
        priorityDot: "orange",
      };
    case "resolved":
      return {
        status: "Lukket",
        priority: "—",
        statusDot: "slate",
        priorityDot: null,
      };
    default:
      return { status: status, priority: "—", statusDot: null, priorityDot: null };
  }
}

const dotClass: Record<NonNullable<StatusDot>, string> = {
  amber: "bg-amber-400 dark:bg-amber-500",
  orange: "bg-orange-500 dark:bg-orange-400",
  slate: "bg-muted-foreground/45",
};

function StatusInfoRow({
  label,
  value,
  valueDot,
}: {
  label: string;
  value: React.ReactNode;
  valueDot?: StatusDot;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="flex min-w-0 items-center justify-end gap-2 text-right text-sm font-medium text-foreground">
        {valueDot ? (
          <span
            aria-hidden
            className={cn("size-2 shrink-0 rounded-full", dotClass[valueDot])}
          />
        ) : null}
        <span className="min-w-0">{value}</span>
      </span>
    </div>
  );
}

export const ContactPanel = () => {
  const params = useParams();
  const conversationId = params.conversationId as Id<"conversations"> | undefined;
  const { user } = useUser();

  const [infoOpen, setInfoOpen] = useState(true);
  const [contactOpen, setContactOpen] = useState(true);
  const [threadOpen, setThreadOpen] = useState(true);
  const [techOpen, setTechOpen] = useState(false);

  const detail = useQuery(
    api.private.conversations.getOne,
    conversationId ? { conversationId } : "skip",
  );

  const sessionMeta = detail?.contactSession;

  const parseUserAgent = useMemo(() => {
    return (userAgent?: string) => {
      if (!userAgent) {
        return { browser: "Unknown", os: "Unknown", device: "Unknown" };
      }

      const browser = Bowser.getParser(userAgent);
      const result = browser.getResult();

      return {
        browser: result.browser.name || "Unknown",
        browserVersion: result.browser.version || "",
        os: result.os.name || "Unknown",
        osVersion: result.os.version || "",
        device: result.platform.type || "desktop",
        deviceVendor: result.platform.vendor || "",
        deviceModel: result.platform.model || "",
      };
    };
  }, []);

  const userAgentInfo = useMemo(
    () => parseUserAgent(sessionMeta?.metadata?.userAgent),
    [sessionMeta?.metadata?.userAgent, parseUserAgent],
  );

  const countryInfo = useMemo(() => {
    return getCountryFromTimezone(sessionMeta?.metadata?.timezone);
  }, [sessionMeta?.metadata?.timezone]);

  const accordionSections = useMemo<InfoSection[]>(() => {
    if (!sessionMeta?.metadata) {
      return [];
    }

    return [
      {
        id: "device-info",
        icon: MonitorIcon,
        title: "Enhet",
        items: [
          {
            label: "Nettleser",
            value:
              userAgentInfo.browser +
              (userAgentInfo.browserVersion
                ? ` ${userAgentInfo.browserVersion}`
                : ""),
          },
          {
            label: "OS",
            value:
              userAgentInfo.os +
              (userAgentInfo.osVersion ? ` ${userAgentInfo.osVersion}` : ""),
          },
          {
            label: "Enhet",
            value:
              userAgentInfo.device +
              (userAgentInfo.deviceModel ? ` – ${userAgentInfo.deviceModel}` : ""),
            className: "capitalize",
          },
          {
            label: "Skjerm",
            value: sessionMeta.metadata.screenResolution,
          },
          {
            label: "Viewport",
            value: sessionMeta.metadata.viewportSize,
          },
          {
            label: "Informasjonskapsler",
            value: sessionMeta.metadata.cookieEnabled ? "På" : "Av",
          },
        ],
      },
      {
        id: "location-info",
        icon: GlobeIcon,
        title: "Språk og sted",
        items: [
          ...(countryInfo
            ? [
                {
                  label: "Land",
                  value: <span>{countryInfo.name}</span>,
                },
              ]
            : []),
          {
            label: "Språk",
            value: sessionMeta.metadata.language,
          },
          {
            label: "Tidssone",
            value: sessionMeta.metadata.timezone,
          },
          {
            label: "UTC",
            value: String(sessionMeta.metadata.timezoneOffset),
          },
        ],
      },
      {
        id: "section-details",
        title: "Økt",
        icon: ClockIcon,
        items: [
          {
            label: "Startet",
            value: new Date(sessionMeta._creationTime).toLocaleString(),
          },
        ],
      },
    ];
  }, [sessionMeta, userAgentInfo, countryInfo]);

  if (!conversationId) {
    return null;
  }

  if (detail === undefined) {
    return (
      <aside className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
        <header className="border-border/80 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/90">
          <Skeleton className="h-5 w-24" />
        </header>
        <div className="space-y-4 p-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </aside>
    );
  }

  if (detail === null) {
    return (
      <aside className="flex h-full min-h-0 flex-col bg-background p-4 text-[13px] text-muted-foreground">
        Fant ikke samtalen.
      </aside>
    );
  }

  if (!detail.contactSession) {
    return (
      <aside className="flex h-full min-h-0 flex-col bg-background p-4 text-[13px] text-muted-foreground">
        Ingen kontakt koblet til denne samtalen.
      </aside>
    );
  }

  const contactSession = detail.contactSession;

  const {
    status: statusText,
    priority: priorityText,
    statusDot,
    priorityDot,
  } = statusLabel(detail.status);
  const assignedName =
    user?.fullName || user?.primaryEmailAddress?.emailAddress || "—";
  const started = new Date(detail._creationTime).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <aside
      aria-label="Samtaledetaljer"
      className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background"
    >
      <header className="shrink-0 border-border/80 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Detaljer
        </h2>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <LegacyCollapsibleSection
          onOpenChange={setInfoOpen}
          open={infoOpen}
          title="Status"
        >
          <div className="space-y-3 border-b border-border bg-background p-4">
            <StatusInfoRow
              label="Status"
              value={statusText}
              valueDot={statusDot}
            />
            <StatusInfoRow
              label="Prioritet"
              value={priorityText}
              valueDot={priorityDot}
            />
            <StatusInfoRow label="Tildelt" value={assignedName} />
            <StatusInfoRow label="Dato" value={started} />
          </div>
        </LegacyCollapsibleSection>

        <LegacyCollapsibleSection
          onOpenChange={setContactOpen}
          open={contactOpen}
          title="Kunde"
        >
          <div className="space-y-3 border-b border-border bg-background p-4">
            <LegacyDetailRow
              icon={<UserIcon className="size-4" />}
              label="Navn"
              value={contactSession.name}
            />
            <LegacyDetailRow
              icon={<MailIcon className="size-4" />}
              label="E-post"
              value={
                <a
                  className="text-primary hover:underline"
                  href={`mailto:${contactSession.email}`}
                >
                  {contactSession.email}
                </a>
              }
            />
            <LegacyDetailRow
              icon={<PhoneIcon className="size-4" />}
              label="Telefon"
              value="Ikke oppgitt"
            />
            <LegacyDetailRow
              icon={<MapPinIcon className="size-4" />}
              label="Adresse"
              value="Ikke oppgitt"
            />
            <Button
              asChild
              className="mt-1 w-full"
              size="sm"
              variant="outline"
            >
              <Link href={`mailto:${contactSession.email}`}>
                <MailIcon className="mr-2 size-4" />
                Send e-post
              </Link>
            </Button>
          </div>
        </LegacyCollapsibleSection>

        <LegacyCollapsibleSection
          onOpenChange={setThreadOpen}
          open={threadOpen}
          title="Samtale"
        >
          <div className="space-y-3 border-b border-border bg-background p-4">
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                Emne
              </p>
              <span className="rounded-md bg-foreground/10 px-2 py-0.5 text-xs font-medium">
                Chat · {contactSession.name}
              </span>
            </div>
            <LegacyDetailRow
              icon={<FileTextIcon className="size-4" />}
              label="Oppsummering"
              value={
                contactSession.metadata?.referrer
                  ? String(contactSession.metadata.referrer)
                  : "Samtale med besøkende"
              }
            />
            <LegacyDetailRow
              icon={<GlobeIcon className="size-4" />}
              label="Språk"
              value={contactSession.metadata?.language ?? "—"}
            />
          </div>
        </LegacyCollapsibleSection>

        {contactSession.metadata ? (
          <LegacyCollapsibleSection
            onOpenChange={setTechOpen}
            open={techOpen}
            title="Teknisk"
          >
            <div className="border-b border-border bg-background">
              <Accordion
                className="border-0"
                collapsible
                type="single"
              >
                {accordionSections.map((section) => (
                  <AccordionItem
                    className="border-border/60 border-b px-4 last:border-b-0"
                    key={section.id}
                    value={section.id}
                  >
                    <AccordionTrigger className="py-3 text-left text-[12px] font-medium hover:no-underline">
                      <div className="flex items-center gap-2">
                        <section.icon className="size-3.5 text-muted-foreground" />
                        {section.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3">
                      <div className="space-y-2 border-border/40 border-t pt-3 text-[12px]">
                        {section.items.map((item) => (
                          <div
                            className="flex justify-between gap-3"
                            key={`${section.id}-${item.label}`}
                          >
                            <span className="text-muted-foreground">
                              {item.label}
                            </span>
                            <span className={item.className}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </LegacyCollapsibleSection>
        ) : null}
      </div>
    </aside>
  );
};
