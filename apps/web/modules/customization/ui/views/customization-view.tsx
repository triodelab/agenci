"use client";

import { api } from "@workspace/backend/_generated/api";
import { useQuery } from "convex/react";
import { Loader2Icon } from "lucide-react";
import {
  DashboardPagePanel,
  DashboardPageShell,
} from "@/modules/dashboard/ui/components/dashboard-page-shell";
import { CustomizationForm } from "../components/customization-form";

export const CustomizationView = () => {
  const widgetSettings = useQuery(api.private.widgetSettings.getOne);
  const vapiPlugin = useQuery(api.private.plugins.getOne, { service: "vapi" });

  const isLoading = widgetSettings === undefined || vapiPlugin === undefined;

  if (isLoading) {
    return (
      <DashboardPageShell contentClassName="max-w-3xl">
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/30 py-16">
          <Loader2Icon className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Laster innstillinger…</p>
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell contentClassName="max-w-3xl">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">
          Widget Customization
        </h1>
        <p className="max-w-2xl text-muted-foreground leading-relaxed">
          Tilpass hvordan chat-widgeten ser ut og oppfører seg for kundene dine.
        </p>
      </header>

      <DashboardPagePanel className="mt-8">
        <CustomizationForm
          initialData={widgetSettings}
          hasVapiPlugin={!!vapiPlugin}
        />
      </DashboardPagePanel>
    </DashboardPageShell>
  );
};
