import { type FormEvent, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowRightIcon, LogOutIcon, TrashIcon } from "lucide-react";

import { AgenciLoader } from "@/components/agenci-loader";
import { authLabelCls, PasswordInput } from "@/components/auth-shell";
import { OnboardingShell, onboardingLinkCls } from "@/components/onboarding-shell";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/api";
import {
  CompanyNumberField,
  prettyCompanyName,
  useFoundCompany,
} from "@/features/billing/ui/components/company-number-field";
import { slugify } from "@/lib/ui";
import { errCls } from "./org-shared-ui";

const icon = { strokeWidth: 1.5, absoluteStrokeWidth: true } as const;

/** Readable slug from the name; a short suffix only if it is taken. */
async function freeSlug(name: string) {
  const base = slugify(name);
  const { data } = await authClient.organization.checkSlug({ slug: base });
  if (data?.status) return base;
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Step 1 of onboarding: the company, by org number (Enhetsregisteret gives
 * the name). The org number is what allows one free trial per company.
 * Step 2 is the first agent.
 */
export default function CreateOrganizationForm() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [orgNumber, setOrgNumber] = useState("");
  const company = useFoundCompany(orgNumber);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstName = session?.user.name?.split(" ")[0];

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setLoading(true);
    setError(null);
    const name = prettyCompanyName(company.name);
    try {
      const { data, error: createError } = await authClient.organization.create({
        name,
        slug: await freeSlug(name),
      });
      if (createError || !data) {
        setError(createError?.message ?? "Kunne ikke opprette bedriften.");
        return;
      }
      await authClient.organization.setActive({ organizationId: data.id });
      try {
        await client.private.billing.registerCompany({ orgNumber: company.orgNumber });
      } catch (registerError) {
        // E.g. the company already uses Agenci: don't leave an empty organization behind.
        await authClient.organization.delete({ organizationId: data.id });
        setError(registerError instanceof Error ? registerError.message : "Kunne ikke registrere bedriften.");
        return;
      }
      await navigate({
        to: "/org/$orgSlug/onboarding",
        params: { orgSlug: data.slug },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kunne ikke opprette bedriften.");
    } finally {
      setLoading(false);
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
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="kb-enter mx-auto w-full max-w-[560px] lg:mt-10"
      >
        <p className="text-[15px] text-(--agenci-ink-2)">
          {firstName ? `Velkommen, ${firstName}.` : "Velkommen."}
        </p>
        <h1 className="mt-2 [font-family:var(--font-agenci-title)] text-[40px] leading-[1.05] font-medium tracking-[-0.03em] text-(--agenci-ink)">
          Hvilken bedrift gjelder det?
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-(--agenci-ink-2)">
          Skriv organisasjonsnummeret, så henter vi resten. Du får 30 dager
          gratis, uten kort. Etterpå setter vi opp den første agenten sammen.
        </p>

        <div className="mt-10">
          <CompanyNumberField value={orgNumber} onChange={setOrgNumber} disabled={loading} autoFocus />
        </div>

        {error ? <p className={cn(errCls, "mt-5")}>{error}</p> : null}

        <div className="mt-10 flex justify-end">
          <button
            type="submit"
            disabled={loading || !company}
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-(--agenci-ink) pr-5 pl-6 text-[15px] font-medium text-(--dash-on-ink) shadow-[0_8px_20px_-10px_rgb(5_6_7/0.6)] transition-[background-color,opacity,transform] duration-150 hover:bg-(--agenci-accent-hover) active:scale-[0.97] disabled:pointer-events-none disabled:opacity-35"
          >
            {loading ? (
              <>
                <AgenciLoader size={22} decorative />
                Oppretter
              </>
            ) : (
              <>
                Fortsett
                <ArrowRightIcon
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  {...icon}
                />
              </>
            )}
          </button>
        </div>

        <p className="mt-12 text-center text-[13px] text-(--agenci-ink-3)">
          Er du invitert av en kollega? Åpne lenken i invitasjonen, så havner du
          rett i teamet.
        </p>
      </form>

      <DeleteAccount />
    </OnboardingShell>
  );
}

/**
 * For someone who deleted their organization and wants to leave for good:
 * delete the account right here (Better Auth checks the password).
 */
function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <p className="mx-auto mt-4 text-center text-[13px] text-(--agenci-ink-3)">
        Vil du ikke bruke Agenci likevel?{" "}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-(--agenci-ink-2) underline underline-offset-4 hover:text-(--dash-bad)"
        >
          Slett kontoen
        </button>
      </p>
    );
  }

  const remove = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await authClient.deleteUser({ password });
    setBusy(false);
    if (err) {
      setError(
        /invalid password|incorrect/i.test(err.message ?? "")
          ? "Passordet er feil."
          : (err.message ?? "Kunne ikke slette kontoen."),
      );
      return;
    }
    window.location.href = "/login";
  };

  return (
    <form
      onSubmit={(e) => void remove(e)}
      className="kb-enter mx-auto mt-6 w-full max-w-[560px] rounded-[16px] border border-[#f0d4d0] bg-[#fdf7f6] p-5"
    >
      <p className="text-[15px] font-medium text-(--agenci-ink)">Slett kontoen</p>
      <p className="mt-1 text-[13.5px] leading-relaxed text-(--agenci-ink-2)">
        Profilen og innloggingene dine slettes for godt. Dette kan ikke angres.
      </p>
      <label className="mt-4 block">
        <span className={authLabelCls}>Bekreft med passordet ditt</span>
        <div className="mt-1.5">
          <PasswordInput
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
        </div>
      </label>
      <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-[13.5px] text-(--agenci-ink)">
        <input
          type="checkbox"
          checked={understood}
          onChange={(e) => setUnderstood(e.currentTarget.checked)}
          className="size-4 accent-(--agenci-ink)"
        />
        Jeg forstår at dette ikke kan angres.
      </label>
      {error ? <p className={cn(errCls, "mt-3")}>{error}</p> : null}
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-10 items-center rounded-full px-4 text-[13.5px] font-medium text-(--agenci-ink-2) hover:bg-black/[0.04]"
        >
          Avbryt
        </button>
        <button
          type="submit"
          disabled={!password || !understood || busy}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-[#b3392f] px-4 text-[13.5px] font-medium text-white transition-colors hover:bg-[#9a2f26] disabled:opacity-40"
        >
          {busy ? <AgenciLoader size={18} decorative /> : <TrashIcon className="size-4" {...icon} />}
          Slett kontoen for godt
        </button>
      </div>
    </form>
  );
}
