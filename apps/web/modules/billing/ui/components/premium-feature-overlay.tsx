"use client";

import {
  type LucideIcon,
  BookOpenIcon,
  BotIcon,
  GemIcon,
  PaletteIcon,
  UsersIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";

interface Feature {
  icon: LucideIcon;
  label: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: BotIcon,
    label: "Opptil 10 AI-agenter",
    description: "Lag agenter for ulike brukstilfeller",
  },
  {
    icon: BookOpenIcon,
    label: "Kunnskapsbase",
    description: "Last opp FAQ, priser og retningslinjer",
  },
  {
    icon: PaletteIcon,
    label: "Widget-tilpasning",
    description: "Egne farger, logo og velkomsttekst",
  },
  {
    icon: UsersIcon,
    label: "Teammedlemmer",
    description: "Inviter kolleger til å følge opp samtaler",
  },
];

export const PremiumFeatureOverlay = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();

  return (
    <div className="relative min-h-screen">
      {/* Blurred background content */}
      <div className="pointer-events-none select-none blur-[3px]">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />

      {/* Upgrade prompt */}
      <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
        <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl">
          {/* Header */}
          <div className="border-b border-border/60 px-6 py-5 text-center">
            <div className="mb-3 flex justify-center">
              <div className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
                <GemIcon className="size-5 text-foreground" strokeWidth={1.75} />
              </div>
            </div>
            <p className="text-[16px] font-semibold text-foreground">Betalt funksjon</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Velg en plan for å låse opp denne funksjonen
            </p>
          </div>

          {/* Features */}
          <div className="divide-y divide-border/40 px-4 py-2">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/40">
                  <feature.icon className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-foreground">{feature.label}</p>
                  <p className="text-[11px] text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="border-t border-border/60 px-4 pb-5 pt-4">
            <Button
              className="w-full rounded-xl font-medium"
              onClick={() => router.push("/billing")}
            >
              Se planer og priser
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
