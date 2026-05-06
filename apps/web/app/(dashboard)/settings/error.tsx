"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/modules/dashboard/ui/components/dashboard-page-shell";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Settings page error:", error);
  }, [error]);

  return (
    <DashboardPageShell contentClassName="max-w-2xl">
      <DashboardPageHeader
        kicker="Konto"
        title="Innstillinger"
        description="Administrer kontoen din og personverninnstillinger."
      />
      <div className="mt-8 rounded-[12px] border border-border bg-card p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-6 text-destructive" strokeWidth={1.75} />
          </div>
        </div>
        <p className="text-[15px] font-semibold text-foreground">Kunne ikke laste innstillinger</p>
        <p className="mt-2 text-[13px] text-muted-foreground">
          En teknisk feil oppsto. Dette kan skyldes at backend-funksjonen ikke er deployet ennå.
        </p>
        <Button
          variant="outline"
          className="mt-5 rounded-[8px]"
          onClick={reset}
        >
          Prøv igjen
        </Button>
      </div>
    </DashboardPageShell>
  );
}
