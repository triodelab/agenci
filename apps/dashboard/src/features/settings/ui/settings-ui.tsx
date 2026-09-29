/** Shared building blocks for the settings pages (calm, flat, no gradients). */
import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

export const inputClass =
  "h-11 w-full rounded-[12px] border border-(--agenci-line) bg-(--dash-surface) px-3.5 text-[14px] text-(--agenci-ink) outline-none transition-[border-color,box-shadow] placeholder:text-(--agenci-ink-3) focus:border-(--agenci-ink) focus:shadow-[0_0_0_4px_rgb(36_50_54/0.08)] disabled:bg-(--dash-subtle-2) disabled:text-(--agenci-ink-2) dark:bg-transparent";
export const inkBtn =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-(--agenci-ink) px-5 text-[13.5px] font-medium text-white transition-[background-color,opacity] hover:bg-(--agenci-accent-hover) disabled:opacity-40 dark:text-[#0b0c0e]";
export const ghostBtn =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-(--agenci-line) bg-(--dash-surface) px-4 text-[13.5px] text-(--agenci-ink) transition-colors hover:bg-(--dash-subtle) disabled:opacity-40 dark:bg-transparent";
export const dangerBtn =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-(--dash-bad-line) bg-(--dash-surface) px-4 text-[13.5px] text-(--dash-bad) transition-colors hover:bg-(--dash-bad-bg) disabled:opacity-40 dark:bg-transparent";

/** Page title inside the settings content column. */
export function SettingsHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="pb-2">
      <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-(--agenci-ink)">{title}</h2>
      <p className="mt-1 text-[13.5px] text-(--agenci-ink-2)">{description}</p>
    </header>
  );
}

/** A block: title + description on the left, controls on the right, optional footer. */
export function Section({
  title,
  description,
  children,
  footer,
  tone = "default",
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section
      className={cn(
        "rounded-[16px] border bg-(--dash-surface) dark:bg-(--card)",
        tone === "danger" ? "border-(--dash-bad-line) dark:border-[#B2463A]/30" : "border-(--agenci-line)",
      )}
    >
      <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:gap-10 md:p-6">
        <div>
          <h3
            className={cn(
              "text-[14.5px] font-semibold tracking-[-0.01em]",
              tone === "danger" ? "text-(--dash-bad)" : "text-(--agenci-ink)",
            )}
          >
            {title}
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-(--agenci-ink-2)">{description}</p>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
      {footer ? (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-(--agenci-line) bg-(--dash-subtle-2) px-5 py-3.5 md:px-6 dark:bg-white/[0.02]">
          {footer}
        </div>
      ) : null}
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-(--agenci-ink)">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {hint ? <span className="mt-1.5 block text-[12.5px] leading-relaxed text-(--agenci-ink-3)">{hint}</span> : null}
    </label>
  );
}

/** An on/off row with a real switch. */
export function ToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-4 py-3.5", disabled && "cursor-default opacity-50")}>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-medium text-(--agenci-ink)">{title}</span>
        <span className="mt-0.5 block text-[12.5px] leading-relaxed text-(--agenci-ink-3)">{description}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.currentTarget.checked)}
        className="relative mt-0.5 h-[22px] w-[38px] shrink-0 cursor-pointer appearance-none rounded-full bg-[#d6d9d7] transition-colors after:absolute after:top-[3px] after:left-[3px] after:size-4 after:rounded-full after:bg-(--dash-surface) after:shadow after:transition-transform checked:bg-(--agenci-ink) checked:after:translate-x-4 disabled:cursor-default"
      />
    </label>
  );
}

/** Pill options (radio group) used for small choices. */
export function Choice<T extends string>({
  value,
  options,
  onChange,
  label,
  cols = 2,
}: {
  value: T;
  options: { value: T; label: string; description?: string }[];
  onChange: (v: T) => void;
  label: string;
  cols?: 2 | 3;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("grid gap-2", cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-[12px] border px-3.5 py-3 text-left transition-[border-color,background-color]",
            value === o.value
              ? "border-(--agenci-ink) bg-(--dash-subtle-2) shadow-[0_0_0_1px_var(--agenci-ink)] dark:bg-white/5"
              : "border-(--agenci-line) hover:border-(--dash-field)",
          )}
        >
          <span className="block text-[13.5px] font-medium text-(--agenci-ink)">{o.label}</span>
          {o.description ? (
            <span className="mt-0.5 block text-[12.5px] leading-relaxed text-(--agenci-ink-3)">{o.description}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (
    (parts.length > 1 ? `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}` : name.slice(0, 2)) || "?"
  ).toUpperCase();
}

/** Shrinks a picked image to a square JPEG data URL (small enough to store). */
export function toSquareDataUrl(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Kunne ikke lese bildet."));
      const s = Math.min(img.width, img.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.86));
    };
    img.onerror = () => reject(new Error("Filen er ikke et bilde vi kan lese."));
    img.src = url;
  });
}
