import { Link } from "@tanstack/react-router";
import { MailCheckIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import { AuthShell, authButtonCls, authInputCls, authLabelCls } from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";
import { errCls } from "@/lib/ui";

/** «Glemt passord»: e-mails a one-time link to /nytt-passord. */
export default function ForgotPasswordView({ initialEmail = "" }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(address)) return setError("Skriv en gyldig e-postadresse.");
    setBusy(true);
    setError(undefined);
    const { error: err } = await authClient.requestPasswordReset({
      email: address,
      redirectTo: `${window.location.origin}/nytt-passord`,
    });
    setBusy(false);
    // Same answer whether or not the address has an account.
    if (err && err.status !== 400) return setError("Noe gikk galt. Prøv igjen om litt.");
    setSentTo(address);
  };

  const back = (
    <Link to="/login" search={{ mode: "signin" }} className="font-medium text-(--agenci-ink) underline underline-offset-4 hover:no-underline">
      Tilbake til innlogging
    </Link>
  );

  if (sentTo) {
    return (
      <AuthShell title="Sjekk e-posten din" subtitle={back}>
        <div className="rounded-[14px] bg-(--dash-subtle) p-5">
          <MailCheckIcon className="size-6 text-(--agenci-ink)" strokeWidth={1.6} />
          <p className="mt-3 text-[14.5px] leading-relaxed text-(--agenci-ink)">
            Har <strong className="font-medium">{sentTo}</strong> en konto hos oss, får du en e-post med en lenke for å lage
            nytt passord. Lenken gjelder i 1 time.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-(--agenci-ink-3)">
            Finner du den ikke? Sjekk søppelpost, eller prøv igjen om noen minutter.
          </p>
        </div>
        <button type="button" onClick={() => setSentTo(null)} className="mt-4 text-[13px] text-(--agenci-ink-2) underline underline-offset-4 hover:text-(--agenci-ink)">
          Send på nytt
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Glemt passordet?" subtitle={<>Skriv e-posten du logger inn med, så sender vi deg en lenke. {back}</>}>
      <form onSubmit={(e) => void submit(e)} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className={authLabelCls}>
            E-post
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            // biome-ignore lint/a11y/noAutofocus: the only field on the page
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputCls}
            placeholder="navn@bedrift.no"
          />
        </div>
        {error ? <p className={errCls}>{error}</p> : null}
        <button type="submit" className={authButtonCls} disabled={busy}>
          {busy ? "Sender…" : "Send lenke"}
        </button>
      </form>
    </AuthShell>
  );
}
