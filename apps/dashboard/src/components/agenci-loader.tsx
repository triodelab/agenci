/**
 * AgenciLoader (DESIGN.md → Laster): the outline of a chat bubble with a
 * short stroke travelling round it. Agenci's only loading indicator — no
 * spinners. Inherits `currentColor`; never green.
 */
import { cn } from "@workspace/ui/lib/utils";

const BUBBLE =
  "M20 3H108C117.389 3 125 10.611 125 20V50C125 59.389 117.389 67 108 67H3V20C3 10.611 10.611 3 20 3Z";

export function AgenciLoader({
  size = 48,
  label = "Laster",
  decorative = false,
  className,
}: {
  /** Width in px; height follows 128 : 70. */
  size?: number;
  label?: string;
  decorative?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 128 70"
      width={size}
      height={(size * 70) / 128}
      fill="none"
      className={cn("shrink-0", className)}
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "status", "aria-label": label })}
    >
      <title>{label}</title>
      <path d={BUBBLE} stroke="currentColor" strokeWidth={3} opacity={0.22} />
      <path
        d={BUBBLE}
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="26 74"
        className="agenci-loader-stroke"
      />
    </svg>
  );
}
