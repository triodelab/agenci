"use client";

import type { ReactNode } from "react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Building2, RefreshCw, UserRound } from "lucide-react";
import {
  DashboardPageHeader,
  DashboardPagePanel,
  DashboardPageShell,
} from "@/modules/dashboard/ui/components/dashboard-page-shell";

function SectionGlyph({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-border/55 bg-[var(--dash-knowledge-folder)] text-[color:var(--accent-primary)] shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
      {children}
    </span>
  );
}

export default function Page() {
  const addUser = useMutation(api.users.add);

  return (
    <DashboardPageShell contentClassName="max-w-2xl">
      <DashboardPageHeader
        description="Konto og organisasjon — hurtigtest for brukersynk mot Convex."
        kicker="Oversikt"
        title="Dashboard"
      />
      <DashboardPagePanel className="mt-2 flex flex-col gap-0 p-0 md:p-0" variant="glass">
        <div className="flex flex-col gap-0 p-6 md:p-8">
          <div className="flex gap-4">
            <SectionGlyph>
              <UserRound aria-hidden className="size-5" strokeWidth={2} />
            </SectionGlyph>
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">
                Bruker
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <UserButton />
              </div>
            </div>
          </div>
          <div
            aria-hidden
            className="my-7 h-px bg-gradient-to-r from-transparent via-border to-transparent"
          />
          <div className="flex gap-4">
            <SectionGlyph>
              <Building2 aria-hidden className="size-5" strokeWidth={2} />
            </SectionGlyph>
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">
                Organisasjon
              </p>
              <div className="min-w-0">
                <OrganizationSwitcher hidePersonal />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-border/55 border-t bg-muted/25 px-6 py-5 md:px-8">
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            Oppretter eller oppdaterer brukerposten i Convex ut fra Clerk-kontoen din.
          </p>
          <Button
            className="w-fit rounded-xl"
            onClick={() => addUser()}
            type="button"
            variant="default"
          >
            <RefreshCw aria-hidden className="size-4" />
            Synk bruker (users.add)
          </Button>
        </div>
      </DashboardPagePanel>
    </DashboardPageShell>
  );
}
