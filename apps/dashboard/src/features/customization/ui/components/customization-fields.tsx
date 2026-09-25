/**
 * Building blocks for the widget customization form. Calm, consistent
 * controls (DESIGN.md): pill toggles, 10px inputs, Space Grotesk numbers.
 */
import { cn } from "@workspace/ui/lib/utils";
import { RotateCcwIcon } from "lucide-react";
import { useEffect, useId, useState } from "react";

export const dataText = "[font-family:var(--font-agenci-data)] tabular-nums";

export function Section({
  icon: Icon,
  title,
  aside,
  children,
}: {
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
    absoluteStrokeWidth?: boolean;
  }>;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-(--agenci-line) bg-white p-5 shadow-[0_1px_2px_rgb(5_6_7/0.04)] dark:bg-(--card)">
      <header className="mb-4 flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#f3f5f4] text-(--agenci-ink) dark:bg-white/5">
          <Icon className="size-4" strokeWidth={1.5} absoluteStrokeWidth />
        </span>
        <h2 className="min-w-0 flex-1 text-[15px] font-semibold tracking-[-0.01em] text-(--agenci-ink)">
          {title}
        </h2>
        {aside}
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  aside,
  children,
}: {
  label: string;
  htmlFor?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-2">
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-medium text-(--agenci-ink)"
        >
          {label}
        </label>
        <span className="ml-auto">{aside}</span>
      </div>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-[10px] border border-[#d7dce2] bg-white px-3 text-[14px] text-(--agenci-ink) outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-(--agenci-ink-3) focus:border-(--agenci-ink-3) focus:shadow-[0_0_0_3px_rgb(36_50_54/0.08)] dark:border-white/10 dark:bg-transparent";

export function TextInput({
  value,
  onChange,
  placeholder,
  max,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max: number;
  id?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        value={value}
        maxLength={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, "h-10 pr-14")}
      />
      <span
        className={cn(
          dataText,
          "pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[12px] text-(--agenci-ink-3)",
        )}
      >
        {value.length}/{max}
      </span>
    </div>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  max,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max: number;
  id?: string;
}) {
  return (
    <div className="relative">
      <textarea
        id={id}
        value={value}
        maxLength={max}
        rows={3}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, "resize-none py-2.5 leading-relaxed")}
      />
      <span
        className={cn(
          dataText,
          "pointer-events-none absolute right-3 bottom-2 text-[12px] text-(--agenci-ink-3)",
        )}
      >
        {value.length}/{max}
      </span>
    </div>
  );
}

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Swatch (native picker) + hex input + reset to the website's colour. */
export function ColorField({
  label,
  value,
  isCustom,
  onChange,
  onReset,
}: {
  label: string;
  value: string;
  isCustom: boolean;
  onChange: (hex: string) => void;
  onReset: () => void;
}) {
  const id = useId();
  const [text, setText] = useState(value.toUpperCase());
  useEffect(() => setText(value.toUpperCase()), [value]);
  const commit = () => {
    const v = text.startsWith("#") ? text : `#${text}`;
    if (HEX.test(v)) onChange(v.toLowerCase());
    else setText(value.toUpperCase());
  };
  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor={id}
        className="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-[10px] border border-black/10 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.4)] transition-transform duration-150 hover:scale-105"
        style={{ background: value }}
        title={`Velg ${label.toLowerCase()}`}
      >
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          aria-label={label}
        />
      </label>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-(--agenci-ink)">{label}</p>
        <p className="text-[12px] text-(--agenci-ink-3)">
          {isCustom ? "Egen farge" : "Fra nettsiden"}
        </p>
      </div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value.toUpperCase())}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        aria-label={`${label} hex`}
        className={cn(
          inputClass,
          dataText,
          "h-9 w-[104px] text-[13px] uppercase",
        )}
      />
      <button
        type="button"
        onClick={onReset}
        disabled={!isCustom}
        aria-label={`Tilbakestill ${label.toLowerCase()}`}
        title="Tilbake til nettsidens farge"
        className="flex size-8 items-center justify-center rounded-full text-(--agenci-ink-3) transition-colors hover:bg-[#f3f5f4] hover:text-(--agenci-ink) disabled:opacity-0"
      >
        <RotateCcwIcon
          className="size-3.5"
          strokeWidth={1.5}
          absoluteStrokeWidth
        />
      </button>
    </div>
  );
}

export function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "px",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-baseline">
        <label
          htmlFor={id}
          className="text-[13px] font-medium text-(--agenci-ink)"
        >
          {label}
        </label>
        <span
          className={cn(dataText, "ml-auto text-[13px] text-(--agenci-ink)")}
        >
          {value}
          <span className="text-(--agenci-ink-3)"> {unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="agenci-range w-full"
        style={{ ["--range-pct" as string]: `${pct}%` }}
      />
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 text-left"
    >
      <span className="min-w-0 flex-1 text-[13px] font-medium text-(--agenci-ink)">
        {label}
      </span>
      <span
        aria-hidden
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-(--agenci-ink)" : "bg-[#d7dce2] dark:bg-white/15",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-[left] duration-200 dark:bg-[#0b0c0e]",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}
