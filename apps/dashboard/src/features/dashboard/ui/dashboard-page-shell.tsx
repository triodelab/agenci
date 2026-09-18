import type { ReactNode } from "react";
import { cn } from "@workspace/ui/lib/utils";

export function DashboardPageShell({
  children,
  className,
  contentClassName,
}: {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-auto scroll-smooth bg-transparent text-foreground antialiased",
        className,
      )}
    >
      <div
        className={cn(
          "dash-workspace-inner mx-auto w-full flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-8 xl:px-12 2xl:px-16",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DashboardPageHeader({
  kicker,
  title,
  description,
  actions,
}: {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  if (actions) {
    return (
      <header className="dash-page-header-accent">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="min-w-0 space-y-3 sm:space-y-3.5">
            {kicker ? <p className="dash-page-kicker">{kicker}</p> : null}
            <h1 className="dash-page-title">{title}</h1>
            {description ? <p className="dash-page-desc">{description}</p> : null}
          </div>
          <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            {actions}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="dash-page-header-accent space-y-3 sm:space-y-3.5">
      {kicker ? <p className="dash-page-kicker">{kicker}</p> : null}
      <h1 className="dash-page-title">{title}</h1>
      {description ? <p className="dash-page-desc">{description}</p> : null}
    </header>
  );
}
