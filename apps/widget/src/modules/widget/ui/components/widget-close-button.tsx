import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useAtomValue } from "jotai";
import { XIcon } from "lucide-react";
import { embedFullscreenAtom } from "@/modules/widget/atoms/widget-atoms";

/**
 * Close button for the full-screen phone layout, where the embed hides its
 * floating bubble. Asks the embed script to close the chat.
 */
export const WidgetCloseButton = ({ className }: { className?: string }) => {
  const fullscreen = useAtomValue(embedFullscreenAtom);
  if (!fullscreen) return null;
  return (
    <Button
      className={cn("shrink-0 !text-[var(--widget-header-text)]", className)}
      size="icon"
      variant="transparent"
      onClick={() => window.parent.postMessage({ type: "close" }, "*")}
      aria-label="Lukk chatten"
    >
      <XIcon />
    </Button>
  );
};
