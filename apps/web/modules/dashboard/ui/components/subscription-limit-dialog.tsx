"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { BotIcon, MessageCircleIcon, ZapIcon } from "lucide-react";
import Link from "next/link";

interface SubscriptionLimitDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  type?: "agent" | "conversation";
}

export function SubscriptionLimitDialog({
  open,
  onClose,
  title = "Planlimit nådd",
  message = "Du har nådd grensen på din nåværende plan. Oppgrader for å fortsette.",
  type = "agent",
}: SubscriptionLimitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="dashboard-app-shell sm:max-w-sm">
        <div className="flex flex-col items-center gap-5 py-2 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-foreground/[0.06] ring-1 ring-border">
            <ZapIcon className="size-8 text-foreground" strokeWidth={1.75} />
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-[18px] font-bold tracking-[-0.02em]">
              {title}
            </DialogTitle>
            <DialogDescription className="text-[13.5px] leading-relaxed max-w-[260px] mx-auto">
              {message}
            </DialogDescription>
          </div>

          {/* What you get on Pro */}
          <div className="w-full rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-left space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Med Pro får du
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="grid size-6 shrink-0 place-items-center rounded-md bg-background border border-border/60">
                  <BotIcon className="size-3.5 text-foreground" strokeWidth={1.75} />
                </div>
                <span className="text-[13px] text-foreground font-medium">Opptil 3 agenter</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="grid size-6 shrink-0 place-items-center rounded-md bg-background border border-border/60">
                  <MessageCircleIcon className="size-3.5 text-foreground" strokeWidth={1.75} />
                </div>
                <span className="text-[13px] text-foreground font-medium">2 000 samtaler per måned</span>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            <Button asChild className="w-full gap-2" onClick={onClose}>
              <Link href="/billing">
                <ZapIcon className="size-4" strokeWidth={2} />
                Oppgrader plan
              </Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Ikke nå
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
