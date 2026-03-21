import { cn } from "@workspace/ui/lib/utils";

/**
 * Samme gradient som hero («jobber mens dere sover»): foreground → primary.
 */
export function LandingGradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Ikonflate i landing: primary-fargen fra gradient-slutten, diskret bakgrunn. */
export function landingIconSurfaceClassName(extra?: string) {
  return cn(
    "bg-primary/[0.12] text-primary dark:bg-primary/[0.18]",
    extra,
  );
}

/** Ytre ramme for steg 01/02/03 — matcher ikonflater, tydelig primary-kant. */
export function landingStepBadgeShellClassName(extra?: string) {
  return cn(
    "border-2 border-background shadow-md ring-1 ring-primary/25",
    landingIconSurfaceClassName(),
    extra,
  );
}
