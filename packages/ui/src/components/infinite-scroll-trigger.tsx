import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface InfiniteScrollTriggerProps {
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  loadMoreText?: string;
  noMoreText?: string;
  className?: string;
  ref?: React.Ref<HTMLDivElement>
};

export const InfiniteScrollTrigger = ({
  canLoadMore,
  isLoadingMore,
  onLoadMore,
  loadMoreText = "Load more",
  noMoreText = "No more items",
  className,
  ref,
}: InfiniteScrollTriggerProps) => {
  /** Når alt er lastet: tom sentinel (beholder ref til scroll-observer), ingen støy i UI. */
  if (!canLoadMore && !isLoadingMore) {
    return (
      <div
        aria-hidden
        className={cn("h-1 w-full shrink-0", className)}
        ref={ref}
      />
    );
  }

  const text = isLoadingMore ? "Loading..." : loadMoreText;

  return (
    <div className={cn("flex w-full justify-center py-2", className)} ref={ref}>
      <Button
        disabled={isLoadingMore}
        onClick={onLoadMore}
        size="sm"
        variant="ghost"
      >
        {text}
      </Button>
    </div>
  );
};
