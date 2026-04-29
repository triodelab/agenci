"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useRouter } from "next/navigation";
import { SparklesIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

export function TrialBanner() {
  const sub = useQuery(api.private.subscription.getOwn);
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !sub || sub.status !== "trialing") return null;

  const daysLeft = sub.trialEndsAt
    ? Math.max(0, Math.ceil((sub.trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const urgent = daysLeft !== null && daysLeft <= 3;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-3 px-4 py-2.5 text-[13px]",
        urgent
          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
          : "bg-foreground/5 text-foreground",
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <SparklesIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
        <span className="truncate">
          {daysLeft !== null ? (
            <>
              <span className="font-semibold">{daysLeft} dager</span> igjen av Pro-prøveperioden.{" "}
            </>
          ) : (
            "Du er på Pro-prøveperioden. "
          )}
          <button
            onClick={() => router.push("/billing")}
            className="underline underline-offset-2 hover:no-underline font-medium"
          >
            Oppgrader for å beholde tilgangen
          </button>
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Lukk"
        className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
}
