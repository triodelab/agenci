import { cn } from "@workspace/ui/lib/utils";

/**
 * DESIGN.md segment control: pill in surface-2 with a gliding white thumb
 * (320 ms). Labels use the caption style (Space Grotesk, uppercase). An
 * optional `count` renders next to the label.
 */
export function Segment<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  return (
    <fieldset
      aria-label={label}
      className={cn(
        "relative grid min-w-0 rounded-full bg-[#f3f5f4] p-0.5 dark:bg-white/5",
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      <span
        aria-hidden
        className="absolute top-0.5 bottom-0.5 left-0.5 rounded-full bg-white shadow-[0_1px_2px_rgb(5_6_7/0.08)] transition-transform duration-[320ms] ease-[cubic-bezier(.16,1,.3,1)] dark:bg-white/15"
        style={{
          width: `calc((100% - 4px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 px-2.5 py-0.5 text-[12px] font-medium tracking-[0.06em] whitespace-nowrap uppercase tabular-nums transition-colors duration-150 [font-family:var(--font-agenci-data)]",
              active
                ? "text-(--agenci-ink)"
                : "text-(--agenci-ink-3) hover:text-(--agenci-ink-2)",
            )}
          >
            {o.label}
            {o.count !== undefined ? (
              <span
                className={cn(
                  "tracking-normal",
                  active ? "text-(--agenci-ink-2)" : "text-(--agenci-ink-3)",
                )}
              >
                {o.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </fieldset>
  );
}
