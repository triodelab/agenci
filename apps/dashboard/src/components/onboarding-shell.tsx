import { cn } from "@workspace/ui/lib/utils";
import { CheckIcon } from "lucide-react";
import type { ReactNode } from "react";

/** The whole first-time flow: create the company, then its first agent. */
export const ONBOARDING_STEPS = ["Bedrift", "Agent", "Kunnskap", "Opprett"] as const;

const dataText = "[font-family:var(--font-agenci-data)] tabular-nums";

/** Numbered steps joined by lines; steps before `step` are ticked off. */
export function Stepper({
  step,
  labels,
}: {
  step: number;
  labels: readonly string[];
}) {
  return (
    <ol className="flex items-center gap-2" aria-label="Fremdrift">
      {labels.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={cn(
              "flex items-center gap-2.5 text-[13.5px] transition-colors duration-300",
              i === step
                ? "font-medium text-(--agenci-ink)"
                : i < step
                  ? "text-(--agenci-ink-2)"
                  : "text-(--agenci-ink-3)",
            )}
            aria-current={i === step ? "step" : undefined}
          >
            <span
              className={cn(
                dataText,
                "flex size-6 items-center justify-center rounded-full text-[12px] transition-[background-color,color,box-shadow] duration-300",
                i < step && "bg-(--agenci-ink) text-white dark:text-[#0b0c0e]",
                i === step &&
                  "text-(--agenci-ink) shadow-[inset_0_0_0_1.5px_var(--agenci-ink)]",
                i > step &&
                  "text-(--agenci-ink-3) shadow-[inset_0_0_0_1px_var(--agenci-line)]",
              )}
            >
              {i < step ? <CheckIcon className="size-3" strokeWidth={2.5} /> : i + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </span>
          {i < labels.length - 1 ? (
            <span className="relative h-px w-6 overflow-hidden bg-(--agenci-line) sm:w-12">
              <span
                className="absolute inset-y-0 left-0 bg-(--agenci-ink) transition-[width] duration-500 ease-[cubic-bezier(.23,1,.32,1)]"
                style={{ width: i < step ? "100%" : "0%" }}
              />
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/**
 * Full-screen onboarding frame (no sidebar): logo left, progress in the
 * middle, an escape hatch on the right, the step below.
 */
export function OnboardingShell({
  step,
  action,
  children,
}: {
  step: number;
  /** Top-right link, e.g. "Hopp over" or "Logg ut". */
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="dashboard-app-shell min-h-svh bg-(--dash-surface)">
      <div className="relative z-0 flex min-h-svh flex-col bg-(--dash-surface)">
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-5 sm:px-8">
          <div className="flex items-end" role="img" aria-label="Agenci">
            <img src="/AgenciLogo.png" alt="" className="size-8 dark:invert" />
            <span className="-ml-[3px] -translate-y-[2.5px] text-[20px] leading-none font-medium tracking-[-0.03em] text-(--agenci-ink)">
              genci
            </span>
          </div>
          <Stepper step={step} labels={ONBOARDING_STEPS} />
          <div className="flex justify-end">{action}</div>
        </header>
        <main className="flex flex-1 flex-col px-5 pt-8 pb-16 sm:px-8 lg:pt-14">
          {children}
        </main>
      </div>
    </div>
  );
}

export const onboardingLinkCls =
  "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium text-(--agenci-ink-2) transition-colors hover:bg-(--dash-subtle) hover:text-(--agenci-ink)";
