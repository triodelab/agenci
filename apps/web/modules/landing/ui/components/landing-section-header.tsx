import { cn } from "@workspace/ui/lib/utils";

type LandingSectionHeaderProps = {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
  titleId?: string;
};

/**
 * Felles topp for landing-seksjoner — konsistent rytme og typografi.
 */
export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  titleId,
}: LandingSectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground md:text-xs",
          align === "center" &&
            "mx-auto w-fit rounded-full border border-primary/20 bg-muted/25 px-3 py-1 dark:bg-muted/20",
        )}
      >
        {eyebrow}
      </p>
      <h2
        id={titleId}
        className={cn(
          "mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground md:mt-5 md:text-4xl lg:text-[2.5rem] lg:leading-[1.12]",
          align === "center" && "mx-auto max-w-[22ch]",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 text-pretty text-base leading-relaxed text-muted-foreground md:mt-5 md:text-lg md:leading-relaxed",
            align === "center" && "mx-auto max-w-2xl",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
