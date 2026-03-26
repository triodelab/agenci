import { Hint } from "@workspace/ui/components/hint";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const pill =
  "rounded-md border font-medium text-[12px] shadow-none transition-colors";

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
      <Hint text="Mark as unresolved">
        <Button
          className={cn(
            pill,
            "border-border bg-muted/40 text-foreground hover:bg-muted/60",
          )}
          disabled={disabled}
          onClick={onClick}
          size="sm"
          variant="outline"
        >
          <CheckIcon className="size-3.5" />
          Resolved
        </Button>
      </Hint>
    );
  }

  if (status === "escalated") {
    return (
      <Hint text="Mark as resolved">
        <Button
          className={cn(
            pill,
            "border-border bg-muted/50 text-foreground hover:bg-muted/70",
          )}
          disabled={disabled}
          onClick={onClick}
          size="sm"
          variant="outline"
        >
          <ArrowUpIcon className="size-3.5" />
          Escalated
        </Button>
      </Hint>
    );
  }

  return (
    <Hint text="Mark as escalated">
      <Button
        className={cn(
          pill,
          "border-border bg-background text-foreground hover:bg-muted/45",
        )}
        disabled={disabled}
        onClick={onClick}
        size="sm"
        variant="outline"
      >
        <ArrowRightIcon className="size-3.5" />
        Unresolved
      </Button>
    </Hint>
  );
};
