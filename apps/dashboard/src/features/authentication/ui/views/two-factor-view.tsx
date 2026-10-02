import { Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { AuthShell, authButtonCls, authInputCls, authLabelCls } from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";
import { takePendingInvite } from "@/lib/pending-invite";
import { errCls } from "@/lib/ui";

/** Second step of sign-in when two-factor login is on. */
export default function TwoFactorView() {
  const navigate = useNavigate();
  const [backup, setBackup] = useState(false);
  const [code, setCode] = useState("");
  const [trust, setTrust] = useState(true);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = code.replace(/\s/g, "");
    if (!value) return;
    setBusy(true);
    setError(undefined);
    const { error: err } = backup
      ? await authClient.twoFactor.verifyBackupCode({ code: value, trustDevice: trust })
      : await authClient.twoFactor.verifyTotp({ code: value, trustDevice: trust });
    setBusy(false);
    if (err) {
      const m = err.message ?? "";
      return setError(
        /too many|locked/i.test(m)
          ? "For mange forsøk. Vent litt og prøv igjen."
          : /expired|session|cookie/i.test(m)
            ? "Innloggingen tok for lang tid. Logg inn på nytt."
            : backup
              ? "Reservekoden stemmer ikke, eller er brukt."
              : "Koden stemmer ikke. Prøv den neste koden i appen.",
      );
    }
    const invite = takePendingInvite();
    await (invite
      ? navigate({ to: "/accept-invitation/$invitationId", params: { invitationId: invite } })
      : navigate({ to: "/" }));
  };

  return (
    <AuthShell
      title="To-trinns innlogging"
      subtitle={
        backup
          ? "Skriv en av reservekodene du lagret da du slo på to-trinns innlogging."
          : "Åpne autentiseringsappen på telefonen og skriv den 6-sifrede koden for Agenci."
      }
    >
      <form onSubmit={(e) => void submit(e)} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="code" className={authLabelCls}>
            {backup ? "Reservekode" : "Kode"}
          </label>
          <input
            id="code"
            // biome-ignore lint/a11y/noAutofocus: the only field on the page
            autoFocus
            inputMode={backup ? "text" : "numeric"}
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={backup ? "abcde-12345" : "123 456"}
            className={`${authInputCls} text-center font-mono text-[18px] tracking-[0.25em]`}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-(--agenci-ink-2)">
          <input type="checkbox" checked={trust} onChange={(e) => setTrust(e.target.checked)} className="size-4 accent-(--agenci-ink)" />
          Husk denne enheten i 30 dager
        </label>
        {error ? <p className={errCls}>{error}</p> : null}
        <button type="submit" className={authButtonCls} disabled={busy || !code.trim()}>
          {busy ? "Sjekker…" : "Logg inn"}
        </button>
      </form>
      <div className="mt-5 flex flex-wrap justify-between gap-3 text-[13px]">
        <button
          type="button"
          onClick={() => {
            setBackup((b) => !b);
            setCode("");
            setError(undefined);
          }}
          className="text-(--agenci-ink-2) underline-offset-4 hover:text-(--agenci-ink) hover:underline"
        >
          {backup ? "Bruk kode fra appen" : "Har du ikke telefonen? Bruk en reservekode"}
        </button>
        <Link to="/login" search={{ mode: "signin" }} className="text-(--agenci-ink-2) underline-offset-4 hover:text-(--agenci-ink) hover:underline">
          Avbryt
        </Link>
      </div>
    </AuthShell>
  );
}
