import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2Icon } from "lucide-react";
import { type FormEvent, useState } from "react";
import { AuthShell, authButtonCls, authLabelCls, PasswordInput } from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";
import { errCls } from "@/lib/ui";

/** The page the e-mailed link lands on: choose a new password. */
export default function ResetPasswordView({ token, error: linkError }: { token?: string; error?: string }) {
  const navigate = useNavigate();
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!token || linkError) {
    return (
      <AuthShell title="Lenken virker ikke lenger" subtitle="Den er brukt, utløpt eller ufullstendig. Lenker for nytt passord gjelder i 1 time.">
        <Link to="/glemt-passord" className={authButtonCls}>
          Send en ny lenke
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Passordet er byttet" subtitle="Du er logget ut på alle enheter. Logg inn med det nye passordet.">
        <CheckCircle2Icon className="mb-5 size-8 text-[#3F7A4A]" strokeWidth={1.6} />
        <button type="button" onClick={() => void navigate({ to: "/login", search: { mode: "signin" } })} className={authButtonCls}>
          Logg inn
        </button>
      </AuthShell>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (next.length < 8) return setError("Passordet må være minst 8 tegn.");
    if (next !== confirm) return setError("Passordene er ikke like.");
    setBusy(true);
    setError(undefined);
    const { error: err } = await authClient.resetPassword({ newPassword: next, token });
    setBusy(false);
    if (err) {
      return setError(
        /invalid|expired|token/i.test(err.message ?? "")
          ? "Lenken er utløpt eller allerede brukt. Be om en ny."
          : "Kunne ikke bytte passord. Prøv igjen.",
      );
    }
    setDone(true);
  };

  return (
    <AuthShell title="Velg nytt passord" subtitle="Bruk minst 8 tegn. En setning du husker er ofte både sterkere og lettere.">
      <form onSubmit={(e) => void submit(e)} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="new-password" className={authLabelCls}>
            Nytt passord
          </label>
          <PasswordInput id="new-password" autoComplete="new-password" required minLength={8} value={next} onChange={(e) => setNext(e.currentTarget.value)} placeholder="Minst 8 tegn" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className={authLabelCls}>
            Gjenta passordet
          </label>
          <PasswordInput id="confirm-password" autoComplete="new-password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.currentTarget.value)} />
        </div>
        {error ? <p className={errCls}>{error}</p> : null}
        <button type="submit" className={authButtonCls} disabled={busy}>
          {busy ? "Lagrer…" : "Lagre nytt passord"}
        </button>
      </form>
    </AuthShell>
  );
}
