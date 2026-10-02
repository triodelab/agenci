import { useQueryClient } from "@tanstack/react-query";
import { ArrowRightIcon, LogOutIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AgenciLoader } from "@/components/agenci-loader";
import { OnboardingShell, onboardingLinkCls } from "@/components/onboarding-shell";
import { client } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { billingKeys } from "../../billing-queries";
import { CompanyNumberField, useFoundCompany } from "../components/company-number-field";

const icon = { strokeWidth: 1.5, absoluteStrokeWidth: true } as const;

/**
 * An organization made before org numbers were required: register the
 * company before the dashboard opens (owners and admins only).
 */
export default function RegisterCompanyView({ canEdit }: { canEdit: boolean }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [orgNumber, setOrgNumber] = useState("");
  const company = useFoundCompany(orgNumber);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    setError(null);
    try {
      await client.private.billing.registerCompany({ orgNumber: company.orgNumber });
      await queryClient.invalidateQueries({ queryKey: billingKeys.status });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke registrere bedriften.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingShell
      step={0}
      action={
        <button
          type="button"
          className={onboardingLinkCls}
          onClick={async () => {
            await authClient.signOut();
            await navigate({ to: "/login" });
          }}
        >
          <LogOutIcon className="size-4" {...icon} />
          Logg ut
        </button>
      }
    >
      <form onSubmit={(e) => void submit(e)} className="kb-enter mx-auto w-full max-w-[560px] lg:mt-10">
        <h1 className="[font-family:var(--font-agenci-title)] text-[40px] leading-[1.05] font-medium tracking-[-0.03em] text-(--agenci-ink)">
          Registrer bedriften
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-(--agenci-ink-2)">
          Vi trenger organisasjonsnummeret før agentene kan svare kundene. Har
          bedriften ikke prøvd Agenci før, får dere 30 dager gratis.
        </p>

        {canEdit ? (
          <>
            <div className="mt-10">
              <CompanyNumberField value={orgNumber} onChange={setOrgNumber} disabled={saving} autoFocus />
            </div>
            {error ? <p className="mt-2 text-[13.5px] text-(--dash-bad)">{error}</p> : null}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving || !company}
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-(--agenci-ink) pr-5 pl-6 text-[15px] font-medium text-(--dash-on-ink) shadow-[0_8px_20px_-10px_rgb(5_6_7/0.6)] transition-[background-color,opacity,transform] duration-150 hover:bg-(--agenci-accent-hover) active:scale-[0.97] disabled:pointer-events-none disabled:opacity-35"
              >
                {saving ? (
                  <>
                    <AgenciLoader size={22} decorative /> Registrerer
                  </>
                ) : (
                  <>
                    Registrer og fortsett
                    <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" {...icon} />
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <p className="mt-10 rounded-[12px] border border-(--agenci-line) bg-(--dash-subtle) px-4 py-3 text-[14.5px] text-(--agenci-ink-2)">
            Be eieren av organisasjonen om å legge inn organisasjonsnummeret. Da
            åpnes dashbordet for hele teamet.
          </p>
        )}
      </form>
    </OnboardingShell>
  );
}
