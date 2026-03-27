"use client";

import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import {
  ArrowRightIcon,
  CreditCardIcon,
  InboxIcon,
  LibraryBigIcon,
  MessageCircleIcon,
  MicIcon,
  PaletteIcon,
  PlugIcon,
  SparklesIcon,
  WrenchIcon,
} from "lucide-react";
import Link from "next/link";
import { DashboardOverviewCalendar } from "@/modules/dashboard/ui/components/dashboard-overview-calendar";
import { DashboardOverviewHeroAside } from "@/modules/dashboard/ui/components/dashboard-overview-hero-aside";
import { DashboardOverviewSpotlight } from "@/modules/dashboard/ui/components/dashboard-overview-spotlight";
import { DashboardPageShell } from "@/modules/dashboard/ui/components/dashboard-page-shell";
import { cn } from "@workspace/ui/lib/utils";

type Shortcut = {
  title: string;
  description: string;
  href: string;
  icon: typeof InboxIcon;
  featured?: boolean;
};

const SHORTCUTS: Shortcut[] = [
  {
    title: "Konversasjoner",
    description: "Innboks, svar og eskalering.",
    href: "/conversations",
    icon: InboxIcon,
    featured: true,
  },
  {
    title: "Kunnskapsbase",
    description: "Filer og kilder til RAG.",
    href: "/files",
    icon: LibraryBigIcon,
    featured: true,
  },
  {
    title: "Widget-tilpasning",
    description: "Utseende og tekster.",
    href: "/customization",
    icon: PaletteIcon,
  },
  {
    title: "Integrasjoner",
    description: "Bygg inn på nettsiden.",
    href: "/integrations",
    icon: PlugIcon,
  },
  {
    title: "Stemmeassistent",
    description: "Vapi tale inn/ut.",
    href: "/plugins/vapi",
    icon: MicIcon,
  },
  {
    title: "Agenter",
    description: "Modell og verktøy.",
    href: "/agents",
    icon: WrenchIcon,
  },
  {
    title: "Plan og faktura",
    description: "Abonnement.",
    href: "/billing",
    icon: CreditCardIcon,
  },
];

function MetricCell({
  label,
  value,
  capped,
  icon: Icon,
}: {
  label: string;
  value: number;
  capped?: boolean;
  icon: typeof InboxIcon;
}) {
  return (
    <div className="flex flex-col gap-3 px-5 py-6 sm:px-6 sm:py-7">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {label}
        </p>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/55 bg-foreground/[0.06] text-foreground/85">
          <Icon className="size-4" strokeWidth={1.5} />
        </span>
      </div>
      <p className="font-semibold tabular-nums text-3xl tracking-tight text-foreground sm:text-[2.125rem]">
        {value}
        {capped ? "+" : ""}
      </p>
    </div>
  );
}

