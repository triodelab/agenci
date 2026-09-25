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
        "w-full min-w-0 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:p-4",
        className,
      )}
      style={{
        backgroundColor: "var(--widget-header-bg)",
        color: "var(--widget-header-text)",
        fontFamily: "var(--widget-font-family, inherit)",
      }}
    >
      {children}
    </header>
  );
};
