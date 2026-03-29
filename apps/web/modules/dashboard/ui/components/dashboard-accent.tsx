"use client";

import type { ComponentProps } from "react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

/** Snarvei-rad «Åpne» — nøytral, matcher dashboard uten egen aksentfarge */
export const dashboardShortcutCtaClassName = cn(
  "mt-4 inline-flex w-fit max-w-full items-center gap-2 rounded-lg border border-border/70 bg-muted/50 px-4 py-2 text-[13px] font-semibold text-foreground shadow-none transition-colors",
  "group-hover:border-border group-hover:bg-muted/70 dark:border-border/80 dark:bg-muted/35 dark:group-hover:bg-muted/50",
);

export const dashboardShortcutArrowClassName =
  "size-3.5 text-foreground/70";

/**
 * Primær handling i dashboard — standard `default`-knapp (primær fra tema).
 */
export function DashboardAccentButton({
  className,
  children,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button className={cn("gap-2 font-semibold", className)} variant="default" {...props}>
      {children}
    </Button>
  );
}
