/**
 * Shared Norwegian form styles for auth / org screens.
 */
export const inputCls =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/10 disabled:opacity-50";

export const labelCls = "text-[13px] font-medium text-neutral-600";

export const btnPrimaryCls =
  "flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 text-[14px] font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50";

export const btnSecondaryCls =
  "flex h-9 items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 text-[13px] font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50";

export const cardCls =
  "w-full max-w-md space-y-5 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm";

export const errCls =
  "rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600";

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || `org-${Date.now()}`
  );
}
