import {
  DashboardPageHeader,
  DashboardPagePanel,
  DashboardPageShell,
} from "@/modules/dashboard/ui/components/dashboard-page-shell";
import { BotIcon } from "lucide-react";

export default function AgentsPage() {
  return (
    <DashboardPageShell contentClassName="max-w-2xl">
      <DashboardPageHeader
        description="Konfigurasjon av AI-agenter kommer her. Strukturen er klar for videre utvikling."
        kicker="Automatisering"
        title="Agents"
      />
      <DashboardPagePanel className="mt-2" variant="plain">
        <div className="flex flex-col items-center gap-5 py-6 text-center sm:py-8">
          <div
            className="grid size-16 place-items-center rounded-2xl border border-border bg-card text-foreground shadow-sm"
            aria-hidden
          >
            <BotIcon className="size-8" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              status
            </p>
            <p className="text-[15px] leading-relaxed text-foreground">
              Ingen agenter er definert ennå.
            </p>
            <p className="font-mono text-[12px] text-muted-foreground">
              // Konfigurasjon kommer i neste iterasjon.
            </p>
          </div>
        </div>
      </DashboardPagePanel>
    </DashboardPageShell>
  );
}
