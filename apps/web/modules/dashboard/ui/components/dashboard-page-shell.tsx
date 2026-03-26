import { cn } from "@workspace/ui/lib/utils";

export type DashboardPagePanelVariant =
  | "glass"
  | "terminal"
  | "bento"
  | "lattice"
  | "plain";

const dashboardPagePanelVariantClass: Record<DashboardPagePanelVariant, string> = {
  glass: "dash-panel-glass",
  terminal: "dash-panel-terminal",
  bento: "dash-bento-block",
  lattice: "dash-lattice-card",
  plain: "app-dashboard-panel",
};

/**
 * Felles innholdsflate for dashboard (som workspace `SidebarInset`):
 * full bredde, scroll, konsistent padding — matcher nøytral widget-/shadcn-oppsett.
 */
export function DashboardPageShell({
  children,
  className,
  contentClassName,
}: {
  children: React.ReactNode;
  className?: string;
  /** Overstyr f.eks. `max-w-3xl` eller `max-w-full` */
  contentClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-auto bg-transparent text-foreground antialiased",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-5xl flex-1 px-4 py-7 md:px-10 md:py-10",
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
}: {
  kicker?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="dash-page-header-accent space-y-3 sm:space-y-3.5">
      {kicker ? <p className="dash-page-kicker">{kicker}</p> : null}
      <h1 className="dash-page-title">{title}</h1>
      {description ? <p className="dash-page-desc">{description}</p> : null}
    </header>
  );
}

export function DashboardPagePanel({
  children,
  className,
  variant = "plain",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: DashboardPagePanelVariant;
}) {
  return (
    <div
      className={cn(
        dashboardPagePanelVariantClass[variant],
        variant === "terminal" ? "p-6 md:p-8" : "p-6 md:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
