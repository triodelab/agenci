import { SettingsNav } from "./_components/settings-nav";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/modules/dashboard/ui/components/dashboard-page-shell";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardPageShell>
      <DashboardPageHeader
        kicker="Konto"
        title="Innstillinger"
        description="Administrer profil, plan, organisasjon og sikkerhet."
      />
      <div className="mt-6 flex gap-8 items-start">
        <SettingsNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </DashboardPageShell>
  );
}
