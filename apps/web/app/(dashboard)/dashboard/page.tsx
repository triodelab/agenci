"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  DashboardPageHeader,
  DashboardPagePanel,
  DashboardPageShell,
} from "@/modules/dashboard/ui/components/dashboard-page-shell";

export default function Page() {
  const addUser = useMutation(api.users.add);

  return (
    <DashboardPageShell contentClassName="max-w-xl">
      <DashboardPageHeader
        description="Konto og organisasjon — hurtigtest for brukersynk mot Convex."
        kicker="Oversikt"
        title="Dashboard"
      />
      <DashboardPagePanel className="mt-2 flex flex-col gap-8" variant="plain">
        <div className="dash-stat-board">
          <div className="dash-stat-tile">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">
              Bruker
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <UserButton />
            </div>
          </div>
          <div className="dash-stat-tile">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">
              Organisasjon
            </p>
            <div className="mt-3">
              <OrganizationSwitcher hidePersonal />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-border/50 border-t pt-6">
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            Hurtigtest for brukersynk mot Convex.
          </p>
          <Button
            className="w-fit rounded-xl"
            onClick={() => addUser()}
            type="button"
            variant="secondary"
          >
            Synk bruker (users.add)
          </Button>
        </div>
      </DashboardPagePanel>
    </DashboardPageShell>
  );
}
