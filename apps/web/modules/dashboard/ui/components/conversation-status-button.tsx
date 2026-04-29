import { Hint } from "@workspace/ui/components/hint";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const pill =
  "rounded-lg border font-medium text-[12px] shadow-none transition-colors";

export const ConversationStatusButton = ({
  status,
  onClick,
  disabled,
}: {
  status: Doc<"conversations">["status"];
  onClick: () => void;
  disabled?: boolean;
}) => {
  if (status === "resolved") {
    return (
      <Hint text="Marker som uavklart">
        <Button
          className={cn(
            pill,
            "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50",
          )}
          disabled={disabled}
          onClick={onClick}
          size="sm"
          variant="outline"
        >
          <CheckIcon className="size-3.5" />
          Løst
        </Button>
      </Hint>
    );
  }

  if (status === "escalated") {
    return (
      <Hint text="Marker som løst">
        <Button
          className={cn(
            pill,
            "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50",
          )}
          disabled={disabled}
          onClick={onClick}
          size="sm"
          variant="outline"
        >
          <ArrowUpIcon className="size-3.5" />
          Eskalert
        </Button>
      </Hint>
    );
  }

  return (
    <Hint text="Marker som eskalert">
      <Button
        className={cn(
          pill,
          "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50",
        )}
        disabled={disabled}
        onClick={onClick}
        size="sm"
        variant="outline"
      >
        <ArrowRightIcon className="size-3.5" />
        Uavklart
      </Button>
    </Hint>
  );
};
