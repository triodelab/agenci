import { cn } from "@workspace/ui/lib/utils";
import { useDemoMode } from "@/lib/demo-mode";

/** Shared "Demodata" switch (overview + conversations). */
export function DemoSwitch() {
  const { on, toggle } = useDemoMode();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggle}
      title={on ? "Viser eksempeltall" : "Viser ekte data"}
      className="flex h-9 items-center gap-2 rounded-full border border-(--agenci-line) bg-white pr-3 pl-2 text-[12.5px] text-(--agenci-ink-2) transition-[color,transform] duration-150 hover:text-(--agenci-ink) active:scale-[0.97] dark:border-white/10 dark:bg-transparent"
    >
      <span
        aria-hidden
        className={cn(
          "relative h-4 w-7 shrink-0 rounded-full transition-colors duration-200",
          on
            ? "bg-(--agenci-ink) dark:bg-white"
            : "bg-[#D7DCE2] dark:bg-white/15",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-[left] duration-200 dark:bg-[#0b0c0e]",
            on ? "left-[14px]" : "left-0.5",
          )}
        />
      </span>
      {on ? "Demodata" : "Ekte data"}
    </button>
  );
}
