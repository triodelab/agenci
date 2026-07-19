"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { ZapIcon } from "lucide-react";
import Link from "next/link";

interface SubscriptionLimitDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function SubscriptionLimitDialog({
  open,
  onClose,
  title = "Planlimit nådd",
  message = "Du har nådd grensen på din nåværende plan. Oppgrader for å fortsette.",
}: SubscriptionLimitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="dashboard-app-shell sm:max-w-sm">
        <div className="flex flex-col items-center gap-5 py-2 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20">
            <ZapIcon className="size-8 text-amber-500" strokeWidth={1.75} />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-[18px] font-bold tracking-[-0.02em]">
              {title}
            </DialogTitle>
            <DialogDescription className="text-[13.5px] leading-relaxed max-w-[260px] mx-auto">
              {message}
            </DialogDescription>
          </div>
          <div className="flex w-full flex-col gap-2">
            <Button
              asChild
              className="w-full gap-2 bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600"
              onClick={onClose}
            >
              <Link href="/billing">
                <ZapIcon className="size-4" strokeWidth={2} />
                Oppgrader plan
              </Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Lukk
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
