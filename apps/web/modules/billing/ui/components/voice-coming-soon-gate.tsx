"use client";

import { MicIcon } from "lucide-react";

export function VoiceComingSoonGate({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none select-none blur-[3px]">
        {children}
      </div>

      <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />

      <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
        <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl">
          <div className="border-b border-border/60 px-6 py-5 text-center">
            <div className="mb-3 flex justify-center">
              <div className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
                <MicIcon className="size-5 text-foreground" strokeWidth={1.75} />
              </div>
            </div>
            <p className="text-[16px] font-semibold text-foreground">Stemmeassistent</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Stemme og telefon kommer snart som et eget tillegg
            </p>
          </div>

          <div className="px-6 py-5 text-center">
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Vi jobber med å integrere AI-stemmeassistent og telefonsystem. Du vil bli varslet når det er klart.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
