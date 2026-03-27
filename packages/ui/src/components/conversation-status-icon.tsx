import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface ConversationStatusIconProps {
  status: "unresolved" | "escalated" | "resolved",
  className?: string;
};

/** Dempede semantiske farger — mørk modus primært, fortsatt lesbart i lys */
const statusConfig = {
  resolved: {
    icon: CheckIcon,
    className:
      "border border-emerald-600/25 bg-emerald-600/10 text-emerald-700 dark:border-emerald-500/35 dark:bg-emerald-500/12 dark:text-emerald-400/95 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  },
  unresolved: {
    icon: ArrowRightIcon,
    className:
      "border border-zinc-400/60 bg-zinc-200/80 text-zinc-700 dark:border-zinc-500/45 dark:bg-zinc-500/15 dark:text-zinc-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  },
  escalated: {
    icon: ArrowUpIcon,
    className:
      "border border-amber-600/30 bg-amber-500/15 text-amber-900 dark:border-amber-500/35 dark:bg-amber-500/10 dark:text-amber-200/85 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
  },
} as const;

export const ConversationStatusIcon = ({
  status,
  className,
}: ConversationStatusIconProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full",
        config.className,
        className,
      )}
      title={
        status === "resolved"
          ? "Løst"
          : status === "escalated"
            ? "Eskalert"
            : "Uavklart"
      }
    >
      <Icon className="size-3 stroke-[2.5] text-current" aria-hidden />
    </div>
  );
};
