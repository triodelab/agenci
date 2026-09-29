import { type FormEvent, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { AuthShell, authButtonCls, authInputCls, authLabelCls, PasswordInput } from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";
import { takePendingInvite } from "@/lib/pending-invite";
import { errCls } from "@/lib/ui";

const signUpSchema = z.object({
  name: z.string().min(2, "Navn må være minst 2 tegn"),
  email: z.email("Ugyldig e-postadresse"),
  password: z.string().min(8, "Passordet må være minst 8 tegn"),
});

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      email: email.trim(),
      password,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Ugyldig input.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: signUpError } = await authClient.signUp.email(parsed.data);
      if (signUpError) {
        setError(signUpError.message ?? "Kunne ikke opprette konto.");
        return;
      }
      // Invited people join the existing team instead of creating their own.
      const invite = takePendingInvite();
      await (invite
        ? navigate({
            to: "/accept-invitation/$invitationId",
            params: { invitationId: invite },
          })
        : navigate({ to: "/org/create" }));
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Kunne ikke opprette konto.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Opprett konto"
      terms="Opprett konto"
      subtitle={
        <>
          Har du allerede konto?{" "}
          <button type="button" onClick={onSwitchToSignIn} className="font-medium text-(--agenci-ink) underline underline-offset-4 hover:no-underline">
            Logg inn
          </button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="first-name" className={authLabelCls}>
              Fornavn
            </label>
            <input id="first-name" type="text" autoComplete="given-name" required className={authInputCls} value={firstName} disabled={loading} onChange={(e) => setFirstName(e.currentTarget.value)} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="last-name" className={authLabelCls}>
              Etternavn
            </label>
            <input id="last-name" type="text" autoComplete="family-name" className={authInputCls} value={lastName} disabled={loading} onChange={(e) => setLastName(e.currentTarget.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className={authLabelCls}>
            E-post
          </label>
          <input id="email" type="email" autoComplete="email" required className={authInputCls} value={email} disabled={loading} onChange={(e) => setEmail(e.currentTarget.value)} placeholder="navn@bedrift.no" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className={authLabelCls}>
            Passord
          </label>
          <PasswordInput id="password" autoComplete="new-password" required minLength={8} value={password} disabled={loading} onChange={(e) => setPassword(e.currentTarget.value)} placeholder="Minst 8 tegn" />
        </div>
        {error ? <p className={errCls}>{error}</p> : null}
        <button type="submit" className={authButtonCls} disabled={loading}>
          {loading ? "Oppretter konto…" : "Opprett konto"}
        </button>
      </form>
    </AuthShell>
  );
}
