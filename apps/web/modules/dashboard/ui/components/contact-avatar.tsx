"use client";

import { cn } from "@workspace/ui/lib/utils";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0];
    const b = parts[parts.length - 1]?.[0];
    if (a && b) {
      return `${a}${b}`.toUpperCase();
    }
  }
  const one = parts[0] ?? "?";
  return one.slice(0, 2).toUpperCase();
}

type ContactAvatarProps = {
  name: string;
  size?: number;
  className?: string;
};

/** Nøytral, Chatbase-lignende avatar uten fargerike illustrasjoner */
export function ContactAvatar({ name, size = 36, className }: ContactAvatarProps) {
  const label = initialsFromName(name || "?");
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted/90 font-semibold text-muted-foreground shadow-none",
        "dark:border-border dark:bg-muted/50 dark:text-foreground/80",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.31)) }}
    >
      {label}
    </div>
  );
}
