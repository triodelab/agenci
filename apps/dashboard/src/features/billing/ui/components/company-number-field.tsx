import { cn } from "@workspace/ui/lib/utils";
import { Building2Icon, CircleAlertIcon } from "lucide-react";
import { AgenciLoader } from "@/components/agenci-loader";
import { type CompanyLookup, useCompanyLookup } from "../../billing-queries";

const icon = { strokeWidth: 1.5, absoluteStrokeWidth: true } as const;

/** "923609016" → "923 609 016" while typing. */
export function formatOrgNumber(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 9);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join(" ");
}

const KEEP_UPPER = new Set(["AS", "ASA", "ANS", "DA", "ENK", "SA", "BA", "NUF", "KS", "IKS", "SF", "HF"]);

/** "NORDLYS MAT AS" → "Nordlys Mat AS" (the register shouts). */
export function prettyCompanyName(name: string) {
  return name
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((w) => (KEEP_UPPER.has(w.toUpperCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}

export type FoundCompany = Extract<CompanyLookup, { ok: true }>;

/**
 * Org number input with a live Enhetsregisteret lookup underneath. Calls
 * `onCompany` with the company once found (null while invalid/unknown).
 */
export function CompanyNumberField({
  value,
  onChange,
  disabled,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const digits = value.replace(/\D/g, "");
  const lookup = useCompanyLookup(value);
  const result = digits.length === 9 ? lookup.data : undefined;

  return (
    <div>
      <label className="block">
        <span className="mb-2.5 block text-[14px] font-medium text-(--agenci-ink)">Organisasjonsnummer</span>
        <input
          // biome-ignore lint/a11y/noAutofocus: the only field of this step
          autoFocus={autoFocus}
          required
          inputMode="numeric"
          autoComplete="off"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(formatOrgNumber(e.currentTarget.value))}
          placeholder="123 456 789"
          className="h-14 w-full rounded-[12px] border border-(--dash-field) bg-(--dash-surface) px-5 text-[17px] tracking-[0.04em] text-(--agenci-ink) tabular-nums outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-(--dash-placeholder) focus:border-(--agenci-ink-3) focus:shadow-[0_0_0_4px_rgb(36_50_54/0.07)] disabled:opacity-60"
        />
      </label>

      <div className="mt-3 min-h-[68px]" aria-live="polite">
        {digits.length < 9 ? (
          <p className="text-[13px] text-(--agenci-ink-3)">
            Vi henter firmanavnet fra Enhetsregisteret. Hvert foretak kan prøve Agenci gratis én gang.
          </p>
        ) : lookup.isFetching ? (
          <p className="flex items-center gap-2 text-[13.5px] text-(--agenci-ink-2)">
            <AgenciLoader size={18} decorative /> Slår opp i Enhetsregisteret …
          </p>
        ) : result?.ok ? (
          <div className="flex items-start gap-3 rounded-[12px] border border-(--agenci-line) bg-(--dash-subtle) px-4 py-3">
            <Building2Icon className="mt-0.5 size-5 shrink-0 text-(--agenci-ink-2)" {...icon} />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-(--agenci-ink)">{prettyCompanyName(result.name)}</p>
              <p className="truncate text-[13px] text-(--agenci-ink-3)">
                {[result.form, result.address].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        ) : result && !result.ok ? (
          <p className={cn("flex items-start gap-2 text-[13.5px] text-(--dash-bad)")}>
            <CircleAlertIcon className="mt-0.5 size-4 shrink-0" {...icon} />
            {result.message}
          </p>
        ) : lookup.isError ? (
          <p className="text-[13.5px] text-(--dash-bad)">Kunne ikke slå opp nummeret akkurat nå. Prøv igjen.</p>
        ) : null}
      </div>
    </div>
  );
}

/** The company found for this value, once the lookup succeeded. */
export function useFoundCompany(value: string): FoundCompany | null {
  const lookup = useCompanyLookup(value);
  const digits = value.replace(/\D/g, "");
  return digits.length === 9 && lookup.data?.ok ? lookup.data : null;
}
