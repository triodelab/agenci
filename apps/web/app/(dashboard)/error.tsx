"use client";

import { useEffect } from "react";
import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  const isConvexError = error?.message?.includes("CONVEX");

  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircleIcon className="size-6 text-destructive" strokeWidth={1.75} />
      </div>
      <div className="space-y-1.5">
        <p className="text-[15px] font-semibold text-foreground">
          {isConvexError ? "Tilkoblingsfeil" : "Noe gikk galt"}
        </p>
        <p className="max-w-sm text-[13px] text-muted-foreground">
          {isConvexError
            ? "Kunne ikke koble til backend. Prøv igjen om et øyeblikk."
            : "En uventet feil oppsto. Prøv å laste siden på nytt."}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="rounded-[8px] gap-2"
        onClick={reset}
      >
        <RefreshCwIcon className="size-3.5" />
        Prøv igjen
      </Button>
    </div>
  );
}
