import { cn } from "@workspace/ui/lib/utils";

export const WidgetHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <header
      className={cn(
        "bg-gradient-to-br from-primary via-primary to-primary/90 p-4 text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
        className,
      )}
    >
      {children}
    </header>
  );
};
