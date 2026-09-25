import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useAtomValue, useSetAtom } from "jotai";
import { HomeIcon, InboxIcon } from "lucide-react"
import { screenAtom } from "../../atoms/widget-atoms";

export const WidgetFooter = () => {
  const screen = useAtomValue(screenAtom);
  const setScreen = useSetAtom(screenAtom);

  return (
    <footer className="flex items-center justify-between border-t border-[var(--widget-input-border)]/50 bg-[var(--widget-input-bg)]">
      <Button
        className="h-14 flex-1 rounded-none"
        onClick={() => setScreen("selection")}
        size="icon"
        variant="ghost"
      >
        <HomeIcon
          className={cn(
            "size-5 text-muted-foreground",
            screen === "selection" && "text-[var(--widget-header-bg)]",
          )}
        />
      </Button>
      <Button
        className="h-14 flex-1 rounded-none"
        onClick={() => setScreen("inbox")}
        size="icon"
        variant="ghost"
      >
        <InboxIcon
          className={cn(
            "size-5 text-muted-foreground",
            screen === "inbox" && "text-[var(--widget-header-bg)]",
          )}
        />
      </Button>
    </footer>
  );
};
