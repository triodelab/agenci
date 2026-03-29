"use client";

import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

export function LegacyCollapsibleSection({
  title,
  open,
  onOpenChange,
  children,
}: {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <div className="app-dashboard-panel overflow-hidden rounded-2xl">
      <Collapsible onOpenChange={onOpenChange} open={open}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors",
            "bg-muted/30 hover:bg-muted/45 dark:bg-muted/15 dark:hover:bg-muted/25",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          )}
        >
          <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {title}
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-border/50 border-t">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
