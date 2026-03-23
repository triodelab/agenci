import { cn } from "@workspace/ui/lib/utils";

/** Ytre padding og sentrert kolonne — felles dashboard-sider (kun layout, ikke logikk). */
export function DashboardPageShell({
  children,
  className,
  contentClassName,
}: {
  children: React.ReactNode;
  className?: string;
  /** Tailwind max-width, f.eks. `max-w-3xl` eller `max-w-screen-md` */
  contentClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-full flex-col bg-transparent px-4 py-8 sm:px-6 md:px-8 lg:py-10",
        className,
      )}
    >
      <div className={cn("mx-auto w-full max-w-3xl", contentClassName)}>
        {children}
      </div>
    </div>
  );
}

/** Kort med myk skygge — tokens fra `styles/tokens.css`. */
export function DashboardPagePanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("app-dashboard-panel p-6 md:p-8", className)}>
      {children}
    </div>
  );
}
