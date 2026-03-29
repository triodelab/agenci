"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowLeftIcon,
  BotIcon,
  LibraryBigIcon,
  MessageCircleIcon,
  PaletteIcon,
  PhoneForwardedIcon,
  SearchIcon,
  WrenchIcon,
} from "lucide-react";
import Link from "next/link";
import { DashboardAccentButton } from "@/modules/dashboard/ui/components/dashboard-accent";
import {
  DashboardPageHeader,
  DashboardPagePanel,
  DashboardPageShell,
} from "@/modules/dashboard/ui/components/dashboard-page-shell";

const TOOLS = [
  {
    name: "Søk i kunnskapsbase",
    body: "Henter relevante utdrag fra filer og nettsider du har lagt inn under General.",
    icon: SearchIcon,
  },
  {
    name: "Eskaler samtale",
    body: "Kunden kan bli satt over til et menneske når AI foreslår det eller ber om det.",
    icon: PhoneForwardedIcon,
  },
  {
    name: "Marker som løst",
    body: "Avslutter samtalen på en ryddig måte når problemet er løst.",
    icon: MessageCircleIcon,
  },
] as const;

export function AgentsView() {
  return (
    <DashboardPageShell contentClassName="max-w-4xl">
      <DashboardPageHeader
        description="Her er støtte-assistenten som kjører i widget og chat. Den er koblet til kunnskapsbasen din og følger norsk kundeservice-profil."
        kicker="AI"
        title="Støtte-agent"
      />

      <DashboardPagePanel className="mt-4" variant="plain">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start md:gap-8 md:p-8">
          <div
            aria-hidden
            className="grid size-16 shrink-0 place-items-center rounded-2xl border border-border bg-card text-foreground shadow-sm"
          >
            <BotIcon className="size-8" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
                Standard støtte-agent
              </h2>
              <Badge variant="secondary">Aktiv</Badge>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Modell: <span className="font-mono text-foreground">gpt-4o-mini</span>{" "}
              via Convex Agent. Assistenten skal alltid søke i kunnskapsbasen før den svarer
              på fagspørsmål, og tilby menneskelig hjelp når den ikke finner svar.
            </p>
            <div className="flex flex-wrap gap-2">
              <DashboardAccentButton asChild size="sm">
                <Link href="/files">
                  <LibraryBigIcon className="size-4" />
                  Kunnskapsbase
                </Link>
              </DashboardAccentButton>
              <Button asChild className="rounded-xl" size="sm" variant="outline">
                <Link href="/customization">
                  <PaletteIcon className="size-4" />
                  Widget-tekster
                </Link>
              </Button>
              <Button asChild className="rounded-xl" size="sm" variant="outline">
                <Link href="/conversations">
                  <MessageCircleIcon className="size-4" />
                  Konversasjoner
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DashboardPagePanel>

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <WrenchIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
          <h3 className="text-[13px] font-semibold tracking-tight text-foreground">
            Verktøy agenten bruker
          </h3>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-1">
          {TOOLS.map((t) => (
            <li
              className="flex gap-4 rounded-xl border border-border/80 bg-card/90 p-4 shadow-sm"
              key={t.name}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50">
                <t.icon className="size-5 text-foreground" strokeWidth={1.6} />
              </span>
              <div>
                <p className="font-medium text-[14px] text-foreground">{t.name}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                  {t.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 rounded-xl border border-dashed border-border/90 bg-muted/20 px-5 py-4">
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Flere egendefinerte agenter (egne prompts, modeller eller verktøyklynger) kan bygges
          ut senere. Dagens oppsett dekker én produksjonsklar støttelinje som er knyttet til
          RAG og operatør-innboksen.
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <Button asChild className="rounded-xl gap-2" variant="ghost">
          <Link href="/dashboard">
            <ArrowLeftIcon className="size-4" />
            Tilbake til oversikt
          </Link>
        </Button>
      </div>
    </DashboardPageShell>
  );
}
