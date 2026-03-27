"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type OverviewForAside = {
  conversations: {
    unresolved: { count: number; capped: boolean };
    escalated: { count: number; capped: boolean };
  };
};

export function DashboardOverviewHeroAside({
  overview,
  organizationName,
}: {
  overview: OverviewForAside | null | undefined;
  organizationName: string | null | undefined;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const timeStr = new Intl.DateTimeFormat("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  const dateStr = new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const open = overview?.conversations.unresolved.count ?? 0;
  const openCapped = overview?.conversations.unresolved.capped ?? false;
  const esc = overview?.conversations.escalated.count ?? 0;
  const escCapped = overview?.conversations.escalated.capped ?? false;

  return (
    <aside className="dash-card-surface w-full rounded-2xl">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground/25 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-foreground/80" />
            </span>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Live
            </span>
          </span>
          {organizationName ? (
            <span className="max-w-[11rem] truncate text-right text-[11px] font-medium text-muted-foreground">
              {organizationName}
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground/80">—</span>
          )}
        </div>

        <div>
          <p
            className="font-semibold tabular-nums tracking-tight text-foreground"
            style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", lineHeight: 1.05 }}
          >
            {timeStr}
          </p>
          <p className="mt-2 text-[13px] capitalize leading-snug text-muted-foreground">
            {dateStr}
          </p>
        </div>

        <div className="border-border/55 border-t pt-4">
          {overview === undefined ? (
            <div className="space-y-2">
              <div className="h-3.5 w-4/5 animate-pulse rounded bg-muted/50" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-muted/40" />
            </div>
          ) : overview === null ? (
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Velg en organisasjon i sidefeltet for å se aktivitet her.
            </p>
          ) : open > 0 ? (
            <Link
              className="group flex items-start justify-between gap-3 rounded-xl py-0.5 text-left transition-colors hover:text-foreground"
              href="/conversations"
            >
              <span className="min-w-0">
                <span className="block font-medium text-[13px] text-foreground">
                  {open}
                  {openCapped ? "+" : ""}{" "}
                  {open === 1 ? "åpen samtale" : "åpne samtaler"}
                </span>
                <span className="mt-0.5 block text-[12px] text-muted-foreground">
                  Krever oppmerksomhet i innboksen.
                </span>
              </span>
              <ArrowRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          ) : esc > 0 ? (
            <Link
              className="group flex items-start justify-between gap-3 rounded-xl py-0.5 text-left transition-colors hover:text-foreground"
              href="/conversations"
            >
              <span className="min-w-0">
                <span className="block font-medium text-[13px] text-foreground">
                  {esc}
                  {escCapped ? "+" : ""}{" "}
                  {esc === 1 ? "eskalert tråd" : "eskalerte tråder"}
                </span>
                <span className="mt-0.5 block text-[12px] text-muted-foreground">
                  Følg opp eller løs i innboksen.
                </span>
              </span>
              <ArrowRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          ) : (
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Ingen åpne saker.</span>{" "}
              Nye henvendelser dukker opp her med en gang.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