export function DashboardOverviewView() {
  const { organization } = useOrganization();
  const overview = useQuery(api.private.dashboard.getOverview);

  return (
    <DashboardPageShell>
      <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-10 xl:gap-14 2xl:gap-16">
        <div className="min-w-0 flex-1 space-y-10 lg:space-y-12">
          <header className="space-y-3">
            <p className="dash-page-kicker">Oversikt</p>
            <h1 className="dash-page-title">Dashboard</h1>
            <p className="dash-page-desc dash-page-desc-wide max-w-2xl">
              Status for samtaler, kunnskapskilder og oppsett — oppdatert live når du
              bruker appen.
            </p>
          </header>

        <section aria-labelledby="dash-conv-metrics">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase" id="dash-conv-metrics">
                Samtaler
              </h2>
              <p className="text-muted-foreground mt-1.5 max-w-xl text-[12px] leading-relaxed">
                Tallene er et øyeblikksbilde (akkurat nå), ikke endring over tid eller sammenligning med
                forrige uke.
              </p>
            </div>
            <Link
              className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-foreground/80 transition-colors hover:text-primary"
              href="/conversations"
            >
              Innboks
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>

          {overview === undefined ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  className="app-dashboard-panel h-32 animate-pulse overflow-hidden rounded-2xl bg-muted/25"
                  key={i}
                />
              ))}
            </div>
          ) : overview === null ? (
            <div className="app-dashboard-panel rounded-2xl px-6 py-8">
              <p className="text-muted-foreground text-sm">
                Velg organisasjon i sidefeltet for å se tall.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="app-dashboard-panel overflow-hidden rounded-2xl">
                <MetricCell
                  capped={overview.conversations.unresolved.capped}
                  icon={InboxIcon}
                  label="Åpne"
                  value={overview.conversations.unresolved.count}
                />
              </div>
              <div className="app-dashboard-panel overflow-hidden rounded-2xl">
                <MetricCell
                  capped={overview.conversations.escalated.capped}
                  icon={SparklesIcon}
                  label="Eskalert"
                  value={overview.conversations.escalated.count}
                />
              </div>
              <div className="app-dashboard-panel overflow-hidden rounded-2xl">
                <MetricCell
                  capped={overview.conversations.resolved.capped}
                  icon={MessageCircleIcon}
                  label="Løst"
                  value={overview.conversations.resolved.count}
                />
              </div>
            </div>
          )}
        </section>

        {overview ? (
          <section aria-labelledby="dash-setup">
            <h2 className="mb-4 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase" id="dash-setup">
              Oppsett
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="app-dashboard-panel overflow-hidden rounded-2xl">
                <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
                  <LibraryBigIcon className="size-5 shrink-0 text-foreground/75" strokeWidth={1.5} />
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Kilder
                    </p>
                    <p className="mt-0.5 font-semibold tabular-nums text-lg text-foreground">
                      {overview.knowledge.count}
                      {overview.knowledge.hasMore ? "+" : ""}
                    </p>
                  </div>
                </div>
              </div>
              <div className="app-dashboard-panel overflow-hidden rounded-2xl">
                <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
                  <PaletteIcon className="size-5 shrink-0 text-foreground/75" strokeWidth={1.5} />
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Widget
                    </p>
                    <p className="mt-0.5 font-medium text-[13px] text-foreground">
                      {overview.hasWidgetSettings ? "Lagret" : "Ikke lagret"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="app-dashboard-panel overflow-hidden rounded-2xl">
                <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
                  <MicIcon className="size-5 shrink-0 text-foreground/75" strokeWidth={1.5} />
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Stemme
                    </p>
                    <p className="mt-0.5 font-medium text-[13px] text-foreground">
                      {overview.vapiConnected ? "Vapi koblet" : "Ikke koblet"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="dash-shortcuts">
          <div className="mb-5">
            <h2 className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase" id="dash-shortcuts">
              Snarveier
            </h2>
            <p className="text-muted-foreground mt-1.5 max-w-xl text-[13px] leading-relaxed">
              Hopp rett inn i arbeidsflatene.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {SHORTCUTS.map((item) => (
              <Link
                className={cn(
                  "dash-tile-premium group flex min-h-[104px] flex-col justify-between p-5",
                  item.featured && "sm:min-h-[112px]",
                )}
                href={item.href}
                key={item.href}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[15px] leading-snug tracking-tight text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-foreground/[0.06] text-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary/10",
                      item.featured && "border-primary/20 bg-primary/10",
                    )}
                  >
                    <item.icon className="size-[18px] text-foreground/90" strokeWidth={1.65} />
                  </span>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-primary">
                  Åpne
                  <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-6 lg:w-[min(100%,20.5rem)] lg:self-start xl:w-[22rem]">
          <DashboardOverviewHeroAside
            organizationName={organization?.name}
            overview={overview}
          />
          <DashboardOverviewCalendar />
          <DashboardOverviewSpotlight />
        </aside>
      </div>
    </DashboardPageShell>
  );
}
