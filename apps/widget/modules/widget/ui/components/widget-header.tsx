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
        "p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
        className,
      )}
      style={{
        backgroundColor: "var(--widget-header-bg)",
        color: "var(--widget-header-text)",
      }}
    >
      {children}
    </header>
  );
};
